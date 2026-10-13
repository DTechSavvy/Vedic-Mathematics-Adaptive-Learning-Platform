-- CreateTable
CREATE TABLE IF NOT EXISTS "Sutra" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meaning" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mathematicalIdea" TEXT NOT NULL,
    "whenToUse" TEXT NOT NULL,
    "whenNotToUse" TEXT NOT NULL,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "example" JSONB NOT NULL,
    "commonMistakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "practiceGuidance" TEXT NOT NULL,
    "relatedSutras" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "practiceTemplateType" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "icon" TEXT NOT NULL DEFAULT '🕉️',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sutra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Sutra_number_key" ON "Sutra"("number");
