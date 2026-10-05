import { request } from './apiClient'
const base = '/api/cost-estimates'
export const estimatesApi = {
  fetchAll: () => request(base),
  create: (value) => request(base, 'POST', value),
  update: (id, value) => request(`${base}/${id}`, 'PUT', value),
  remove: (id) => request(`${base}/${id}`, 'DELETE'),
}
