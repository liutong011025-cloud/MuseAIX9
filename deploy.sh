#!/bin/bash

# 部署脚本 - 用于在 Ubuntu 服务器上部署 Next.js 应用

echo "========================================="
echo "  开始部署 Story Writer 应用"
echo "========================================="

# 更新系统包
echo "1. 更新系统包..."
apt update && apt upgrade -y

# 安装 Node.js (如果没有安装)
if ! command -v node &> /dev/null; then
    echo "2. 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "2. Node.js 已安装，版本: $(node -v)"
fi

# 安装 PM2 (用于进程管理)
if ! command -v pm2 &> /dev/null; then
    echo "3. 安装 PM2..."
    npm install -g pm2
else
    echo "3. PM2 已安装"
fi

# 安装 Nginx (如果没有安装)
if ! command -v nginx &> /dev/null; then
    echo "4. 安装 Nginx..."
    apt install -y nginx
else
    echo "4. Nginx 已安装"
fi

# 安装项目依赖
echo "5. 安装项目依赖..."
npm install

# 构建项目
echo "6. 构建 Next.js 项目..."
npm run build

# 停止旧的应用实例
echo "7. 停止旧的应用实例..."
pm2 stop story-writer 2>/dev/null || true
pm2 delete story-writer 2>/dev/null || true

# 启动应用
echo "8. 启动应用..."
pm2 start npm --name "story-writer" -- start

# 保存 PM2 配置
pm2 save

# 设置 PM2 开机自启
echo "9. 配置 PM2 开机自启..."
pm2 startup systemd -u root --hp /root || true

# 配置 Nginx
if [ -f "nginx.conf" ]; then
    echo "10. 配置 Nginx..."
    cp nginx.conf /etc/nginx/sites-available/story-writer
    ln -sf /etc/nginx/sites-available/story-writer /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
fi

echo "========================================="
echo "  部署完成！"
echo "========================================="
echo "应用运行在: http://localhost:3000"
echo "公网访问: http://139.180.141.143"
echo ""
echo "PM2 命令："
echo "  pm2 status          # 查看状态"
echo "  pm2 logs story-writer # 查看日志"
echo "  pm2 restart story-writer # 重启应用"
echo "  pm2 stop story-writer # 停止应用"
echo "========================================="

