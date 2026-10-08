'use client'
import { useCallback, useEffect, useState } from 'react'
import { createId } from '@/lib/createId'
import { estimatesApi } from '@/services/estimatesService'
import { isApiEnabled } from '@/services/apiClient'
import { useStoredState } from './useStoredState'
/** Sama seperti useAccounts: mode lokal (localStorage) atau mode backend (API + muat ulang). */
export function useEstimates(onError) {
  const [localRows, setLocalRows, localReady] = useStoredState('sims.estimates', [])
  const [remoteRows, setRemoteRows] = useState([])
  const [remoteReady, setRemoteReady] = useState(false)
  const reload = useCallback(async () => {
    try {
      setRemoteRows(await estimatesApi.fetchAll())
    } catch {
      onError?.('Backend tidak terjangkau.')
    } finally {
      setRemoteReady(true)
    }
  }, [onError])
  useEffect(() => {
    if (isApiEnabled) void reload()
  }, [reload])
  async function run(remote, local) {
    if (!isApiEnabled) {
      setLocalRows((prev) => local(prev))
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
    add: (value) =>
      run(
        () => estimatesApi.create(value),
        (rows) => [...rows, { id: createId(), ...value }],
      ),
    update: (id, value) =>
      run(
        () => estimatesApi.update(id, value),
        (rows) => rows.map((r) => (r.id === id ? { ...r, ...value } : r)),
      ),
    remove: (id) =>
      run(
        () => estimatesApi.remove(id),
        (rows) => rows.filter((r) => r.id !== id),
      ),
  }
  return {
    rows: isApiEnabled ? remoteRows : localRows,
    ready: isApiEnabled ? remoteReady : localReady,
    actions,
  }
}
