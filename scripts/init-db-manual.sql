-- 手动初始化用户数据的 SQL 脚本
-- 可以直接在数据库客户端中执行，或使用 psql 命令

-- 插入教师账户
INSERT INTO users (id, username, password, role, "noAi", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Nicole', 'yinyin2948', 'teacher', false, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "noAi" = EXCLUDED."noAi",
  "updatedAt" = NOW();

-- 插入正常AI用户（密码：123321）
INSERT INTO users (id, username, password, role, "noAi", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Stark', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Banner', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Rogers', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Parker', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Romanoff', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Barton', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Odinson', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Maximoff', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Lang', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Strange', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Fury', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Groot', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Rocket', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Quill', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Drax', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Gamora', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Thanos', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Loki', '123321', 'student', false, NOW(), NOW()),
  (gen_random_uuid()::text, 'halk', '123321', 'student', false, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "noAi" = EXCLUDED."noAi",
  "updatedAt" = NOW();

-- 插入非AI用户（密码：123321，noAi: true）
INSERT INTO users (id, username, password, role, "noAi", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Wayne', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Kent', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Queen', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Allen', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Barbara', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Diana', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Selina', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Lex', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Luthor', '123321', 'student', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Zod', '123321', 'student', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "noAi" = EXCLUDED."noAi",
  "updatedAt" = NOW();



