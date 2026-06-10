// Review 模块 - 复盘
import { db } from '../storage.js';

export async function initReview(container) {
  const reviews = await db.getAll('reviews');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">🔄 Review</h1>
        <p class="page-subtitle">复盘不是审判，而是看见自己</p>
      </div>

      <!-- 添加复盘 -->
      <div class="card">
        <h3>记录复盘</h3>
        <form id="reviewForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
            <select id="reviewType" required>
              <option value="每日">每日</option>
              <option value="每周">每周</option>
              <option value="每月">每月</option>
            </select>
            <input type="text" id="reviewTitle" placeholder="标题，如：2026年第3周" required>
          </div>
          
          <textarea id="reviewContent" placeholder="内容：收获 / 困惑 / 输入 / 输出 / 改变" style="min-height: 120px;"></textarea>
          <textarea id="reviewNext" placeholder="下一步 / 下周重点 / 下月方向" style="min-height: 80px;"></textarea>
          
          <button type="submit" class="btn-primary">保存复盘</button>
        </form>
      </div>

      <!-- 复盘模板提示 -->
      <div class="card" style="background: #f6f3ed;">
        <h3>📋 复盘模板参考</h3>
        <div style="display: grid; gap: 14px; margin-top: 10px;">
          <div>
            <strong>每日（3分钟）</strong>
            <ul style="margin: 6px 0 0 20px; line-height: 1.8; color: var(--sub);">
              <li>今天最重要的一件事</li>
              <li>今天最大的收获</li>
              <li>今天最大的困惑</li>
              <li>明天三件事</li>
            </ul>
          </div>
          <div>
            <strong>每周（20分钟）</strong>
            <ul style="margin: 6px 0 0 20px; line-height: 1.8; color: var(--sub);">
              <li>输入了什么？</li>
              <li>输出了什么？</li>
              <li>成长了什么？</li>
              <li>浪费了什么？</li>
              <li>下周 Focus 是什么？</li>
            </ul>
          </div>
          <div>
            <strong>每月</strong>
            <ul style="margin: 6px 0 0 20px; line-height: 1.8; color: var(--sub);">
              <li>本月最喜欢的一本书</li>
              <li>本月最好的作品</li>
              <li>本月最大的改变</li>
              <li>本月想继续追问的问题</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 筛选 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center;">
        <span style="font-size: 14px; color: var(--sub);">类型：</span>
        <button class="btn-secondary" onclick="filterReviews('all')" id="filterAllReviews">全部 (${reviews.length})</button>
        <button class="btn-secondary" onclick="filterReviews('每日')" id="filter每日">每日 (${reviews.filter(r => r.type === '每日').length})</button>
        <button class="btn-secondary" onclick="filterReviews('每周')" id="filter每周">每周 (${reviews.filter(r => r.type === '每周').length})</button>
        <button class="btn-secondary" onclick="filterReviews('每月')" id="filter每月">每月 (${reviews.filter(r => r.type === '每月').length})</button>
      </div>

      <!-- 复盘列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="reviewList"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const review = {
      type: document.getElementById('reviewType').value,
      title: document.getElementById('reviewTitle').value.trim(),
      content: document.getElementById('reviewContent').value.trim(),
      next: document.getElementById('reviewNext').value.trim()
    };

    await db.add('reviews', review);
    e.target.reset();
    
    const reviews = await db.getAll('reviews');
    renderReviews(reviews, currentFilter);
    updateFilterButtons(reviews);
    
    alert('✅ 复盘已保存');
  });

  renderReviews(reviews, 'all');

  async function renderReviews(reviews, filter) {
    currentFilter = filter;
    const list = document.getElementById('reviewList');
    
    let filtered = filter === 'all' 
      ? reviews 
      : reviews.filter(r => r.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有复盘</p></div>';
      return;
    }

    list.innerHTML = filtered.map(r => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${r.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${r.type} · ${new Date(r.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteReview(${r.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${r.content ? `<div style="margin-top: 8px; line-height: 1.7; white-space: pre-wrap;">${r.content}</div>` : ''}
        ${r.next ? `<div style="margin-top: 8px; padding: 10px; background: #f6f3ed; border-radius: 10px;"><strong>下一步：</strong>${r.next}</div>` : ''}
      </div>
    `).join('');
  }

  function updateFilterButtons(reviews) {
    document.getElementById('filterAllReviews').textContent = `全部 (${reviews.length})`;
    document.getElementById('filter每日').textContent = `每日 (${reviews.filter(r => r.type === '每日').length})`;
    document.getElementById('filter每周').textContent = `每周 (${reviews.filter(r => r.type === '每周').length})`;
    document.getElementById('filter每月').textContent = `每月 (${reviews.filter(r => r.type === '每月').length})`;
  }

  window.filterReviews = async (filter) => {
    const reviews = await db.getAll('reviews');
    renderReviews(reviews, filter);
  };

  window.deleteReview = async (id) => {
    if (confirm('确认删除这条复盘？')) {
      await db.delete('reviews', id);
      const reviews = await db.getAll('reviews');
      renderReviews(reviews, currentFilter);
      updateFilterButtons(reviews);
    }
  };
}
