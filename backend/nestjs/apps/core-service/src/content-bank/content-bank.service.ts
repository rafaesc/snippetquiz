import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../commons/services';
import { CreateContentBankDto } from './dto/create-content-bank.dto';
import { UpdateContentBankDto } from './dto/update-content-bank.dto';
import { DuplicateContentBankDto } from './dto/duplicate-content-bank.dto';
import { FindAllContentBanksDto } from './dto/find-all-content-banks.dto';
import {
  ContentBankResponseDto,
  PaginatedContentBanksResponseDto,
} from './dto/content-bank-response.dto';

@Injectable()
export class ContentBankService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createContentBankDto: CreateContentBankDto,
  ): Promise<ContentBankResponseDto> {
    const { name, userId } = createContentBankDto;

    // Check if user already has a content bank with this name
    const existingBank = await this.prisma.contentBank.findFirst({
      where: {
        userId,
        name: name.trim(),
      },
    });

    if (existingBank) {
      throw new ConflictException(
        'A content bank with this name already exists',
      );
    }

    const contentBank = await this.prisma.contentBank.create({
      data: {
        userId,
        name: name.trim(),
      },
    });

    return {
      id: Number(contentBank.id),
      name: contentBank.name,
      user_id: contentBank.userId,
      created_at: contentBank.createdAt,
      updated_at: contentBank.updatedAt,
      entry_count: 0,
    };
  }

  async findAll(
    findAllDto: FindAllContentBanksDto,
  ): Promise<PaginatedContentBanksResponseDto> {
    const { page = 1, limit = 10, name, userId } = findAllDto;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(name && {
        name: {
          contains: name.trim(),
          mode: 'insensitive' as const,
        },
      }),
    };

    const [contentBanks, total] = await Promise.all([
      this.prisma.contentBank.findMany({
        where,
        include: {
          _count: {
            select: {
              contentEntries: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.contentBank.count({ where }),
    ]);

    return {
      content_banks: contentBanks.map((bank) => ({
        id: Number(bank.id),
        name: bank.name,
        user_id: bank.userId,
        created_at: bank.createdAt,
        updated_at: bank.updatedAt,
        content_entries: bank._count.contentEntries,
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<ContentBankResponseDto> {
    const contentBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
      include: {
        _count: {
          select: {
            contentEntries: true,
          },
        },
      },
    });

    if (!contentBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
    }

    return {
      id: Number(contentBank.id),
      name: contentBank.name,
      user_id: contentBank.userId,
      created_at: contentBank.createdAt,
      updated_at: contentBank.updatedAt,
      entry_count: contentBank._count.contentEntries,
    };
  }

  async update(
    id: string,
    updateContentBankDto: UpdateContentBankDto,
  ): Promise<ContentBankResponseDto> {
    const { name, userId } = updateContentBankDto;

    // Check if the content bank exists and belongs to the user
    const existingBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
    });

    if (!existingBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
    }

    // Check if user already has another content bank with this name
    if (name) {
      const duplicateBank = await this.prisma.contentBank.findFirst({
        where: {
          userId,
          name: name.trim(),
          NOT: {
            id: BigInt(id),
          },
        },
      });

      if (duplicateBank) {
        throw new ConflictException(
          'A content bank with this name already exists',
        );
      }
    }

    const updatedBank = await this.prisma.contentBank.update({
      where: {
        id: BigInt(id),
      },
      data: {
        ...(name && { name: name.trim() }),
      },
    });

    return {
      id: Number(updatedBank.id),
      name: updatedBank.name,
      user_id: updatedBank.userId,
      created_at: updatedBank.createdAt,
      updated_at: updatedBank.updatedAt,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Check if the content bank exists and belongs to the user
    const contentBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
    });

    if (!contentBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
    }

    await this.prisma.contentBank.delete({
      where: {
        id: BigInt(id),
      },
    });

    return { message: 'Content bank deleted successfully' };
  }

  async duplicate(
    id: string,
    userId: string,
    duplicateDto: DuplicateContentBankDto,
  ): Promise<ContentBankResponseDto> {
    // Check if the original content bank exists and belongs to the user
    const originalBank = await this.prisma.contentBank.findFirst({
      where: {
        id: BigInt(id),
        userId,
      },
    });

    if (!originalBank) {
      throw new NotFoundException(
        'Content bank not found or does not belong to user',
      );
    }

    // Generate new name if not provided
    const newName = duplicateDto.name?.trim() || `Copy of ${originalBank.name}`;

    // Check if user already has a content bank with this name
    const existingBank = await this.prisma.contentBank.findFirst({
      where: {
        userId,
        name: newName,
      },
    });

    if (existingBank) {
      throw new ConflictException(
        'A content bank with this name already exists',
      );
    }

    // Use Prisma transaction to ensure data consistency
    const duplicatedBank = await this.prisma.$transaction(async (prisma) => {
      // Create the new content bank
      const newBank = await prisma.contentBank.create({
        data: {
          userId,
          name: newName,
        },
      });

      // Get all content entries associated with the original bank
      const contentEntryAssociations = await prisma.contentEntryBank.findMany({
        where: {
          contentBankId: BigInt(id),
        },
        include: {
          contentEntry: {
            include: {
              questions: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      // Duplicate each content entry and its associations
      for (const association of contentEntryAssociations) {
        if (association.contentEntry) {
          const originalEntry = association.contentEntry;

          // Create new content entry
          const newEntry = await prisma.contentEntry.create({
            data: {
              contentType: originalEntry.contentType,
              content: originalEntry.content,
              sourceUrl: originalEntry.sourceUrl,
              pageTitle: originalEntry.pageTitle,
              promptSummary: originalEntry.promptSummary,
            },
          });

          // Associate the new content entry with the new bank
          await prisma.contentEntryBank.create({
            data: {
              contentEntryId: newEntry.id,
              contentBankId: newBank.id,
            },
          });

          // Duplicate questions and their options
          for (const originalQuestion of originalEntry.questions) {
            const newQuestion = await prisma.question.create({
              data: {
                question: originalQuestion.question,
                type: originalQuestion.type,
                contentEntryId: newEntry.id,
              },
            });

            // Duplicate question options
            for (const originalOption of originalQuestion.options) {
              await prisma.questionOption.create({
                data: {
                  questionId: newQuestion.id,
                  optionText: originalOption.optionText,
                  optionExplanation: originalOption.optionExplanation,
                  isCorrect: originalOption.isCorrect,
                },
              });
            }
          }
        }
      }

      return newBank;
    });

    return {
      id: Number(duplicatedBank.id),
      name: duplicatedBank.name,
      user_id: duplicatedBank.userId,
      created_at: duplicatedBank.createdAt,
      updated_at: duplicatedBank.updatedAt,
    };
  }
}
