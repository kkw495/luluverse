// Library 模块 - 输入记录
import { db } from '../storage.js';

export async function initLibrary(container) {
  const items = await db.getAll('library');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">📚 Library</h1>
        <p class="page-subtitle">不是收藏，而是输入如何改变了你</p>
      </div>

      <!-- 添加输入 -->
      <div class="card">
        <h3>记录新输入</h3>
        <form id="libraryForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
            <select id="libraryType" required>
              <option value="">类型</option>
              <option value="书籍">书籍</option>
              <option value="视频">视频</option>
              <option value="论文">论文</option>
              <option value="播客">播客</option>
              <option value="课程">课程</option>
            </select>
            <input type="text" id="libraryTitle" placeholder="名称" required>
          </div>
          
          <input type="text" id="libraryAuthor" placeholder="作者 / 主讲 / 来源">
          <textarea id="librarySummary" placeholder="一句话总结" style="min-height: 60px;"></textarea>
          <textarea id="libraryChanged" placeholder="它改变了我什么？" style="min-height: 80px;"></textarea>
          
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
            <input type="number" id="libraryRating" min="1" max="5" placeholder="推荐指数 1-5">
            <input type="text" id="libraryRelation" placeholder="关联知识，用逗号分隔">
          </div>
          
          <button type="submit" class="btn-primary">保存输入记录</button>
        </form>
      </div>

      <!-- 筛选 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 14px; color: var(--sub);">类型：</span>
        <button class="btn-secondary" onclick="filterLibrary('all')" id="filterAllLib">全部 (${items.length})</button>
        <button class="btn-secondary" onclick="filterLibrary('书籍')" id="filter书籍">书籍 (${items.filter(i => i.type === '书籍').length})</button>
        <button class="btn-secondary" onclick="filterLibrary('视频')" id="filter视频">视频 (${items.filter(i => i.type === '视频').length})</button>
        <button class="btn-secondary" onclick="filterLibrary('论文')" id="filter论文">论文 (${items.filter(i => i.type === '论文').length})</button>
        <button class="btn-secondary" onclick="filterLibrary('播客')" id="filter播客">播客 (${items.filter(i => i.type === '播客').length})</button>
        <button class="btn-secondary" onclick="filterLibrary('课程')" id="filter课程">课程 (${items.filter(i => i.type === '课程').length})</button>
      </div>

      <!-- 输入列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="libraryList"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  // 绑定表单
  document.getElementById('libraryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const item = {
      type: document.getElementById('libraryType').value,
      title: document.getElementById('libraryTitle').value.trim(),
      author: document.getElementById('libraryAuthor').value.trim(),
      summary: document.getElementById('librarySummary').value.trim(),
      changed: document.getElementById('libraryChanged').value.trim(),
      rating: Number(document.getElementById('libraryRating').value) || 0,
      relation: document.getElementById('libraryRelation').value.trim()
    };

    await db.add('library', item);
    e.target.reset();
    
    const items = await db.getAll('library');
    renderLibrary(items, currentFilter);
    updateFilterButtons(items);
    
    alert('✅ 输入记录已保存');
  });

  renderLibrary(items, 'all');

  async function renderLibrary(items, filter) {
    currentFilter = filter;
    const list = document.getElementById('libraryList');
    
    let filtered = filter === 'all' 
      ? items 
      : items.filter(i => i.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有输入记录</p></div>';
      return;
    }

    list.innerHTML = filtered.map(i => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${i.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${i.type}
              ${i.author ? ` · ${i.author}` : ''}
              ${i.rating ? ` · ${'⭐'.repeat(i.rating)}` : ''}
              · ${new Date(i.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteLibraryItem(${i.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${i.summary ? `<div style="margin-top: 8px; color: var(--sub);">${i.summary}</div>` : ''}
        ${i.changed ? `<div style="margin-top: 8px;"><strong>改变了我：</strong>${i.changed}</div>` : ''}
        ${i.relation ? `<div style="margin-top: 8px; font-size: 13px; color: var(--sub);">关联: ${i.relation}</div>` : ''}
      </div>
    `).join('');
  }

  function updateFilterButtons(items) {
    document.getElementById('filterAllLib').textContent = `全部 (${items.length})`;
    document.getElementById('filter书籍').textContent = `书籍 (${items.filter(i => i.type === '书籍').length})`;
    document.getElementById('filter视频').textContent = `视频 (${items.filter(i => i.type === '视频').length})`;
    document.getElementById('filter论文').textContent = `论文 (${items.filter(i => i.type === '论文').length})`;
    document.getElementById('filter播客').textContent = `播客 (${items.filter(i => i.type === '播客').length})`;
    document.getElementById('filter课程').textContent = `课程 (${items.filter(i => i.type === '课程').length})`;
  }

  window.filterLibrary = async (filter) => {
    const items = await db.getAll('library');
    renderLibrary(items, filter);
  };

  window.deleteLibraryItem = async (id) => {
    if (confirm('确认删除这条记录？')) {
      await db.delete('library', id);
      const items = await db.getAll('library');
      renderLibrary(items, currentFilter);
      updateFilterButtons(items);
    }
  };
}
