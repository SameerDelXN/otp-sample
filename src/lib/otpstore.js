// @/lib/otpstore.js
import fs from 'fs';
import path from 'path';

const storagePath = path.join(process.cwd(), 'tmp', 'otpStore.json');

// Initialize storage file
if (!fs.existsSync(path.dirname(storagePath))) {
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
}
if (!fs.existsSync(storagePath)) {
  fs.writeFileSync(storagePath, '{}');
}

const getStore = () => {
  return JSON.parse(fs.readFileSync(storagePath));
};

const saveStore = (store) => {
  fs.writeFileSync(storagePath, JSON.stringify(store));
};

export default {
  set: (key, value, ttl = 300000) => { // 5 minutes in ms
    const store = getStore();
    store[key] = {
      value,
      expiresAt: Date.now() + ttl
    };
    saveStore(store);
  },
  get: (key) => {
    const store = getStore();
    const item = store[key];
    if (!item) return null;
    
    // Clean up expired items
    if (item.expiresAt < Date.now()) {
      delete store[key];
      saveStore(store);
      return null;
    }
    
    return item.value;
  },
  delete: (key) => {
    const store = getStore();
    delete store[key];
    saveStore(store);
  }
};