// Life 模块 - 生活记录
import { db } from '../storage.js';

export async function initLife(container) {
  const records = await db.getAll('lifeRecords');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">❤️ Life</h1>
        <p class="page-subtitle">不是自律，而是人生</p>
      </div>

      <!-- 添加生活记录 -->
      <div class="card">
        <h3>记录生活</h3>
        <form id="lifeForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <select id="lifeType" required>
              <option value="">类型</option>
              <option value="阅读">阅读</option>
              <option value="电影">电影</option>
              <option value="旅行">旅行</option>
              <option value="美食">美食</option>
              <option value="游泳">游泳</option>
              <option value="朋友">朋友</option>
              <option value="金钱">金钱</option>
              <option value="愿望清单">愿望清单</option>
              <option value="幸福小事">幸福小事</option>
            </select>
            <input type="date" id="lifeDate" required>
          </div>
          
          <input type="text" id="lifeTitle" placeholder="标题 / 一件小事" required>
          <textarea id="lifeContent" placeholder="记录内容" style="min-height: 100px;"></textarea>
          
          <button type="submit" class="btn-primary">保存生活记录</button>
        </form>
      </div>

      <!-- Happiness List -->
      <div class="card" style="background: linear-gradient(135deg, rgba(184,196,178,.2), rgba(220,206,245,.2));">
        <h3>❤️ 幸福小事</h3>
        <div id="happinessList" style="margin-top: 14px;">
          ${records.filter(r => r.type === '幸福小事').slice(0, 5).map(r => `
            <div style="padding: 10px; background: white; border-radius: 12px; margin-bottom: 8px;">
              ${r.title}${r.content ? ` · ${r.content}` : ''}
              <span style="font-size: 12px; color: var(--sub); margin-left: 8px;">${new Date(r.date).toLocaleDateString()}</span>
            </div>
          `).join('') || '<div style="color: var(--sub); text-align: center;">还没有记录幸福小事</div>'}
        </div>
      </div>

      <!-- 类型筛选 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 14px; color: var(--sub);">类型：</span>
        <button class="btn-secondary" onclick="filterLife('all')" id="filterAllLife">全部 (${records.length})</button>
        ${['阅读', '电影', '游泳', '幸福小事'].map(t => `
          <button class="btn-secondary" onclick="filterLife('${t}')" id="filter${t}">${t} (${records.filter(r => r.type === t).length})</button>
        `).join('')}
      </div>

      <!-- 生活记录列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="lifeList"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  // 默认今天日期
  document.getElementById('lifeDate').value = new Date().toISOString().split('T')[0];

  document.getElementById('lifeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const record = {
      type: document.getElementById('lifeType').value,
      date: document.getElementById('lifeDate').value,
      title: document.getElementById('lifeTitle').value.trim(),
      content: document.getElementById('lifeContent').value.trim()
    };

    await db.add('lifeRecords', record);
    e.target.reset();
    document.getElementById('lifeDate').value = new Date().toISOString().split('T')[0];
    
    const records = await db.getAll('lifeRecords');
    renderLife(records, currentFilter);
    updateFilterButtons(records);
    updateHappinessList(records);
    
    alert('✅ 生活记录已保存');
  });

  renderLife(records, 'all');

  async function renderLife(records, filter) {
    currentFilter = filter;
    const list = document.getElementById('lifeList');
    
    let filtered = filter === 'all' 
      ? records 
      : records.filter(r => r.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有生活记录</p></div>';
      return;
    }

    list.innerHTML = filtered.map(r => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${r.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${r.type} · ${new Date(r.date || r.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteLifeRecord(${r.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${r.content ? `<div style="margin-top: 8px; line-height: 1.7;">${r.content}</div>` : ''}
      </div>
    `).join('');
  }

  function updateFilterButtons(records) {
    document.getElementById('filterAllLife').textContent = `全部 (${records.length})`;
    ['阅读', '电影', '游泳', '幸福小事'].forEach(t => {
      const btn = document.getElementById(`filter${t}`);
      if (btn) btn.textContent = `${t} (${records.filter(r => r.type === t).length})`;
    });
  }

  function updateHappinessList(records) {
    const happy = records.filter(r => r.type === '幸福小事').slice(0, 5);
    const list = document.getElementById('happinessList');
    list.innerHTML = happy.length ? happy.map(r => `
      <div style="padding: 10px; background: white; border-radius: 12px; margin-bottom: 8px;">
        ${r.title}${r.content ? ` · ${r.content}` : ''}
        <span style="font-size: 12px; color: var(--sub); margin-left: 8px;">${new Date(r.date).toLocaleDateString()}</span>
      </div>
    `).join('') : '<div style="color: var(--sub); text-align: center;">还没有记录幸福小事</div>';
  }

  window.filterLife = async (filter) => {
    const records = await db.getAll('lifeRecords');
    renderLife(records, filter);
  };

  window.deleteLifeRecord = async (id) => {
    if (confirm('确认删除这条记录？')) {
      await db.delete('lifeRecords', id);
      const records = await db.getAll('lifeRecords');
      renderLife(records, currentFilter);
      updateFilterButtons(records);
      updateHappinessList(records);
    }
  };
}
