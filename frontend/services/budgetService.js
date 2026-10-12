import { request } from './apiClient'

const base = '/api/budget'

export const budgetApi = {
  calendar: (year) => request(`${base}/calendar?year=${year}`),
  setLeave: (dates, leave) => request(`${base}/leave`, 'PUT', { dates, leave }),
  entries: (from, to) => request(`${base}/entries?from=${from}&to=${to}`),
  saveEntry: (body) => request(`${base}/entries`, 'PUT', body),
  saveEntries: (entries) => request(`${base}/entries/batch`, 'PUT', { entries }),
  closings: () => request(`${base}/closings`),
  closeMonth: (body) => request(`${base}/closings`, 'POST', body),
  reopenMonth: (month) => request(`${base}/closings/${month}`, 'DELETE'),
  rules: () => request(`${base}/rules`),
  saveRule: (itemId, body) => request(`${base}/rules/${itemId}`, 'PUT', body),
  removeRule: (itemId) => request(`${base}/rules/${itemId}`, 'DELETE'),
}
