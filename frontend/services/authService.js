import { request } from './apiClient'

export const authApi = {
  config: () => request('/api/auth/config'),
  me: () => request('/api/auth/me'),
  login: (username, password) => request('/api/auth/login', 'POST', { username, password }),
  register: (email, password) => request('/api/auth/register', 'POST', { email, password }),
  verifyEmail: (email, code) => request('/api/auth/verify-email', 'POST', { email, code }),
  resendCode: (email) => request('/api/auth/resend-code', 'POST', { email }),
  google: (credential) => request('/api/auth/google', 'POST', { credential }),
  logout: () => request('/api/auth/logout', 'POST'),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/password', 'PUT', { currentPassword, newPassword }),
}
