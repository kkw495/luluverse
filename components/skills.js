// Skills 模块 - 能力训练
import { db } from '../storage.js';

export async function initSkills(container) {
  const records = await db.getAll('skillRecords');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">🗣 Skills</h1>
        <p class="page-subtitle">不是收藏教程，而是记录训练</p>
      </div>

      <!-- 添加训练记录 -->
      <div class="card">
        <h3>记录训练</h3>
        <form id="skillForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <select id="skillName" required>
              <option value="">选择能力</option>
              <option value="辩论">辩论</option>
              <option value="模拟法庭">模拟法庭</option>
              <option value="写作">写作</option>
              <option value="演讲">演讲</option>
              <option value="英语">英语</option>
              <option value="研究检索">研究检索</option>
              <option value="AI 工具">AI 工具</option>
              <option value="设计">设计</option>
            </select>
            <select id="skillLevel">
              <option value="入门">入门</option>
              <option value="进阶">进阶</option>
              <option value="熟练">熟练</option>
            </select>
          </div>
          
          <textarea id="skillPractice" placeholder="练习记录 - 这次练了什么" style="min-height: 80px;"></textarea>
          <textarea id="skillIssue" placeholder="遇到的问题" style="min-height: 60px;"></textarea>
          <textarea id="skillImprove" placeholder="改进方向" style="min-height: 60px;"></textarea>
          <input type="text" id="skillResource" placeholder="推荐资源（可选）">
          
          <button type="submit" class="btn-primary">保存训练记录</button>
        </form>
      </div>

      <!-- 能力分类 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 14px; color: var(--sub);">能力：</span>
        <button class="btn-secondary" onclick="filterSkills('all')" id="filterAllSkills">全部 (${records.length})</button>
        ${['辩论', '模拟法庭', '写作', '演讲', '英语', '研究检索'].map(s => `
          <button class="btn-secondary" onclick="filterSkills('${s}')" id="filter${s}">${s} (${records.filter(r => r.name === s).length})</button>
        `).join('')}
      </div>

      <!-- 训练记录列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="skillList"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  document.getElementById('skillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const record = {
      name: document.getElementById('skillName').value,
      level: document.getElementById('skillLevel').value,
      practice: document.getElementById('skillPractice').value.trim(),
      issue: document.getElementById('skillIssue').value.trim(),
      improve: document.getElementById('skillImprove').value.trim(),
      resource: document.getElementById('skillResource').value.trim()
    };

    await db.add('skillRecords', record);
    e.target.reset();
    
    const records = await db.getAll('skillRecords');
    renderSkills(records, currentFilter);
    updateFilterButtons(records);
    
    alert('✅ 训练记录已保存');
  });

  renderSkills(records, 'all');

  async function renderSkills(records, filter) {
    currentFilter = filter;
    const list = document.getElementById('skillList');
    
    let filtered = filter === 'all' 
      ? records 
      : records.filter(r => r.name === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有训练记录</p></div>';
      return;
    }

    list.innerHTML = filtered.map(r => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${r.name}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${r.level} · ${new Date(r.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteSkillRecord(${r.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${r.practice ? `<div style="margin-top: 8px;"><strong>练习记录：</strong>${r.practice}</div>` : ''}
        ${r.issue ? `<div style="margin-top: 8px;"><strong>问题：</strong>${r.issue}</div>` : ''}
        ${r.improve ? `<div style="margin-top: 8px;"><strong>改进：</strong>${r.improve}</div>` : ''}
        ${r.resource ? `<div style="margin-top: 8px; font-size: 13px; color: var(--sub);">推荐: ${r.resource}</div>` : ''}
      </div>
    `).join('');
  }

  function updateFilterButtons(records) {
    document.getElementById('filterAllSkills').textContent = `全部 (${records.length})`;
    ['辩论', '模拟法庭', '写作', '演讲', '英语', '研究检索'].forEach(s => {
      const btn = document.getElementById(`filter${s}`);
      if (btn) btn.textContent = `${s} (${records.filter(r => r.name === s).length})`;
    });
  }

  window.filterSkills = async (filter) => {
    const records = await db.getAll('skillRecords');
    renderSkills(records, filter);
  };

  window.deleteSkillRecord = async (id) => {
    if (confirm('确认删除这条记录？')) {
      await db.delete('skillRecords', id);
      const records = await db.getAll('skillRecords');
      renderSkills(records, currentFilter);
      updateFilterButtons(records);
    }
  };
}
