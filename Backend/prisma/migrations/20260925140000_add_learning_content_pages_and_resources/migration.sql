-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN "lastVisitedPageId" INTEGER;

-- CreateTable
CREATE TABLE "LearningPage" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'CONTENT',
    "order" INTEGER NOT NULL DEFAULT 1,
    "contentMarkdown" TEXT NOT NULL,
    "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningResource" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER,
    "topicId" INTEGER,
    "lessonId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "embedUrl" TEXT,
    "provider" TEXT,
    "authorOrPublisher" TEXT,
    "attributionText" TEXT,
    "licenseType" TEXT,
    "licenseUrl" TEXT,
    "sourceDate" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPageProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPageProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningPage_lessonId_isPublished_idx" ON "LearningPage"("lessonId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPage_lessonId_order_key" ON "LearningPage"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPage_lessonId_slug_key" ON "LearningPage"("lessonId", "slug");

-- CreateIndex
CREATE INDEX "LearningResource_pageId_idx" ON "LearningResource"("pageId");

-- CreateIndex
CREATE INDEX "LearningResource_topicId_idx" ON "LearningResource"("topicId");

-- CreateIndex
CREATE INDEX "LearningResource_lessonId_idx" ON "LearningResource"("lessonId");

-- CreateIndex
CREATE INDEX "LearningPageProgress_userId_isCompleted_idx" ON "LearningPageProgress"("userId", "isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPageProgress_userId_pageId_key" ON "LearningPageProgress"("userId", "pageId");

-- AddForeignKey
ALTER TABLE "LearningPage" ADD CONSTRAINT "LearningPage_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "LearningPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPageProgress" ADD CONSTRAINT "LearningPageProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPageProgress" ADD CONSTRAINT "LearningPageProgress_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "LearningPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
