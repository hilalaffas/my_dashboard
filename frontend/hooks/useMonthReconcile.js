'use client'
import { useMemo } from 'react'
import { buildTracked, reconcile } from '@/lib/dailyTracker'
import { useDailyEntries } from './useDailyEntries'

/**
 * Rekonsiliasi bulan berjalan untuk Overview dan Reports. Memakai hasil useMonthBudget (hari, aturan, bulan ini)
 * sehingga kalender dan aturan tidak dimuat dua kali; hanya catatan harian bulan ini yang dimuat di sini.
 */
export function useMonthReconcile(tree, month, onError) {
  const entries = useDailyEntries(month.days[0]?.iso ?? '', month.days[month.days.length - 1]?.iso ?? '', onError)
  const tracked = useMemo(() => buildTracked(tree, month.rules), [tree, month.rules])
  const rec = useMemo(
    () => reconcile(tracked, month.days, entries.entries, month.todayIso),
    [tracked, month.days, entries.entries, month.todayIso],
  )
  return { rec, supported: entries.supported, ready: month.ready && entries.ready }
}
