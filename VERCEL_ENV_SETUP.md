# Vercel 环境变量配置指南

## 问题
Vercel 部署后显示 "FAL_KEY not configured" 或 "No cover available"，这是因为环境变量未在 Vercel 中配置。

## 解决方案

### 1. 在 Vercel 控制台中配置环境变量

1. 登录 Vercel 控制台：https://vercel.com
2. 进入你的项目（MuseAIWriteV7）
3. 点击 **Settings**（设置）
4. 在左侧菜单选择 **Environment Variables**（环境变量）
5. 添加以下环境变量：

#### 必需的环境变量

```
FAL_KEY=bc35b5d9-8125-4aa4-99cd-cf8df4bcd3d0:2063617b179b1ed975af5ea42d217b35
```

**注意：** 这是项目的 FAL API 密钥。在 Vercel 部署时也需要在环境变量中设置这个值。

#### Dify API 相关（如果使用 AI 功能）

```
DIFY_API_KEY=你的Dify_API密钥
DIFY_PROGRESS_MENTOR_APP_ID=app-wLT4t7SzLiDXIkTyAu1jfwOK
```

#### 其他可选环境变量

```
DIFY_CHAT_APP_ID=app-TFDykrjN8LpJROY6eTRNjwo5
DIFY_PLOT_SUMMARY_APP_ID=app-HgMPyyxKQNPk2ZZP6znDalkp
DIFY_WRITING_EVAL_APP_ID=app-1aoSk7aJ0xjaYGlVVIQrxvQe
DIFY_BOOK_SELECTION_APP_ID=app-EnHszR7uaCnOh1EWb7INdemd
DIFY_BOOK_WRITING_AID_APP_ID=app-9Qbo41jL3RuXmArfN7doaHvl
DIFY_BOOK_SUMMARY_APP_ID=app-FMli5GdNfA9M1ErElR0HWXj8
```

### 2. 选择环境

对于每个环境变量，选择适用的环境：
- ✅ **Production**（生产环境）
- ✅ **Preview**（预览环境）
- ✅ **Development**（开发环境）

### 3. 重新部署

配置环境变量后：
1. 进入 **Deployments**（部署）页面
2. 找到最新的部署
3. 点击 "..." 菜单
4. 选择 **Redeploy**（重新部署）

或者在 **Settings** → **Environment Variables** 页面，配置完成后会自动提示重新部署。

## 检查环境变量

### 在代码中检查环境变量

项目中使用以下环境变量：

1. **`FAL_KEY`** - 用于生成图片（字符和书籍封面）
   - 使用位置：`app/api/generate-image/route.ts`
   - 使用位置：`app/api/generate-book-cover/route.ts`

2. **`DIFY_API_KEY`** - Dify API 密钥
   - 使用位置：所有 `app/api/dify-*/route.ts` 文件

3. **`DIFY_PROGRESS_MENTOR_APP_ID`** - Muse 助手 API
   - 使用位置：`app/api/dify-progress-mentor/route.ts`

## 注意事项

1. **环境变量名称区分大小写**：确保变量名与代码中使用的一致
2. **不要提交敏感信息**：`.env.local` 文件应该在 `.gitignore` 中
3. **重新部署**：配置环境变量后必须重新部署才能生效
4. **检查部署日志**：如果仍然失败，查看部署日志中的错误信息

## 本地开发

在本地开发时，创建 `.env.local` 文件（不要提交到 Git）：

```env
FAL_KEY=bc35b5d9-8125-4aa4-99cd-cf8df4bcd3d0:2063617b179b1ed975af5ea42d217b35
DIFY_API_KEY=你的Dify_API密钥
DIFY_PROGRESS_MENTOR_APP_ID=app-wLT4t7SzLiDXIkTyAu1jfwOK
# ... 其他环境变量
```

## 验证配置

部署后，检查：
1. 字符图片是否可以生成
2. 书籍封面是否可以生成
3. AI 对话是否正常工作

如果仍然显示 "No cover available" 或 "FAL_KEY not configured"：
- 确认环境变量名称正确
- 确认已重新部署
- 检查 Vercel 部署日志中的错误信息

