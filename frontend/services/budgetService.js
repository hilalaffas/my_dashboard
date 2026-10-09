import { request } from './apiClient'

const base = '/api/budget'

export const budgetApi = {
  calendar: (year) => request(`${base}/calendar?year=${year}`),
  setLeave: (dates, leave) => request(`${base}/leave`, 'PUT', { dates, leave }),
  rules: () => request(`${base}/rules`),
  saveRule: (itemId, body) => request(`${base}/rules/${itemId}`, 'PUT', body),
  removeRule: (itemId) => request(`${base}/rules/${itemId}`, 'DELETE'),
}
