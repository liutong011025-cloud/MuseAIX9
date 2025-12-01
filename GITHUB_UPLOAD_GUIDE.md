# GitHub 上传指南 - MuseAIWriteV2

## 步骤 1：安装 Git

如果系统中没有安装 Git，请先安装：

### Windows 安装 Git

1. **下载 Git for Windows**
   - 访问：https://git-scm.com/download/win
   - 下载最新版本的 Git
   - 运行安装程序，使用默认设置即可

2. **验证安装**
   打开 PowerShell 或 CMD，运行：
   ```powershell
   git --version
   ```
   如果显示版本号，说明安装成功。

## 步骤 2：配置 Git（首次使用）

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 步骤 3：创建 GitHub Personal Access Token

1. 访问 GitHub：https://github.com/settings/tokens
2. 点击 **"Generate new token"** -> **"Generate new token (classic)"**
3. 设置：
   - **Note**: MuseAIWriteV2
   - **Expiration**: 根据需要选择（建议 90 天或 No expiration）
   - **Select scopes**: 勾选 ✅ `repo` (Full control of private repositories)
4. 点击 **"Generate token"**
5. **重要**：复制生成的 token（只显示一次！）

## 步骤 4：上传代码到 GitHub

### 方法 A：使用 PowerShell 脚本（推荐）

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
   - **Username**: 你的 GitHub 用户名
   - **Password**: 使用刚才创建的 Personal Access Token（不是 GitHub 密码）

### 方法 B：手动执行命令

```powershell
# 1. 初始化 Git 仓库
git init

# 2. 检查当前状态
git status

# 3. 添加远程仓库
git remote add origin https://github.com/liutong011025-cloud/MuseAI.git

# 如果远程仓库已存在，使用：
# git remote set-url origin https://github.com/liutong011025-cloud/MuseAI.git

# 4. 添加所有文件
git add .

# 5. 提交更改
git commit -m "Initial commit: MuseAIWriteV2 - AI-powered story writing platform"

# 6. 设置主分支
git branch -M main

# 7. 推送到 GitHub
git push -u origin main
```

**注意**：在执行 `git push` 时：
- Username: 输入你的 GitHub 用户名
- Password: 输入刚才创建的 Personal Access Token

### 方法 C：使用 GitHub Desktop（最简单）

1. 下载并安装 GitHub Desktop：https://desktop.github.com/
2. 打开 GitHub Desktop
3. File -> Add Local Repository
4. 选择项目文件夹：`C:\Users\liut\Downloads\code`
5. File -> Options -> Accounts，登录你的 GitHub 账户
6. 点击 **"Publish repository"**
7. 输入仓库名称：`MuseAI`
8. 勾选 ✅ "Keep this code private"（如果需要）
9. 点击 **"Publish repository"**

## 步骤 5：处理仓库名称（可选）

如果你想将项目文件夹改名为 `MuseAIWriteV2`：

1. 在 Windows 文件管理器中，将 `C:\Users\liut\Downloads\code` 重命名为 `C:\Users\liut\Downloads\MuseAIWriteV2`
2. 然后重新打开 PowerShell，导航到新目录：
   ```powershell
   cd C:\Users\liut\Downloads\MuseAIWriteV2
   ```
3. 继续执行 Git 命令

**注意**：Git 仓库名称不影响 GitHub 上的仓库名称。

## 常见问题解决

### 问题 1：认证失败

**错误信息**：`fatal: Authentication failed`

**解决方案**：
- 确保使用 Personal Access Token 而不是 GitHub 密码
- 检查 token 是否有 `repo` 权限
- 重新生成 token 并重试

### 问题 2：仓库不为空

**错误信息**：`Updates were rejected because the remote contains work`

**解决方案**：
```powershell
# 先拉取远程内容
git pull origin main --allow-unrelated-histories

# 如果有冲突，解决后再次推送
git push -u origin main
```

### 问题 3：Git 命令不存在

**错误信息**：`git : The term 'git' is not recognized`

**解决方案**：
1. 安装 Git（见步骤 1）
2. 重启 PowerShell 或 CMD
3. 如果仍不工作，可能需要将 Git 添加到系统 PATH

### 问题 4：需要强制推送（仅当仓库为空时）

如果远程仓库是全新的且为空，可以使用：

```powershell
git push -u origin main --force
```

**警告**：只在远程仓库为空时使用 `--force`，否则会覆盖远程内容！

## 验证上传

上传成功后，访问：https://github.com/liutong011025-cloud/MuseAI

你应该能看到所有代码文件。

## 后续更新

每次修改代码后，使用以下命令更新 GitHub：

```powershell
git add .
git commit -m "描述你的更改"
git push
```

## 安全提示

⚠️ **重要**：
1. 不要将 `.env` 文件提交到 GitHub（已在 `.gitignore` 中）
2. 不要将 Personal Access Token 提交到代码库
3. 定期更新 Personal Access Token

---

**需要帮助？** 查看 GitHub 文档：https://docs.github.com/en/get-started




