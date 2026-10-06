import { request } from './apiClient'

/** Khusus superuser. Semua hanya membaca data pengguna lain. */
export const adminApi = {
  users: () => request('/api/admin/users'),
  user: (id) => request(`/api/admin/users/${id}`),
  accounts: (id) => request(`/api/admin/users/${id}/accounts`),
  estimates: (id) => request(`/api/admin/users/${id}/cost-estimates`),
}
