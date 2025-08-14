import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/postgres';
import { CreateContentBankDto } from './dto/create-content-bank.dto';
import { UpdateContentBankDto } from './dto/update-content-bank.dto';
import { DuplicateContentBankDto } from './dto/duplicate-content-bank.dto';
import { FindAllContentBanksDto } from './dto/find-all-content-banks.dto';
import {
  ContentBankResponseDto,
  PaginatedContentBanksResponseDto,
} from './dto/content-bank-response.dto';

@Injectable()
export class ContentBankService extends PrismaClient {
  constructor() {
    super();
  }

  async create(
    createContentBankDto: CreateContentBankDto,
  ): Promise<ContentBankResponseDto> {
    const { name, userId } = createContentBankDto;

    // Check if user already has a content bank with this name
    const existingBank = await this.contentBank.findFirst({
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

    const contentBank = await this.contentBank.create({
      data: {
        userId,
        name: name.trim(),
      },
    });

    return {
      id: contentBank.id.toString(),
      name: contentBank.name,
      userId: contentBank.userId,
      createdAt: contentBank.createdAt,
      updatedAt: contentBank.updatedAt,
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
      this.contentBank.findMany({
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
      this.contentBank.count({ where }),
    ]);

    return {
      contentBanks: contentBanks.map((bank) => ({
        id: bank.id.toString(),
        name: bank.name,
        userId: bank.userId,
        createdAt: bank.createdAt,
        updatedAt: bank.updatedAt,
        entryCount: bank._count.contentEntries,
      })),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<ContentBankResponseDto> {
    const contentBank = await this.contentBank.findFirst({
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
      id: contentBank.id.toString(),
      name: contentBank.name,
      userId: contentBank.userId,
      createdAt: contentBank.createdAt,
      updatedAt: contentBank.updatedAt,
      entryCount: contentBank._count.contentEntries,
    };
  }

  async update(
    id: string,
    updateContentBankDto: UpdateContentBankDto,
  ): Promise<ContentBankResponseDto> {
    const { name, userId } = updateContentBankDto;

    // Check if the content bank exists and belongs to the user
    const existingBank = await this.contentBank.findFirst({
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
      const duplicateBank = await this.contentBank.findFirst({
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

    const updatedBank = await this.contentBank.update({
      where: {
        id: BigInt(id),
      },
      data: {
        ...(name && { name: name.trim() }),
      },
    });

    return {
      id: updatedBank.id.toString(),
      name: updatedBank.name,
      userId: updatedBank.userId,
      createdAt: updatedBank.createdAt,
      updatedAt: updatedBank.updatedAt,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Check if the content bank exists and belongs to the user
    const contentBank = await this.contentBank.findFirst({
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

    await this.contentBank.delete({
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
    const originalBank = await this.contentBank.findFirst({
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
    const existingBank = await this.contentBank.findFirst({
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
    const duplicatedBank = await this.$transaction(async (prisma) => {
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
      id: duplicatedBank.id.toString(),
      name: duplicatedBank.name,
      userId: duplicatedBank.userId,
      createdAt: duplicatedBank.createdAt,
      updatedAt: duplicatedBank.updatedAt,
    };
  }
}
