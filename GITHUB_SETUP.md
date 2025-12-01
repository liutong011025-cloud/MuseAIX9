# GitHub 上传指南

## 准备工作

### 1. 安装 Git

如果还没有安装 Git，请先安装：

**方法1：下载 Git for Windows**
- 访问：https://git-scm.com/download/win
- 下载并安装 Git

**方法2：使用 GitHub Desktop**
- 访问：https://desktop.github.com/
- 下载并安装 GitHub Desktop（包含 Git）

### 2. 配置 Git（首次使用）

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. 创建 GitHub Personal Access Token (PAT)

1. 访问 GitHub: https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 设置 Token 名称（如：MuseAIWriteV2）
4. 选择权限：
   - ✅ `repo` (Full control of private repositories)
5. 点击 "Generate token"
6. **重要**：复制生成的 token（只显示一次）

## 上传代码到 GitHub

### 方法1：使用提供的 PowerShell 脚本（推荐）

1. 打开 PowerShell
2. 导航到项目目录：
   ```powershell
   cd C:\Users\liut\Downloads\code
   ```
3. 运行脚本：
   ```powershell
   .\push-to-github.ps1
   ```
4. 如果提示输入用户名和密码：
   - Username: 你的 GitHub 用户名
   - Password: 使用刚才创建的 Personal Access Token（不是GitHub密码）

### 方法2：手动执行 Git 命令

```powershell
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加远程仓库
git remote add origin https://github.com/liutong011025-cloud/MuseAI.git
# 如果已经存在，使用：
# git remote set-url origin https://github.com/liutong011025-cloud/MuseAI.git

# 3. 添加所有文件
git add .

# 4. 提交更改
git commit -m "Initial commit: MuseAIWriteV2 - AI-powered story writing platform"

# 5. 设置主分支（如果需要）
git branch -M main

# 6. 推送到 GitHub
git push -u origin main
# 如果仓库不为空，可能需要先拉取：
# git pull origin main --allow-unrelated-histories
# 然后再推送
```

### 方法3：使用 GitHub Desktop

1. 打开 GitHub Desktop
2. File -> Add Local Repository
3. 选择项目文件夹
4. File -> Options -> Accounts，登录你的 GitHub 账户
5. Publish repository
6. 输入仓库名称：MuseAI
7. 点击 Publish

## 如果遇到问题

### 问题1：认证失败

**解决方案：**
- 确保使用 Personal Access Token 而不是 GitHub 密码
- 检查 token 是否有 `repo` 权限
- 如果使用 HTTPS，可以配置 credential helper：
  ```powershell
  git config --global credential.helper wincred
  ```

### 问题2：仓库不为空

**解决方案：**
如果远程仓库已经有内容（如 README），需要先拉取：

```powershell
git pull origin main --allow-unrelated-histories
# 解决可能的合并冲突
git push -u origin main
```

### 问题3：分支名称不同

**解决方案：**
```powershell
# 查看当前分支
git branch

# 重命名分支为 main（如果需要）
git branch -M main

# 或者推送到现有分支
git push -u origin master  # 如果远程使用 master
```

## 后续更新

每次修改代码后，使用以下命令更新 GitHub：

```powershell
git add .
git commit -m "描述你的更改"
git push
```

## 注意事项

1. ⚠️ **不要提交敏感信息**：`.env` 文件已添加到 `.gitignore`
2. ✅ **定期提交**：建议经常提交更改，保持代码同步
3. 🔒 **保护 Token**：不要将 Personal Access Token 提交到代码库




