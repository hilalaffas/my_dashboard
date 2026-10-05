'use client'
import { useCallback, useEffect, useState } from 'react'
import { defaultAccounts } from '@/data/mockData'
import * as treeOps from '@/lib/accountsTree'
import { accountsApi, isApiEnabled } from '@/services/accountsService'
import { useStoredState } from './useStoredState'
/**
 * Mode lokal  : data di localStorage (NEXT_PUBLIC_API_URL kosong).
 * Mode backend: setiap aksi memanggil API, lalu data dimuat ulang dari server.
 * Semua aksi mengembalikan true jika berhasil.
 */
export function useAccounts(onError) {
  const [localTree, setLocalTree, localReady] = useStoredState('sims.accounts', defaultAccounts)
  const [remoteTree, setRemoteTree] = useState([])
  const [remoteReady, setRemoteReady] = useState(false)
  const reload = useCallback(async () => {
    try {
      setRemoteTree(await accountsApi.fetchTree())
    } catch (e) {
      onError?.(e instanceof Error ? 'Backend tidak terjangkau.' : 'Gagal memuat data.')
    } finally {
      setRemoteReady(true)
    }
  }, [onError])
  useEffect(() => {
    if (isApiEnabled) void reload()
  }, [reload])
  async function run(remote, local) {
    if (!isApiEnabled) {
      setLocalTree((prev) => local(prev))
      return true
    }
    try {
      await remote()
      await reload()
      return true
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Gagal menyimpan.')
      return false
    }
  }
  const actions = {
    addCategory: (name) =>
      run(
        () => accountsApi.createCategory(name),
        (t) => treeOps.addCategory(t, name),
      ),
    updateCategory: (id, name) =>
      run(
        () => accountsApi.updateCategory(id, name),
        (t) => treeOps.updateCategory(t, id, name),
      ),
    removeCategory: (id) =>
      run(
        () => accountsApi.deleteCategory(id),
        (t) => treeOps.removeCategory(t, id),
      ),
    addSub: (categoryId, name) =>
      run(
        () => accountsApi.createSub(categoryId, name),
        (t) => treeOps.addSub(t, categoryId, name),
      ),
    updateSub: (categoryId, subId, name) =>
      run(
        () => accountsApi.updateSub(subId, name),
        (t) => treeOps.updateSub(t, categoryId, subId, name),
      ),
    removeSub: (categoryId, subId) =>
      run(
        () => accountsApi.deleteSub(subId),
        (t) => treeOps.removeSub(t, categoryId, subId),
      ),
    addItem: (categoryId, subId, name, amount) =>
      run(
        () => accountsApi.createItem(subId, name, amount),
        (t) => treeOps.addItem(t, categoryId, subId, name, amount),
      ),
    updateItem: (categoryId, subId, itemId, name, amount) =>
      run(
        () => accountsApi.updateItem(itemId, name, amount),
        (t) => treeOps.updateItem(t, categoryId, subId, itemId, name, amount),
      ),
    removeItem: (categoryId, subId, itemId) =>
      run(
        () => accountsApi.deleteItem(itemId),
        (t) => treeOps.removeItem(t, categoryId, subId, itemId),
      ),
  }
  return {
    tree: isApiEnabled ? remoteTree : localTree,
    ready: isApiEnabled ? remoteReady : localReady,
    actions,
  }
}
