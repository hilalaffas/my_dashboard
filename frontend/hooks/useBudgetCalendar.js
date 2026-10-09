'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isApiEnabled } from '@/services/apiClient'
import { budgetApi } from '@/services/budgetService'

const EMPTY = { year: null, holidays: new Map(), leaves: new Set() }

/**
 * Hari libur (bersama) dan hari cuti pengguna untuk satu tahun. year = 0/null menunda pemuatan.
 * Menandai cuti berubah seketika dan dikembalikan bila server menolak.
 */
export function useBudgetCalendar(year, onError) {
  const [state, setState] = useState(EMPTY)
  const [ready, setReady] = useState(!isApiEnabled)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!isApiEnabled || !year) return
    let alive = true
    setReady(false)
    budgetApi
      .calendar(year)
      .then((res) => {
        if (!alive) return
        setState({
          year,
          holidays: new Map(res.holidays.map((h) => [h.date, { name: h.name, kind: h.kind }])),
          leaves: new Set(res.leaveDays),
        })
      })
      .catch((e) => alive && onError?.(e instanceof Error ? e.message : 'Gagal memuat kalender.'))
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [year, onError])

  /** dates: daftar ISO; leave: true = tandai cuti, false = hapus tandanya. */
  const setLeave = useCallback(
    async (dates, leave) => {
      const before = stateRef.current
      setState((prev) => {
        const leaves = new Set(prev.leaves)
        dates.forEach((d) => (leave ? leaves.add(d) : leaves.delete(d)))
        return { ...prev, leaves }
      })
      try {
        await budgetApi.setLeave(dates, leave)
        return true
      } catch (e) {
        setState(before)
        onError?.(e instanceof Error ? e.message : 'Gagal menyimpan cuti.')
        return false
      }
    },
    [onError],
  )

  const current = state.year === year ? state : EMPTY
  return { supported: isApiEnabled, ready, holidays: current.holidays, leaves: current.leaves, setLeave }
}
