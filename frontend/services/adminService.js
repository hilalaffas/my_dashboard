import { request } from './apiClient'

/** Khusus superuser. Membaca data pengguna lain dan membuat akun baru. */
export const adminApi = {
  users: () => request('/api/admin/users'),
  createUser: (username, password) => request('/api/admin/users', 'POST', { username, password }),
  user: (id) => request(`/api/admin/users/${id}`),
  accounts: (id) => request(`/api/admin/users/${id}/accounts`),
  estimates: (id) => request(`/api/admin/users/${id}/cost-estimates`),
}
