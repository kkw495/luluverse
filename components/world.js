// World Map 模块 - 按世界分类组织知识
import { db } from '../storage.js';

export async function initWorld(container) {
  const knowledge = await db.getAll('worldKnowledge');

  // 统计各世界的知识数量
  const counts = {
    '人': knowledge.filter(k => k.world === '人').length,
    '社会': knowledge.filter(k => k.world === '社会').length,
    '文明': knowledge.filter(k => k.world === '文明').length,
    '自然': knowledge.filter(k => k.world === '自然').length,
    '宇宙': knowledge.filter(k => k.world === '宇宙').length
  };

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">🌍 World Map</h1>
        <p class="page-subtitle">不是按来源分类，而是按世界分类。你理解世界的方式，就是你组织知识的方式。</p>
      </div>

      <!-- 五个世界 -->
      <div class="grid grid-2" id="worldCards">
        <div class="world-card" onclick="selectWorld('人')" data-world="人">
          <h3>👤 人</h3>
          <p style="color: var(--sub); font-size: 14px; line-height: 1.7; margin: 10px 0;">
            心理学 · 人类学 · 社会学 · 性别研究 · 传播学 · 教育
          </p>
          <div style="font-size: 13px; color: var(--brown); margin-top: 10px;">
            ${counts['人']} 张知识卡片
          </div>
        </div>

        <div class="world-card" onclick="selectWorld('社会')" data-world="社会">
          <h3>🏛 社会</h3>
          <p style="color: var(--sub); font-size: 14px; line-height: 1.7; margin: 10px 0;">
            法律 · 经济学 · 政治学 · 公共政策 · 媒介 · 技术
          </p>
          <div style="font-size: 13px; color: var(--brown); margin-top: 10px;">
            ${counts['社会']} 张知识卡片
          </div>
        </div>

        <div class="world-card" onclick="selectWorld('文明')" data-world="文明">
          <h3>📜 文明</h3>
          <p style="color: var(--sub); font-size: 14px; line-height: 1.7; margin: 10px 0;">
            历史 · 哲学 · 文学 · 艺术 · 宗教
          </p>
          <div style="font-size: 13px; color: var(--brown); margin-top: 10px;">
            ${counts['文明']} 张知识卡片
          </div>
        </div>

        <div class="world-card" onclick="selectWorld('自然')" data-world="自然">
          <h3>🌿 自然</h3>
          <p style="color: var(--sub); font-size: 14px; line-height: 1.7; margin: 10px 0;">
            生物 · 神经科学 · 进化 · 生态
          </p>
          <div style="font-size: 13px; color: var(--brown); margin-top: 10px;">
            ${counts['自然']} 张知识卡片
          </div>
        </div>

        <div class="world-card" onclick="selectWorld('宇宙')" data-world="宇宙">
          <h3>🌌 宇宙</h3>
          <p style="color: var(--sub); font-size: 14px; line-height: 1.7; margin: 10px 0;">
            天文 · 物理 · 人工智能 · 未来研究
          </p>
          <div style="font-size: 13px; color: var(--brown); margin-top: 10px;">
            ${counts['宇宙']} 张知识卡片
          </div>
        </div>
      </div>

      <!-- 添加知识卡片 -->
      <div class="card" style="margin-top: 28px;">
        <h3>新增知识卡片</h3>
        <form id="worldKnowledgeForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
            <input type="text" id="knowledgeTitle" placeholder="标题，如：认知失调" required>
            <select id="knowledgeWorld" required>
              <option value="">选择世界</option>
              <option value="人">👤 人</option>
              <option value="社会">🏛 社会</option>
              <option value="文明">📜 文明</option>
              <option value="自然">🌿 自然</option>
              <option value="宇宙">🌌 宇宙</option>
            </select>
          </div>
          
          <input type="text" id="knowledgeCategory" placeholder="子学科，如：心理学 / 法律 / 哲学">
          <input type="text" id="knowledgeOneLine" placeholder="一句话概括">
          <textarea id="knowledgeCore" placeholder="核心观点" style="min-height: 80px;"></textarea>
          <textarea id="knowledgeUnderstanding" placeholder="我的理解" style="min-height: 80px;"></textarea>
          <textarea id="knowledgeApplication" placeholder="现实应用" style="min-height: 60px;"></textarea>
          <input type="text" id="knowledgeTags" placeholder="关联 / 标签，用逗号分隔">
          <input type="text" id="knowledgeSource" placeholder="来源，如：书 / B站 / 论文 / YouTube">
          
          <button type="submit" class="btn-primary">保存知识卡片</button>
        </form>
      </div>

      <!-- 知识列表 -->
      <div style="margin-top: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 id="knowledgeListTitle">全部知识卡片</h3>
          <button class="btn-secondary" onclick="clearWorldFilter()" id="clearFilterBtn" style="display: none;">显示全部</button>
        </div>
        <div class="list" id="knowledgeList"></div>
      </div>
    </div>
  `;

  let currentWorld = null;

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .world-card {
      min-height: 180px;
      padding: 22px;
      border-radius: 24px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, #fffefb, #fbf8f2);
      box-shadow: var(--shadow);
      cursor: pointer;
      transition: all 0.3s;
    }
    .world-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(64, 52, 38, 0.12);
    }
    .world-card.selected {
      border: 2px solid var(--sage);
      background: linear-gradient(135deg, rgba(184,196,178,.15), rgba(169,189,214,.15));
    }
    .world-card:nth-child(1) { border-left: 8px solid var(--sage); }
    .world-card:nth-child(2) { border-left: 8px solid var(--blue); }
    .world-card:nth-child(3) { border-left: 8px solid var(--lav); }
    .world-card:nth-child(4) { border-left: 8px solid #c8d7b5; }
    .world-card:nth-child(5) { border-left: 8px solid #c8b2e7; }
  `;
  document.head.appendChild(style);

  // 表单提交
  document.getElementById('worldKnowledgeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const item = {
      title: document.getElementById('knowledgeTitle').value.trim(),
      world: document.getElementById('knowledgeWorld').value,
      category: document.getElementById('knowledgeCategory').value.trim(),
      oneLine: document.getElementById('knowledgeOneLine').value.trim(),
      core: document.getElementById('knowledgeCore').value.trim(),
      understanding: document.getElementById('knowledgeUnderstanding').value.trim(),
      application: document.getElementById('knowledgeApplication').value.trim(),
      tags: document.getElementById('knowledgeTags').value.trim(),
      source: document.getElementById('knowledgeSource').value.trim()
    };

    await db.add('worldKnowledge', item);
    e.target.reset();
    
    await refreshWorld();
    alert('✅ 知识卡片已保存');
  });

  // 初始渲染
  renderKnowledgeList();

  async function refreshWorld() {
    const knowledge = await db.getAll('worldKnowledge');
    
    // 更新计数
    const newCounts = {
      '人': knowledge.filter(k => k.world === '人').length,
      '社会': knowledge.filter(k => k.world === '社会').length,
      '文明': knowledge.filter(k => k.world === '文明').length,
      '自然': knowledge.filter(k => k.world === '自然').length,
      '宇宙': knowledge.filter(k => k.world === '宇宙').length
    };

    document.querySelectorAll('.world-card').forEach((card, i) => {
      const worlds = ['人', '社会', '文明', '自然', '宇宙'];
      const world = worlds[i];
      const countDiv = card.querySelector('div:last-child');
      if (countDiv) {
        countDiv.textContent = `${newCounts[world]} 张知识卡片`;
      }
    });

    renderKnowledgeList();
  }

  async function renderKnowledgeList() {
    const knowledge = await db.getAll('worldKnowledge');
    const list = document.getElementById('knowledgeList');
    
    let filtered = currentWorld 
      ? knowledge.filter(k => k.world === currentWorld)
      : knowledge;

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有知识卡片</p></div>';
      return;
    }

    list.innerHTML = filtered.map(k => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${k.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${k.world} ${k.category ? `· ${k.category}` : ''} · ${new Date(k.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteKnowledge(${k.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${k.oneLine ? `<div style="margin-top: 8px; color: var(--sub);">${k.oneLine}</div>` : ''}
        ${k.core ? `<div style="margin-top: 8px;"><strong>核心观点：</strong>${k.core}</div>` : ''}
        ${k.understanding ? `<div style="margin-top: 8px;"><strong>我的理解：</strong>${k.understanding}</div>` : ''}
        ${k.application ? `<div style="margin-top: 8px;"><strong>现实应用：</strong>${k.application}</div>` : ''}
        ${k.source ? `<div style="margin-top: 8px; font-size: 13px; color: var(--sub);">来源: ${k.source}</div>` : ''}
        ${k.tags ? `<div style="margin-top: 8px;">${k.tags.split(',').map(t => `<span class="pill">${t.trim()}</span>`).join('')}</div>` : ''}
      </div>
    `).join('');
  }

  window.selectWorld = async (world) => {
    currentWorld = currentWorld === world ? null : world;
    
    // 更新选中状态
    document.querySelectorAll('.world-card').forEach(card => {
      if (card.dataset.world === world) {
        card.classList.toggle('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // 更新标题和按钮
    const title = document.getElementById('knowledgeListTitle');
    const clearBtn = document.getElementById('clearFilterBtn');
    
    if (currentWorld) {
      title.textContent = `${currentWorld} · 知识卡片`;
      clearBtn.style.display = 'block';
    } else {
      title.textContent = '全部知识卡片';
      clearBtn.style.display = 'none';
    }

    renderKnowledgeList();
  };

  window.clearWorldFilter = () => {
    currentWorld = null;
    document.querySelectorAll('.world-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('knowledgeListTitle').textContent = '全部知识卡片';
    document.getElementById('clearFilterBtn').style.display = 'none';
    renderKnowledgeList();
  };

  window.deleteKnowledge = async (id) => {
    if (confirm('确认删除这张知识卡片？')) {
      await db.delete('worldKnowledge', id);
      await refreshWorld();
    }
  };
}
