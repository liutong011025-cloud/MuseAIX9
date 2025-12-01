# 数据库设置指南

本项目使用 Prisma + PostgreSQL 作为数据库。

## 1. 安装依赖

```bash
npm install prisma @prisma/client
npm install -D tsx  # 用于运行TypeScript脚本
```

## 2. 配置数据库连接

创建 `.env` 文件（如果还没有），添加数据库连接字符串：

```env
DATABASE_URL="postgresql://用户名:密码@localhost:5432/数据库名?schema=public"
```

### 本地开发（使用 Docker）

```bash
# 启动 PostgreSQL 容器
docker run --name museaiwrite-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=museaiwrite \
  -p 5432:5432 \
  -d postgres:15

# DATABASE_URL 设置为：
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/museaiwrite?schema=public"
```

### 使用云数据库（推荐用于生产环境）

- **Vercel Postgres**: 在 Vercel 项目中添加 Postgres 数据库
- **Supabase**: 免费 PostgreSQL 数据库
- **Railway**: 提供 PostgreSQL 服务
- **Neon**: Serverless PostgreSQL

## 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库（创建表）
npm run db:push

# 或者使用迁移（推荐用于生产环境）
npm run db:migrate

# 初始化用户数据
npm run db:init
```

## 4. 数据库表结构

### Users（用户表）
- 存储所有用户信息（用户名、密码、角色、是否使用AI）

### Interactions（交互记录表）
- 存储所有用户交互记录
- 包含输入、输出、API调用等信息

### Stories（故事表）
- 存储完成的故事
- 包含角色、情节、结构等信息

### Reviews（书评表）
- 存储完成的书评
- 包含书评类型、书名、封面等信息

### Letters（信件表）
- 存储完成的信件
- 包含收信人、契机、内容等信息

## 5. 开发工具

```bash
# 打开 Prisma Studio（可视化数据库管理工具）
npm run db:studio
```

## 6. 生产环境部署

### Vercel 部署

1. 在 Vercel 项目中添加 Postgres 数据库
2. Vercel 会自动设置 `DATABASE_URL` 环境变量
3. 在构建时运行：
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:init
   ```

### 其他平台

确保在部署前：
1. 设置 `DATABASE_URL` 环境变量
2. 运行数据库迁移
3. 初始化用户数据

## 7. 数据迁移

如果需要修改数据库结构：

1. 修改 `prisma/schema.prisma`
2. 运行 `npm run db:migrate` 创建迁移
3. 迁移会自动应用到数据库

## 注意事项

- 数据库密码和连接字符串是敏感信息，不要提交到 Git
- `.env` 文件已在 `.gitignore` 中
- 生产环境请使用强密码和安全的数据库连接



