// Projects 模块 - 项目管理
import { db } from '../storage.js';

export async function initProjects(container) {
  const projects = await db.getAll('projects');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">🚀 Projects</h1>
        <p class="page-subtitle">项目管理 · 把事情组织成清晰的项目</p>
      </div>

      <!-- 添加项目 -->
      <div class="card">
        <h3>新建项目</h3>
        <form id="projectForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px;">
            <input type="text" id="projectTitle" placeholder="项目名称" required>
            <select id="projectType">
              <option value="论文">论文</option>
              <option value="比赛">比赛</option>
              <option value="模拟法庭">模拟法庭</option>
              <option value="辩论">辩论</option>
              <option value="公众号">公众号</option>
              <option value="网站">网站</option>
              <option value="其他">其他</option>
            </select>
            <select id="projectStatus">
              <option value="计划中">计划中</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
          
          <textarea id="projectGoal" placeholder="项目目标" style="min-height: 80px;"></textarea>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <input type="number" id="projectProgress" min="0" max="100" placeholder="进度 0-100" value="0">
            <input type="date" id="projectDeadline">
          </div>
          
          <textarea id="projectMaterials" placeholder="资料" style="min-height: 60px;"></textarea>
          <textarea id="projectOutput" placeholder="预期产出" style="min-height: 60px;"></textarea>
          
          <button type="submit" class="btn-primary">创建项目</button>
        </form>
      </div>

      <!-- 筛选 -->
      <div style="margin-top: 28px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 14px; color: var(--sub);">状态：</span>
        <button class="btn-secondary" onclick="filterProjects('all')" id="filterAllProjects">全部 (${projects.length})</button>
        <button class="btn-secondary" onclick="filterProjects('进行中')" id="filter进行中">进行中 (${projects.filter(p => p.status === '进行中').length})</button>
        <button class="btn-secondary" onclick="filterProjects('计划中')" id="filter计划中">计划中 (${projects.filter(p => p.status === '计划中').length})</button>
        <button class="btn-secondary" onclick="filterProjects('已完成')" id="filter已完成">已完成 (${projects.filter(p => p.status === '已完成').length})</button>
      </div>

      <!-- 项目列表 -->
      <div style="margin-top: 18px;">
        <div class="list" id="projectList"></div>
      </div>
    </div>

    <!-- 项目详情弹窗 -->
    <div class="modal" id="projectDetailModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2 id="detailProjectTitle"></h2>
          <button class="close-btn" onclick="closeProjectDetail()">×</button>
        </div>
        <div class="modal-body" id="projectDetailContent"></div>
      </div>
    </div>
  `;

  let currentFilter = 'all';

  // 绑定表单
  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const project = {
      title: document.getElementById('projectTitle').value.trim(),
      type: document.getElementById('projectType').value,
      status: document.getElementById('projectStatus').value,
      goal: document.getElementById('projectGoal').value.trim(),
      progress: Number(document.getElementById('projectProgress').value) || 0,
      deadline: document.getElementById('projectDeadline').value,
      materials: document.getElementById('projectMaterials').value.trim(),
      output: document.getElementById('projectOutput').value.trim()
    };

    await db.add('projects', project);
    e.target.reset();
    document.getElementById('projectProgress').value = '0';
    
    const projects = await db.getAll('projects');
    renderProjects(projects, currentFilter);
    updateFilterButtons(projects);
    
    alert('✅ 项目已创建');
  });

  // 初始渲染
  renderProjects(projects, 'all');

  async function renderProjects(projects, filter) {
    currentFilter = filter;
    const list = document.getElementById('projectList');
    
    let filtered = filter === 'all' 
      ? projects 
      : projects.filter(p => p.status === filter);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有项目</p></div>';
      return;
    }

    list.innerHTML = filtered.map(p => `
      <div class="list-item" onclick="viewProject(${p.id})">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 6px;">${p.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${p.type} · ${p.status}
              ${p.deadline ? ` · 截止: ${p.deadline}` : ''}
            </div>
          </div>
          <button class="btn-secondary" onclick="event.stopPropagation(); deleteProject(${p.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        
        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 13px; color: var(--sub);">进度</span>
            <span style="font-size: 14px; font-weight: 600;">${p.progress}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar" style="width: ${p.progress}%"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function updateFilterButtons(projects) {
    document.getElementById('filterAllProjects').textContent = `全部 (${projects.length})`;
    document.getElementById('filter进行中').textContent = `进行中 (${projects.filter(p => p.status === '进行中').length})`;
    document.getElementById('filter计划中').textContent = `计划中 (${projects.filter(p => p.status === '计划中').length})`;
    document.getElementById('filter已完成').textContent = `已完成 (${projects.filter(p => p.status === '已完成').length})`;
  }

  window.filterProjects = async (filter) => {
    const projects = await db.getAll('projects');
    renderProjects(projects, filter);
  };

  window.viewProject = async (id) => {
    const projects = await db.getAll('projects');
    const p = projects.find(project => project.id === id);
    if (!p) return;

    document.getElementById('detailProjectTitle').textContent = p.title;
    document.getElementById('projectDetailContent').innerHTML = `
      <div style="display: grid; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">类型</div>
            <div>${p.type}</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">状态</div>
            <div>${p.status}</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">进度</div>
            <div>${p.progress}%</div>
          </div>
        </div>
        
        ${p.deadline ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">截止日期</div>
            <div>${p.deadline}</div>
          </div>
        ` : ''}
        
        ${p.goal ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">目标</div>
            <div style="line-height: 1.7;">${p.goal}</div>
          </div>
        ` : ''}
        
        ${p.materials ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">资料</div>
            <div style="line-height: 1.7; white-space: pre-wrap;">${p.materials}</div>
          </div>
        ` : ''}
        
        ${p.output ? `
          <div>
            <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">预期产出</div>
            <div style="line-height: 1.7; white-space: pre-wrap;">${p.output}</div>
          </div>
        ` : ''}
        
        <div>
          <div style="font-size: 13px; color: var(--sub); margin-bottom: 4px;">创建时间</div>
          <div>${new Date(p.createdAt).toLocaleString()}</div>
        </div>
      </div>
    `;
    
    document.getElementById('projectDetailModal').classList.add('show');
  };

  window.closeProjectDetail = () => {
    document.getElementById('projectDetailModal').classList.remove('show');
  };

  window.deleteProject = async (id) => {
    if (confirm('确认删除这个项目？')) {
      await db.delete('projects', id);
      const projects = await db.getAll('projects');
      renderProjects(projects, currentFilter);
      updateFilterButtons(projects);
    }
  };
}
