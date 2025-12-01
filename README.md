# MuseAIWriteV2 - AI Powered Story Creation Tool

一个基于 AI 的儿童故事创作工具，集成 Dify AI 和图片生成功能，帮助小学生创作精彩的故事。

## 功能特性

- 🎨 **角色创建**: 为你的故事创造生动有趣的角色
- 🖼️ **AI 图片生成**: 使用 Poe API 自动生成角色图片
- 📖 **情节构思**: AI 助手帮助你构建精彩的故事情节
- 🏗️ **故事结构**: 支持多种经典故事结构
- ✍️ **引导式写作**: 逐步引导完成完整故事
- 📱 **响应式设计**: 完美适配各种设备

## 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **图标**: Lucide React
- **图片生成**: Poe API (Imagen-4)
- **通知**: Sonner

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install`

# 运行开发服务器
npm run dev

# 打开浏览器
# http://localhost:3000
```

### 部署到服务器

详细部署指南请参考：
- [快速部署指南](QUICKSTART.md)
- [完整部署文档](DEPLOYMENT.md)

#### 一键部署

```bash
# 1. 打包项目
tar --exclude='node_modules' --exclude='.next' -czf story-writer.tar.gz .

# 2. 上传到服务器
scp story-writer.tar.gz root@139.180.141.143:/root/

# 3. SSH 连接并部署
ssh root@139.180.141.143
cd /root
tar -xzf story-writer.tar.gz
cd story-writer
chmod +x deploy.sh
./deploy.sh
```

## 项目结构

```
story-writer/
├── app/                      # Next.js 应用目录
│   ├── api/                  # API 路由
│   │   └── generate-image/   # 图片生成 API
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 主页
├── components/              # React 组件
│   ├── stages/              # 各个阶段的组件
│   │   ├── character-creation.tsx
│   │   ├── plot-brainstorm.tsx
│   │   ├── story-structure.tsx
│   │   ├── guided-writing.tsx
│   │   └── story-review.tsx
│   └── ui/                  # UI 组件库
├── lib/                     # 工具函数
├── public/                  # 静态资源
├── deploy.sh                # 部署脚本
├── nginx.conf              # Nginx 配置
├── ecosystem.config.js     # PM2 配置
├── QUICKSTART.md           # 快速开始
└── DEPLOYMENT.md           # 部署文档
```

## API 配置

图片生成使用 Poe API，需要配置 API Key：

编辑 `app/api/generate-image/route.ts`：
```typescript
const POE_API_KEY = 'your-api-key-here'
```

获取 API Key: [poe.com/api_key](https://poe.com/api_key)

## 生产环境部署

### 服务器要求

- Ubuntu 20.04+ 或类似 Linux 发行版
- Node.js 20+
- 1GB+ RAM
- 20GB+ 存储空间
- Nginx (可选，用于反向代理)

### 部署流程

1. **安装依赖工具**
   - Node.js
   - PM2 (进程管理)
   - Nginx (可选)

2. **构建应用**
   ```bash
   npm install
   npm run build
   ```

3. **启动应用**
   ```bash
   pm2 start npm --name "story-writer" -- start
   ```

4. **配置 Nginx** (可选)
   - 反向代理
   - SSL 证书

详细步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)

## 环境变量

生产环境建议使用环境变量：

```bash
# .env.local
POE_API_KEY=your-api-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 开发

### 添加新功能

```bash
# 创建新组件
mkdir -p components/new-feature
touch components/new-feature/index.tsx

# 创建新页面
mkdir -p app/new-page
touch app/new-page/page.tsx
```

### 代码规范

```bash
# Lint 检查
npm run lint

# 类型检查
npx tsc --noEmit
```

## 常见问题

### 图片生成失败

1. 检查 API Key 是否正确
2. 查看服务器日志: `pm2 logs story-writer`
3. 确认 Poe API 服务正常

### 内存不足

服务器 RAM 较小（1GB）时：
1. 增加 Swap 空间
2. 减少 PM2 内存限制
3. 使用 `pm2 monit` 监控

### 部署后无法访问

1. 检查防火墙设置
2. 确认端口已开放（80, 3000）
3. 查看 Nginx 配置

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请查看：
- [Issue Tracker](https://github.com/your-repo/issues)
- [部署文档](DEPLOYMENT.md)

---

**Made with ❤️ using Next.js and Poe API**

