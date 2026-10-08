import { request } from './apiClient'

const base = '/api/profile'

export const profileApi = {
  get: () => request(base),
  update: (fullName) => request(base, 'PUT', { fullName }),
}
