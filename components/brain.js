// Second Brain 模块 - 问题库与思考
import { db } from '../storage.js';

export async function initBrain(container) {
  const questions = await db.getAll('questions');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">🧠 Second Brain</h1>
        <p class="page-subtitle">你的思想实验室 · 问题会在这里发芽</p>
      </div>

      <!-- 添加问题 -->
      <div class="card">
        <h3>记录新问题</h3>
        <form id="questionForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
            <input type="text" id="questionTitle" placeholder="问题，如：为什么现代人越来越孤独？" required>
            <select id="questionType">
              <option value="为什么">为什么？</option>
              <option value="如果">如果...？</option>
              <option value="是否">是否...？</option>
              <option value="怎么做">怎么做？</option>
            </select>
          </div>
          
          <textarea id="questionBackground" placeholder="问题背景（可选）" style="min-height: 80px;"></textarea>
          <textarea id="questionThought" placeholder="当前的理解和思考（可选）" style="min-height: 80px;"></textarea>
          <input type="text" id="questionRelated" placeholder="相关知识 / 项目 / 标签，用逗号分隔">
          <textarea id="questionNext" placeholder="后续追问（可选）" style="min-height: 60px;"></textarea>
          
          <button type="submit" class="btn-primary">保存问题</button>
        </form>
      </div>

      <!-- 筛选 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center;">
        <span style="font-size: 14px; color: var(--sub);">筛选：</span>
        <button class="btn-secondary" onclick="filterQuestions('all')" id="filterAll">全部 (${questions.length})</button>
        <button class="btn-secondary" onclick="filterQuestions('为什么')" id="filter为什么">为什么 (${questions.filter(q => q.type === '为什么').length})</button>
        <button class="btn-secondary" onclick="filterQuestions('如果')" id="filter如果">如果 (${questions.filter(q => q.type === '如果').length})</button>
        <button class="btn-secondary" onclick="filterQuestions('是否')" id="filter是否">是否 (${questions.filter(q => q.type === '是否').length})</button>
        <button class="btn-secondary" onclick="filterQuestions('怎么做')" id="filter怎么做">怎么做 (${questions.filter(q => q.type === '怎么做').length})</button>
      </div>

      <!-- 问题列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="questionList"></div>
      </div>
    </div>

    <!-- 查看问题详情弹窗 -->
    <div class="modal" id="questionDetailModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2 id="detailQuestionTitle"></h2>
          <button class="close-btn" onclick="closeQuestionDetail()">×</button>
        </div>
        <div class="modal-body" id="questionDetailContent"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  // 绑定表单
  document.getElementById('questionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const question = {
      title: document.getElementById('questionTitle').value.trim(),
      type: document.getElementById('questionType').value,
      background: document.getElementById('questionBackground').value.trim(),
      thought: document.getElementById('questionThought').value.trim(),
      related: document.getElementById('questionRelated').value.trim(),
      next: document.getElementById('questionNext').value.trim()
    };

    await db.add('questions', question);
    e.target.reset();
    
    // 重新渲染
    const questions = await db.getAll('questions');
    renderQuestions(questions, currentFilter);
    updateFilterButtons(questions);
    
    alert('✅ 问题已保存');
  });

  // 初始渲染
  renderQuestions(questions, 'all');

  async function renderQuestions(questions, filter) {
    currentFilter = filter;
    const list = document.getElementById('questionList');
    
    let filtered = filter === 'all' 
      ? questions 
      : questions.filter(q => q.type === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有问题，试着记录第一个</p></div>';
      return;
    }

    list.innerHTML = filtered.map(q => `
      <div class="list-item" onclick="viewQuestion(${q.id})">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 6px;">${q.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${q.type} · ${new Date(q.createdAt).toLocaleDateString()}
              ${q.related ? ` · 关联: ${q.related}` : ''}
            </div>
          </div>
          <button class="btn-secondary" onclick="event.stopPropagation(); deleteQuestion(${q.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${q.thought ? `<div style="margin-top: 10px; color: var(--sub); font-size: 14px;">${q.thought.slice(0, 100)}${q.thought.length > 100 ? '...' : ''}</div>` : ''}
      </div>
    `).join('');
  }

  function updateFilterButtons(questions) {
    document.getElementById('filterAll').textContent = `全部 (${questions.length})`;
    document.getElementById('filter为什么').textContent = `为什么 (${questions.filter(q => q.type === '为什么').length})`;
    document.getElementById('filter如果').textContent = `如果 (${questions.filter(q => q.type === '如果').length})`;
    document.getElementById('filter是否').textContent = `是否 (${questions.filter(q => q.type === '是否').length})`;
    document.getElementById('filter怎么做').textContent = `怎么做 (${questions.filter(q => q.type === '怎么做').length})`;
  }

  window.filterQuestions = async (filter) => {
    const questions = await db.getAll('questions');
    renderQuestions(questions, filter);
  };

  window.viewQuestion = async (id) => {
    const questions = await db.getAll('questions');
    const q = questions.find(question => question.id === id);
    if (!q) return;

    document.getElementById('detailQuestionTitle').textContent = q.title;
    document.getElementById('questionDetailContent').innerHTML = `
      <div style="display: grid; gap: 16px;">
        <div>
          <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">类型</div>
          <div>${q.type}</div>
        </div>
        ${q.background ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">背景</div>
            <div style="line-height: 1.7;">${q.background}</div>
          </div>
        ` : ''}
        ${q.thought ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">当前理解</div>
            <div style="line-height: 1.7;">${q.thought}</div>
          </div>
        ` : ''}
        ${q.related ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">相关知识</div>
            <div>${q.related}</div>
          </div>
        ` : ''}
        ${q.next ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">后续追问</div>
            <div style="line-height: 1.7;">${q.next}</div>
          </div>
        ` : ''}
        <div>
          <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">创建时间</div>
          <div>${new Date(q.createdAt).toLocaleString()}</div>
        </div>
      </div>
    `;
    
    document.getElementById('questionDetailModal').classList.add('show');
  };

  window.closeQuestionDetail = () => {
    document.getElementById('questionDetailModal').classList.remove('show');
  };

  window.deleteQuestion = async (id) => {
    if (confirm('确认删除这个问题？')) {
      await db.delete('questions', id);
      const questions = await db.getAll('questions');
      renderQuestions(questions, currentFilter);
      updateFilterButtons(questions);
    }
  };
}
