-- Add the curriculum fields used by the lesson seed and AI Tutor context.
ALTER TABLE "Course"
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

ALTER TABLE "Module"
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "difficulty" "Difficulty";

ALTER TABLE "Topic"
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "difficulty" "Difficulty",
ADD COLUMN "learningObjectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "sutra" TEXT,
ADD COLUMN "subSutra" TEXT,
ADD COLUMN "technique" TEXT,
ADD COLUMN "estimatedMinutes" INTEGER;

ALTER TABLE "Lesson"
ADD COLUMN "description" TEXT,
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
ADD COLUMN "learningObjectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "explanation" TEXT,
ADD COLUMN "steps" JSONB,
ADD COLUMN "sutra" TEXT,
ADD COLUMN "subSutra" TEXT,
ADD COLUMN "technique" TEXT,
ADD COLUMN "method" TEXT,
ADD COLUMN "estimatedMinutes" INTEGER,
ADD COLUMN "prerequisiteLessonId" INTEGER;

CREATE TABLE "LessonExample" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "sutra" TEXT,
    "technique" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonExample_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonExample_lessonId_idx" ON "LessonExample"("lessonId");

ALTER TABLE "Lesson"
ADD CONSTRAINT "Lesson_prerequisiteLessonId_fkey"
FOREIGN KEY ("prerequisiteLessonId") REFERENCES "Lesson"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LessonExample"
ADD CONSTRAINT "LessonExample_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
ON DELETE CASCADE ON UPDATE CASCADE;