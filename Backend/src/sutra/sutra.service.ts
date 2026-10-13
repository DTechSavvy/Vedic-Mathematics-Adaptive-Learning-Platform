import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CANONICAL_SUTRAS, CanonicalSutra } from './canonical-sutras.data';

@Injectable()
export class SutraService implements OnModuleInit {
  private readonly logger = new Logger(SutraService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureCanonicalSutrasSeeded();
  }

  async ensureCanonicalSutrasSeeded(): Promise<void> {
    try {
      for (const sutra of CANONICAL_SUTRAS) {
        await this.prisma.sutra.upsert({
          where: { id: sutra.id },
          update: {
            number: sutra.number,
            name: sutra.name,
            aliases: sutra.aliases,
            meaning: sutra.meaning,
            description: sutra.description,
            mathematicalIdea: sutra.mathematicalIdea,
            whenToUse: sutra.whenToUse,
            whenNotToUse: sutra.whenNotToUse,
            prerequisites: sutra.prerequisites,
            example: sutra.example,
            commonMistakes: sutra.commonMistakes,
            practiceGuidance: sutra.practiceGuidance,
            relatedSutras: sutra.relatedSutras,
            practiceTemplateType: sutra.practiceTemplateType,
            difficulty: sutra.difficulty,
            icon: sutra.icon,
          },
          create: {
            id: sutra.id,
            number: sutra.number,
            name: sutra.name,
            aliases: sutra.aliases,
            meaning: sutra.meaning,
            description: sutra.description,
            mathematicalIdea: sutra.mathematicalIdea,
            whenToUse: sutra.whenToUse,
            whenNotToUse: sutra.whenNotToUse,
            prerequisites: sutra.prerequisites,
            example: sutra.example,
            commonMistakes: sutra.commonMistakes,
            practiceGuidance: sutra.practiceGuidance,
            relatedSutras: sutra.relatedSutras,
            practiceTemplateType: sutra.practiceTemplateType,
            difficulty: sutra.difficulty,
            icon: sutra.icon,
          },
        });
      }
      this.logger.log(
        'Canonical 16 Sutras verified and up to date in database.',
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to verify canonical Sutras in DB: ${message}`);
    }
  }

  async findAll() {
    const list = await this.prisma.sutra.findMany({
      orderBy: { number: 'asc' },
    });

    if (list.length > 0) {
      return list;
    }

    // Fallback to static canonical dataset if database is cold
    return CANONICAL_SUTRAS;
  }

  async findById(sutraId: string) {
    const found = await this.prisma.sutra.findUnique({
      where: { id: sutraId },
    });

    if (found) {
      return found;
    }

    // Fallback
    return CANONICAL_SUTRAS.find((s) => s.id === sutraId) ?? null;
  }

  getCanonicalData(): CanonicalSutra[] {
    return CANONICAL_SUTRAS;
  }
}
