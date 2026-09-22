const DB_NAME = 'signal-lab-v2';
const DB_VERSION = 1;
const SESSION_STORE = 'sessions';
const BLOB_STORE = 'audio';

function openDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB no está disponible.'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains(SESSION_STORE)) db.createObjectStore(SESSION_STORE, { keyPath: 'id' }); if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction(storeName, mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => { const tx = db.transaction(storeName, mode); const store = tx.objectStore(storeName); const result = action(store); tx.oncomplete = () => resolve(result); tx.onerror = () => reject(tx.error); });
}

export async function saveSession(session) { return transaction(SESSION_STORE, 'readwrite', (store) => store.put(session)); }
export async function listSessions() { return transaction(SESSION_STORE, 'readonly', (store) => new Promise((resolve) => { const req = store.getAll(); req.onsuccess = () => resolve(req.result || []); })); }
export async function saveBlob(key, blob) { return transaction(BLOB_STORE, 'readwrite', (store) => store.put(blob, key)); }
export async function getBlob(key) { return transaction(BLOB_STORE, 'readonly', (store) => new Promise((resolve) => { const req = store.get(key); req.onsuccess = () => resolve(req.result || null); })); }

export function downloadJson(filename, value) { const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
export function downloadBlob(filename, blob) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
