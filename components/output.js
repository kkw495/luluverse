// Output 模块 - 输出中心
import { db } from '../storage.js';

export async function initOutput(container) {
  const outputs = await db.getAll('outputs');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">📝 Output</h1>
        <p class="page-subtitle">输入 100，不如输出 10</p>
      </div>

      <!-- 添加输出 -->
      <div class="card">
        <h3>记录新输出</h3>
        <form id="outputForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
            <select id="outputType" required>
              <option value="">类型</option>
              <option value="论文">论文</option>
              <option value="随笔">随笔</option>
              <option value="公众号">公众号</option>
              <option value="读书笔记">读书笔记</option>
              <option value="观点">观点</option>
              <option value="演讲稿">演讲稿</option>
              <option value="展示 Pre">展示 Pre</option>
              <option value="辩论稿">辩论稿</option>
            </select>
            <input type="text" id="outputTitle" placeholder="标题" required>
          </div>
          
          <textarea id="outputSummary" placeholder="内容摘要 / 核心观点" style="min-height: 100px;"></textarea>
          <input type="text" id="outputSource" placeholder="来源问题 / 来源项目 / 来源输入（可选）">
          <input type="text" id="outputLink" placeholder="链接（可选）">
          
          <button type="submit" class="btn-primary">保存输出</button>
        </form>
      </div>

      <!-- 筛选 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 14px; color: var(--sub);">类型：</span>
        <button class="btn-secondary" onclick="filterOutputs('all')" id="filterAllOutputs">全部 (${outputs.length})</button>
        <button class="btn-secondary" onclick="filterOutputs('论文')" id="filter论文out">论文 (${outputs.filter(o => o.type === '论文').length})</button>
        <button class="btn-secondary" onclick="filterOutputs('随笔')" id="filter随笔">随笔 (${outputs.filter(o => o.type === '随笔').length})</button>
        <button class="btn-secondary" onclick="filterOutputs('公众号')" id="filter公众号">公众号 (${outputs.filter(o => o.type === '公众号').length})</button>
      </div>

      <!-- 输出列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="outputList"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  document.getElementById('outputForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const output = {
      type: document.getElementById('outputType').value,
      title: document.getElementById('outputTitle').value.trim(),
      summary: document.getElementById('outputSummary').value.trim(),
      source: document.getElementById('outputSource').value.trim(),
      link: document.getElementById('outputLink').value.trim()
    };

    await db.add('outputs', output);
    e.target.reset();
    
    const outputs = await db.getAll('outputs');
    renderOutputs(outputs, currentFilter);
    updateFilterButtons(outputs);
    
    alert('✅ 输出已保存');
  });

  renderOutputs(outputs, 'all');

  async function renderOutputs(outputs, filter) {
    currentFilter = filter;
    const list = document.getElementById('outputList');
    
    let filtered = filter === 'all' 
      ? outputs 
      : outputs.filter(o => o.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有输出</p></div>';
      return;
    }

    list.innerHTML = filtered.map(o => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${o.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${o.type} · ${new Date(o.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteOutput(${o.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${o.summary ? `<div style="margin-top: 8px;">${o.summary}</div>` : ''}
        ${o.source ? `<div style="margin-top: 8px; font-size: 13px; color: var(--sub);">来源: ${o.source}</div>` : ''}
        ${o.link ? `<div style="margin-top: 8px;"><a href="${o.link}" target="_blank" style="color: var(--accent);">查看链接 →</a></div>` : ''}
      </div>
    `).join('');
  }

  function updateFilterButtons(outputs) {
    document.getElementById('filterAllOutputs').textContent = `全部 (${outputs.length})`;
    document.getElementById('filter论文out').textContent = `论文 (${outputs.filter(o => o.type === '论文').length})`;
    document.getElementById('filter随笔').textContent = `随笔 (${outputs.filter(o => o.type === '随笔').length})`;
    document.getElementById('filter公众号').textContent = `公众号 (${outputs.filter(o => o.type === '公众号').length})`;
  }

  window.filterOutputs = async (filter) => {
    const outputs = await db.getAll('outputs');
    renderOutputs(outputs, filter);
  };

  window.deleteOutput = async (id) => {
    if (confirm('确认删除这条输出？')) {
      await db.delete('outputs', id);
      const outputs = await db.getAll('outputs');
      renderOutputs(outputs, currentFilter);
      updateFilterButtons(outputs);
    }
  };
}
