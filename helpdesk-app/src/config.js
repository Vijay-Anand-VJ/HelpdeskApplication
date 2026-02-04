// Logic to determine the backend URL
// 1. If VITE_API_URL env var is set (Production), use it.
// 2. Otherwise, default to localhost (Development).

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
