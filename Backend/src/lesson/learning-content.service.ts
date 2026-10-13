import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PageSummaryDto {
  id: number;
  lessonId: number;
  title: string;
  slug: string;
  pageType: string;
  order: number;
  estimatedMinutes: number;
  difficulty: string;
  isCompleted?: boolean;
  timeSpentSeconds?: number;
  lastVisitedAt?: Date | null;
  resourcesCount: number;
}

export interface PageDetailDto {
  id: number;
  lessonId: number;
  title: string;
  slug: string;
  pageType: string;
  order: number;
  contentMarkdown: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  difficulty: string;
  version: number;
  metadata?: any;
  resources: any[];
  isCompleted?: boolean;
  timeSpentSeconds?: number;
  lastVisitedAt?: Date | null;
  navigation: {
    previousPage: { id: number; title: string; slug: string } | null;
    nextPage: { id: number; title: string; slug: string } | null;
    totalPublishedPages: number;
    currentPageIndex: number;
  };
  lesson: {
    id: number;
    title: string;
    topicId: number;
    topicTitle: string;
    moduleTitle: string;
    courseTitle: string;
  };
}

@Injectable()
export class LearningContentService {
  private readonly logger = new Logger(LearningContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve all published learning pages for a lesson, with optional student progress
   * Supports both lessonId and topicId lookups gracefully
   */
  async getLessonPages(
    lessonId: number,
    userId?: number,
  ): Promise<any> {
    // 1. First attempt lookup by lessonId
    let lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: {
          include: {
            module: true,
          },
        },
        pages: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            resources: {
              where: { isActive: true },
              select: { id: true },
            },
            progress: userId
              ? {
                  where: { userId },
                }
              : false,
          },
        },
        resources: {
          where: { isActive: true },
        },
      },
    });

    // 2. If not found by lessonId, attempt lookup by topicId (flexible fallback)
    if (!lesson) {
      lesson = await this.prisma.lesson.findFirst({
        where: { topicId: lessonId },
        include: {
          topic: {
            include: {
              module: true,
            },
          },
          pages: {
            where: { isPublished: true },
            orderBy: { order: 'asc' },
            include: {
              resources: {
                where: { isActive: true },
                select: { id: true },
              },
              progress: userId
                ? {
                    where: { userId },
                  }
                : false,
            },
          },
          resources: {
            where: { isActive: true },
          },
        },
      });
    }

    // 3. If still no lesson found, check if a Topic exists with this ID to provide a structured empty state
    if (!lesson) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: lessonId },
        include: {
          module: true,
          resources: {
            where: { isActive: true },
          },
        },
      });

      if (!topic) {
        throw new NotFoundException(`Lesson or Topic with ID ${lessonId} not found`);
      }

      return {
        lesson: {
          id: 0,
          title: `${topic.title} Lesson`,
          description: topic.description || `Learning module for ${topic.title}.`,
          topicId: topic.id,
          topicTitle: topic.title,
          moduleTitle: topic.module?.title || 'Vedic Mathematics',
          sutra: topic.sutra || null,
          technique: topic.technique || null,
        },
        pages: [],
        resources: (topic.resources || []).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          resourceType: r.resourceType,
          url: r.url,
          embedUrl: r.embedUrl,
          authorOrPublisher: r.authorOrPublisher,
          attributionText: r.attributionText,
          licenseType: r.licenseType,
          isVerified: r.isVerified,
        })),
        stats: {
          totalPages: 0,
          completedPages: 0,
          progressPercentage: 0,
          totalEstimatedMinutes: topic.estimatedMinutes || 15,
        },
        lastVisitedPageId: null,
        // Backward-compatibility fields
        lessonId: 0,
        lessonTitle: `${topic.title} Lesson`,
        totalPages: 0,
        completedPages: 0,
      };
    }

    // 4. Calculate progress and total estimated minutes
    let completedPagesCount = 0;
    let totalEstimatedMinutes = 0;

    const pages: PageSummaryDto[] = lesson.pages.map((p) => {
      const userProg = p.progress && p.progress.length > 0 ? p.progress[0] : null;
      const isCompleted = userProg?.isCompleted || false;
      if (isCompleted) completedPagesCount++;
      totalEstimatedMinutes += p.estimatedMinutes || 5;

      return {
        id: p.id,
        lessonId: p.lessonId,
        title: p.title,
        slug: p.slug,
        pageType: p.pageType,
        order: p.order,
        estimatedMinutes: p.estimatedMinutes,
        difficulty: p.difficulty,
        isCompleted,
        timeSpentSeconds: userProg?.timeSpentSeconds || 0,
        lastVisitedAt: userProg?.lastVisitedAt || null,
        resourcesCount: p.resources.length,
      };
    });

    // 5. Look up student's last visited page if authenticated
    let lastVisitedPageId: number | null = null;
    if (userId) {
      const lessonProg = await this.prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: lesson.id,
          },
        },
      });
      if (lessonProg?.lastVisitedPageId) {
        lastVisitedPageId = lessonProg.lastVisitedPageId;
      }
    }

    // Map verified resources attached to lesson or topic
    const resources = (lesson.resources || []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      resourceType: r.resourceType,
      url: r.url,
      embedUrl: r.embedUrl,
      authorOrPublisher: r.authorOrPublisher,
      attributionText: r.attributionText,
      licenseType: r.licenseType,
      isVerified: r.isVerified,
    }));

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        topicId: lesson.topicId,
        topicTitle: lesson.topic?.title || '',
        moduleTitle: lesson.topic?.module?.title || '',
        sutra: lesson.sutra || lesson.topic?.sutra || null,
        technique: lesson.technique || lesson.topic?.technique || null,
      },
      pages,
      resources,
      stats: {
        totalPages: pages.length,
        completedPages: completedPagesCount,
        progressPercentage:
          pages.length > 0
            ? Math.round((completedPagesCount / pages.length) * 100)
            : 0,
        totalEstimatedMinutes:
          totalEstimatedMinutes > 0
            ? totalEstimatedMinutes
            : lesson.estimatedMinutes || 15,
      },
      lastVisitedPageId,
      // Backward-compatibility fields
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      totalPages: pages.length,
      completedPages: completedPagesCount,
    };
  }

  /**
   * Retrieve full details of a specific learning page by ID or slug
   */
  async getPageDetails(
    lessonId: number,
    pageIdOrSlug: string | number,
    userId?: number,
  ): Promise<PageDetailDto> {
    const isNumeric =
      typeof pageIdOrSlug === 'number' || /^\d+$/.test(String(pageIdOrSlug));
    const pageId = isNumeric ? Number(pageIdOrSlug) : undefined;
    const slug = !isNumeric ? String(pageIdOrSlug) : undefined;

    // Resolve actual lessonId if a topicId was provided
    let resolvedLessonId = lessonId;
    const lessonDirect = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lessonDirect) {
      const lessonByTopic = await this.prisma.lesson.findFirst({
        where: { topicId: lessonId },
        select: { id: true },
      });
      if (lessonByTopic) {
        resolvedLessonId = lessonByTopic.id;
      }
    }

    const page = await this.prisma.learningPage.findFirst({
      where: {
        lessonId: resolvedLessonId,
        isPublished: true,
        ...(pageId ? { id: pageId } : { slug }),
      },
      include: {
        resources: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        progress: userId
          ? {
              where: { userId },
            }
          : false,
        lesson: {
          include: {
            topic: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException(
        `Learning page "${pageIdOrSlug}" for lesson ID ${lessonId} not found`,
      );
    }

    // Retrieve sibling pages for deterministic next/previous navigation
    const allPublished = await this.prisma.learningPage.findMany({
      where: { lessonId: resolvedLessonId, isPublished: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, slug: true, order: true },
    });

    const currentIndex = allPublished.findIndex((p) => p.id === page.id);
    const prevPage = currentIndex > 0 ? allPublished[currentIndex - 1] : null;
    const nextPage =
      currentIndex < allPublished.length - 1
        ? allPublished[currentIndex + 1]
        : null;

    const userProg =
      page.progress && page.progress.length > 0 ? page.progress[0] : null;

    return {
      id: page.id,
      lessonId: page.lessonId,
      title: page.title,
      slug: page.slug,
      pageType: page.pageType,
      order: page.order,
      contentMarkdown: page.contentMarkdown,
      learningObjectives: page.learningObjectives,
      estimatedMinutes: page.estimatedMinutes,
      difficulty: page.difficulty,
      version: page.version,
      metadata: page.metadata,
      resources: page.resources,
      isCompleted: userProg?.isCompleted || false,
      timeSpentSeconds: userProg?.timeSpentSeconds || 0,
      lastVisitedAt: userProg?.lastVisitedAt || null,
      navigation: {
        previousPage: prevPage
          ? { id: prevPage.id, title: prevPage.title, slug: prevPage.slug }
          : null,
        nextPage: nextPage
          ? { id: nextPage.id, title: nextPage.title, slug: nextPage.slug }
          : null,
        totalPublishedPages: allPublished.length,
        currentPageIndex: currentIndex + 1,
      },
      lesson: {
        id: page.lesson.id,
        title: page.lesson.title,
        topicId: page.lesson.topicId,
        topicTitle: page.lesson.topic.title,
        moduleTitle: page.lesson.topic.module.title,
        courseTitle: page.lesson.topic.module.course.title,
      },
    };
  }

  /**
   * Record page visit / started state
   */
  async startPage(userId: number, pageId: number) {
    const page = await this.prisma.learningPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException(`Page #${pageId} not found`);
    }

    // Upsert page progress
    const pageProgress = await this.prisma.learningPageProgress.upsert({
      where: {
        userId_pageId: {
          userId,
          pageId,
        },
      },
      update: {
        lastVisitedAt: new Date(),
      },
      create: {
        userId,
        pageId,
        lastVisitedAt: new Date(),
        isCompleted: false,
      },
    });

    // Update parent lesson progress
    await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: page.lessonId,
        },
      },
      update: {
        lastVisitedPageId: pageId,
      },
      create: {
        userId,
        lessonId: page.lessonId,
        status: 'IN_PROGRESS',
        lastVisitedPageId: pageId,
      },
    });

    return pageProgress;
  }

  /**
   * Complete a learning page, evaluate lesson completion, and award gamification tokens
   */
  async completePage(
    userId: number,
    pageId: number,
    timeSpentSeconds: number = 0,
  ): Promise<{
    pageCompleted: boolean;
    pageId: number;
    lessonCompleted: boolean;
    lessonId: number;
    nextPageId: number | null;
    earnedXp?: number;
    earnedCoins?: number;
  }> {
    const page = await this.prisma.learningPage.findUnique({
      where: { id: pageId },
      include: {
        lesson: {
          include: {
            pages: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: { id: true, order: true },
            },
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException(`Page #${pageId} not found`);
    }

    const lessonId = page.lessonId;

    // 1. Mark page completed
    await this.prisma.learningPageProgress.upsert({
      where: {
        userId_pageId: {
          userId,
          pageId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        timeSpentSeconds: {
          increment: Math.max(0, timeSpentSeconds),
        },
        lastVisitedAt: new Date(),
      },
      create: {
        userId,
        pageId,
        isCompleted: true,
        completedAt: new Date(),
        timeSpentSeconds: Math.max(0, timeSpentSeconds),
        lastVisitedAt: new Date(),
      },
    });

    // Real-time Streak Evaluation on learning activity
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, lastActiveDate: true },
      });
      const now = new Date();
      let updatedStreak = user?.streak || 0;
      if (user?.lastActiveDate) {
        const lastDate = new Date(user.lastActiveDate);
        const getUtcMidnight = (d: Date) =>
          Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        const diffDays = Math.round(
          (getUtcMidnight(now) - getUtcMidnight(lastDate)) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
          updatedStreak += 1;
        } else if (diffDays > 1) {
          updatedStreak = 1;
        }
      } else {
        updatedStreak = 1;
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveDate: now,
          streak: updatedStreak,
        },
      });
    } catch (streakErr: any) {
      this.logger.warn(`Failed to update daily streak on page completion: ${streakErr.message}`);
    }

    // 2. Find next page
    const currentIndex = page.lesson.pages.findIndex((p) => p.id === page.id);
    const nextPage =
      currentIndex < page.lesson.pages.length - 1
        ? page.lesson.pages[currentIndex + 1]
        : null;

    // 3. Evaluate total lesson completion
    const allPublishedPageIds = page.lesson.pages.map((p) => p.id);
    const completedPages = await this.prisma.learningPageProgress.findMany({
      where: {
        userId,
        pageId: { in: allPublishedPageIds },
        isCompleted: true,
      },
    });

    const isLessonFullyCompleted =
      completedPages.length >= allPublishedPageIds.length;

    let earnedXp = 0;
    let earnedCoins = 0;

    if (isLessonFullyCompleted) {
      const existingLessonProgress =
        await this.prisma.lessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
        });

      const wasAlreadyCompleted =
        existingLessonProgress?.status === 'COMPLETED';

      await this.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          status: 'COMPLETED',
          completedAt: wasAlreadyCompleted
            ? existingLessonProgress?.completedAt
            : new Date(),
          lastVisitedPageId: pageId,
        },
        create: {
          userId,
          lessonId,
          status: 'COMPLETED',
          completedAt: new Date(),
          lastVisitedPageId: pageId,
        },
      });

      // Award XP and Coins if newly completed
      if (!wasAlreadyCompleted) {
        earnedXp = 50;
        earnedCoins = 25;

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: earnedXp },
            coins: { increment: earnedCoins },
          },
        });

        await this.prisma.coinTransaction.create({
          data: {
            userId,
            amount: earnedCoins,
            type: 'EARN',
            source: 'LESSON_COMPLETE',
            referenceId: `lesson_${lessonId}`,
          },
        });

        this.logger.log(
          `User #${userId} completed Lesson #${lessonId} (Awarded +${earnedXp} XP, +${earnedCoins} Coins)`,
        );
      }
    } else {
      // Still in progress
      await this.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          status: 'IN_PROGRESS',
          lastVisitedPageId: pageId,
        },
        create: {
          userId,
          lessonId,
          status: 'IN_PROGRESS',
          lastVisitedPageId: pageId,
        },
      });
    }

    return {
      pageCompleted: true,
      pageId,
      lessonCompleted: isLessonFullyCompleted,
      lessonId,
      nextPageId: nextPage ? nextPage.id : null,
      ...(earnedXp > 0 ? { earnedXp, earnedCoins } : {}),
    };
  }

  /**
   * Resume lesson: returns last visited page or next uncompleted page
   */
  async resumeLesson(
    userId: number,
    lessonId: number,
  ): Promise<{
    lessonId: number;
    recommendedPageId: number;
    reason: 'LAST_VISITED' | 'FIRST_UNCOMPLETED' | 'FIRST_PAGE';
  }> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        pages: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: { id: true },
        },
      },
    });

    if (!lesson || lesson.pages.length === 0) {
      throw new NotFoundException(`No pages found for Lesson #${lessonId}`);
    }

    // Check last visited page
    const lessonProg = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (
      lessonProg?.lastVisitedPageId &&
      lesson.pages.some((p) => p.id === lessonProg.lastVisitedPageId)
    ) {
      return {
        lessonId,
        recommendedPageId: lessonProg.lastVisitedPageId,
        reason: 'LAST_VISITED',
      };
    }

    // Find first uncompleted page
    const completedPages = await this.prisma.learningPageProgress.findMany({
      where: {
        userId,
        pageId: { in: lesson.pages.map((p) => p.id) },
        isCompleted: true,
      },
      select: { pageId: true },
    });

    const completedIds = new Set(completedPages.map((p) => p.pageId));
    const firstUncompleted = lesson.pages.find((p) => !completedIds.has(p.id));

    if (firstUncompleted) {
      return {
        lessonId,
        recommendedPageId: firstUncompleted.id,
        reason: 'FIRST_UNCOMPLETED',
      };
    }

    return {
      lessonId,
      recommendedPageId: lesson.pages[0].id,
      reason: 'FIRST_PAGE',
    };
  }

  /**
   * Retrieve educational resources for a specific topic
   */
  async getTopicResources(topicId: number) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        resources: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        lessons: {
          include: {
            resources: {
              where: { isActive: true },
            },
            pages: {
              include: {
                resources: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic #${topicId} not found`);
    }

    // Aggregate resources
    const allResources: any[] = [...topic.resources];
    for (const l of topic.lessons) {
      allResources.push(...l.resources);
      for (const p of l.pages) {
        allResources.push(...p.resources);
      }
    }

    // Deduplicate by URL or ID
    const seen = new Set<string>();
    const uniqueResources = allResources.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    return {
      topicId: topic.id,
      topicTitle: topic.title,
      totalResources: uniqueResources.length,
      resources: uniqueResources,
    };
  }
}
