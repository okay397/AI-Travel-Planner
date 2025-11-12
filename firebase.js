// Firebase 配置
const firebaseConfig = {
  // 注意：这里使用模拟配置，实际项目中需要替换为真实的 Firebase 配置
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化 Firebase
let firebaseApp;
let auth;
let db;

function initializeFirebase() {
  if (!firebaseApp) {
    // 动态加载 Firebase SDK
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
    script.onload = () => {
      const authScript = document.createElement('script');
      authScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
      authScript.onload = () => {
        const firestoreScript = document.createElement('script');
        firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
        firestoreScript.onload = () => {
          // 使用 ES6 模块导入方式
          import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js')
            .then(({ initializeApp }) => {
              firebaseApp = initializeApp(firebaseConfig);
              
              import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js')
                .then(({ getAuth }) => {
                  auth = getAuth(firebaseApp);
                });
              
              import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js')
                .then(({ getFirestore }) => {
                  db = getFirestore(firebaseApp);
                });
            });
        };
        document.head.appendChild(firestoreScript);
      };
      document.head.appendChild(authScript);
    };
    document.head.appendChild(script);
  }
}

// 模拟的用户认证函数
const mockAuth = {
  currentUser: null,
  
  async login(email, password) {
    // 模拟登录
    if (email && password) {
      this.currentUser = {
        uid: 'user_' + Date.now(),
        email: email
      };
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      return { success: true };
    }
    return { success: false, error: '请输入邮箱和密码' };
  },
  
  async register(email, password) {
    // 模拟注册
    if (email && password) {
      this.currentUser = {
        uid: 'user_' + Date.now(),
        email: email
      };
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      return { success: true };
    }
    return { success: false, error: '请输入邮箱和密码' };
  },
  
  async logout() {
    this.currentUser = null;
    localStorage.removeItem('user');
  },
  
  checkAuth() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    return this.currentUser;
  }
};

// 模拟的数据库函数
const mockDB = {
  async saveTripPlan(plan) {
    const plans = JSON.parse(localStorage.getItem('tripPlans') || '[]');
    const userId = mockAuth.currentUser?.uid || 'guest';
    
    const newPlan = {
      id: 'plan_' + Date.now(),
      userId,
      ...plan,
      createdAt: new Date().toISOString()
    };
    
    plans.push(newPlan);
    localStorage.setItem('tripPlans', JSON.stringify(plans));
    return newPlan;
  },
  
  async getTripPlans() {
    const plans = JSON.parse(localStorage.getItem('tripPlans') || '[]');
    const userId = mockAuth.currentUser?.uid || 'guest';
    return plans.filter(plan => plan.userId === userId);
  },
  
  async saveExpense(expense) {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const userId = mockAuth.currentUser?.uid || 'guest';
    
    const newExpense = {
      id: 'expense_' + Date.now(),
      userId,
      ...expense,
      createdAt: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    return newExpense;
  },
  
  async getExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const userId = mockAuth.currentUser?.uid || 'guest';
    return expenses.filter(expense => expense.userId === userId);
  }
};

// 导出模拟服务，以便在无法使用真实 Firebase 时使用
// 将这些对象挂载到window对象上，以便在浏览器中全局访问
window.initializeFirebase = initializeFirebase;
window.mockAuth = mockAuth;
window.mockDB = mockDB;