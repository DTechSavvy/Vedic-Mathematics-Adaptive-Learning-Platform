-- AlterTable: User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "coins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stars" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "wisdomStones" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: AchievementDefinition
CREATE TABLE IF NOT EXISTS "AchievementDefinition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "targetValue" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rewardXp" INTEGER NOT NULL DEFAULT 50,
    "rewardCoins" INTEGER NOT NULL DEFAULT 25,
    "rewardStars" INTEGER NOT NULL DEFAULT 0,
    "rewardStones" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementDefinition_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Achievement
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "achievementId" TEXT;
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "isCompleted" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Achievement_achievementId_fkey') THEN
        ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Achievement_userId_title_key" ON "Achievement"("userId", "title");
CREATE INDEX IF NOT EXISTS "Achievement_userId_isCompleted_idx" ON "Achievement"("userId", "isCompleted");

-- CreateTable: CoinTransaction
CREATE TABLE IF NOT EXISTS "CoinTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CoinTransaction_userId_fkey') THEN
        ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CoinTransaction_userId_createdAt_idx" ON "CoinTransaction"("userId", "createdAt");

-- CreateTable: StoreItem
CREATE TABLE IF NOT EXISTS "StoreItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "costCoins" INTEGER NOT NULL DEFAULT 0,
    "costStones" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserPurchase
CREATE TABLE IF NOT EXISTS "UserPurchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserPurchase_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserPurchase_userId_fkey') THEN
        ALTER TABLE "UserPurchase" ADD CONSTRAINT "UserPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserPurchase_itemId_fkey') THEN
        ALTER TABLE "UserPurchase" ADD CONSTRAINT "UserPurchase_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "UserPurchase_userId_idx" ON "UserPurchase"("userId");

-- CreateTable: DailyGoalProgress
CREATE TABLE IF NOT EXISTS "DailyGoalProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "currentVal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetVal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyGoalProgress_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyGoalProgress_userId_fkey') THEN
        ALTER TABLE "DailyGoalProgress" ADD CONSTRAINT "DailyGoalProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "DailyGoalProgress_userId_date_goalType_key" ON "DailyGoalProgress"("userId", "date", "goalType");
CREATE INDEX IF NOT EXISTS "DailyGoalProgress_userId_date_idx" ON "DailyGoalProgress"("userId", "date");
