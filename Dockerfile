# 第一阶段：构建阶段
FROM node:16-alpine as builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm install

# 复制所有项目文件
COPY . .

# 创建public文件夹并复制静态文件
RUN mkdir -p public && cp -r index.html ai-service.js firebase.js public/

# 第二阶段：生产阶段
FROM node:16-alpine

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# 设置工作目录
WORKDIR /app

# 从构建阶段复制生产依赖和构建文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.gitignore ./

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 3000

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 启动命令
CMD ["node", "server.js"]