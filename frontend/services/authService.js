import { request } from './apiClient'
export const authApi = {
  me: () => request('/api/auth/me'),
  login: (username, password) => request('/api/auth/login', 'POST', { username, password }),
  logout: () => request('/api/auth/logout', 'POST'),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/password', 'PUT', { currentPassword, newPassword }),
}
