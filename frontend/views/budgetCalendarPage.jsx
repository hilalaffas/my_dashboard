'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AccountsTabs } from '@/components/accounts/accountsTabs'
import { MonthCalendar } from '@/components/budget/monthCalendar'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { useAccounts } from '@/hooks/useAccounts'
import { useBudgetCalendar } from '@/hooks/useBudgetCalendar'
import { useBudgetRules } from '@/hooks/useBudgetRules'
import {
  budgetFor,
  describeBudget,
  expandRange,
  monthDays,
  MONTHS,
  summarize,
  toISO,
  weekdayOfIso,
  WEEKDAYS,
} from '@/lib/budgetCalendar'
import { formatRp } from '@/lib/formatters'

const dateText = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${WEEKDAYS[weekdayOfIso(iso) - 1].slice(0, 3)}, ${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`
}

export function BudgetCalendarPage() {
  const notify = useToast()
  const [cursor, setCursor] = useState(null) // { year, month }, ditentukan setelah tampil agar sama dengan hasil render server
  const [todayIso, setTodayIso] = useState('')
  const [direction, setDirection] = useState('next')
  const [range, setRange] = useState({ from: '', to: '' })

  useEffect(() => {
    const now = new Date()
    setCursor({ year: now.getFullYear(), month: now.getMonth() + 1 })
    setTodayIso(toISO(now.getFullYear(), now.getMonth() + 1, now.getDate()))
  }, [])

  const calendar = useBudgetCalendar(cursor?.year ?? 0, notify)
  const { tree } = useAccounts(notify)
  const { rules } = useBudgetRules(notify)

  const days = useMemo(
    () => (cursor ? monthDays(cursor.year, cursor.month, calendar.holidays, calendar.leaves) : []),
    [cursor, calendar.holidays, calendar.leaves],
  )
  const summary = summarize(days)

  const holidaysInMonth = days.filter((d) => d.holiday)
  const leavesInMonth = days.filter((d) => d.leave && !d.weekend && !d.holiday)

  // Item yang punya aturan hitung, beserta anggarannya pada bulan yang sedang ditampilkan
  const ruled = useMemo(
    () =>
      tree.flatMap((cat) =>
        cat.subs.flatMap((sub) =>
          sub.items.flatMap((item) => {
            const rule = rules.get(item.id)
            if (!rule || days.length === 0) return []
            const budget = budgetFor(item.amount, rule, days)
            return [{ id: item.id, name: item.name, path: `${cat.name} › ${sub.name}`, hint: describeBudget(rule, budget), total: budget.total }]
          }),
        ),
      ),
    [tree, rules, days],
  )

  function shift(delta) {
    setDirection(delta > 0 ? 'next' : 'prev')
    setCursor((c) => {
      const index = c.year * 12 + (c.month - 1) + delta
      return { year: Math.floor(index / 12), month: (index % 12) + 1 }
    })
  }

  function goToday() {
    const now = new Date()
    setDirection('next')
    setCursor({ year: now.getFullYear(), month: now.getMonth() + 1 })
  }

  function handleToggle(d) {
    if (!calendar.supported) return notify('Menandai cuti membutuhkan backend.')
    if (d.weekend) return notify('Akhir pekan sudah bukan hari kerja.')
    if (d.holiday) return notify(`${d.holiday.name}: sudah tanggal merah.`)
    void calendar.setLeave([d.iso], !d.leave)
  }

  async function applyRange(leave) {
    if (!calendar.supported) return notify('Menandai cuti membutuhkan backend.')
    const dates = expandRange(range.from, range.to)
    if (!dates) return notify('Rentang tanggal tidak valid (maksimal 62 hari).')
    if (dates.some((iso) => !iso.startsWith(`${cursor.year}-`))) return notify('Pilih rentang di dalam tahun yang sedang ditampilkan.')
    const target = leave ? dates.filter((iso) => weekdayOfIso(iso) <= 5 && !calendar.holidays.has(iso)) : dates
    if (target.length === 0) return notify('Tidak ada hari kerja pada rentang itu.')
    if (await calendar.setLeave(target, leave)) {
      notify(leave ? `${target.length} hari ditandai cuti.` : 'Tanda cuti pada rentang itu dihapus.')
    }
  }

  const monthTitle = cursor ? `${MONTHS[cursor.month - 1]} ${cursor.year}` : ''
  const rulesTotal = ruled.reduce((n, r) => n + r.total, 0)

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Accounts
          </div>
          <h1>Kalender anggaran</h1>
          <p>Hari kerja, tanggal merah, dan cuti Anda. Item yang dihitung per hari kerja atau mingguan mengikuti kalender ini.</p>
        </div>
      </div>

      <AccountsTabs />

      <div className="bc-layout">
        <section className="panel bc-card">
          <div className="bc-head">
            <h2 aria-live="polite">{monthTitle || '\u00a0'}</h2>
            <div className="bc-nav">
              <button type="button" className="icon-button bc-arrow" aria-label="Bulan sebelumnya" onClick={() => shift(-1)} disabled={!cursor}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="outline-button" onClick={goToday} disabled={!cursor}>
                Hari ini
              </button>
              <button type="button" className="icon-button bc-arrow" aria-label="Bulan berikutnya" onClick={() => shift(1)} disabled={!cursor}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {cursor && (
            <div key={`${cursor.year}-${cursor.month}`} className={`bc-slide bc-dir-${direction}`}>
              <MonthCalendar days={days} todayIso={todayIso} onToggle={handleToggle} />
            </div>
          )}

          <ul className="bc-legend" aria-label="Keterangan warna">
            <li><i className="bc-key is-holiday" /> Libur nasional</li>
            <li><i className="bc-key is-collective" /> Cuti bersama</li>
            <li><i className="bc-key is-leave" /> Cuti Anda</li>
            <li><i className="bc-key is-weekend" /> Akhir pekan</li>
          </ul>

          <form
            className="bc-range"
            onSubmit={(e) => {
              e.preventDefault()
              void applyRange(true)
            }}
          >
            <span className="bc-range-title">Cuti beberapa hari</span>
            <label>
              Dari
              <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} required />
            </label>
            <label>
              Sampai
              <input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} required />
            </label>
            <button type="submit" className="outline-button">
              Tandai cuti
            </button>
            <button type="button" className="outline-button" onClick={() => void applyRange(false)}>
              Hapus tanda
            </button>
          </form>
        </section>

        <aside className="bc-side">
          <section className="panel">
            <h2 className="bc-side-title">Ringkasan {monthTitle}</h2>
            <div className="bc-stats">
              <div className="bc-stat is-main">
                <strong>{summary.workdays}</strong>
                <span>hari kerja</span>
              </div>
              <div className="bc-stat">
                <strong>{summary.calendar}</strong>
                <span>hari kalender</span>
              </div>
              <div className="bc-stat">
                <strong>{summary.holidayWeekdays}</strong>
                <span>tanggal merah (Sen–Jum)</span>
              </div>
              <div className="bc-stat">
                <strong>{summary.leaveWorkdays}</strong>
                <span>cuti Anda</span>
              </div>
            </div>
            <p className="bc-subtitle">Jumlah tiap hari (untuk item mingguan)</p>
            <ul className="bc-chips">
              {WEEKDAYS.map((name, i) => (
                <li key={name}>
                  {name.slice(0, 3)} <b>{days.filter((d) => d.dow === i + 1).length}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2 className="bc-side-title">Libur dan cuti bulan ini</h2>
            {holidaysInMonth.length === 0 && leavesInMonth.length === 0 ? (
              <p className="bc-empty">Tidak ada tanggal merah atau cuti.</p>
            ) : (
              <ul className="bc-list">
                {holidaysInMonth.map((d) => (
                  <li key={d.iso}>
                    <span>{dateText(d.iso)}</span>
                    <b>{d.holiday.name}</b>
                  </li>
                ))}
                {leavesInMonth.map((d) => (
                  <li key={`leave-${d.iso}`}>
                    <span>{dateText(d.iso)}</span>
                    <b>Cuti Anda</b>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <section className="panel table-panel bc-budget">
        <div className="panel-heading">
          <div>
            <h2>Anggaran {monthTitle} menurut aturan hitung</h2>
            <p>Item yang diatur per hari kalender, hari kerja, atau mingguan. Atur lewat tombol kalender di tab Struktur.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ITEM</th>
                <th>PERHITUNGAN</th>
                <th className="numeric">ANGGARAN</th>
              </tr>
            </thead>
            <tbody>
              {ruled.map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.name}</b>
                    <small className="line-source">{row.path}</small>
                  </td>
                  <td>{row.hint}</td>
                  <td className="numeric">{formatRp(row.total)}</td>
                </tr>
              ))}
              {ruled.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    Belum ada item dengan aturan hitung. Buka tab Struktur lalu klik ikon kalender pada sebuah item.
                  </td>
                </tr>
              )}
            </tbody>
            {ruled.length > 0 && (
              <tfoot>
                <tr>
                  <th colSpan={2}>TOTAL</th>
                  <th className="numeric">{formatRp(rulesTotal)}</th>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
      <PageFooter />
    </>
  )
}
