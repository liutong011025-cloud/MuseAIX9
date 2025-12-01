# PowerShell script to push code to GitHub
# Usage: .\push-to-github.ps1

Write-Host "=== MuseAIWriteV2 - GitHub Upload Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or use GitHub Desktop: https://desktop.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
if (Test-Path .git) {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

# Add remote repository
Write-Host ""
Write-Host "Setting up remote repository..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/liutong011025-cloud/MuseAIX9.git"
$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
    if ($existingRemote -eq $remoteUrl) {
        Write-Host "✓ Remote repository already set: $remoteUrl" -ForegroundColor Green
    } else {
        Write-Host "Updating remote URL..." -ForegroundColor Yellow
        git remote set-url origin $remoteUrl
        Write-Host "✓ Remote repository updated" -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✓ Remote repository added: $remoteUrl" -ForegroundColor Green
}

# Add all files
Write-Host ""
Write-Host "Adding all files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Files added" -ForegroundColor Green

# Check if there are changes to commit
$status = git status --porcelain
if (-not $status) {
    Write-Host ""
    Write-Host "No changes to commit. Repository is up to date." -ForegroundColor Yellow
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
} else {
    # Commit changes
    Write-Host ""
    Write-Host "Committing changes..." -ForegroundColor Yellow
    $commitMessage = "Update: Fix Prisma build issue and Dify API configuration for Vercel deployment"
    git commit -m $commitMessage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to commit changes" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Changes committed" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: You may need to authenticate with GitHub." -ForegroundColor Yellow
Write-Host "If prompted, use your GitHub username and Personal Access Token (PAT)" -ForegroundColor Yellow
Write-Host ""

# Try to push to main branch first, if fails try master
$branches = git branch --show-current
if (-not $branches) {
    git branch -M main
    $branches = "main"
}

Write-Host "Current branch: $branches" -ForegroundColor Cyan

# Push command
Write-Host "Executing: git push -u origin $branches" -ForegroundColor Cyan
git push -u origin $branches

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: $remoteUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Push failed. This might be because:" -ForegroundColor Red
    Write-Host "  1. You need to authenticate (use GitHub Personal Access Token)" -ForegroundColor Yellow
    Write-Host "  2. The repository doesn't exist or you don't have permission" -ForegroundColor Yellow
    Write-Host "  3. You need to pull first if the repository has content" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If the repository is empty, you can try:" -ForegroundColor Yellow
    Write-Host "  git push -u origin $branches --force" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or if the remote has content, try:" -ForegroundColor Yellow
    Write-Host "  git pull origin $branches --allow-unrelated-histories" -ForegroundColor Cyan
    Write-Host "  git push -u origin $branches" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Script completed ===" -ForegroundColor Cyan




