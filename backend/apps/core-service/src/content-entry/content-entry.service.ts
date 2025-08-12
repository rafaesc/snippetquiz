import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { CreateContentEntryDto, ContentType } from './dto/create-content-entry.dto';
import { FindAllContentEntriesDto } from './dto/find-all-content-entries.dto';
import { CloneContentEntryDto } from './dto/clone-content-entry.dto';
import { ContentEntryResponseDto, PaginatedContentEntriesResponseDto } from './dto/content-entry-response.dto';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

@Injectable()
export class ContentEntryService extends PrismaClient {
  constructor() {
    super();
  }

  async create(createContentEntryDto: CreateContentEntryDto): Promise<ContentEntryResponseDto> {
    const { sourceUrl, content, type, pageTitle, bankId, userId } = createContentEntryDto;

    // Verify that the bank belongs to the user
    const contentBank = await this.contentBank.findFirst({
      where: {
        id: BigInt(bankId),
        userId,
      },
    });

    if (!contentBank) {
      throw new NotFoundException('Content bank not found or does not belong to user');
    }

    let processedContent = content;

    // Extract plain text from HTML when type is 'full_html'
    if (type === ContentType.FULL_HTML && content) {
      try {
        const window = new JSDOM('').window;
        const purify = DOMPurify(window);
        const clean = purify.sanitize(content);
        const dom = new JSDOM(clean);
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        processedContent = article?.textContent || content;
      } catch (error) {
        console.error('Error processing HTML content:', error);
        processedContent = content;
      }
    }

    // Check for existing entry with same sourceUrl and type 'full_html'
    let existingEntry: any = null;
    if (type === ContentType.FULL_HTML && sourceUrl) {
      existingEntry = await this.contentEntry.findFirst({
        where: {
          sourceUrl,
          contentType: ContentType.FULL_HTML,
          contentBanks: {
            some: {
              contentBankId: BigInt(bankId),
            },
          },
        },
      });
    }

    let resultEntry;

    if (existingEntry) {
      // Update existing entry
      resultEntry = await this.contentEntry.update({
        where: { id: existingEntry.id },
        data: {
          content: processedContent,
          pageTitle,
          createdAt: new Date(),
        },
      });
    } else {
      // Create new entry
      const newEntry = await this.contentEntry.create({
        data: {
          contentType: type,
          sourceUrl,
          content: processedContent,
          pageTitle,
        },
      });

      // Create relationship with content bank
      await this.contentEntryBank.create({
        data: {
          contentEntryId: newEntry.id,
          contentBankId: BigInt(bankId),
        },
      });

      resultEntry = newEntry;
    }

    return {
      id: resultEntry.id.toString(),
      contentType: resultEntry.contentType,
      content: resultEntry.content || undefined,
      sourceUrl: resultEntry.sourceUrl || undefined,
      pageTitle: resultEntry.pageTitle || undefined,
      createdAt: resultEntry.createdAt,
      questionsGenerated: resultEntry.questionsGenerated,
      promptSummary: resultEntry.promptSummary || undefined,
    };
  }

  async findAll(findAllDto: FindAllContentEntriesDto): Promise<PaginatedContentEntriesResponseDto> {
    const { page = 1, limit = 10, name, bankId, userId } = findAllDto;
    const skip = (page - 1) * limit;

    // Verify bank belongs to user
    const contentBank = await this.contentBank.findFirst({
      where: {
        id: BigInt(bankId),
        userId,
      },
    });

    if (!contentBank) {
      throw new NotFoundException('Content bank not found or does not belong to user');
    }

    const where = {
      contentBanks: {
        some: {
          contentBankId: BigInt(bankId),
        },
      },
      ...(name && {
        pageTitle: {
          contains: name.trim(),
          mode: 'insensitive' as const,
        },
      }),
    };

    const [contentEntries, total] = await Promise.all([
      this.contentEntry.findMany({
        where,
        include: {
          topics: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.contentEntry.count({ where }),
    ]);

    return {
      entries: contentEntries.map(entry => ({
        id: entry.id.toString(),
        contentType: entry.contentType,
        content: entry.content ? (entry.content.length > 300 ? entry.content.substring(0, 300) + '...' : entry.content) : undefined,
        sourceUrl: entry.sourceUrl || undefined,
        pageTitle: entry.pageTitle || undefined,
        createdAt: entry.createdAt,
        questionsGenerated: entry.questionsGenerated,
        topics: entry.topics?.map(t => t.topic.topic) || [],
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<ContentEntryResponseDto> {
    const contentEntry = await this.contentEntry.findFirst({
      where: {
        id: BigInt(id),
        contentBanks: {
          some: {
            contentBank: {
              userId,
            },
          },
        },
      },
    });

    if (!contentEntry) {
      throw new NotFoundException('Content entry not found or does not belong to user');
    }

    return {
      id: contentEntry.id.toString(),
      contentType: contentEntry.contentType,
      content: contentEntry.content?.substring(0, 100),
      sourceUrl: contentEntry.sourceUrl || undefined,
      pageTitle: contentEntry.pageTitle || undefined,
      createdAt: contentEntry.createdAt,
      questionsGenerated: contentEntry.questionsGenerated,
      promptSummary: contentEntry.promptSummary || undefined,
    };
  }

  async clone(id: string, cloneDto: CloneContentEntryDto): Promise<ContentEntryResponseDto> {
    const { targetBankId, userId } = cloneDto;

    // Verify source entry belongs to user
    const sourceEntry = await this.contentEntry.findFirst({
      where: {
        id: BigInt(id),
        contentBanks: {
          some: {
            contentBank: {
              userId,
            },
          },
        },
      },
    });

    if (!sourceEntry) {
      throw new NotFoundException('Source content entry not found or does not belong to user');
    }

    // Verify target bank belongs to user
    const targetBank = await this.contentBank.findFirst({
      where: {
        id: BigInt(targetBankId),
        userId,
      },
    });

    if (!targetBank) {
      throw new NotFoundException('Target content bank not found or does not belong to user');
    }

    // Check if entry already exists in target bank
    const existingRelation = await this.contentEntryBank.findFirst({
      where: {
        contentEntryId: BigInt(id),
        contentBankId: BigInt(targetBankId),
      },
    });

    if (existingRelation) {
      throw new ConflictException('Content entry already exists in the target bank');
    }

    // Create relationship
    await this.contentEntryBank.create({
      data: {
        contentEntryId: BigInt(id),
        contentBankId: BigInt(targetBankId),
      },
    });

    return {
      id: sourceEntry.id.toString(),
      contentType: sourceEntry.contentType,
      content: sourceEntry.content || undefined,
      sourceUrl: sourceEntry.sourceUrl || undefined,
      pageTitle: sourceEntry.pageTitle || undefined,
      createdAt: sourceEntry.createdAt,
      questionsGenerated: sourceEntry.questionsGenerated,
      promptSummary: sourceEntry.promptSummary || undefined,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Verify entry belongs to user
    const existingEntry = await this.contentEntry.findFirst({
      where: {
        id: BigInt(id),
        contentBanks: {
          some: {
            contentBank: {
              userId,
            },
          },
        },
      },
    });

    if (!existingEntry) {
      throw new NotFoundException('Content entry not found or does not belong to user');
    }

    await this.contentEntry.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Content entry deleted successfully' };
  }
}
