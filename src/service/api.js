import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/customer-portal`,
    timeout: 15000,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
});

// Attach Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('portal_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 → paksa logout total biar gak loop login-logout.
// Wajib lewat auth.clear() supaya snapshot pinia-persist ('portal-auth') juga
// ke-reset. Kalau cuma hapus 'portal_token' manual, plugin persist tetap
// rehidrasi token expired → router anggap masih login → API 401 lagi → ∞ loop.
let isLoggingOut = false;
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            if (!isLoggingOut) {
                isLoggingOut = true;
                try {
                    useAuthStore().clear();
                } catch (_) {
                    // pinia belum ready (saat app init) → fallback hapus manual
                    localStorage.removeItem('portal_token');
                    localStorage.removeItem('portal_customer');
                    localStorage.removeItem('portal-auth');
                }
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const patch = (url, data, config) => api.patch(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
