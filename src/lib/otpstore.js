// @/lib/otpstore.js (simple in-memory version)
const otpStore = new Map();

export default {
  set: (key, value) => otpStore.set(key, value),
  get: (key) => otpStore.get(key),
  delete: (key) => otpStore.delete(key),
};