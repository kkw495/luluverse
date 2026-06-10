// Classroom 模块 - 课堂笔记系统
import { db } from '../storage.js';

export async function initClassroom(container) {
  const courses = await db.getAll('courses');
  const notes = await db.getAll('classNotes');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">📖 Classroom</h1>
        <p class="page-subtitle">课堂笔记 · 按课程组织</p>
      </div>

      <!-- 快速添加 -->
      <div class="card">
        <h3>快速记录</h3>
        <form id="quickNoteForm" style="display: grid; gap: 12px;">
          <select id="quickCourse" required>
            <option value="">选择课程</option>
            <option value="民事诉讼法">民事诉讼法</option>
            <option value="刑法分论">刑法分论</option>
            <option value="国际公法">国际公法</option>
            <option value="毛概">毛概</option>
            <option value="其他">其他课程...</option>
          </select>
          <input type="text" id="quickTitle" placeholder="知识点标题，如：管辖权异议" required>
          <textarea id="quickContent" placeholder="笔记内容..." style="min-height: 100px;"></textarea>
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn-primary">保存笔记</button>
            <button type="button" class="btn-secondary" onclick="showDetailedForm()">详细记录</button>
          </div>
        </form>
      </div>

      <!-- 课程列表 -->
      <div style="margin-top: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3>我的课程</h3>
          <button class="btn-secondary" onclick="showAddCourse()">+ 添加课程</button>
        </div>
        <div class="grid grid-3" id="courseGrid"></div>
      </div>

      <!-- 最近笔记 -->
      <div style="margin-top: 28px;">
        <h3>最近笔记</h3>
        <div class="list" id="recentNotes"></div>
      </div>
    </div>

    <!-- 详细记录弹窗 -->
    <div class="modal" id="detailedNoteModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2>详细笔记记录</h2>
          <button class="close-btn" onclick="closeDetailedForm()">×</button>
        </div>
        <div class="modal-body">
          <form id="detailedNoteForm" style="display: grid; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <select id="detailCourse" required>
                <option value="">选择课程</option>
                <option value="民事诉讼法">民事诉讼法</option>
                <option value="刑法分论">刑法分论</option>
                <option value="国际公法">国际公法</option>
                <option value="毛概">毛概</option>
              </select>
              <input type="text" id="detailChapter" placeholder="章节，如：第二章">
            </div>
            <input type="text" id="detailTitle" placeholder="知识点标题" required>
            
            <div>
              <label style="font-size: 13px; color: var(--sub); margin-bottom: 4px; display: block;">💡 核心概念</label>
              <textarea id="detailConcept" placeholder="这个知识点的定义和核心内容"></textarea>
            </div>
            
            <div>
              <label style="font-size: 13px; color: var(--sub); margin-bottom: 4px; display: block;">⭐ 重点</label>
              <textarea id="detailPoints" placeholder="考试重点、老师强调的内容"></textarea>
            </div>
            
            <div>
              <label style="font-size: 13px; color: var(--sub); margin-bottom: 4px; display: block;">📋 案例</label>
              <textarea id="detailCases" placeholder="相关案例、例子"></textarea>
            </div>
            
            <div>
              <label style="font-size: 13px; color: var(--sub); margin-bottom: 4px; display: block;">🤔 我的理解</label>
              <textarea id="detailThinking" placeholder="自己的思考、疑问"></textarea>
            </div>
            
            <input type="text" id="detailTags" placeholder="标签，用逗号分隔，如：管辖,程序,重点">
            
            <button type="submit" class="btn-primary">保存详细笔记</button>
          </form>
        </div>
      </div>
    </div>

    <!-- 添加课程弹窗 -->
    <div class="modal" id="addCourseModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>添加课程</h2>
          <button class="close-btn" onclick="closeAddCourse()">×</button>
        </div>
        <div class="modal-body">
          <form id="addCourseForm" style="display: grid; gap: 12px;">
            <input type="text" id="courseName" placeholder="课程名称，如：民事诉讼法" required>
            <input type="text" id="courseTeacher" placeholder="任课老师（可选）">
            <select id="courseSemester">
              <option value="2025春季">2025春季</option>
              <option value="2025秋季">2025秋季</option>
              <option value="2026春季">2026春季</option>
            </select>
            <textarea id="courseNote" placeholder="课程备注（可选）"></textarea>
            <button type="submit" class="btn-primary">添加</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // 渲染课程
  renderCourses();
  renderRecentNotes();

  // 绑定快速记录表单
  document.getElementById('quickNoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const note = {
      course: document.getElementById('quickCourse').value,
      title: document.getElementById('quickTitle').value.trim(),
      content: document.getElementById('quickContent').value.trim(),
      type: 'quick'
    };

    await db.add('classNotes', note);
    e.target.reset();
    renderRecentNotes();
    alert('✅ 笔记已保存');
  });

  // 绑定详细记录表单
  document.getElementById('detailedNoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const note = {
      course: document.getElementById('detailCourse').value,
      chapter: document.getElementById('detailChapter').value.trim(),
      title: document.getElementById('detailTitle').value.trim(),
      concept: document.getElementById('detailConcept').value.trim(),
      points: document.getElementById('detailPoints').value.trim(),
      cases: document.getElementById('detailCases').value.trim(),
      thinking: document.getElementById('detailThinking').value.trim(),
      tags: document.getElementById('detailTags').value.trim(),
      type: 'detailed'
    };

    await db.add('classNotes', note);
    e.target.reset();
    closeDetailedForm();
    renderRecentNotes();
    alert('✅ 详细笔记已保存');
  });

  // 绑定添加课程表单
  document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const course = {
      name: document.getElementById('courseName').value.trim(),
      teacher: document.getElementById('courseTeacher').value.trim(),
      semester: document.getElementById('courseSemester').value,
      note: document.getElementById('courseNote').value.trim()
    };

    await db.add('courses', course);
    e.target.reset();
    closeAddCourse();
    renderCourses();
    alert('✅ 课程已添加');
  });

  async function renderCourses() {
    const courses = await db.getAll('courses');
    const grid = document.getElementById('courseGrid');
    
    if (courses.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><p>还没有课程，点右上角添加</p></div>';
      return;
    }

    grid.innerHTML = courses.map(c => `
      <div class="card" style="cursor: pointer;" onclick="viewCourseNotes('${c.name}')">
        <h4>${c.name}</h4>
        <div style="font-size: 13px; color: var(--sub); margin-top: 8px;">
          ${c.teacher ? `👨‍🏫 ${c.teacher}<br>` : ''}
          📅 ${c.semester}
        </div>
      </div>
    `).join('');
  }

  async function renderRecentNotes() {
    const notes = await db.getAll('classNotes');
    const list = document.getElementById('recentNotes');
    
    if (notes.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有笔记</p></div>';
      return;
    }

    const recent = notes.slice(0, 5);
    list.innerHTML = recent.map(n => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 600;">${n.title}</div>
            <div style="font-size: 13px; color: var(--sub); margin-top: 4px;">
              ${n.course} ${n.chapter ? `· ${n.chapter}` : ''} · ${new Date(n.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteNote(${n.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${n.concept ? `<div style="margin-top: 8px;"><strong>概念：</strong>${n.concept}</div>` : ''}
        ${n.content ? `<div style="margin-top: 8px;">${n.content}</div>` : ''}
        ${n.points ? `<div style="margin-top: 8px;"><strong>重点：</strong>${n.points}</div>` : ''}
      </div>
    `).join('');
  }

  window.showDetailedForm = () => {
    document.getElementById('detailedNoteModal').classList.add('show');
  };

  window.closeDetailedForm = () => {
    document.getElementById('detailedNoteModal').classList.remove('show');
  };

  window.showAddCourse = () => {
    document.getElementById('addCourseModal').classList.add('show');
  };

  window.closeAddCourse = () => {
    document.getElementById('addCourseModal').classList.remove('show');
  };

  window.viewCourseNotes = async (courseName) => {
    alert(`查看 ${courseName} 的所有笔记功能开发中...`);
  };

  window.deleteNote = async (id) => {
    if (confirm('确认删除这条笔记？')) {
      await db.delete('classNotes', id);
      renderRecentNotes();
    }
  };
}
