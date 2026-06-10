// 所有数据表
export const STORE_NAMES = [
  'focus', 'habits', 'questions', 'notes', 'projects', 'courses', 'classNotes',
  'library', 'skillRecords', 'outputs', 'lifeRecords', 'reviews', 'archives',
  'worldKnowledge', 'lawNotes'
];

let syncCallback = null;

export function onDataChange(callback) {
  syncCallback = callback;
}

function notifyChange() {
  if (syncCallback) syncCallback();
}

// IndexedDB 数据库管理
class Database {
  constructor() {
    this.db = null;
    this.dbName = 'luluverse-v3';
    this.version = 1;
  }

  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ 数据库已连接');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('focus')) {
          db.createObjectStore('focus', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('questions')) {
          db.createObjectStore('questions', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('classNotes')) {
          db.createObjectStore('classNotes', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('library')) {
          db.createObjectStore('library', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('skillRecords')) {
          db.createObjectStore('skillRecords', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('outputs')) {
          db.createObjectStore('outputs', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('lifeRecords')) {
          db.createObjectStore('lifeRecords', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('reviews')) {
          db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('archives')) {
          db.createObjectStore('archives', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('worldKnowledge')) {
          db.createObjectStore('worldKnowledge', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('lawNotes')) {
          db.createObjectStore('lawNotes', { keyPath: 'id', autoIncrement: true });
        }
        
        
        
        console.log('✅ 数据库结构已创建');
      };
    });
  }

  // 通用：添加数据
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        notifyChange();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 通用：获取所有数据
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // 通用：更新数据
  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({
        ...data,
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        notifyChange();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 通用：删除数据
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        notifyChange();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 清空某个表
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 批量替换某个表的数据
  async replaceAll(storeName, items) {
    await this.clear(storeName);
    for (const item of items) {
      await this.putRaw(storeName, item);
    }
    notifyChange();
  }

  // 写入数据（保留原始时间戳，用于同步导入）
  async putRaw(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 导出单例
export const db = new Database();

// 导出全部数据
export async function exportAllData() {
  const data = { exportDate: new Date().toISOString() };
  for (const store of STORE_NAMES) {
    try {
      data[store] = await db.getAll(store);
    } catch {
      data[store] = [];
    }
  }
  return data;
}

// 导入全部数据（覆盖本地）
export async function importAllData(data) {
  for (const store of STORE_NAMES) {
    if (data[store] && Array.isArray(data[store])) {
      await db.replaceAll(store, data[store]);
    }
  }
}
