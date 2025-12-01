-- 更新表结构以匹配 schema.prisma

-- 更新 reviews 表，添加缺失的字段
ALTER TABLE "reviews" 
ADD COLUMN IF NOT EXISTS "reviewType" TEXT,
ADD COLUMN IF NOT EXISTS "bookTitle" TEXT,
ADD COLUMN IF NOT EXISTS "bookCoverUrl" TEXT,
ADD COLUMN IF NOT EXISTS "bookSummary" TEXT,
ADD COLUMN IF NOT EXISTS "structure" JSONB;

-- 更新 letters 表，添加缺失的字段
ALTER TABLE "letters" 
ADD COLUMN IF NOT EXISTS "recipient" TEXT,
ADD COLUMN IF NOT EXISTS "occasion" TEXT,
ADD COLUMN IF NOT EXISTS "guidance" TEXT,
ADD COLUMN IF NOT EXISTS "readerImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "sections" JSONB;

-- 更新 interactions 表，将字段类型改为 JSONB
ALTER TABLE "interactions" 
ALTER COLUMN "input" TYPE JSONB USING "input"::jsonb,
ALTER COLUMN "output" TYPE JSONB USING "output"::jsonb,
ALTER COLUMN "apiCalls" TYPE JSONB USING "apiCalls"::jsonb;

-- 添加 stage 索引
CREATE INDEX IF NOT EXISTS "interactions_stage_idx" ON "interactions"("stage");



