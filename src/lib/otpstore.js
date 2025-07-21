// @/lib/otpstore.js
import fs from 'fs';
import path from 'path';

// In-memory store as primary storage
const memoryStore = new Map();

// For environments where filesystem is available (local dev)
let fileStoreEnabled = false;
let storagePath;

try {
  // Use /tmp directory which is writable in most environments
  storagePath = path.join('/tmp', 'otpStore.json');
  
  // Test filesystem access
  fs.accessSync('/tmp', fs.constants.W_OK);
  fileStoreEnabled = true;
  
  if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, '{}');
  }
} catch (err) {
  console.warn('Filesystem storage not available, using memory only');
  fileStoreEnabled = false;
}

const getStore = () => {
  if (!fileStoreEnabled) return null;
  
  try {
    return JSON.parse(fs.readFileSync(storagePath));
  } catch (err) {
    console.error('Error reading store:', err);
    return {};
  }
};

const saveStore = (store) => {
  if (!fileStoreEnabled) return;
  
  try {
    fs.writeFileSync(storagePath, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving store:', err);
  }
};

export default {
  set: (key, value, ttl = 300000) => { // 5 minutes
    // Store in memory
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
    
    // Also store in file if available
    if (fileStoreEnabled) {
      const store = getStore();
      store[key] = {
        value,
        expiresAt: Date.now() + ttl
      };
      saveStore(store);
    }
  },
  
  get: (key) => {
    // Check memory first
    const memoryItem = memoryStore.get(key);
    if (memoryItem) {
      if (memoryItem.expiresAt > Date.now()) {
        return memoryItem.value;
      }
      memoryStore.delete(key);
    }
    
    // Check file storage if available
    if (fileStoreEnabled) {
      const store = getStore();
      const fileItem = store[key];
      
      if (fileItem && fileItem.expiresAt > Date.now()) {
        // Bring into memory
        memoryStore.set(key, fileItem);
        return fileItem.value;
      }
      
      // Clean up expired
      if (fileItem) {
        delete store[key];
        saveStore(store);
      }
    }
    
    return null;
  },
  
  delete: (key) => {
    memoryStore.delete(key);
    if (fileStoreEnabled) {
      const store = getStore();
      delete store[key];
      saveStore(store);
    }
  }
};