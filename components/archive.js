// Archive 模块 - 归档
import { db, exportAllData, importAllData } from '../storage.js';
import { getCloudConfig, isCloudConfigured } from '../sync.js';

export async function initArchive(container) {
  const archives = await db.getAll('archives');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">📂 Archive</h1>
        <p class="page-subtitle">存放旧课程、旧项目、完成的目标、过去的想法</p>
      </div>

      <!-- 添加归档 -->
      <div class="card">
        <h3>添加归档</h3>
        <form id="archiveForm" style="display: grid; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
            <input type="text" id="archiveTitle" placeholder="归档标题" required>
            <input type="text" id="archiveTag" placeholder="类型，如：旧课程">
          </div>
          
          <textarea id="archiveContent" placeholder="归档内容" style="min-height: 100px;"></textarea>
          
          <button type="submit" class="btn-primary">保存归档</button>
        </form>
      </div>

      <!-- 归档列表 -->
      <div style="margin-top: 28px;">
        <h3>归档内容</h3>
        <div class="list" id="archiveList" style="margin-top: 14px;"></div>
      </div>

      <!-- 云端同步 -->
      <div class="card" style="margin-top: 28px; background: linear-gradient(135deg, rgba(220,206,245,.25), rgba(169,189,214,.2));">
        <h3>☁️ 云端共享</h3>
        <p style="font-size: 13px; color: var(--sub); margin-top: 8px; line-height: 1.7;">
          ${isCloudConfigured()
            ? `当前工作区：<strong>${getCloudConfig().workspaceCode}</strong> · 数据会自动同步到云端`
            : '在 ⚙️ 设置中配置 Supabase 并创建/加入工作区，即可多设备共享数据'}
        </p>
        <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn-primary" onclick="manualCloudSync()">立即同步到云端</button>
          <button class="btn-secondary" onclick="openSettings()">配置云端</button>
        </div>
      </div>

      <!-- 导出导入 -->
      <div class="card" style="margin-top: 28px; background: linear-gradient(135deg, rgba(184,196,178,.2), rgba(169,189,214,.2));">
        <h3>💾 数据导出 / 导入</h3>
        <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn-primary" onclick="exportAllDataFile()">导出全部数据</button>
          <label class="btn-secondary" style="cursor: pointer;">
            导入数据
            <input type="file" id="importData" accept=".json" style="display: none;">
          </label>
        </div>
        <p style="font-size: 13px; color: var(--sub); margin-top: 10px; line-height: 1.7;">
          导出的 JSON 文件包含你的全部数据，可以备份到网盘或换设备时导入。
        </p>
      </div>
    </div>
  `;

  document.getElementById('archiveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const archive = {
      title: document.getElementById('archiveTitle').value.trim(),
      tag: document.getElementById('archiveTag').value.trim(),
      content: document.getElementById('archiveContent').value.trim()
    };

    await db.add('archives', archive);
    e.target.reset();
    
    renderArchives();
    alert('✅ 归档已保存');
  });

  // 导入数据
  document.getElementById('importData').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!confirm('导入将覆盖现有数据，确认继续？')) return;

      await importAllData(data);

      alert('✅ 数据导入成功');
      location.reload();
    } catch (err) {
      alert('❌ 导入失败：' + err.message);
    }
  });

  renderArchives();

  async function renderArchives() {
    const archives = await db.getAll('archives');
    const list = document.getElementById('archiveList');
    
    if (archives.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>还没有归档内容</p></div>';
      return;
    }

    list.innerHTML = archives.map(a => `
      <div class="list-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">${a.title}</div>
            <div style="font-size: 13px; color: var(--sub);">
              ${a.tag ? `${a.tag} · ` : ''}${new Date(a.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button class="btn-secondary" onclick="deleteArchive(${a.id})" style="padding: 6px 10px; font-size: 12px;">删除</button>
        </div>
        ${a.content ? `<div style="margin-top: 8px; line-height: 1.7; white-space: pre-wrap;">${a.content}</div>` : ''}
      </div>
    `).join('');
  }

  window.deleteArchive = async (id) => {
    if (confirm('确认删除这条归档？')) {
      await db.delete('archives', id);
      renderArchives();
    }
  };

  window.exportAllDataFile = async () => {
    try {
      const data = await exportAllData();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Luluverse-备份-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert('✅ 数据已导出');
    } catch (err) {
      alert('❌ 导出失败：' + err.message);
    }
  };
}
