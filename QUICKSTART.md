# 快速部署指南 🚀

## 服务器信息
```
IP: 139.180.141.143
位置: Singapore
系统: Ubuntu 24.04 LTS
配置: 1 vCPU, 1GB RAM, 25GB SSD
用户: root
密码: j@F3ic[4FfV?NjKX
```

## 一键部署命令

### 方式一：使用部署脚本（推荐）

1. **上传代码到服务器**
```bash
# 在本地将项目打包
tar --exclude='node_modules' --exclude='.next' -czf story-writer.tar.gz .

# 上传到服务器
scp story-writer.tar.gz root@139.180.141.143:/root/

# 连接到服务器
ssh root@139.180.141.143
```

2. **解压并部署**
```bash
# 在服务器上执行
cd /root
tar -xzf story-writer.tar.gz
cd story-writer
chmod +x deploy.sh
./deploy.sh
```

3. **访问应用**
```
浏览器打开: http://139.180.141.143
```

### 方式二：手动部署

```bash
# 1. 连接服务器
ssh root@139.180.141.143

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. 安装 PM2
npm install -g pm2

# 4. 安装 Nginx
apt install -y nginx

# 5. 进入项目目录
cd /root/story-writer

# 6. 安装依赖并构建
npm install
npm run build

# 7. 启动应用
pm2 start npm --name "story-writer" -- start
pm2 save

# 8. 配置 Nginx
cp nginx.conf /etc/nginx/sites-available/story-writer
ln -sf /etc/nginx/sites-available/story-writer /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 9. 访问应用
# 打开浏览器: http://139.180.141.143
```

## 常用管理命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs story-writer

# 重启应用
pm2 restart story-writer

# 停止应用
pm2 stop story-writer

# 查看 Nginx 日志
tail -f /var/log/nginx/error.log

# 查看系统资源
pm2 monit
```

## 更新应用

```bash
cd /root/story-writer
git pull          # 如果使用 Git
npm install       # 安装新依赖
npm run build     # 重新构建
pm2 restart story-writer  # 重启应用
```

## 故障排查

### 应用无法访问

1. **检查应用是否运行**
```bash
pm2 status
pm2 logs story-writer
```

2. **检查端口**
```bash
netstat -tulpn | grep 3000
netstat -tulpn | grep 80
```

3. **检查 Nginx**
```bash
systemctl status nginx
nginx -t
```

### 内存不足

服务器只有 1GB RAM，如果内存不足：

1. **优化 PM2 配置**
编辑 `ecosystem.config.js`，减少内存限制

2. **添加 Swap**
```bash
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

## 安全建议

1. **更改 SSH 端口**
2. **禁用密码登录，使用 SSH 密钥**
3. **配置防火墙**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

4. **定期更新系统**
```bash
apt update && apt upgrade -y
```

## 备份

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /root/backup-${DATE}.tar.gz /root/story-writer
# 保留最近7天的备份
find /root/backup-*.tar.gz -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# 设置每天2点自动备份
crontab -e
# 添加：0 2 * * * /root/backup.sh
```

## 完成！

现在你的 Story Writer 应用应该可以访问了：
👉 http://139.180.141.143

如有问题，查看详细部署文档：`DEPLOYMENT.md`




