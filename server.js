const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置静态文件目录
app.use(express.static(__dirname));

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 捕获所有其他路由，返回index.html（支持前端路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API 路由
app.post('/api/plan-trip', async (req, res) => {
  try {
    // 这里将集成 AI 行程规划逻辑
    const { destination, days, budget, preferences } = req.body;
    
    // 模拟 AI 响应
    const mockTripPlan = {
      destination,
      days,
      budget,
      preferences,
      plan: [
        {
          day: 1,
          activities: [
            { time: '09:00', description: '抵达目的地' },
            { time: '10:30', description: '办理入住' },
            { time: '12:00', description: '当地特色午餐' },
            { time: '14:00', description: '参观主要景点' },
            { time: '18:00', description: '晚餐推荐' }
          ]
        }
      ],
      estimatedCost: budget * 0.8
    };
    
    res.json(mockTripPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});