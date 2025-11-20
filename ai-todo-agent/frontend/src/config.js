// frontend/src/config.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
// Auto-switch between ws:// (local) and wss:// (secure cloud)
const WS_URL = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";

export { API_URL, WS_URL };