# 推送到 GitHub 仓库 MuseAIX9
# 仓库地址: https://github.com/liutong011025-cloud/MuseAIX9.git

Write-Host "开始推送到 GitHub..." -ForegroundColor Green

# 检查是否已初始化 git 仓库
if (-not (Test-Path .git)) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 检查远程仓库
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "添加远程仓库..." -ForegroundColor Yellow
    git remote add origin https://github.com/liutong011025-cloud/MuseAIX9.git
} else {
    Write-Host "当前远程仓库: $remoteUrl" -ForegroundColor Cyan
    Write-Host "更新远程仓库地址..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/liutong011025-cloud/MuseAIX9.git
}

# 添加所有文件
Write-Host "添加所有文件..." -ForegroundColor Yellow
git add .

# 提交更改
Write-Host "提交更改..." -ForegroundColor Yellow
$commitMessage = "Update: Fix Prisma build issue and Dify API configuration for Vercel deployment"
git commit -m $commitMessage

# 推送到 GitHub
Write-Host "推送到 GitHub (main 分支)..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 成功推送到 GitHub!" -ForegroundColor Green
    Write-Host "仓库地址: https://github.com/liutong011025-cloud/MuseAIX9" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 推送失败，请检查错误信息" -ForegroundColor Red
    Write-Host "如果这是第一次推送，可能需要先拉取远程仓库:" -ForegroundColor Yellow
    Write-Host "  git pull origin main --allow-unrelated-histories" -ForegroundColor Yellow
}

