# AI 旅行规划软件

这是一个基于 Web 的 AI 旅行规划软件，旨在简化旅行规划过程，通过 AI 了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

## 功能特性

### 1. 智能行程规划
- 支持语音和文字输入旅行需求（目的地、日期、预算、人数、偏好）
- AI 自动生成个性化旅行路线
- 包含交通、住宿、景点、餐厅等详细信息
- 每日行程安排和活动建议

### 2. 费用预算与管理
- AI 预算分析和建议
- 旅行开销记录（支持语音输入）
- 预算进度可视化
- 支出分类统计

### 3. 用户管理与数据存储
- 注册登录系统
- 云端行程同步
- 多设备访问支持
- 行程保存与管理

### 4. 地图集成
- 支持高德地图和百度地图
- 行程地点标记
- 路线可视化展示
- 实时位置服务

## 技术栈

- **前端**：HTML, CSS, JavaScript
- **后端**：Node.js, Express
- **数据库/认证**：Firebase
- **语音识别**：浏览器原生 Web Speech API
- **地图服务**：高德地图/百度地图 API
- **容器化**：Docker, Docker Compose
- **AI 模型**：支持 OpenAI 和阿里云百炼大模型

## 快速开始

### 方法一：使用 Docker Compose 运行（推荐）

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录运行：
   ```bash
   docker-compose up -d
   ```
3. 打开浏览器访问：`http://localhost:3000`

### 方法二：使用 Docker 运行

1. 确保已安装 Docker
2. 构建 Docker 镜像：
   ```bash
   docker build -t ai-travel-planner .
   ```
3. 运行容器：
   ```bash
   docker run -p 3000:3000 ai-travel-planner
   ```
4. 打开浏览器访问：`http://localhost:3000`

### 方法三：使用脚本构建并导出镜像

项目中提供了自动化脚本来构建并导出Docker镜像：

**在Windows上：**
1. 确保已安装 Docker Desktop 并运行
2. 双击运行 `build_and_export_docker.bat` 文件
3. 脚本将自动构建镜像并导出为 `output\ai-travel-planner_latest.tar` 文件

**在Linux/Mac上：**
> 注：本项目主要提供Windows脚本支持。如需在Linux/Mac上使用，请参考方法二手动构建和导出。

### 方法四：直接运行

1. 确保已安装 Node.js 14 或更高版本
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动服务器：
   ```bash
   npm start
   ```
4. 打开浏览器访问：`http://localhost:3000`



## API Key 配置

在应用的 "API Key 配置" 部分，您需要输入以下 API Key：

1. **AI 模型 API Key**：用于生成旅行计划
   - 支持 OpenAI API（推荐，格式：sk-xxx）
   - 支持阿里云百炼大模型 API

2. **地图 API Key**：用于地图展示功能
   - 高德地图：需要申请 Web 端 API Key
   - 百度地图：需要申请浏览器端 API Key

### 示例 API Key（仅供测试）

```
AI 模型 API Key: sk_test_your_ai_api_key_here
地图 API Key: test_map_api_key
```

### API Key 安全说明

- 所有 API Key 都保存在浏览器的 localStorage 中，不会上传到服务器
- 请确保不要在公共场合展示您的 API Key
- 定期更换您的 API Key 以保证安全

## 项目结构

```
├── Dockerfile         # Docker 配置文件
├── docker-compose.yml # Docker Compose 配置
├── index.html         # 前端页面
├── ai-service.js      # AI 服务模块
├── map-service.js     # 地图服务模块
├── firebase.js        # Firebase 配置
├── package.json       # 项目配置和依赖
├── server.js          # Express 后端服务器
└── README.md          # 项目说明文档
```

## 使用指南

### 1. 注册/登录
- 首次使用需要注册账号
- 使用邮箱和密码进行登录
- 登录后可以保存和管理多个旅行计划

### 2. 生成旅行计划
- 在主页面选择语音或文字输入
- 输入旅行需求（如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"）
- 点击"生成行程计划"按钮
- 等待 AI 生成详细行程

### 3. 管理旅行计划
- 生成的行程会自动保存到您的账号
- 在"我的行程"页面可以查看所有保存的行程
- 可以删除不需要的行程

### 4. 费用管理
- 在"费用记录"部分添加实际支出
- 查看预算分析和建议
- 跟踪预算使用情况

### 5. 地图功能
- 在"API Key 配置"中选择地图提供商并输入 API Key
- 生成行程后，地图会自动显示行程路线和地点
- 点击地图上的标记可以查看详细信息

## 注意事项

1. 本项目为演示版本，实际使用时请替换为真实的 API Key
2. 语音识别功能依赖浏览器支持，请使用最新版 Chrome 或 Edge 浏览器
3. 为了更好的体验，建议在稳定的网络环境下使用
4. 地图功能需要有效的 API Key 才能正常使用
5. 模拟数据仅用于演示，实际使用时会根据真实输入生成行程

## 常见问题

### 1. 地图不显示怎么办？
- 请检查是否正确配置了地图 API Key
- 确保选择了正确的地图提供商
- 检查浏览器控制台是否有错误信息

### 2. AI 生成的行程不准确怎么办？
- 尝试提供更详细的旅行需求描述
- 确保 API Key 有效且有足够的使用额度
- 重新生成行程

### 3. 语音输入不工作怎么办？
- 确保浏览器已获取麦克风权限
- 检查麦克风是否正常工作
- 尝试在安静的环境中使用语音输入

## 许可证

MIT License
