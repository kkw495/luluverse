// Luluverse V3 - 主应用逻辑
import { db } from './storage.js';
import {
  getCloudConfig,
  saveCloudConfig,
  createWorkspace,
  joinWorkspace,
  syncToCloud,
  initAutoSync,
  setSyncStatus
} from './sync.js';
import { initDashboard } from './components/dashboard.js';
import { initClassroom } from './components/classroom.js';
import { initBrain } from './components/brain.js';
import { initProjects } from './components/projects.js';
import { initLibrary } from './components/library.js';
import { initSkills } from './components/skills.js';
import { initOutput } from './components/output.js';
import { initLife } from './components/life.js';
import { initReview } from './components/review.js';
import { initArchive } from './components/archive.js';
import { initWorld } from './components/world.js';
import { initLaw } from './components/law.js';
import { initAIPanel } from './components/ai-panel.js';




// 应用状态
const state = {
  currentPage: 'dashboard',
  user: {
    name: 'Lulu',
    apiKey: localStorage.getItem('deepseek-api-key') || ''
  }
};

// 初始化应用
async function init() {
  console.log('🚀 Luluverse V3 启动中...');
  
  // 初始化数据库
  await db.init();
  
  // 绑定导航
  bindNavigation();
  
  // 加载默认页面
  loadPage('dashboard');

  // 初始化云端同步
  initAutoSync();
  
  console.log('✅ Luluverse V3 已就绪');
}

// 导航绑定
function bindNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      
      // 更新导航状态
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 加载页面
      loadPage(page);
    });
  });
}

// 页面加载
async function loadPage(pageName) {
  state.currentPage = pageName;
  const main = document.getElementById('main');
  
  // 清空内容
  main.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    switch(pageName) {
      case 'dashboard':
        await initDashboard(main);
        break;
      
        case 'world':
          await initWorld(main);
          break;
      
        case 'classroom':
          await initClassroom(main);
          break;
     
        case 'law':
          await initLaw(main);
          break;
      
        case 'skills':
          await initSkills(main);
          break;
      
        case 'library':
          await initLibrary(main);
          break;
      
        case 'brain':
          await initBrain(main);
          break;
        
        case 'projects':
          await initProjects(main);
          break;
        
        case 'output':
          await initOutput(main);
          break;
      
        case 'life':
          await initLife(main);
          break;
            
        case 'review':
          await initReview(main);
          break;
            
        case 'archive':
           await initArchive(main);
           break;
         case 'ai':
           await initAIPanel(main);
           break;

      
      default:
        main.innerHTML = '<div class="page"><div class="empty-state"><div class="empty-state-icon">❓</div><p>页面不存在</p></div></div>';
    }
  } catch (error) {
    console.error('加载页面失败:', error);
    main.innerHTML = '<div class="page"><div class="empty-state"><div class="empty-state-icon">❌</div><p>加载失败，请刷新重试</p></div></div>';
  }
}

// 设置相关
window.openSettings = function() {
  const modal = document.getElementById('settingsModal');
  const apiKey = document.getElementById('apiKey');
  const cloud = getCloudConfig();
  
  apiKey.value = state.user.apiKey;
  document.getElementById('supabaseUrl').value = cloud.supabaseUrl || '';
  document.getElementById('supabaseKey').value = cloud.supabaseKey || '';
  document.getElementById('workspaceCode').value = cloud.workspaceCode || '';
  document.getElementById('autoSync').checked = cloud.autoSync !== false;
  modal.classList.add('show');
};

window.closeSettings = function() {
  document.getElementById('settingsModal').classList.remove('show');
};

function saveCloudForm() {
  const cloud = getCloudConfig();
  saveCloudConfig({
    ...cloud,
    supabaseUrl: document.getElementById('supabaseUrl').value.trim(),
    supabaseKey: document.getElementById('supabaseKey').value.trim(),
    workspaceCode: document.getElementById('workspaceCode').value.trim().toUpperCase(),
    autoSync: document.getElementById('autoSync').checked
  });
}

window.saveSettings = function() {
  const apiKey = document.getElementById('apiKey').value.trim();
  
  if (apiKey) {
    localStorage.setItem('deepseek-api-key', apiKey);
    state.user.apiKey = apiKey;
  }

  saveCloudForm();
  initAutoSync();
  alert('✅ 设置已保存');
  closeSettings();
};

window.createCloudWorkspace = async function() {
  try {
    saveCloudForm();
    const code = await createWorkspace();
    document.getElementById('workspaceCode').value = code;
    initAutoSync();
    alert(`✅ 工作区已创建！\n\n共享代码：${code}\n\n将此代码发给其他人，他们可在设置中「加入工作区」。`);
  } catch (err) {
    alert('❌ ' + err.message);
  }
};

window.joinCloudWorkspace = async function() {
  const code = document.getElementById('workspaceCode').value.trim().toUpperCase();
  if (!code) {
    alert('请先输入工作区代码');
    return;
  }
  if (!confirm(`加入工作区 ${code}？\n本地数据将与云端智能合并。`)) return;

  try {
    saveCloudForm();
    await joinWorkspace(code);
    alert('✅ 已加入工作区并同步数据');
    location.reload();
  } catch (err) {
    alert('❌ ' + err.message);
  }
};

window.manualCloudSync = async function() {
  try {
    saveCloudForm();
    setSyncStatus('syncing');
    await syncToCloud();
    alert('✅ 云端同步完成');
  } catch (err) {
    alert('❌ ' + err.message);
  }
};

// 导出状态供其他模块使用
export { state };

// 启动应用
init();
// 首次使用引导
if (!localStorage.getItem('luluverse-visited')) {
  localStorage.setItem('luluverse-visited', 'true');
  
  setTimeout(() => {
    if (confirm('👋 欢迎使用 Luluverse！\n\n这是你的个人操作系统，包含：\n\n📖 Classroom - 课堂笔记\n⚖️ Law School - 法学体系\n🧠 Second Brain - 问题库\n🚀 Projects - 项目管理\n📚 Library - 输入记录\n📝 Output - 输出中心\n❤️ Life - 生活记录\n🔄 Review - 复盘系统\n\n点击确定查看使用提示')) {
      showWelcomeGuide();
    }
  }, 1000);
}

function showWelcomeGuide() {
  const guide = `
📌 快速开始：

1. Dashboard - 每天设置 3 件要事，打卡习惯
2. Classroom - 记录民诉、刑法等课程笔记
3. Second Brain - 记录"为什么"类问题
4. Projects - 管理论文、比赛、辩论项目
5. Review - 每日/每周/每月复盘

💡 使用技巧：

• 用全局搜索快速找到任何内容
• Archive 页面可以导出备份数据
• 可在设置中配置云端同步，多设备共享数据
• 建议定期在 Archive 导出备份

🎯 建议工作流：

早上 → Dashboard 设置今日 Focus
学习 → Classroom / Law School 记笔记
思考 → Second Brain 记录问题
项目 → Projects 推进论文/比赛
晚上 → Review 每日复盘 + 习惯打卡

开始使用吧！
  `;
  
  alert(guide);
}

// 全局搜索功能
(function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      searchResults.classList.remove('show');
      searchResults.innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(async () => {
      await performSearch(query);
    }, 300);
  });

  // 点击外部关闭搜索结果
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('show');
    }
  });

  async function performSearch(query) {
    const results = [];

    // 搜索所有数据源
    const sources = [
      { name: 'classNotes', label: '📖 课堂笔记', titleKey: 'title', page: 'classroom' },
      { name: 'lawNotes', label: '⚖️ 法学笔记', titleKey: 'title', page: 'law' },
      { name: 'questions', label: '🧠 问题', titleKey: 'title', page: 'brain' },
      { name: 'projects', label: '🚀 项目', titleKey: 'title', page: 'projects' },
      { name: 'worldKnowledge', label: '🌍 知识', titleKey: 'title', page: 'world' },
      { name: 'library', label: '📚 输入', titleKey: 'title', page: 'library' },
      { name: 'outputs', label: '📝 输出', titleKey: 'title', page: 'output' },
      { name: 'lifeRecords', label: '❤️ 生活', titleKey: 'title', page: 'life' },
      { name: 'reviews', label: '🔄 复盘', titleKey: 'title', page: 'review' }
    ];

    for (const source of sources) {
      try {
        const items = await db.getAll(source.name);
        items.forEach(item => {
          const searchText = JSON.stringify(item).toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              ...item,
              _source: source.label,
              _page: source.page,
              _title: item[source.titleKey] || item.name || '未命名'
            });
          }
        });
      } catch (err) {
        // 某些表可能还不存在，忽略
      }
    }

    displayResults(results, query);
  }

  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item" style="text-align: center; color: var(--sub);">没有找到相关内容</div>';
      searchResults.classList.add('show');
      return;
    }

    searchResults.innerHTML = results.slice(0, 10).map(item => {
      // 提取预览文本
      let preview = '';
      if (item.content) preview = item.content;
      else if (item.concept) preview = item.concept;
      else if (item.core) preview = item.core;
      else if (item.summary) preview = item.summary;
      else if (item.goal) preview = item.goal;
      
      preview = preview.slice(0, 100) + (preview.length > 100 ? '...' : '');

      return `
        <div class="search-result-item" onclick="goToSearchResult('${item._page}', ${item.id})">
          <div class="search-result-title">${highlightQuery(item._title, query)}</div>
          <div class="search-result-meta">${item._source} · ${new Date(item.createdAt).toLocaleDateString()}</div>
          ${preview ? `<div class="search-result-preview">${highlightQuery(preview, query)}</div>` : ''}
        </div>
      `;
    }).join('');

    searchResults.classList.add('show');
  }

  function highlightQuery(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: #fff3b0; padding: 1px 2px;">$1</mark>');
  }

  window.goToSearchResult = (page, id) => {
    searchResults.classList.remove('show');
    searchInput.value = '';
    
    // 触发页面切换
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.page === page) {
        btn.click();
      }
    });

    // 滚动到顶部
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
})();
