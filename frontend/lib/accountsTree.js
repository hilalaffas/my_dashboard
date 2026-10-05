import { createId } from './createId'
const mapCategory = (tree, id, fn) => tree.map((c) => (c.id === id ? fn(c) : c))
export const addCategory = (tree, name) => [...tree, { id: createId(), name, subs: [] }]
export const updateCategory = (tree, id, name) => tree.map((c) => (c.id === id ? { ...c, name } : c))
export const removeCategory = (tree, id) => tree.filter((c) => c.id !== id)
export const addSub = (tree, categoryId, name) =>
  mapCategory(tree, categoryId, (c) => ({ ...c, subs: [...c.subs, { id: createId(), name, items: [] }] }))
export const updateSub = (tree, categoryId, subId, name) =>
  mapCategory(tree, categoryId, (c) => ({
    ...c,
    subs: c.subs.map((s) => (s.id === subId ? { ...s, name } : s)),
  }))
export const removeSub = (tree, categoryId, subId) =>
  mapCategory(tree, categoryId, (c) => ({ ...c, subs: c.subs.filter((s) => s.id !== subId) }))
export const addItem = (tree, categoryId, subId, name, amount) =>
  mapCategory(tree, categoryId, (c) => ({
    ...c,
    subs: c.subs.map((s) =>
      s.id === subId ? { ...s, items: [...s.items, { id: createId(), name, amount }] } : s,
    ),
  }))
export const updateItem = (tree, categoryId, subId, itemId, name, amount) =>
  mapCategory(tree, categoryId, (c) => ({
    ...c,
    subs: c.subs.map((s) =>
      s.id === subId
        ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, name, amount } : i)) }
        : s,
    ),
  }))
export const removeItem = (tree, categoryId, subId, itemId) =>
  mapCategory(tree, categoryId, (c) => ({
    ...c,
    subs: c.subs.map((s) => (s.id === subId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s)),
  }))
export const subTotal = (items) => items.reduce((sum, i) => sum + i.amount, 0)
export const categoryTotal = (c) => c.subs.reduce((sum, s) => sum + subTotal(s.items), 0)
