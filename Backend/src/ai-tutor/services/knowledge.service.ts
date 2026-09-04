import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeResult } from '../interfaces/knowledge-result.interface';

type TopicWithCurriculum = Prisma.TopicGetPayload<{
  include: {
    lessons: { take: 1 };
    templates: { take: 2 };
  };
}>;

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly cache = new Map<
    string,
    { data: KnowledgeResult[]; expiresAt: number }
  >();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache for stable curriculum data

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Main knowledge retrieval method based on context and extracted NLP entities
   */
  async retrieveRelevant(
    params: {
      topicId?: number | null;
      technique?: string | null;
      sutra?: string | null;
      query?: string | null;
    },
    limit = 4,
  ): Promise<KnowledgeResult[]> {
    const cacheKey = `rel:${params.topicId || ''}:${params.technique || ''}:${params.sutra || ''}:${params.query || ''}:${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const results: KnowledgeResult[] = [];
    const seenIds = new Set<number>();

    // 1. If technique specified, retrieve by technique
    if (params.technique) {
      const byTech = await this.findByTechnique(params.technique, limit);
      for (const item of byTech) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          results.push(item);
        }
      }
    }

    // 2. If sutra specified, retrieve by sutra
    if (params.sutra && results.length < limit) {
      const bySutra = await this.findBySutra(
        params.sutra,
        limit - results.length,
      );
      for (const item of bySutra) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          results.push(item);
        }
      }
    }

    // 3. If topicId specified, retrieve by topic
    if (params.topicId && results.length < limit) {
      const byTopic = await this.findByTopic(
        params.topicId,
        limit - results.length,
      );
      for (const item of byTopic) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          results.push(item);
        }
      }
    }

    // 4. Keyword search if still have capacity
    if (params.query && results.length < limit) {
      const byQuery = await this.searchKnowledge(
        params.query,
        limit - results.length,
      );
      for (const item of byQuery) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          results.push(item);
        }
      }
    }

    // 5. Fallback: If no KnowledgeDocument found yet, extract curriculum from Topic & Lesson models
    if (results.length === 0 && (params.topicId || params.query)) {
      const fallback = await this.retrieveCurriculumFallback(
        params.topicId,
        params.query,
      );
      if (fallback) {
        results.push(fallback);
      }
    }

    this.setCache(cacheKey, results);
    return results;
  }

  async findByTechnique(
    technique: string,
    limit = 5,
  ): Promise<KnowledgeResult[]> {
    try {
      const docs = await (this.prisma as any).knowledgeDocument.findMany({
        where: {
          technique: {
            contains: technique,
            mode: 'insensitive',
          },
        },
        take: limit,
      });

      return docs.map(this.mapToResult);
    } catch (err: any) {
      this.logger.debug(
        `Error querying KnowledgeDocument by technique: ${err.message}`,
      );
      return [];
    }
  }

  async findBySutra(sutra: string, limit = 5): Promise<KnowledgeResult[]> {
    try {
      const docs = await (this.prisma as any).knowledgeDocument.findMany({
        where: {
          sutra: {
            contains: sutra,
            mode: 'insensitive',
          },
        },
        take: limit,
      });

      return docs.map(this.mapToResult);
    } catch (err: any) {
      this.logger.debug(
        `Error querying KnowledgeDocument by sutra: ${err.message}`,
      );
      return [];
    }
  }

  async findByTopic(topicId: number, limit = 5): Promise<KnowledgeResult[]> {
    try {
      const docs = await (this.prisma as any).knowledgeDocument.findMany({
        where: { topicId },
        take: limit,
      });

      return docs.map(this.mapToResult);
    } catch (err: any) {
      this.logger.debug(
        `Error querying KnowledgeDocument by topicId: ${err.message}`,
      );
      return [];
    }
  }

  async searchKnowledge(query: string, limit = 5): Promise<KnowledgeResult[]> {
    try {
      const cleaned = query.replace(/[^\w\s]/g, '').trim();
      if (!cleaned) return [];

      const docs = await (this.prisma as any).knowledgeDocument.findMany({
        where: {
          OR: [
            { title: { contains: cleaned, mode: 'insensitive' } },
            { content: { contains: cleaned, mode: 'insensitive' } },
            { technique: { contains: cleaned, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });

      return docs.map(this.mapToResult);
    } catch (err: any) {
      this.logger.debug(`Error in searchKnowledge: ${err.message}`);
      return [];
    }
  }

  /**
   * Grounding fallback from existing Topic, Lesson, and QuestionTemplate models
   */
  private async retrieveCurriculumFallback(
    topicId?: number | null,
    query?: string | null,
  ): Promise<KnowledgeResult | null> {
    try {
      let topic: TopicWithCurriculum | null = null;
      if (topicId) {
        topic = await this.prisma.topic.findUnique({
          where: { id: topicId },
          include: {
            lessons: { take: 1 },
            templates: { take: 2 },
          },
        });
      } else if (query) {
        topic = await this.prisma.topic.findFirst({
          where: {
            title: { contains: query.slice(0, 30), mode: 'insensitive' },
          },
          include: {
            lessons: { take: 1 },
            templates: { take: 2 },
          },
        });
      }

      if (!topic) return null;

      const explanations = topic.templates
        .map((t) => t.explanation)
        .filter(Boolean)
        .join('\n\n');

      const content = [
        topic.description ? `Overview: ${topic.description}` : '',
        topic.lessons.length > 0
          ? `Lesson content: ${topic.lessons[0].content}`
          : '',
        explanations ? `Method explanation: ${explanations}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!content) return null;

      return {
        id: -topic.id, // negative ID indicates synthetic fallback
        title: topic.title,
        topicId: topic.id,
        technique: topic.title,
        sutra: null,
        content,
        contentType: 'concept',
        source: 'Curriculum Database (Topic & Lessons)',
        tags: [topic.title],
      };
    } catch (err: any) {
      this.logger.debug(`Fallback curriculum retrieval failed: ${err.message}`);
      return null;
    }
  }

  private mapToResult(doc: any): KnowledgeResult {
    return {
      id: doc.id,
      title: doc.title,
      topicId: doc.topicId,
      sutra: doc.sutra,
      technique: doc.technique,
      content: doc.content,
      contentType: doc.contentType,
      source: doc.source,
      tags: doc.tags || [],
    };
  }

  private getFromCache(key: string): KnowledgeResult[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: KnowledgeResult[]) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }
}
