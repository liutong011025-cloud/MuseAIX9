# Vercel 404 修复指南

如果 Vercel 部署后显示 404，请检查以下几点：

## 1. 确认项目结构
确保以下文件存在：
- `app/page.tsx` - 主页面组件
- `app/layout.tsx` - 根布局组件
- `package.json` - 包含 Next.js 依赖
- `next.config.mjs` - Next.js 配置

## 2. 检查 Vercel 项目设置
1. 登录 Vercel 控制台
2. 进入项目设置 (Settings)
3. 检查 **Root Directory** - 应该留空或设置为项目根目录
4. 检查 **Build Command** - 应该为 `npm run build`
5. 检查 **Output Directory** - Next.js 应用应该留空

## 3. 确保 package.json 正确
```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

## 4. 清除缓存并重新部署
1. 在 Vercel 控制台中，进入 Deployments
2. 点击三个点菜单
3. 选择 "Redeploy" 或删除部署并重新部署
4. 或者在设置中清除构建缓存

## 5. 检查构建日志
查看 Vercel 的构建日志，确保：
- Next.js 版本正确识别
- 构建成功完成（没有错误）
- 所有文件正确打包

## 6. 常见问题
- **Next.js 版本未识别**: 确保 `package.json` 中 `next` 在 `dependencies` 中
- **路由问题**: 确保使用 App Router (`app` 目录) 而不是 Pages Router (`pages` 目录)
- **环境变量**: 确保所有必需的环境变量在 Vercel 项目中设置

## 7. 如果仍然 404
尝试以下步骤：
1. 删除 `.next` 文件夹（如果存在）
2. 重新提交代码到 GitHub
3. 在 Vercel 中触发新的部署
4. 检查自定义域名设置（如果有）
