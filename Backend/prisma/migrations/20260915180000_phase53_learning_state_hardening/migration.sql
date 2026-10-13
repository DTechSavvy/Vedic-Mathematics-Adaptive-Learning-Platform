-- AlterTable: QuestionAttempt
ALTER TABLE "QuestionAttempt" ADD COLUMN IF NOT EXISTS "questionType" TEXT;
ALTER TABLE "QuestionAttempt" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;
ALTER TABLE "QuestionAttempt" ADD COLUMN IF NOT EXISTS "sutraId" TEXT;
ALTER TABLE "QuestionAttempt" ADD COLUMN IF NOT EXISTS "isValidAttempt" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: LessonProgress
CREATE TABLE IF NOT EXISTS "LessonProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPENED',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LessonProgress_userId_fkey') THEN
        ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LessonProgress_lessonId_fkey') THEN
        ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "LessonProgress_userId_status_idx" ON "LessonProgress"("userId", "status");

-- CreateTable: UserEntitlement
CREATE TABLE IF NOT EXISTS "UserEntitlement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "activeUntil" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEntitlement_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserEntitlement_userId_fkey') THEN
        ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "UserEntitlement_userId_type_key" ON "UserEntitlement"("userId", "type");
CREATE INDEX IF NOT EXISTS "UserEntitlement_userId_idx" ON "UserEntitlement"("userId");
