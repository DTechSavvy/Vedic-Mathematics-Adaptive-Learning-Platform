import { Difficulty } from '@prisma/client';

export interface SeedPageData {
  title: string;
  slug: string;
  pageType: string;
  order: number;
  estimatedMinutes?: number;
  difficulty?: Difficulty;
  contentMarkdown: string;
  learningObjectives?: string[];
}

export interface SeedResourceData {
  title: string;
  description?: string;
  resourceType: string;
  url: string;
  embedUrl?: string;
  videoId?: string;
  provider?: string;
  authorOrPublisher?: string;
  attributionText?: string;
  licenseType?: string;
  isVerified?: boolean;
  isEmbeddable?: boolean;
}

export interface TopicContentPackage {
  topicTitle: string;
  moduleTitle?: string;
  lessonTitle?: string;
  lessonDescription?: string;
  sutra?: string;
  technique?: string;
  difficulty?: Difficulty;
  estimatedMinutes?: number;
  pages: SeedPageData[];
  resources?: SeedResourceData[];
}

export type TopicSeedData = TopicContentPackage;
