import { request } from './apiClient'

const base = '/api/cost-columns'

export const costColumnsApi = {
  fetchMeta: () => request(base),
  create: (body) => request(base, 'POST', body),
  update: (id, body) => request(`${base}/${id}`, 'PUT', body),
  remove: (id) => request(`${base}/${id}`, 'DELETE'),
  reorder: (ids) => request(`${base}/order`, 'PUT', { ids }),
  setCell: (id, body) => request(`${base}/${id}/cells`, 'PUT', body),
}
