import { ProjectData } from '../types/editor';

const DB_NAME = 'CapCutProPC_DB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_CURRENT = 'current_state';

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CURRENT)) {
          db.createObjectStore(STORE_CURRENT, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProject(project: ProjectData): Promise<void> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_PROJECTS, STORE_CURRENT], 'readwrite');
        const projectStore = tx.objectStore(STORE_PROJECTS);
        const currentStore = tx.objectStore(STORE_CURRENT);

        projectStore.put(project);
        currentStore.put({ key: 'last_active_project', id: project.id, data: project });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fallback to localStorage if IndexedDB has permission restrictions
      localStorage.setItem(`cc_proj_${project.id}`, JSON.stringify(project));
      localStorage.setItem('cc_last_active', project.id);
    }
  }

  async loadLastProject(): Promise<ProjectData | null> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_CURRENT, 'readonly');
        const store = tx.objectStore(STORE_CURRENT);
        const request = store.get('last_active_project');
        request.onsuccess = () => {
          if (request.result?.data) {
            resolve(request.result.data);
          } else {
            // Check localStorage fallback
            const lastId = localStorage.getItem('cc_last_active');
            if (lastId) {
              const item = localStorage.getItem(`cc_proj_${lastId}`);
              if (item) resolve(JSON.parse(item));
              else resolve(null);
            } else {
              resolve(null);
            }
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      const lastId = localStorage.getItem('cc_last_active');
      if (lastId) {
        const item = localStorage.getItem(`cc_proj_${lastId}`);
        if (item) return JSON.parse(item);
      }
      return null;
    }
  }

  async getAllProjects(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const request = store.getAll();
        request.onsuccess = () => {
          const list = (request.result || []).map((p: ProjectData) => ({
            id: p.id,
            name: p.name,
            updatedAt: p.updatedAt,
          }));
          resolve(list);
        };
        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  exportProjectToFile(project: ProjectData) {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.capcutproj`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const localDB = new IndexedDBStorage();
