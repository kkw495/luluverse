// Law School 模块 - 法学专门系统
import { db } from '../storage.js';

export async function initLaw(container) {
  const lawNotes = await db.getAll('lawNotes');

  // 按课程统计
  const courses = {};
  lawNotes.forEach(note => {
    courses[note.course] = (courses[note.course] || 0) + 1;
  });

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">⚖️ Law School</h1>
        <p class="page-subtitle">法学课程体系 · 课程 → 章节 → 知识点 → 考点</p>
      </div>

      <!-- 课程卡片 -->
      <div class="grid grid-3">
        ${['法理学', '民法', '刑法', '刑诉', '民诉', '国际法', '知识产权', '竞争法'].map(c => `
          <div class="card" style="cursor: pointer; ${courses[c] ? 'border-left: 4px solid var(--sage);' : ''}" onclick="selectCourse('${c}')">
            <h4>${c}</h4>
            <div style="font-size: 13px; color: var(--sub); margin-top: 8px;">
              ${courses[c] ? `${courses[c]} 条笔记` : '还没有笔记'}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 添加法学笔记 -->
      <div class="card" style="margin-top: 28px;">
        <h3>记录法学笔记</h3>
        <form id="lawNoteForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <select id="lawCourse" required>
              <option value="">选择课程</option>
              <option value="法理学">法理学</option>
              <option value="民法">民法</option>
              <option value="刑法">刑法</option>
              <option value="刑诉">刑诉</option>
              <option value="民诉">民诉</option>
              <option value="国际法">国际法</option>
              <option value="知识产权">知识产权</option>
              <option value="竞争法">竞争法</option>
            </select>
            <input type="text" id="lawChapter" placeholder="章节，如：第二章">
          </div>
          
          <input type="text" id="lawTitle" placeholder="知识点标题" required>
          
          <div>
            <label style="font-size: 13px; color: var(--sub); display: block; margin-bottom: 4px;">📝 概念 / 定义</label>
            <textarea id="lawConcept" placeholder="法条原文、定义、构成要件..." style="min-height: 80px;"></textarea>
          </div>
          
          <div>
            <label style="font-size: 13px; color: var(--sub); display: block; margin-bottom: 4px;">⭐ 重点</label>
            <textarea id="lawPoints" placeholder="考试重点、老师强调、易混淆点..." style="min-height: 80px;"></textarea>
          </div>
          
          <div>
            <label style="font-size: 13px; color: var(--sub); display: block; margin-bottom: 4px;">📋 案例 / 例题</label>
            <textarea id="lawCases" placeholder="经典案例、例题、争议点..." style="min-height: 80px;"></textarea>
          </div>
          
          <div>
            <label style="font-size: 13px; color: var(--sub); display: block; margin-bottom: 4px;">💡 理解 / 口诀</label>
            <textarea id="lawThinking" placeholder="自己的理解、记忆口诀、易错点..." style="min-height: 60px;"></textarea>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <input type="text" id="lawTeacher" placeholder="老师强调（可选）">
            <input type="text" id="lawExam" placeholder="考试题型（可选）">
          </div>
          
          <button type="submit" class="btn-primary">保存法学笔记</button>
        </form>
      </div>

      <!-- 笔记列表 -->
      <div style="margin-top: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 id="lawListTitle">全部笔记</h3>
          <button class="btn-secondary" onclick="clearCourseFilter()" id="clearLawFilterBtn" style="display: none;">显示全部</button>
        </div>
        <div class="list" id="lawNotesList"></div>
      </div>
    </div>
  `;

  let currentCourse = null;

  // 表单提交
  document.getElementById('lawNoteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const note = {
      course: document.getElementById('lawCourse').value,
      chapter: document.getElementById('lawChapter').value.trim(),
      title: document.getElementById('lawTitle').value.trim(),
      concept: document.getElementById('lawConcept').value.trim(),
      points: document.getElementById('lawPoints').value.trim(),
      cases: document.getElementById('lawCases').value.trim(),
      thinking: document.getElementById('lawThinking').value.trim(),
      teacher: document.getElementById('lawTeacher').value.trim(),
      exam: document.getElementById('lawExam').value.trim()
    };

    await db.add('lawNotes', note);
    e.target.reset();
    
    await refreshLaw();
    alert('✅ 法学笔记已保存');
  });

  renderLawNotes();

  async function refreshLaw() {
    const lawNotes = await db.getAll('lawNotes');
    
    // 更新课程卡片计数
    const newCourses = {};
    lawNotes.forEach(note => {
      newCourses[note.course] = (newCourses[note.course] || 0) + 1;
    });

    document.querySelectorAll('.grid .card').forEach(card => {
      const courseName = card.querySelector('h4').textContent;
      const countDiv = card.querySelector('div');
      if (countDiv) {
        countDiv.textContent = newCourses[courseName] 
          ? `${newCourses[courseName]} 条笔记` 
          : '还没有笔记';
      }
      
      if (newCourses[courseName]) {
        card.style.borderLeft = '4px solid var(--sage)';
      } else {
        card.style.borderLeft = '';
      }
    });

    renderLawNotes();
  }

  async function renderLawNotes() {
    const lawNotes = await db.getAll('lawNotes');
    const list = document.getElementById('lawNotesList');
    
    let filtered = currentCourse 
      ? lawNotes.filter(n => n.course === currentCourse)
      : lawNotes;

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有笔记</p></div>';
      return;
    }

    list.innerHTML = filtered.map(n => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${n.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${n.course} ${n.chapter ? `· ${n.chapter}` : ''} · ${new Date(n.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteLawNote(${n.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${n.concept ? `<div style="margin-top: 10px; padding: 10px; background: #f6f3ed; border-radius: 10px;"><strong>概念：</strong>${n.concept}</div>` : ''}
        ${n.points ? `<div style="margin-top: 10px;"><strong>重点：</strong>${n.points}</div>` : ''}
        ${n.cases ? `<div style="margin-top: 10px;"><strong>案例：</strong>${n.cases}</div>` : ''}
        ${n.thinking ? `<div style="margin-top: 10px; color: var(--sub);"><strong>理解：</strong>${n.thinking}</div>` : ''}
        ${n.teacher || n.exam ? `<div style="margin-top: 8px; font-size: 13px; color: var(--brown);">
          ${n.teacher ? `老师强调: ${n.teacher}` : ''}
          ${n.teacher && n.exam ? ' · ' : ''}
          ${n.exam ? `考试: ${n.exam}` : ''}
        </div>` : ''}
      </div>
    `).join('');
  }

  window.selectCourse = async (course) => {
    currentCourse = currentCourse === course ? null : course;
    
    const title = document.getElementById('lawListTitle');
    const clearBtn = document.getElementById('clearLawFilterBtn');
    
    if (currentCourse) {
      title.textContent = `${currentCourse} · 笔记`;
      clearBtn.style.display = 'block';
    } else {
      title.textContent = '全部笔记';
      clearBtn.style.display = 'none';
    }

    renderLawNotes();
  };

  window.clearCourseFilter = () => {
    currentCourse = null;
    document.getElementById('lawListTitle').textContent = '全部笔记';
    document.getElementById('clearLawFilterBtn').style.display = 'none';
    renderLawNotes();
  };

  window.deleteLawNote = async (id) => {
    if (confirm('确认删除这条笔记？')) {
      await db.delete('lawNotes', id);
      await refreshLaw();
    }
  };
}
