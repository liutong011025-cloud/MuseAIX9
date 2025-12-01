# 部署指南

## 服务器信息
- **IP**: 139.180.141.143
- **位置**: Singapore
- **操作系统**: Ubuntu 24.04 LTS x64
- **配置**: 1 vCPU, 1GB RAM, 25GB SSD

## 部署步骤

### 1. 连接到服务器

```bash
ssh root@139.180.141.143
# 密码: j@F3ic[4FfV?NjKX
```

### 2. 上传代码到服务器

有多种方式：

#### 方式 A: 使用 Git (推荐)

```bash
# 在服务器上
cd /root
git clone <your-repo-url> story-writer
cd story-writer
```

#### 方式 B: 使用 SCP 从本地上传

在本地终端执行：

```bash
# 打包项目（排除 node_modules）
tar --exclude='node_modules' --exclude='.next' -czf story-writer.tar.gz .

# 上传到服务器
scp story-writer.tar.gz root@139.180.141.143:/root/

# SSH 连接到服务器
ssh root@139.180.141.143

# 解压
cd /root
tar -xzf story-writer.tar.gz -C story-writer/
cd story-writer
```

### 3. 运行部署脚本

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

或者手动执行以下步骤：

### 手动部署步骤

#### 3.1 更新系统并安装 Node.js

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 3.2 安装 PM2

```bash
sudo npm install -g pm2
```

#### 3.3 安装 Nginx

```bash
sudo apt install -y nginx
```

#### 3.4 安装项目依赖

```bash
npm install
```

#### 3.5 构建项目

```bash
npm run build
```

#### 3.6 配置并启动应用

```bash
# 使用 PM2 启动
pm2 start npm --name "story-writer" -- start

# 或者使用配置文件
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2 startup systemd
```

#### 3.7 配置 Nginx

```bash
# 复制 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/story-writer
sudo ln -s /etc/nginx/sites-available/story-writer /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 3.8 配置防火墙

```bash
# 允许 HTTP 和 HTTPS 端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 常用命令

### PM2 命令

```bash
pm2 status              # 查看应用状态
pm2 logs story-writer   # 查看日志
pm2 restart story-writer # 重启应用
pm2 stop story-writer   # 停止应用
pm2 delete story-writer # 删除应用
```

### 查看日志

```bash
# PM2 日志
pm2 logs story-writer

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 检查端口

```bash
# 检查应用是否运行在 3000 端口
sudo netstat -tulpn | grep 3000

# 检查 Nginx 是否运行在 80 端口
sudo netstat -tulpn | grep 80
```

## 故障排查

### 应用无法启动

1. 检查端口是否被占用
```bash
sudo lsof -i :3000
```

2. 查看 PM2 日志
```bash
pm2 logs story-writer --lines 100
```

3. 检查内存使用
```bash
free -h
pm2 monit
```

### 无法访问网站

1. 检查防火墙
```bash
sudo ufw status
```

2. 检查 Nginx 状态
```bash
sudo systemctl status nginx
```

3. 检查应用是否运行
```bash
pm2 status
```

### 图片生成失败

1. 检查 API 密钥是否正确配置
2. 查看服务器日志中的错误信息
3. 检查网络连接和 Poe API 的可访问性

## 更新应用

```bash
cd /root/story-writer

# 拉取最新代码
git pull origin main

# 重新安装依赖（如果有新依赖）
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart story-writer
```

## 备份

建议定期备份数据：

```bash
# 创建备份目录
mkdir -p /root/backups

# 备份项目
tar -czf /root/backups/story-writer-$(date +%Y%m%d).tar.gz /root/story-writer

# 设置定时任务（可选）
crontab -e
# 添加：0 2 * * * tar -czf /root/backups/story-writer-$(date +\%Y\%m\%d).tar.gz /root/story-writer
```

## 性能优化

### 1. 启用 Gzip 压缩

编辑 Nginx 配置：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. 配置缓存

根据需要添加静态资源缓存配置

### 3. 监控资源使用

```bash
# 安装监控工具
sudo apt install htop iotop

# 使用 PM2 监控
pm2 monit
```

## SSL 证书 (可选)

如果需要 HTTPS：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 联系信息

如有问题，请查看：
- PM2 日志：`pm2 logs story-writer`
- Nginx 日志：`/var/log/nginx/`
- 应用日志：检查 PM2 输出




