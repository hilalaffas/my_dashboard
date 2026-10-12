'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { entryKey } from '@/lib/dailyTracker'
import { isApiEnabled } from '@/services/apiClient'
import { budgetApi } from '@/services/budgetService'

const EMPTY = new Map()

/**
 * Catatan harian pada rentang tanggal (satu bulan): Map `${itemId}|${iso}` -> jumlah.
 * Menyimpan berubah seketika dan dikembalikan bila server menolak. amount null = hapus catatan.
 */
export function useDailyEntries(fromIso, toIso, onError) {
  const [state, setState] = useState({ key: '', map: EMPTY })
  const [ready, setReady] = useState(!isApiEnabled)
  const stateRef = useRef(state)
  const key = fromIso && toIso ? `${fromIso}..${toIso}` : ''

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!isApiEnabled || !key) return
    let alive = true
    setReady(false)
    budgetApi
      .entries(fromIso, toIso)
      .then((list) => alive && setState({ key, map: new Map(list.map((e) => [entryKey(e.itemId, e.date), Number(e.amount)])) }))
      .catch((e) => alive && onError?.(e instanceof Error ? e.message : 'Gagal memuat catatan harian.'))
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [key, fromIso, toIso, onError])

  const saveEntry = useCallback(
    async (itemId, iso, amount) => {
      const before = stateRef.current
      const k = entryKey(itemId, iso)
      setState((prev) => {
        const map = new Map(prev.map)
        if (amount === null) map.delete(k)
        else map.set(k, amount)
        return { ...prev, map }
      })
      try {
        await budgetApi.saveEntry({ itemId, date: iso, amount })
        return true
      } catch (e) {
        setState(before)
        onError?.(e instanceof Error ? e.message : 'Gagal menyimpan catatan.')
        return false
      }
    },
    [onError],
  )

  /** Banyak catatan sekaligus (satu transaksi di server). list: [{ itemId, date, amount }]. */
  const saveEntries = useCallback(
    async (list) => {
      const before = stateRef.current
      setState((prev) => {
        const map = new Map(prev.map)
        list.forEach((e) => map.set(entryKey(e.itemId, e.date), e.amount))
        return { ...prev, map }
      })
      try {
        await budgetApi.saveEntries(list)
        return true
      } catch (e) {
        setState(before)
        onError?.(e instanceof Error ? e.message : 'Gagal menyimpan catatan.')
        return false
      }
    },
    [onError],
  )

  return { supported: isApiEnabled, ready, entries: state.key === key ? state.map : EMPTY, saveEntry, saveEntries }
}
