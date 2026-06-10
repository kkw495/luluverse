// 云端同步模块（基于 Supabase REST API）
import { db, STORE_NAMES, exportAllData, importAllData, onDataChange } from './storage.js';

const CONFIG_KEY = 'luluverse-cloud-config';

export function getCloudConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveCloudConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function isCloudConfigured() {
  const { supabaseUrl, supabaseKey, workspaceCode } = getCloudConfig();
  return Boolean(supabaseUrl && supabaseKey && workspaceCode);
}

function headers() {
  const { supabaseUrl, supabaseKey } = getCloudConfig();
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
}

function restUrl(path) {
  const { supabaseUrl } = getCloudConfig();
  return `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`;
}

export function generateWorkspaceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 合并两个数据集（按 id 取 updatedAt 较新的）
function mergeData(local, remote) {
  const merged = { exportDate: new Date().toISOString() };
  for (const store of STORE_NAMES) {
    const localItems = local[store] || [];
    const remoteItems = remote[store] || [];
    const map = new Map();
    for (const item of remoteItems) map.set(item.id, item);
    for (const item of localItems) {
      const existing = map.get(item.id);
      if (!existing || new Date(item.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
        map.set(item.id, item);
      }
    }
    merged[store] = Array.from(map.values());
  }
  return merged;
}

export async function createWorkspace() {
  const config = getCloudConfig();
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('请先在设置中填写 Supabase 地址和 Key');
  }

  const code = generateWorkspaceCode();
  const data = await exportAllData();

  const res = await fetch(restUrl('workspaces'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ code, data, updated_at: new Date().toISOString() })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`创建工作区失败：${err}`);
  }

  saveCloudConfig({ ...config, workspaceCode: code });
  setSyncStatus('synced');
  return code;
}

export async function joinWorkspace(code) {
  const config = getCloudConfig();
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('请先在设置中填写 Supabase 地址和 Key');
  }

  const res = await fetch(
    restUrl(`workspaces?code=eq.${encodeURIComponent(code)}&select=data`),
    { headers: headers() }
  );

  if (!res.ok) throw new Error('连接云端失败');
  const rows = await res.json();
  if (!rows.length) throw new Error('工作区代码不存在');

  saveCloudConfig({ ...config, workspaceCode: code });

  const remote = rows[0].data;
  const local = await exportAllData();
  const merged = mergeData(local, remote);
  await importAllData(merged);
  await pushToCloud(merged);

  setSyncStatus('synced');
  return code;
}

export async function pullFromCloud() {
  const { workspaceCode } = getCloudConfig();
  if (!workspaceCode) throw new Error('尚未加入工作区');

  const res = await fetch(
    restUrl(`workspaces?code=eq.${encodeURIComponent(workspaceCode)}&select=data,updated_at`),
    { headers: headers() }
  );

  if (!res.ok) throw new Error('拉取失败');
  const rows = await res.json();
  if (!rows.length) throw new Error('工作区不存在');

  const remote = rows[0].data;
  const local = await exportAllData();
  const merged = mergeData(local, remote);
  await importAllData(merged);

  setSyncStatus('synced');
  return merged;
}

export async function pushToCloud(data) {
  const { workspaceCode } = getCloudConfig();
  if (!workspaceCode) throw new Error('尚未加入工作区');

  const payload = data || await exportAllData();

  const res = await fetch(
    restUrl(`workspaces?code=eq.${encodeURIComponent(workspaceCode)}`),
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ data: payload, updated_at: new Date().toISOString() })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`上传失败：${err}`);
  }

  setSyncStatus('synced');
}

export async function syncToCloud() {
  if (!isCloudConfigured()) return;
  setSyncStatus('syncing');
  try {
    await pullFromCloud();
    await pushToCloud();
  } catch (err) {
    setSyncStatus('error', err.message);
    throw err;
  }
}

// 同步状态 UI
let syncTimer = null;

export function setSyncStatus(status, message = '') {
  const el = document.getElementById('syncStatus');
  if (!el) return;

  const labels = {
    synced: '☁️ 已同步',
    syncing: '⏳ 同步中...',
    pending: '☁️ 待同步',
    error: '❌ 同步失败',
    offline: '☁️ 未配置'
  };

  el.textContent = message || labels[status] || labels.offline;
  el.className = `sync-status sync-${status}`;
}

let autoSyncInitialized = false;

export function initAutoSync() {
  if (!isCloudConfigured()) {
    setSyncStatus('offline');
    return;
  }

  setSyncStatus('synced');

  if (!autoSyncInitialized) {
    autoSyncInitialized = true;
    onDataChange(() => {
      if (!getCloudConfig().autoSync) return;
      setSyncStatus('pending');
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        syncToCloud().catch(() => {});
      }, 3000);
    });
  }

  syncToCloud().catch(() => setSyncStatus('error', '❌ 同步失败'));
}
