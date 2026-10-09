'use client'
import { useEffect, useMemo, useState } from 'react'
import { makeBudgetOf, monthDays, MONTHS } from '@/lib/budgetCalendar'
import { useBudgetCalendar } from './useBudgetCalendar'
import { useBudgetRules } from './useBudgetRules'

/**
 * Anggaran bulan berjalan untuk Accounts, Cost, dan Overview: budgetOf(itemId, amount) memakai aturan hitung
 * dan kalender (hari kerja, libur, cuti) bulan ini. Tanpa aturan atau tanpa backend, nominalnya tidak berubah.
 * Bulan baru ditentukan setelah halaman tampil di browser, agar tidak berbeda dengan hasil render server.
 */
export function useMonthBudget(onError) {
  const [today, setToday] = useState(null)
  useEffect(() => {
    setToday(new Date())
  }, [])

  const year = today ? today.getFullYear() : 0
  const month = today ? today.getMonth() + 1 : 0
  const calendar = useBudgetCalendar(year, onError)
  const { rules, ready: rulesReady, supported: rulesSupported, actions: ruleActions } = useBudgetRules(onError)

  const days = useMemo(
    () => (year ? monthDays(year, month, calendar.holidays, calendar.leaves) : []),
    [year, month, calendar.holidays, calendar.leaves],
  )
  const budgetOf = useMemo(() => makeBudgetOf(rules, days), [rules, days])

  return {
    budgetOf,
    rules,
    rulesSupported,
    ruleActions,
    days,
    year,
    month,
    monthLabel: year ? `${MONTHS[month - 1]} ${year}` : '',
    ready: Boolean(today) && calendar.ready && rulesReady,
  }
}
