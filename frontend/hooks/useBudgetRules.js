'use client'
import { useCallback, useEffect, useState } from 'react'
import { isApiEnabled } from '@/services/apiClient'
import { budgetApi } from '@/services/budgetService'

/** Aturan hitung per item Accounts milik pengguna. rules: Map itemId -> { unit, basis, rate, weekDay }. */
export function useBudgetRules(onError) {
  const [rules, setRules] = useState(() => new Map())
  const [ready, setReady] = useState(!isApiEnabled)

  useEffect(() => {
    if (!isApiEnabled) return
    let alive = true
    budgetApi
      .rules()
      .then((list) => alive && setRules(new Map(list.map((r) => [r.itemId, r]))))
      .catch((e) => alive && onError?.(e instanceof Error ? e.message : 'Gagal memuat aturan hitung.'))
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [onError])

  const saveRule = useCallback(
    async (itemId, body) => {
      try {
        const saved = await budgetApi.saveRule(itemId, body)
        setRules((prev) => new Map(prev).set(itemId, saved))
        return true
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Gagal menyimpan aturan.')
        return false
      }
    },
    [onError],
  )

  const removeRule = useCallback(
    async (itemId) => {
      try {
        await budgetApi.removeRule(itemId)
        setRules((prev) => {
          const next = new Map(prev)
          next.delete(itemId)
          return next
        })
        return true
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Gagal menghapus aturan.')
        return false
      }
    },
    [onError],
  )

  return { supported: isApiEnabled, ready, rules, actions: { saveRule, removeRule } }
}
