# 上传 MuseAIWriteV2 到 GitHub 的详细步骤

## 📋 准备工作清单

- [ ] 安装 Git（如果还没有）
- [ ] 创建 GitHub Personal Access Token
- [ ] 准备好项目代码

## 🚀 快速开始

### 步骤 1：安装 Git（如果还没有）

1. 访问：https://git-scm.com/download/win
2. 下载并安装 Git for Windows
3. 安装完成后，**重新打开 PowerShell**

验证安装：
```powershell
git --version
```

### 步骤 2：创建 GitHub Personal Access Token

1. 登录 GitHub：https://github.com
2. 点击右上角头像 -> **Settings**
3. 左侧菜单最下方 -> **Developer settings**
4. 点击 **Personal access tokens** -> **Tokens (classic)**
5. 点击 **Generate new token** -> **Generate new token (classic)**
6. 填写：
   - **Note**: `MuseAIWriteV2`
   - **Expiration**: 选择 90 天或 No expiration
   - **Select scopes**: 勾选 ✅ **repo** (全部权限)
7. 点击 **Generate token**
8. **复制 token**（只显示一次！）

### 步骤 3：重命名文件夹（可选）

如果你想将文件夹从 `code` 改名为 `MuseAIWriteV2`：

1. 在 Windows 文件管理器中，导航到：`C:\Users\liut\Downloads\`
2. 右键点击 `code` 文件夹
3. 选择 **重命名**
4. 输入新名称：`MuseAIWriteV2`

**注意**：Git 仓库名称不影响 GitHub 上的仓库名称。

### 步骤 4：上传到 GitHub

#### 方法 1：使用提供的脚本（最简单）

1. 打开 PowerShell
2. 导航到项目目录：
   ```powershell
   cd C:\Users\liut\Downloads\code
   # 或者如果已重命名：
   # cd C:\Users\liut\Downloads\MuseAIWriteV2
   ```
3. 运行脚本：
   ```powershell
   .\push-to-github.ps1
   ```
4. 按照提示操作

#### 方法 2：手动执行命令

打开 PowerShell，执行以下命令：

```powershell
# 1. 进入项目目录
cd C:\Users\liut\Downloads\code

# 2. 初始化 Git（如果还没有）
git init

# 3. 添加远程仓库
git remote add origin https://github.com/liutong011025-cloud/MuseAI.git

# 如果已经存在，更新远程地址：
# git remote set-url origin https://github.com/liutong011025-cloud/MuseAI.git

# 4. 添加所有文件
git add .

# 5. 提交更改
git commit -m "Initial commit: MuseAIWriteV2"

# 6. 设置主分支
git branch -M main

# 7. 推送到 GitHub
git push -u origin main
```

**当提示输入用户名和密码时：**
- **Username**: 输入你的 GitHub 用户名
- **Password**: 输入刚才创建的 Personal Access Token（不是 GitHub 密码）

## 🔍 验证上传

上传成功后，访问：
**https://github.com/liutong011025-cloud/MuseAI**

你应该能看到所有代码文件。

## ⚠️ 常见问题

### 问题 1：Git 命令不存在

**解决方案**：
1. 确保已安装 Git
2. **重启 PowerShell**（重要！）
3. 如果仍不工作，检查环境变量 PATH

### 问题 2：认证失败

**解决方案**：
- 使用 Personal Access Token 而不是 GitHub 密码
- 确保 token 有 `repo` 权限
- 重新生成 token

### 问题 3：仓库不为空

如果远程仓库已有内容（如 README），需要先拉取：

```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 问题 4：需要强制推送（仅当仓库为空时）

```powershell
git push -u origin main --force
```

**警告**：只在远程仓库为空时使用！

## 📝 后续更新

修改代码后，使用以下命令更新：

```powershell
git add .
git commit -m "描述更改内容"
git push
```

## 🔒 安全提示

✅ **已配置的安全措施**：
- `.env*` 文件已添加到 `.gitignore`，不会上传
- `node_modules` 已忽略
- `.next` 构建文件已忽略

⚠️ **注意事项**：
- 不要将 API Key 硬编码到代码中
- 使用环境变量存储敏感信息
- 不要将 Personal Access Token 提交到代码库

---

**完成！** 🎉

如有问题，请查看：
- GitHub 文档：https://docs.github.com
- Git 文档：https://git-scm.com/doc




