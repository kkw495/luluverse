// Dashboard 模块
import { db } from '../storage.js';

function pickGreeting(pool) {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return pool[day % pool.length];
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    return pickGreeting([
      { title: 'Good Morning 👋', subtitle: '新的一天，从 Focus 开始' },
      { title: '早安 🌅', subtitle: '今天也要元气满满' },
      { title: '早上好 ☀️', subtitle: '欢迎回到 Luluverse' }
    ]);
  }
  if (hour >= 9 && hour < 12) {
    return pickGreeting([
      { title: '上午好 ☀️', subtitle: '保持专注，稳步前进' },
      { title: 'Good Morning 👋', subtitle: '上午是效率黄金时段' },
      { title: '嗨，上午好 ✨', subtitle: '欢迎回到 Luluverse' }
    ]);
  }
  if (hour >= 12 && hour < 14) {
    return pickGreeting([
      { title: '中午好 🍱', subtitle: '休息一下，下午继续' },
      { title: '午安 ☕', subtitle: '补充能量，迎接下午' },
      { title: '午间好 🌤️', subtitle: '欢迎回到 Luluverse' }
    ]);
  }
  if (hour >= 14 && hour < 18) {
    return pickGreeting([
      { title: '下午好 🌤️', subtitle: '继续推进今日要事' },
      { title: 'Good Afternoon 👋', subtitle: '欢迎回到 Luluverse' },
      { title: '午后时光 📖', subtitle: '学习、思考、创造' }
    ]);
  }
  if (hour >= 18 && hour < 22) {
    return pickGreeting([
      { title: '晚上好 🌙', subtitle: '复盘今天，规划明天' },
      { title: 'Good Evening ✨', subtitle: '欢迎回到 Luluverse' },
      { title: '傍晚好 🌆', subtitle: '今天过得怎么样？' }
    ]);
  }
  return pickGreeting([
    { title: '夜深了 🌙', subtitle: '早点休息，明天见' },
    { title: 'Good Night ✨', subtitle: '睡前记得每日复盘' },
    { title: '还没睡？💫', subtitle: '注意作息，欢迎回到 Luluverse' }
  ]);
}

export async function initDashboard(container) {
  // 获取今天的数据
  const today = new Date().toISOString().split('T')[0];
  
  // 从数据库获取统计数据
  const questions = await db.getAll('questions');
  const projects = await db.getAll('projects');
  const notes = await db.getAll('notes');
  
  // 获取今日 Focus（如果有）
  const allFocus = await db.getAll('focus');
  const todayFocus = allFocus.find(f => f.date === today) || { focus1: '', focus2: '', focus3: '', theme: '' };
  
  // 获取习惯打卡数据
  const allHabits = await db.getAll('habits');
  const todayHabits = allHabits.find(h => h.date === today) || { exercise: 0, reading: 0, english: 0, sleep: 0 };
  const greeting = getTimeGreeting();

  // 渲染页面
  container.innerHTML = `
    <div class="page">
      <!-- 欢迎 -->
      <div class="page-header">
        <h1 class="page-title">${greeting.title}</h1>
        <p class="page-subtitle">${greeting.subtitle}</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-4">
        <div class="stat-card">
          <div class="stat-label">待解决问题</div>
          <div class="stat-value">${questions.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">进行中项目</div>
          <div class="stat-value">${projects.filter(p => p.status === '进行中').length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">笔记总数</div>
          <div class="stat-value">${notes.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">完成项目</div>
          <div class="stat-value">${projects.filter(p => p.status === '已完成').length}</div>
        </div>
      </div>

      <!-- 今日 Focus -->
      <div class="card" style="margin-top: 28px;">
        <h3>🌱 今日三件要事</h3>
        <form id="focusForm" style="display: grid; gap: 12px; margin-top: 14px;">
          <input type="text" id="focus1" placeholder="Focus 1" value="${todayFocus.focus1 || ''}">
          <input type="text" id="focus2" placeholder="Focus 2" value="${todayFocus.focus2 || ''}">
          <input type="text" id="focus3" placeholder="Focus 3" value="${todayFocus.focus3 || ''}">
          <input type="text" id="theme" placeholder="本周主题，例如：Human（人）" value="${todayFocus.theme || ''}">
          <button type="submit" class="btn-primary">保存</button>
        </form>
      </div>

      <!-- 习惯打卡 -->
      <div class="card">
        <h3>📈 习惯打卡（点 + 记录一次）</h3>
        <div class="grid grid-2 habits-grid" style="margin-top: 18px;">
          <div class="habit-item">
            <span>🏃 运动</span>
            <div class="habit-controls">
              <button class="btn-secondary" onclick="modifyHabit('exercise', -1)">−</button>
              <span class="habit-count" id="habitExercise">${todayHabits.exercise || 0}</span>
              <button class="btn-primary" onclick="modifyHabit('exercise', 1)">+</button>
            </div>
          </div>
          <div class="habit-item">
            <span>📖 阅读</span>
            <div class="habit-controls">
              <button class="btn-secondary" onclick="modifyHabit('reading', -1)">−</button>
              <span class="habit-count" id="habitReading">${todayHabits.reading || 0}</span>
              <button class="btn-primary" onclick="modifyHabit('reading', 1)">+</button>
            </div>
          </div>
          <div class="habit-item">
            <span>🔤 英语</span>
            <div class="habit-controls">
              <button class="btn-secondary" onclick="modifyHabit('english', -1)">−</button>
              <span class="habit-count" id="habitEnglish">${todayHabits.english || 0}</span>
              <button class="btn-primary" onclick="modifyHabit('english', 1)">+</button>
            </div>
          </div>
          <div class="habit-item">
            <span>😴 睡眠</span>
            <div class="habit-controls">
              <button class="btn-secondary" onclick="modifyHabit('sleep', -1)">−</button>
              <span class="habit-count" id="habitSleep">${todayHabits.sleep || 0}</span>
              <button class="btn-primary" onclick="modifyHabit('sleep', 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近动态 -->
      <div class="grid grid-2">
        <div class="card">
          <h3>💡 最近问题</h3>
          <div class="list">
            ${questions.length > 0 
              ? questions.slice(0, 3).map(q => `
                  <div class="list-item">
                    <div style="font-weight: 600;">${q.title}</div>
                    <div style="font-size: 13px; color: var(--sub); margin-top: 4px;">${q.type || 'Why'}</div>
                  </div>
                `).join('')
              : '<div class="empty-state"><p>还没有问题，去 Second Brain 记录</p></div>'}
          </div>
        </div>

        <div class="card">
          <h3>🚀 最近项目</h3>
          <div class="list">
            ${projects.length > 0
              ? projects.slice(0, 3).map(p => `
                  <div class="list-item">
                    <div style="font-weight: 600;">${p.title}</div>
                    <div style="font-size: 13px; color: var(--sub); margin-top: 4px;">${p.status || '进行中'} · ${p.progress || 0}%</div>
                  </div>
                `).join('')
              : '<div class="empty-state"><p>还没有项目，去 Projects 创建</p></div>'}
          </div>
        </div>
      </div>
      </div>
  `;

  // 绑定 Focus 表单提交
  document.getElementById('focusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const focusData = {
      date: today,
      focus1: document.getElementById('focus1').value.trim(),
      focus2: document.getElementById('focus2').value.trim(),
      focus3: document.getElementById('focus3').value.trim(),
      theme: document.getElementById('theme').value.trim()
    };

    // 删除旧记录，添加新记录
    const allFocus = await db.getAll('focus');
    const oldFocus = allFocus.find(f => f.date === today);
    if (oldFocus) {
      await db.delete('focus', oldFocus.id);
    }
    
    await db.add('focus', focusData);
    alert('✅ 今日 Focus 已保存');
  });

  // 习惯打卡逻辑
  window.modifyHabit = async function(type, delta) {
    const today = new Date().toISOString().split('T')[0];
    const allHabits = await db.getAll('habits');
    let todayHabits = allHabits.find(h => h.date === today);

    if (!todayHabits) {
      todayHabits = { date: today, exercise: 0, reading: 0, english: 0, sleep: 0 };
    }

    todayHabits[type] = Math.max(0, (todayHabits[type] || 0) + delta);

    // 保存
    if (todayHabits.id) {
      await db.update('habits', todayHabits);
    } else {
      await db.add('habits', todayHabits);
    }

    // 更新界面
    document.getElementById(`habit${type.charAt(0).toUpperCase() + type.slice(1)}`).textContent = todayHabits[type];
  };
}
window.quickNav = (page) => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.page === page) {
      btn.click();
    }
  });
};
