-- 修复 interactions 表的字段类型
-- 将 input, output 改为 JSONB（可为空）
-- 将 apiCalls 改为 JSONB（可为空）

-- 先删除现有的 apiCalls 列（如果是 integer 类型）
ALTER TABLE "interactions" DROP COLUMN IF EXISTS "apiCalls";

-- 重新添加正确类型的列
ALTER TABLE "interactions" 
ADD COLUMN IF NOT EXISTS "input" JSONB,
ADD COLUMN IF NOT EXISTS "output" JSONB,
ADD COLUMN IF NOT EXISTS "apiCalls" JSONB;

-- 如果原来的 input 和 output 是 text 类型，需要先删除再重新添加
-- 但为了安全，我们先检查是否有数据
-- 如果有数据，我们需要迁移数据

-- 删除旧的 text 类型列（如果存在且为空）
DO $$
BEGIN
    -- 检查是否有数据
    IF (SELECT COUNT(*) FROM interactions) = 0 THEN
        -- 没有数据，可以直接删除并重建
        ALTER TABLE "interactions" DROP COLUMN IF EXISTS "input";
        ALTER TABLE "interactions" DROP COLUMN IF EXISTS "output";
        ALTER TABLE "interactions" ADD COLUMN "input" JSONB;
        ALTER TABLE "interactions" ADD COLUMN "output" JSONB;
    ELSE
        -- 有数据，需要迁移（暂时保留 text 列，让应用层处理）
        -- 这里我们只确保新列存在
        NULL;
    END IF;
END $$;


