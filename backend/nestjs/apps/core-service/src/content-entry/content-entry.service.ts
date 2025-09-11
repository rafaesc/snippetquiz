import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../commons/services';
import { ContentEntry } from 'generated/prisma/postgres';
import {
  CreateContentEntryDto,
  ContentType,
} from './dto/create-content-entry.dto';
import { FindAllContentEntriesDto } from './dto/find-all-content-entries.dto';
import { CloneContentEntryDto } from './dto/clone-content-entry.dto';
import {
  ContentEntryResponseDto,
  PaginatedContentEntriesResponseDto,
} from './dto/content-entry-response.dto';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { KAFKA_SERVICE } from '../config/services';
import { ClientKafka } from '@nestjs/microservices';
import { ContentEntryEventPayload } from './dto/content-entry-event.dto';

@Injectable()
export class ContentEntryService {
  private readonly logger = new Logger(ContentEntryService.name);

  constructor(
    @Inject(KAFKA_SERVICE) private kafkaClient: ClientKafka,
    private prisma: PrismaService,
  ) {}

  async create(
    createContentEntryDto: CreateContentEntryDto,
  ): Promise<ContentEntryResponseDto> {
    const {
      sourceUrl,
      content,
      type,
      pageTitle,
      bankId,
      userId,
      youtubeVideoId,
      youtubeVideoDuration,
      youtubeChannelId,
      youtubeChannelName,
      youtubeAvatarUrl,
    } = createContentEntryDto;

    // Verify that the bank belongs to the user
    const contentBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(bankId),
        userId,
      },
    });

    if (!contentBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
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

    // Handle YouTube channel for VIDEO_TRANSCRIPT type
    let youtubeChannelDbId: bigint | null = null;
    if (type === ContentType.VIDEO_TRANSCRIPT && youtubeChannelId) {
      // Check if YouTube channel already exists
      let existingChannel = await this.prisma.youTubeChannel.findFirst({
        where: {
          channelId: youtubeChannelId,
        },
      });

      if (existingChannel) {
        youtubeChannelDbId = existingChannel.id;
      } else if (youtubeChannelName) {
        // Create new YouTube channel
        const newChannel = await this.prisma.youTubeChannel.create({
          data: {
            channelId: youtubeChannelId,
            channelName: youtubeChannelName,
            avatarUrl: youtubeAvatarUrl,
          },
        });
        youtubeChannelDbId = newChannel.id;
      }
    }

    let resultEntry;

    // Check for existing entry with same sourceUrl and type 'full_html'
    let existingEntry: any = null;
    if (type === ContentType.FULL_HTML && sourceUrl) {
      existingEntry = await this.prisma.contentEntry.findFirst({
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

      if (existingEntry) {
        const updateData: any = {
          content: processedContent,
          pageTitle,
          createdAt: new Date(),
        };

        if (type === ContentType.FULL_HTML && processedContent) {
          const wordCount = processedContent
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
          updateData.wordCount = wordCount;
        }

        // Update existing entry
        resultEntry = await this.prisma.contentEntry.update({
          where: { id: existingEntry.id },
          data: updateData,
        });
      }
    }

    // Check for existing VIDEO_TRANSCRIPT entry with same sourceUrl in same bank
    if (type === ContentType.VIDEO_TRANSCRIPT && sourceUrl) {
      existingEntry = await this.prisma.contentEntry.findFirst({
        where: {
          sourceUrl,
          contentType: ContentType.VIDEO_TRANSCRIPT,
          contentBanks: {
            some: {
              contentBankId: BigInt(bankId),
            },
          },
        },
      });

      // If VIDEO_TRANSCRIPT entry already exists, return it without creating/updating
      if (existingEntry) {
        resultEntry = existingEntry;
      }
    }

    if (!existingEntry) {
      // Create new entry
      const createData: any = {
        contentType: type,
        sourceUrl,
        content: processedContent,
        pageTitle,
      };

      // Calculate word count for selected_text and full_html content types
      if (
        (type === ContentType.SELECTED_TEXT ||
          type === ContentType.FULL_HTML) &&
        processedContent
      ) {
        const wordCount = processedContent
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        createData.wordCount = wordCount;
      }

      // Add YouTube fields for VIDEO_TRANSCRIPT type
      if (type === ContentType.VIDEO_TRANSCRIPT) {
        if (youtubeVideoId) createData.youtubeVideoId = youtubeVideoId;
        if (youtubeVideoDuration)
          createData.videoDuration = youtubeVideoDuration;
        if (youtubeChannelDbId)
          createData.youtubeChannelId = youtubeChannelDbId;
      }

      const newEntry = await this.prisma.contentEntry.create({
        data: createData,
      });

      // Create relationship with content bank
      await this.prisma.contentEntryBank.create({
        data: {
          contentEntryId: newEntry.id,
          contentBankId: BigInt(bankId),
        },
      });

      resultEntry = newEntry;
    }

    this.generateTopicsForContentEntry(resultEntry.id.toString(), userId).catch(
      (error) => {
        console.error(
          `Failed to generate topics for content entry ${resultEntry.id}:`,
          error,
        );
      },
    );

    return {
      id: resultEntry.id.toString(),
      content_type: resultEntry.contentType,
      content: resultEntry.content || undefined,
      source_url: resultEntry.sourceUrl || undefined,
      page_title: resultEntry.pageTitle || undefined,
      created_at: resultEntry.createdAt,
      questions_generated: resultEntry.questionsGenerated,
      prompt_summary: resultEntry.promptSummary || undefined,
    };
  }

  async findAll(
    findAllDto: FindAllContentEntriesDto,
  ): Promise<PaginatedContentEntriesResponseDto> {
    const { page = 1, limit = 10, name, bankId, userId } = findAllDto;
    const skip = (page - 1) * limit;

    // Verify bank belongs to user
    const contentBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(bankId),
        userId,
      },
    });

    if (!contentBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
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
      this.prisma.contentEntry.findMany({
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
      this.prisma.contentEntry.count({ where }),
    ]);

    return {
      entries: contentEntries.map((entry) => ({
        id: entry.id.toString(),
        content_type: entry.contentType,
        content: entry.content
          ? entry.content.length > 300
            ? entry.content.substring(0, 300) + '...'
            : entry.content
          : undefined,
        source_url: entry.sourceUrl || undefined,
        page_title: entry.pageTitle || undefined,
        created_at: entry.createdAt,
        questions_generated: entry.questionsGenerated,
        topics: entry.topics?.map((t) => t.topic.topic) || [],
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<ContentEntryResponseDto> {
    const contentEntry = await this.prisma.contentEntry.findFirst({
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
      throw new NotFoundException(
        'Content entry not found or does not belong to user',
      );
    }

    return {
      id: contentEntry.id.toString(),
      content_type: contentEntry.contentType,
      content: contentEntry.content?.substring(0, 100),
      source_url: contentEntry.sourceUrl || undefined,
      page_title: contentEntry.pageTitle || undefined,
      created_at: contentEntry.createdAt,
      questions_generated: contentEntry.questionsGenerated,
      prompt_summary: contentEntry.promptSummary || undefined,
    };
  }

  async clone(
    id: string,
    cloneDto: CloneContentEntryDto,
  ): Promise<ContentEntryResponseDto> {
    const { targetBankId, userId } = cloneDto;

    // Verify source entry belongs to user
    const sourceEntry = await this.prisma.contentEntry.findFirst({
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
      throw new NotFoundException(
        'Source content entry not found or does not belong to user',
      );
    }

    // Verify target bank belongs to user
    const targetBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(targetBankId),
        userId,
      },
    });

    if (!targetBank) {
      throw new NotFoundException(
        'Target content bank not found or does not belong to user',
      );
    }

    // Check if entry already exists in target bank
    const existingRelation = await this.prisma.contentEntryBank.findFirst({
      where: {
        contentEntryId: BigInt(id),
        contentBankId: BigInt(targetBankId),
      },
    });

    if (existingRelation) {
      throw new ConflictException(
        'Content entry already exists in the target bank',
      );
    }

    // Create relationship
    await this.prisma.contentEntryBank.create({
      data: {
        contentEntryId: BigInt(id),
        contentBankId: BigInt(targetBankId),
      },
    });

    return {
      id: sourceEntry.id.toString(),
      content_type: sourceEntry.contentType,
      content: sourceEntry.content || undefined,
      source_url: sourceEntry.sourceUrl || undefined,
      page_title: sourceEntry.pageTitle || undefined,
      created_at: sourceEntry.createdAt,
      questions_generated: sourceEntry.questionsGenerated,
      prompt_summary: sourceEntry.promptSummary || undefined,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Verify entry belongs to user
    const existingEntry = await this.prisma.contentEntry.findFirst({
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
      throw new NotFoundException(
        'Content entry not found or does not belong to user',
      );
    }

    await this.prisma.contentEntry.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Content entry deleted successfully' };
  }

  async generateTopicsForContentEntry(
    contentEntryId: string,
    userId: string,
  ): Promise<{ message: string; topicsCreated: number }> {
    try {
      const contentEntry = await this.prisma.contentEntry.findFirst({
        where: {
          id: BigInt(contentEntryId),
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
        throw new NotFoundException(
          'Content entry not found or does not belong to user',
        );
      }

      const existingTopics = await this.prisma.topic.findMany({
        where: {
          userId,
        },
        select: {
          topic: true,
        },
      });

      const existingTopicNames = existingTopics.map((t) => t.topic);

      const generateTopicsRequest: ContentEntryEventPayload = {
        userId: userId,
        contentId: contentEntry.id.toString(),
        action: 'GENERATE',
        content: contentEntry.content || '',
        pageTitle: contentEntry.pageTitle || '',
        existingTopics: existingTopicNames.join(','),
      };

      this.kafkaClient.emit('content-entry-events', {
        key: `content-entry-${contentEntry.id}`,
        value: generateTopicsRequest,
      });

      return {
        message: `Successfully generated and linked  topics to content entry`,
        topicsCreated: 1,
      };
    } catch (error) {
      this.logger.error('Error generating topics for content entry:', error);
      throw error;
    }
  }

  /**
   * Update a Content Entry, using a content entry id, and user id,
   * to enable the column questions_generated to true.
   */
  updateContentEntry(params: {
    userId: string;
    contentEntryId: number;
  }): Observable<ContentEntry> {
    const { userId, contentEntryId } = params;

    return from(
      this.prisma.contentEntry.findFirst({
        where: {
          id: BigInt(contentEntryId),
          contentBanks: {
            some: {
              contentBank: {
                userId,
              },
            },
          },
        },
      }),
    ).pipe(
      switchMap((contentEntry) => {
        if (!contentEntry) {
          return throwError(
            () =>
              new NotFoundException(
                'Content entry not found or you do not have permission to access it',
              ),
          );
        }

        return from(
          this.prisma.contentEntry.update({
            where: { id: BigInt(contentEntryId) },
            data: {
              questionsGenerated: true,
            },
          }),
        );
      }),
    );
  }

  async calculateTotalChunksForBank(
    bankId: number,
    userId: string,
  ): Promise<number> {
    // Get configurable chunk size from environment variable, default to 2500
    const chunkSize = parseInt(process.env.CONTENT_CHUNK_SIZE || '2500', 10);
  
    // Verify that the bank belongs to the user
    const contentBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(bankId),
        userId,
      },
    });
  
    if (!contentBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
    }
  
    // Get all content entries for the specified bank
    const contentEntries = await this.prisma.contentEntry.findMany({
      where: {
        contentBanks: {
          some: {
            contentBankId: BigInt(bankId),
          },
        },
      },
      select: {
        id: true,
        content: true,
      },
    });
  
    let totalChunks = 0;
  
    // Calculate chunks for each content entry
    for (const entry of contentEntries) {
      if (entry.content) {
        // Split content into chunks of specified size
        const content = entry.content;
        const chunks = Math.ceil(content.length / chunkSize);
        totalChunks += chunks;
      }
    }
  
    this.logger.log(
      `Calculated ${totalChunks} total chunks for bank ${bankId} with chunk size ${chunkSize}`,
    );
  
    return totalChunks;
  }
}
