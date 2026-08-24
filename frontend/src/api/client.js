// Central API client. Every protected call attaches the JWT from localStorage.
// Base URL comes from Vite env so you can point at staging/prod without code changes.
export const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:4000';

export const TOKEN_KEY = 'pp_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Thrown for any non-2xx response so callers can `catch (e) { e.message }`. */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body, auth = true, isForm = false } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError('Not authenticated', 401);
    headers.Authorization = `Bearer ${token}`;
  }
  // Never set Content-Type on FormData — the browser must add the multipart boundary.
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the API running?', 0);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    // 401 anywhere means the token is dead — drop it so route guards bounce to /login.
    if (res.status === 401) clearToken();
    throw new ApiError(data?.message || data?.error || `Request failed (${res.status})`, res.status, data);
  }
  return data;
}

const safeJson = (t) => {
  try { return JSON.parse(t); } catch { return { raw: t }; }
};

export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password }, auth: false }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  /** POST /upload — multipart. `file` is a File from the drop zone / file input. */
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/upload', { method: 'POST', body: form, isForm: true });
  },

  listReports: () => request('/reports'),
  getReport: (id) => request(`/reports/${id}`),
  updateReport: (id, data) => request(`/reports/${id}`, { method: 'PUT', body: data }),
  deleteReport: (id) => request(`/reports/${id}`, { method: 'DELETE' }),
};
