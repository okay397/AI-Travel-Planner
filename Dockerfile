# 使用官方Node.js镜像作为基础镜像
    # 支持通过build-arg传入自定义的基础镜像URL
    ARG BASE_IMAGE=node:20-slim
    FROM ${BASE_IMAGE}

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建app目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制所有必要的项目文件
COPY server.js ./
COPY index.html ./
COPY ai-service.js ./
COPY firebase.js ./
COPY map-service.js ./
COPY test-app.js ./

# 为了更好的安全性，使用非root用户运行应用
# Node镜像已经包含node用户，直接使用
USER node

# 暴露端口
EXPOSE 3000

# 使用curl进行健康检查，这在slim镜像中更常用
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: 3000, path: '/', method: 'HEAD'}, (res) => {process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1);}); req.on('error', () => {process.exit(1);}); req.end();"

# 启动命令
CMD ["node", "server.js"]