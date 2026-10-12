'use client'
import { useCallback, useEffect, useState } from 'react'
import { isApiEnabled } from '@/services/apiClient'
import { budgetApi } from '@/services/budgetService'

/** Bulan yang sudah ditutup: Map 'YYYY-MM' -> { month, closedAt, items } (angka beku). */
export function useMonthClosings(onError) {
  const [map, setMap] = useState(() => new Map())
  const [ready, setReady] = useState(!isApiEnabled)

  useEffect(() => {
    if (!isApiEnabled) return
    let alive = true
    budgetApi
      .closings()
      .then((list) => alive && setMap(new Map(list.map((c) => [c.month, c]))))
      .catch((e) => alive && onError?.(e instanceof Error ? e.message : 'Gagal memuat riwayat bulan.'))
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [onError])

  const closeMonth = useCallback(
    async (body) => {
      try {
        const saved = await budgetApi.closeMonth(body)
        setMap((prev) => new Map(prev).set(saved.month, saved))
        return true
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Gagal menutup bulan.')
        return false
      }
    },
    [onError],
  )

  const reopenMonth = useCallback(
    async (month) => {
      try {
        await budgetApi.reopenMonth(month)
        setMap((prev) => {
          const next = new Map(prev)
          next.delete(month)
          return next
        })
        return true
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Gagal membuka kembali bulan.')
        return false
      }
    },
    [onError],
  )

  return { ready, map, actions: { closeMonth, reopenMonth } }
}
