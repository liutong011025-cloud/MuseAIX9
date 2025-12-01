# 数据库依赖安装指南

## 在 PowerShell 中安装依赖

### 方法 1：直接运行 npm install（推荐）

如果 PowerShell 执行策略允许，直接运行：

```powershell
npm install prisma @prisma/client
npm install -D tsx
```

### 方法 2：如果遇到执行策略错误

如果看到 "running scripts is disabled" 错误，按以下步骤操作：

#### 步骤 1：检查当前执行策略
```powershell
Get-ExecutionPolicy
```

#### 步骤 2：临时允许执行脚本（仅当前会话）
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

#### 步骤 3：然后运行安装命令
```powershell
npm install prisma @prisma/client
npm install -D tsx
```

#### 步骤 4：永久允许执行脚本（可选，仅当前用户）
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 方法 3：使用 cmd 代替 PowerShell

如果 PowerShell 一直有问题，可以打开 **命令提示符（CMD）** 运行：

```cmd
npm install prisma @prisma/client
npm install -D tsx
```

### 方法 4：使用 Git Bash（如果已安装 Git）

打开 Git Bash，运行：

```bash
npm install prisma @prisma/client
npm install -D tsx
```

## 验证安装

安装完成后，验证是否成功：

```powershell
# 检查 Prisma 版本
npx prisma --version

# 检查依赖是否在 package.json 中
cat package.json | Select-String -Pattern "prisma"
```

## 下一步

安装完成后，继续：

1. **配置数据库连接** - 创建 `.env` 文件并添加 `DATABASE_URL`
2. **生成 Prisma Client** - 运行 `npm run db:generate`
3. **创建数据库表** - 运行 `npm run db:push`
4. **初始化用户数据** - 运行 `npm run db:init`

## 常见问题

### Q: 提示 "npm 不是内部或外部命令"
A: 需要先安装 Node.js，从 https://nodejs.org/ 下载安装

### Q: 提示 "权限被拒绝"
A: 以管理员身份运行 PowerShell，或使用方法 2 修改执行策略

### Q: 安装很慢
A: 可以使用国内镜像：
```powershell
npm config set registry https://registry.npmmirror.com
```



