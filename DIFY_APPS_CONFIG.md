# Dify 机器人配置清单

## 重要说明
- **所有路由现在都使用环境变量 `DIFY_API_KEY` 作为 Authorization header**
- **每个路由的 App ID 已硬编码在代码中，确保不会混淆**

## 机器人列表

### 1. 编辑助手 (Edit Assistant)
- **路由**: `/api/dify-edit-assistant`
- **App ID**: `app-gZpvq3GiPCZ0D0JPmrxH00jF`
- **用途**: 在编辑页面提供修改建议

### 2. 书籍选择 (Book Selection)
- **路由**: `/api/dify-book-selection`
- **App ID**: `app-EnHszR7uaCnOh1EWb7INdemd`
- **用途**: 判断书籍是否适合写书评

### 3. 情节总结 (Plot Summary)
- **路由**: `/api/dify-plot-summary`
- **App ID**: `app-HgMPyyxKQNPk2ZZP6znDalkp`
- **用途**: 从对话中提取 Setting、Conflict、Goal

### 4. 情节对话 (Plot Chat / Brainstorm)
- **路由**: `/api/dify-chat`
- **App ID**: `app-TFDykrjN8LpJROY6eTRNjwo5`
- **用途**: 情节头脑风暴对话

### 5. 写作评估 (Writing Evaluation / Muse)
- **路由**: `/api/dify-writing-evaluation`
- **App ID**: `app-wLT4t7SzLiDXIkTyAu1jfwOK`
- **用途**: 评估故事写作质量

### 6. 写作辅助 (Writing Aid)
- **路由**: `/api/dify-writing-aid`
- **App ID**: `app-IKvkbOgKstyjEupEpbpu2iPF`
- **用途**: 提供写作建议

### 7. 书籍写作辅助 (Book Writing Aid)
- **路由**: `/api/dify-book-writing-aid`
- **App ID**: `app-9Qbo41jL3RuXmArfN7doaHvl`
- **用途**: 书评写作辅助

### 8. 书籍摘要 (Book Summary)
- **路由**: `/api/dify-book-summary`
- **App ID**: `app-FMli5GdNfA9M1ErElR0HWXj8`
- **用途**: 生成书籍介绍和摘要

### 9. 信件指导 (Letter Guide)
- **路由**: `/api/dify-letter-guide`
- **App ID**: `app-3iAjb8MCQEXkUxcjvky6lhXt`
- **用途**: 信件写作指导

### 10. 信件设置 (Letter Setup)
- **路由**: `/api/dify-letter-setup`
- **App ID**: `app-3iAjb8MCQEXkUxcjvky6lhXt`
- **用途**: 信件初始指导

### 11. 结构示例 (Structure Examples)
- **路由**: `/api/dify-structure-examples`
- **App ID**: `app-UxoYLEHygZGu8ZaHIl8jdNf7`
- **用途**: 生成故事结构示例

### 12. 进度导师 (Progress Mentor)
- **路由**: `/api/dify-progress-mentor`
- **App ID**: `app-wLT4t7SzLiDXIkTyAu1jfwOK` (默认，可通过环境变量覆盖)
- **用途**: 提供进度指导

## Vercel 环境变量配置

在 Vercel 项目设置中，确保配置以下环境变量：

```
DIFY_API_KEY=你的Dify平台API密钥
DATABASE_URL=你的PostgreSQL数据库连接字符串
```

## 验证清单

发布前请确认：
- [x] 所有路由都使用 `process.env.DIFY_API_KEY` 作为 Authorization header
- [x] 每个路由的 App ID 都正确硬编码
- [x] 没有将 App ID 误用作 API Key
- [x] 所有 App ID 与 Dify 平台中的实际应用 ID 匹配

