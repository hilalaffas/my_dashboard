import { request } from './apiClient'
export { isApiEnabled } from './apiClient'
const base = '/api/accounts'
export const accountsApi = {
  fetchTree: () => request(base),
  createCategory: (name) => request(`${base}/categories`, 'POST', { name }),
  updateCategory: (id, name) => request(`${base}/categories/${id}`, 'PUT', { name }),
  deleteCategory: (id) => request(`${base}/categories/${id}`, 'DELETE'),
  createSub: (categoryId, name) => request(`${base}/categories/${categoryId}/subs`, 'POST', { name }),
  updateSub: (id, name) => request(`${base}/subs/${id}`, 'PUT', { name }),
  deleteSub: (id) => request(`${base}/subs/${id}`, 'DELETE'),
  createItem: (subId, name, amount) => request(`${base}/subs/${subId}/items`, 'POST', { name, amount }),
  updateItem: (id, name, amount) => request(`${base}/items/${id}`, 'PUT', { name, amount }),
  deleteItem: (id) => request(`${base}/items/${id}`, 'DELETE'),
}
