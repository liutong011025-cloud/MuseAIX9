# 使用 Node.js 20 作为基础镜像（不使用 Alpine，避免 lightningcss 原生模块问题）
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（包括可选依赖）
RUN npm install --include=optional

# 确保所有原生模块正确安装
# @tailwindcss/oxide 需要平台特定的可选依赖包
RUN npm install @tailwindcss/oxide-linux-x64-gnu --save-optional || true && \
    npm rebuild lightningcss --update-binary && \
    npm rebuild @tailwindcss/oxide --update-binary || true

# 复制所有文件
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 暴露端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "run", "dev"]

