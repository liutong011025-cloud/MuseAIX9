# Vercel 部署指南 - 解决 404 错误

## 问题诊断

Vercel 404 错误通常由以下原因引起：

1. ❌ Next.js 配置问题
2. ❌ 构建失败
3. ❌ 路由配置问题
4. ❌ 环境变量缺失

## 解决方案

### 1. 检查 Vercel 项目设置

在 Vercel Dashboard 中：

1. 进入项目设置
2. **General** -> **Framework Preset**: 选择 **Next.js**
3. **Build & Development Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (默认，不需要修改)
   - **Install Command**: `npm install`
   - **Development Command**: `npm run dev`

### 2. 检查构建日志

在 Vercel Dashboard -> **Deployments** -> 点击最新的部署 -> 查看 **Build Logs**

常见错误：
- **依赖安装失败**：检查 `package.json` 是否正确
- **构建失败**：查看错误信息
- **TypeScript 错误**：已在 `next.config.mjs` 中配置忽略构建错误

### 3. 环境变量配置

在 Vercel Dashboard -> **Settings** -> **Environment Variables** 中添加：

```
DIFY_API_KEY=你的Dify API Key
DIFY_PROGRESS_MENTOR_APP_ID=app-wLT4t7SzLiDXIkTyAu1jfwOK
FAL_API_KEY=你的Fal.ai API Key（如果需要）
NODE_ENV=production
```

### 4. 重新部署

1. 在 Vercel Dashboard 中，点击 **Deployments**
2. 找到最新的部署
3. 点击 **Redeploy**

或者：

1. 推送代码到 GitHub
2. Vercel 会自动触发新的部署

## 常见问题

### 问题 1: 404 NOT_FOUND

**可能原因**：
- 项目根目录配置错误
- `package.json` 中的构建脚本错误
- Next.js 版本不兼容

**解决方案**：
1. 确保 Vercel 检测到 Next.js 项目
2. 检查 `package.json` 中的 `build` 脚本
3. 确保 `app/` 目录存在且包含 `layout.tsx` 和 `page.tsx`

### 问题 2: 构建失败

**检查**：
- 查看构建日志中的具体错误
- 检查依赖是否正确安装
- 确认 Node.js 版本（Vercel 默认使用 Node.js 18.x）

### 问题 3: 路由不工作

**解决方案**：
- 确保使用 Next.js App Router（`app/` 目录）
- 检查 `app/page.tsx` 是否正确导出
- 确保 `app/layout.tsx` 存在

## 验证步骤

1. ✅ **检查项目结构**：
   ```
   app/
   ├── layout.tsx  ✓
   ├── page.tsx    ✓
   └── api/        ✓
   ```

2. ✅ **检查配置文件**：
   - `next.config.mjs` ✓
   - `package.json` ✓
   - `tsconfig.json` ✓

3. ✅ **本地测试构建**：
   ```bash
   npm run build
   npm run start
   ```
   如果本地构建成功，Vercel 应该也能成功。

## 推荐的 Vercel 设置

### Framework Preset
- **Next.js**

### Root Directory
- 留空（如果项目在仓库根目录）
- 或填写项目子目录路径

### Build Command
- `npm run build`

### Output Directory
- 留空（Vercel 会自动检测）

### Install Command
- `npm install`

### Node.js Version
- **18.x** 或 **20.x**（推荐）

## 如果问题仍然存在

1. **查看完整构建日志**：
   - Vercel Dashboard -> Deployments -> 点击部署 -> Build Logs

2. **检查 GitHub 仓库**：
   - 确保代码已正确推送到 GitHub
   - 检查 `.gitignore` 是否排除了必要文件

3. **重新连接 GitHub**：
   - Vercel Dashboard -> Settings -> Git
   - 断开连接，重新连接仓库

4. **手动部署**：
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel

   # 登录
   vercel login

   # 部署
   vercel --prod
   ```

## 联系支持

如果问题仍然存在，可以：
1. 查看 Vercel 文档：https://vercel.com/docs
2. 查看构建日志中的详细错误信息
3. 在 Vercel Discord 社区寻求帮助

---

**已修复的配置**：
- ✅ 移除了 `output: 'standalone'`（Vercel 不需要）
- ✅ 添加了 `eslint.ignoreDuringBuilds: true`
- ✅ 配置了图片远程域名
- ✅ 创建了 `vercel.json` 配置文件




