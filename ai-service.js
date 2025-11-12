// AI 服务模块，用于处理行程规划和预算分析

// 支持的 AI 服务提供商
const AI_PROVIDERS = {
  OPENAI: 'openai',
  ALIYUN: 'aliyun',
  MOCK: 'mock' // 模拟模型，用于演示
};

// 支持的模型列表
const MODEL_LIST = {
  openai: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
  ],
  aliyun: [
    { value: 'qwen-plus', label: '通义千问 Plus' },
    { value: 'qwen-max', label: '通义千问 Max' },
    { value: 'qianwen-turbo', label: '千问 Turbo' }
  ]
};

class AIService {
  constructor() {
    this.apiKey = localStorage.getItem('aiApiKey') || '';
    this.provider = localStorage.getItem('aiProvider') || AI_PROVIDERS.MOCK;
    this.modelName = localStorage.getItem('aiModelName') || 'gpt-3.5-turbo';
    this.aliyunAppKey = localStorage.getItem('aliyunAppKey') || '';
    this.status = 'idle'; // idle, busy, error
    this.error = null;
  }

  // 更新 API 配置
  updateConfig(config) {
    if (config.apiKey !== undefined) {
      this.apiKey = config.apiKey;
      localStorage.setItem('aiApiKey', config.apiKey);
    }
    if (config.provider !== undefined) {
      this.provider = config.provider;
      localStorage.setItem('aiProvider', config.provider);
    }
    if (config.modelName !== undefined) {
      this.modelName = config.modelName;
      localStorage.setItem('aiModelName', config.modelName);
    }
    if (config.aliyunAppKey !== undefined) {
      this.aliyunAppKey = config.aliyunAppKey;
      localStorage.setItem('aliyunAppKey', config.aliyunAppKey);
    }
    
    // 重置状态
    this.status = 'idle';
    this.error = null;
    
    console.log('AI 服务配置已更新:', {
      provider: this.provider,
      modelName: this.modelName,
      hasApiKey: !!this.apiKey,
      hasAppKey: !!this.aliyunAppKey
    });
  }
  
  // 获取可用模型列表
  getAvailableModels() {
    return MODEL_LIST[this.provider] || [];
  }
  
  // 测试 API 连接
  async testConnection() {
    this.status = 'busy';
    this.error = null;
    
    try {
      if (this.provider === AI_PROVIDERS.OPENAI && this.apiKey) {
        // 测试 OpenAI API 连接
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });
        
        if (response.ok) {
          this.status = 'idle';
          return { success: true, message: 'OpenAI API 连接成功' };
        } else {
          throw new Error(`OpenAI API 连接失败: ${response.status} ${await response.text()}`);
        }
      } else if (this.provider === AI_PROVIDERS.ALIYUN) {
        // 模拟阿里云 API 连接测试
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.status = 'idle';
        return { 
          success: true, 
          message: this.apiKey && this.aliyunAppKey 
            ? '阿里云 API 配置完整（模拟测试通过）' 
            : '阿里云 API 配置不完整，请检查配置'
        };
      } else if (this.provider === AI_PROVIDERS.MOCK) {
        this.status = 'idle';
        return { success: true, message: '模拟模式不需要 API Key' };
      }
      
      throw new Error('未配置有效的 API Key');
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      return { success: false, message: error.message };
    }
  }

  // 生成旅行计划
  async generateTripPlan(tripData) {
    this.status = 'busy';
    this.error = null;
    
    const { destination, days, budget, travelers, preferences } = tripData;
    
    // 构建提示词
    const prompt = `请为以下旅行需求生成详细的行程计划：
目的地：${destination}
天数：${days}天
预算：${budget}元
人数：${travelers}人
旅行偏好：${preferences}

请严格按照以下JSON格式输出，确保可以被正确解析：
{
  "destination": "目的地",
  "days": 天数,
  "budget": 预算,
  "travelers": 人数,
  "preferences": "偏好",
  "plan": [
    {
      "day": 第几天,
      "activities": [
        { "time": "时间", "description": "活动描述", "location": "地点", "estimatedCost": 预计费用 },
        ...
      ],
      "accommodation": "住宿建议",
      "dailyBudget": 每日预算
    }
  ],
  "totalEstimatedCost": 总费用,
  "transportation": "交通建议",
  "tips": ["旅行建议1", "旅行建议2", ...]
}

请确保生成的JSON格式正确，不要包含任何额外的文本说明。`;

    try {
      switch (this.provider) {
        case AI_PROVIDERS.OPENAI:
          if (!this.apiKey) {
            throw new Error('OpenAI API Key 未配置');
          }
          const openaiResult = await this.callOpenAI(prompt);
          this.status = 'idle';
          return openaiResult;
        case AI_PROVIDERS.ALIYUN:
          const aliyunResult = await this.callAliyun(prompt);
          this.status = 'idle';
          return aliyunResult;
        default:
          this.status = 'idle';
          return this.getMockResponse(tripData);
      }
    } catch (error) {
      console.error('AI 行程规划错误:', error);
      this.status = 'error';
      this.error = error.message;
      // 返回模拟数据作为降级方案
      const mockResult = this.getMockResponse(tripData);
      mockResult.warning = '由于 API 调用失败，返回的是模拟数据';
      return mockResult;
    }
  }

  // 调用 OpenAI API
  async callOpenAI(prompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一位专业的旅行规划师，请根据用户需求生成详细的行程计划。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `OpenAI API 错误: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('未收到 AI 响应内容');
      }
      
      // 尝试解析 JSON 响应
      try {
        const result = JSON.parse(content);
        result.source = 'openai'; // 添加来源标识
        return result;
      } catch (e) {
        console.error('解析 AI 响应失败:', e);
        throw new Error('AI 响应格式错误，无法解析为 JSON');
      }
    } catch (error) {
      console.error('OpenAI API 调用失败:', error);
      throw error;
    }
  }

  // 调用阿里云百炼 API
  async callAliyun(prompt) {
    console.log('调用阿里云百炼 API:', { model: this.modelName, hasApiKey: !!this.apiKey, hasAppKey: !!this.aliyunAppKey });
    
    // 检查配置完整性
    if (!this.apiKey) {
      throw new Error('阿里云 Access Key 未配置');
    }
    
    // 构建阿里云 API 请求参数
    const requestBody = {
      model: this.modelName || 'qwen-plus',
      input: {
        prompt: prompt,
        system_prompt: '你是一位专业的旅行规划师，请根据用户需求生成详细的行程计划。'
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 2048
      }
    };
    
    try {
      // 注意：这里是模拟的阿里云 API 调用
      // 实际使用时需要根据阿里云百炼平台的最新文档调整
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 解析提示词中的旅行数据
      const tripData = {
        destination: prompt.match(/目的地：(.*)/)?.[1] || '未知',
        days: parseInt(prompt.match(/天数：(\d+)天/)?.[1] || '3'),
        budget: parseInt(prompt.match(/预算：(\d+)元/)?.[1] || '5000'),
        travelers: parseInt(prompt.match(/人数：(\d+)人/)?.[1] || '2'),
        preferences: prompt.match(/旅行偏好：(.*)/)?.[1] || ''
      };
      
      // 返回模拟数据，但添加阿里云标识
      const mockResult = this.getMockResponse(tripData);
      mockResult.source = 'aliyun';
      mockResult.model = this.modelName || 'qwen-plus';
      
      // 如果没有配置 App Key，添加提示
      if (!this.aliyunAppKey) {
        mockResult.notice = '注意：阿里云 App Key 未配置，某些高级功能可能受限';
      }
      
      return mockResult;
    } catch (error) {
      console.error('阿里云 API 调用失败:', error);
      throw new Error(`阿里云 API 错误: ${error.message}`);
    }
  }

  // 获取模拟响应
  getMockResponse(tripData) {
    const { destination, days, budget, travelers, preferences } = tripData;
    const dailyBudget = Math.floor(budget / days);
    
    const plan = [];
    const prefLower = preferences ? preferences.toLowerCase() : '';
    
    // 根据偏好生成特定活动
    const getActivitiesForDay = (day, totalDays) => {
      const activities = [];
      
      // 第一天特殊处理
      if (day === 1) {
        activities.push({
          time: '09:00',
          description: '抵达目的地，办理入住',
          location: `${destination}机场`,
          estimatedCost: dailyBudget * 0.4
        });
        activities.push({
          time: '12:00',
          description: `机场附近午餐`,
          location: `${destination}机场餐厅`,
          estimatedCost: dailyBudget * 0.15
        });
        activities.push({
          time: '14:00',
          description: prefLower.includes('休息') ? '酒店休息调整时差' : '市区初步游览',
          location: prefLower.includes('休息') ? '酒店' : `${destination}市中心`,
          estimatedCost: dailyBudget * 0.1
        });
      } else {
        activities.push({
          time: '08:00',
          description: '酒店早餐',
          location: '酒店',
          estimatedCost: 0 // 通常包含在住宿费中
        });
        
        // 上午活动
        if (prefLower.includes('美食')) {
          activities.push({
            time: '10:00',
            description: '当地美食市场探索',
            location: `${destination}美食市场`,
            estimatedCost: dailyBudget * 0.15
          });
        } else if (prefLower.includes('文化') || prefLower.includes('历史')) {
          activities.push({
            time: '10:00',
            description: '历史文化景点游览',
            location: `${destination}博物馆/历史区`,
            estimatedCost: dailyBudget * 0.2
          });
        } else if (prefLower.includes('自然')) {
          activities.push({
            time: '10:00',
            description: '自然风光欣赏',
            location: `${destination}自然公园`,
            estimatedCost: dailyBudget * 0.25
          });
        } else if (prefLower.includes('购物')) {
          activities.push({
            time: '10:00',
            description: '特色商店购物',
            location: `${destination}特色街区`,
            estimatedCost: dailyBudget * 0.3
          });
        } else {
          activities.push({
            time: '10:00',
            description: '主要景点游览',
            location: `${destination}著名景点`,
            estimatedCost: dailyBudget * 0.2
          });
        }
      }
      
      // 午餐
      activities.push({
        time: '13:00',
        description: prefLower.includes('美食') ? `当地特色午餐（美食推荐）` : '午餐',
        location: prefLower.includes('美食') ? `${destination}知名餐厅` : `${destination}餐厅`,
        estimatedCost: dailyBudget * 0.2
      });
      
      // 下午活动
      if (prefLower.includes('动漫') || prefLower.includes('二次元')) {
        activities.push({
          time: '15:00',
          description: '动漫主题商店/展览',
          location: `${destination}动漫街区`,
          estimatedCost: dailyBudget * 0.25
        });
      } else if (prefLower.includes('艺术')) {
        activities.push({
          time: '15:00',
          description: '艺术展览参观',
          location: `${destination}艺术博物馆`,
          estimatedCost: dailyBudget * 0.15
        });
      } else if (prefLower.includes('带孩子') || prefLower.includes('亲子')) {
        activities.push({
          time: '15:00',
          description: '亲子活动',
          location: `${destination}儿童乐园/主题公园`,
          estimatedCost: dailyBudget * 0.3
        });
      } else {
        activities.push({
          time: '15:00',
          description: '自由活动/自选景点',
          location: `${destination}市区`,
          estimatedCost: dailyBudget * 0.1
        });
      }
      
      // 晚餐
      activities.push({
        time: '18:00',
        description: '晚餐',
        location: `${destination}高级餐厅`,
        estimatedCost: dailyBudget * 0.25
      });
      
      // 最后一天特殊处理
      if (day === totalDays) {
        activities.push({
          time: '20:00',
          description: '整理行李，准备返程',
          location: '酒店',
          estimatedCost: 0
        });
      } else {
        activities.push({
          time: '20:00',
          description: '晚间自由活动',
          location: `${destination}夜市/夜景`,
          estimatedCost: dailyBudget * 0.1
        });
      }
      
      return activities;
    };
    
    // 为每天生成行程
    for (let i = 1; i <= days; i++) {
      plan.push({
        day: i,
        activities: getActivitiesForDay(i, days),
        accommodation: `${destination}${i === 1 ? '机场附近' : '市中心'}${prefLower.includes('豪华') ? '豪华' : '商务'}酒店`,
        dailyBudget: dailyBudget
      });
    }

    // 生成旅行提示
    const tips = [
      '记得随身携带护照和重要证件',
      '建议购买旅行保险',
      `根据季节准备合适的衣物`,
      '尊重当地的风俗习惯',
      '下载离线地图以备不时之需'
    ];
    
    // 添加偏好相关提示
    if (prefLower.includes('美食')) {
      tips.push(`尝试${destination}的特色美食，但注意饮食卫生`);
    }
    if (prefLower.includes('购物')) {
      tips.push(`了解${destination}的退税政策`);
      tips.push(`预留足够的行李空间存放购物物品`);
    }
    if (prefLower.includes('带孩子') || prefLower.includes('亲子')) {
      tips.push('携带孩子喜欢的零食和玩具，以应对长途旅行');
      tips.push('选择儿童友好型餐厅和景点');
    }
    if (prefLower.includes('自然')) {
      tips.push('穿着舒适的鞋子，准备防晒用品');
    }
    if (days > 7) {
      tips.push('长途旅行注意休息，不要安排过于紧凑的行程');
    }

    return {
      destination,
      days,
      budget,
      travelers,
      preferences,
      plan,
      totalEstimatedCost: Math.floor(budget * 0.9), // 预留 10% 预算缓冲
      transportation: `${destination}市内交通建议使用${prefLower.includes('自驾') ? '租车自驾' : '地铁和出租车'}。${days > 3 ? '可以考虑购买城市交通卡节省费用。' : ''}`,
      tips: tips.slice(0, 7), // 最多返回7条提示
      source: 'mock',
      generatedAt: new Date().toLocaleString()
    };
  }

  // 预算分析
  async analyzeBudget(tripData, expenses = []) {
    const { budget } = tripData;
    const totalExpenses = expenses.length > 0 
      ? expenses.reduce((sum, expense) => sum + expense.amount, 0)
      : Math.floor(budget * 0.3); // 如果没有实际支出，返回默认值
    
    const remainingBudget = budget - totalExpenses;
    const percentageUsed = (totalExpenses / budget) * 100;
    
    // 支出分类统计
    const expenseCategories = {};
    expenses.forEach(expense => {
      const category = expense.category || '其他';
      if (!expenseCategories[category]) {
        expenseCategories[category] = 0;
      }
      expenseCategories[category] += expense.amount;
    });

    // 生成建议
    const recommendations = [
      `当前已使用预算的${percentageUsed.toFixed(1)}%`,
      `剩余预算: ${remainingBudget}元`
    ];
    
    if (percentageUsed > 90) {
      recommendations.push('预算已接近超支，建议严格控制后续支出');
      recommendations.push('考虑减少一些非必要的购物和娱乐活动');
    } else if (percentageUsed > 70) {
      recommendations.push('预算使用较多，建议适度控制后续支出');
    } else if (percentageUsed > 50) {
      recommendations.push('预算使用合理，可以继续按计划进行');
    } else {
      recommendations.push('预算使用较少，有充足的灵活空间');
    }

    // 添加分类建议
    if (expenseCategories['购物'] && expenseCategories['购物'] > budget * 0.3) {
      recommendations.push('购物支出占比较大，建议控制后续购物预算');
    }
    if (expenseCategories['餐饮'] && expenseCategories['餐饮'] > budget * 0.25) {
      recommendations.push('餐饮支出占比较高，可以尝试一些性价比更高的餐厅');
    }

    return {
      totalBudget: budget,
      totalExpenses,
      remainingBudget,
      percentageUsed,
      budgetStatus: percentageUsed > 90 ? '超支警告' : percentageUsed > 70 ? '预算紧张' : '预算充足',
      expenseCategories,
      recommendations,
      isOverBudget: remainingBudget < 0,
      overBudgetAmount: remainingBudget < 0 ? Math.abs(remainingBudget) : 0,
      safeDailySpending: remainingBudget > 0 && tripData.days > 0 
        ? Math.floor(remainingBudget / tripData.days) 
        : 0
    };
  }
  
  // 保存行程计划
  saveTripPlan(tripPlan) {
    try {
      const savedPlans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
      const planWithId = {
        ...tripPlan,
        id: Date.now().toString(),
        savedAt: new Date().toISOString()
      };
      savedPlans.push(planWithId);
      localStorage.setItem('savedTripPlans', JSON.stringify(savedPlans));
      return planWithId;
    } catch (error) {
      console.error('保存行程计划失败:', error);
      throw new Error('保存行程计划失败');
    }
  }
  
  // 获取保存的行程计划列表
  getSavedTripPlans() {
    try {
      return JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
    } catch (error) {
      console.error('获取保存的行程计划失败:', error);
      return [];
    }
  }
  
  // 删除行程计划
  deleteTripPlan(planId) {
    try {
      const savedPlans = JSON.parse(localStorage.getItem('savedTripPlans') || '[]');
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      localStorage.setItem('savedTripPlans', JSON.stringify(updatedPlans));
      return true;
    } catch (error) {
      console.error('删除行程计划失败:', error);
      throw new Error('删除行程计划失败');
    }
  }
}

// 导出常量
export { AI_PROVIDERS, MODEL_LIST };

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', () => {
  // 从 localStorage 加载配置并初始化 AI 服务
  const config = {
    apiKey: localStorage.getItem('aiApiKey') || '',
    provider: localStorage.getItem('aiProvider') || AI_PROVIDERS.MOCK,
    modelName: localStorage.getItem('aiModelName') || '',
    aliyunAppKey: localStorage.getItem('aliyunAppKey') || ''
  };
  
  if (config.apiKey || config.provider !== AI_PROVIDERS.MOCK) {
    aiService.updateConfig(config);
  }
});

// 导出单例
export const aiService = new AIService();