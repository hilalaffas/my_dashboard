import { request } from './apiClient'

/** Khusus superuser. Membaca data pengguna lain, membuat akun, mengubah detail, dan mengatur status aktif. */
export const adminApi = {
  users: () => request('/api/admin/users'),
  createUser: (username, password) => request('/api/admin/users', 'POST', { username, password }),
  updateUser: (id, body) => request(`/api/admin/users/${id}`, 'PUT', body),
  setEnabled: (id, enabled) => request(`/api/admin/users/${id}/enabled`, 'PUT', { enabled }),
  holidays: (year) => request(`/api/admin/holidays?year=${year}`),
  createHoliday: (body) => request('/api/admin/holidays', 'POST', body),
  updateHoliday: (id, body) => request(`/api/admin/holidays/${id}`, 'PUT', body),
  deleteHoliday: (id) => request(`/api/admin/holidays/${id}`, 'DELETE'),
  user: (id) => request(`/api/admin/users/${id}`),
  accounts: (id) => request(`/api/admin/users/${id}/accounts`),
  estimates: (id) => request(`/api/admin/users/${id}/cost-estimates`),
}
