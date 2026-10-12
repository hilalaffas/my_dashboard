'use client'
import { ChevronLeft, ChevronRight, CircleDollarSign, Download, Lock, Receipt, TrendingUp, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AccountsTabs } from '@/components/accounts/accountsTabs'
import { ConfirmDialog } from '@/components/common/confirmDialog'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { DayStrip } from '@/components/daily/dayStrip'
import { EntryRow } from '@/components/daily/entryRow'
import { ReconcileTable } from '@/components/daily/reconcileTable'
import { useAccounts } from '@/hooks/useAccounts'
import { useBudgetCalendar } from '@/hooks/useBudgetCalendar'
import { useBudgetRules } from '@/hooks/useBudgetRules'
import { useDailyEntries } from '@/hooks/useDailyEntries'
import { useMonthClosings } from '@/hooks/useMonthClosings'
import { monthDays, MONTHS, toISO, weekdayOfIso, WEEKDAYS } from '@/lib/budgetCalendar'
import { buildTracked, closingPayload, closingToItem, dayTotals, pendingFill, reconcile, totalsOfItems } from '@/lib/dailyTracker'
import { exportCsv } from '@/lib/exportCsv'
import { formatRp } from '@/lib/formatters'

const STATE_LABEL = {
  auto: 'Otomatis',
  override: 'Dikoreksi',
  entered: 'Diisi',
  pending: 'Belum diisi',
  upcoming: 'Terjadwal',
  none: '',
}

const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${WEEKDAYS[weekdayOfIso(iso) - 1]}, ${d} ${MONTHS[m - 1]} ${y}`
}

const monthKeyOf = (year, month) => `${year}-${String(month).padStart(2, '0')}`
const monthLabelOf = (key) => {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/** Tab "Harian": catat atau pantau pengeluaran per hari, cocokkan dengan anggaran, lalu tutup bulan. */
export function DailyTrackerPage() {
  const notify = useToast()
  const [cursor, setCursor] = useState(null) // { year, month }, ditentukan setelah tampil agar sama dengan hasil render server
  const [todayIso, setTodayIso] = useState('')
  const [selected, setSelected] = useState('')
  const [busyId, setBusyId] = useState('')
  const [confirm, setConfirm] = useState(null) // 'close' | 'reopen'

  useEffect(() => {
    const now = new Date()
    const iso = toISO(now.getFullYear(), now.getMonth() + 1, now.getDate())
    setCursor({ year: now.getFullYear(), month: now.getMonth() + 1 })
    setTodayIso(iso)
    setSelected(iso)
  }, [])

  const calendar = useBudgetCalendar(cursor?.year ?? 0, notify)
  const { tree, ready: accountsReady } = useAccounts(notify)
  const rulesState = useBudgetRules(notify)
  const closings = useMonthClosings(notify)

  const days = useMemo(
    () => (cursor ? monthDays(cursor.year, cursor.month, calendar.holidays, calendar.leaves) : []),
    [cursor, calendar.holidays, calendar.leaves],
  )
  const entriesState = useDailyEntries(days[0]?.iso ?? '', days[days.length - 1]?.iso ?? '', notify)

  const tracked = useMemo(() => buildTracked(tree, rulesState.rules), [tree, rulesState.rules])
  const rec = useMemo(
    () => reconcile(tracked, days, entriesState.entries, todayIso),
    [tracked, days, entriesState.entries, todayIso],
  )

  const monthKey = cursor ? monthKeyOf(cursor.year, cursor.month) : ''
  const closed = closings.map.get(monthKey) ?? null
  const isPastMonth = Boolean(monthKey && todayIso) && monthKey < todayIso.slice(0, 7)
  // Bulan tertutup memakai angka beku; selain itu angka hidup dari aturan, kalender, dan catatan
  const viewItems = useMemo(() => (closed ? closed.items.map(closingToItem) : rec.items), [closed, rec.items])
  const totals = useMemo(() => (closed ? totalsOfItems(viewItems) : rec.totals), [closed, viewItems, rec.totals])

  const selectedDay = days.find((d) => d.iso === selected) ?? null
  const future = selected > todayIso
  const listed = rec.items.filter((item) => {
    const day = item.perDay.get(selected)
    return day && (item.mode === 'MANUAL' || day.planned > 0 || day.actual !== null)
  })
  const totalsOfDay = selectedDay ? dayTotals(rec.items, selected) : { planned: 0, actual: 0 }

  function goTo(year, month) {
    setCursor({ year, month })
    const prefix = monthKeyOf(year, month)
    setSelected(todayIso.startsWith(prefix) ? todayIso : `${prefix}-01`)
  }

  function shift(delta) {
    const index = cursor.year * 12 + (cursor.month - 1) + delta
    goTo(Math.floor(index / 12), (index % 12) + 1)
  }

  function goToday() {
    const now = new Date()
    goTo(now.getFullYear(), now.getMonth() + 1)
  }

  async function changeMode(itemId, mode) {
    setBusyId(itemId)
    const ok = await rulesState.actions.setMode(itemId, mode)
    setBusyId('')
    if (ok) notify(mode === 'MANUAL' ? 'Mode Manual: isi pengeluaran tiap hari.' : 'Mode Auto: terpotong otomatis sesuai jadwal.')
  }

  async function fillAllPending() {
    const list = pendingFill(rec.items)
    if (list.length === 0) return
    if (await entriesState.saveEntries(list)) notify(`${list.length} catatan diisi sesuai rencana. Koreksi yang berbeda per hari.`)
  }

  async function handleClose() {
    setConfirm(null)
    if (await closings.actions.closeMonth(closingPayload(monthKey, rec.items))) {
      notify(`${monthLabelOf(monthKey)} ditutup. Angkanya dibekukan.`)
    }
  }

  async function handleReopen() {
    setConfirm(null)
    if (await closings.actions.reopenMonth(monthKey)) notify(`${monthLabelOf(monthKey)} dibuka kembali.`)
  }

  function exportReconcile() {
    const rows = viewItems.map((i) => [i.name, i.category, i.sub, i.mode === 'AUTO' ? 'Auto' : 'Manual', i.budget, i.plannedToDate, i.actualToDate, i.variance, i.projection, i.pending])
    exportCsv(`rekonsiliasi-${monthKey}.csv`, [
      ['Item', 'Kategori', 'Sub kategori', 'Mode', 'Anggaran bulan', 'Rencana s/d hari ini', 'Aktual', 'Selisih (+ hemat)', 'Proyeksi', 'Hari belum diisi'],
      ...rows,
      ['TOTAL', '', '', '', totals.budget, totals.plannedToDate, totals.actualToDate, totals.variance, totals.projection, totals.pending],
    ])
    notify('Rekonsiliasi diunduh.')
  }

  function exportDaily() {
    const rows = rec.items.flatMap((i) =>
      days.flatMap((d) => {
        const day = i.perDay.get(d.iso)
        if (!day || (day.planned === 0 && day.actual === null)) return []
        return [[d.iso, i.name, i.category, i.mode === 'AUTO' ? 'Auto' : 'Manual', day.planned, day.actual ?? '', STATE_LABEL[day.state]]]
      }),
    )
    exportCsv(`harian-${monthKey}.csv`, [['Tanggal', 'Item', 'Kategori', 'Mode', 'Rencana', 'Aktual', 'Status'], ...rows])
    notify('Rincian harian diunduh.')
  }

  const monthTitle = cursor ? `${MONTHS[cursor.month - 1]} ${cursor.year}` : ''
  const loading = !cursor || !accountsReady || !rulesState.ready || !entriesState.ready || !closings.ready
  const supported = rulesState.supported
  const history = [...closings.map.values()].sort((a, b) => (a.month < b.month ? 1 : -1))

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Accounts
          </div>
          <h1>Pengeluaran harian</h1>
          <p>
            Cocokkan anggaran dengan pengeluaran nyata tiap hari. Mode Auto terpotong sendiri sesuai jadwal, mode Manual Anda isi
            sesuai pengeluaran hari itu.
          </p>
        </div>
      </div>

      <AccountsTabs />

      {!supported ? (
        <section className="panel">
          <p className="dt-muted">Pelacakan harian membutuhkan backend. Di mode demo lokal fitur ini tidak tersedia.</p>
        </section>
      ) : (
        <>
          <div className="dt-month">
            <h2 aria-live="polite">{monthTitle || '\u00a0'}</h2>
            <div className="dt-month-actions">
              {closed && (
                <span className="dt-closed">
                  <Lock size={13} /> Ditutup {new Date(closed.closedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {closed && (
                <button type="button" className="outline-button" onClick={() => setConfirm('reopen')}>
                  Buka kembali
                </button>
              )}
              {!closed && isPastMonth && tracked.length > 0 && (
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setConfirm('close')}
                  disabled={rec.totals.pending > 0}
                  title={rec.totals.pending > 0 ? `Isi ${rec.totals.pending} catatan yang kosong dulu` : 'Bekukan angka bulan ini'}
                >
                  <Lock size={14} /> Tutup bulan
                </button>
              )}
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
          </div>

          <div className="metrics-grid">
            <MetricCard icon={CircleDollarSign} label="Anggaran bulan ini" value={formatRp(totals.budget)} />
            <MetricCard icon={Receipt} label={closed ? 'Terpakai' : 'Terpakai s/d hari ini'} value={formatRp(totals.actualToDate)} tone="orange" />
            <MetricCard
              icon={WalletCards}
              label={totals.variance >= 0 ? 'Hemat' : 'Melebihi rencana'}
              value={formatRp(Math.abs(totals.variance))}
              tone={totals.variance >= 0 ? 'green' : 'orange'}
            />
            <MetricCard
              icon={TrendingUp}
              label={closed ? 'Realisasi akhir' : 'Proyeksi akhir bulan'}
              value={formatRp(totals.projection)}
              tone={totals.projection > totals.budget + 0.005 ? 'orange' : 'green'}
            />
          </div>

          {tracked.length === 0 && !closed ? (
            <section className="panel">
              <p className="dt-muted">
                {loading ? 'Memuat…' : 'Belum ada item dengan aturan hitung. '}
                {!loading && (
                  <>
                    Buka tab{' '}
                    <Link href="/accounts" className="inline-link">
                      Struktur
                    </Link>{' '}
                    lalu klik ikon kalender pada sebuah item untuk mengatur cara hitungnya, misalnya per hari kerja.
                  </>
                )}
              </p>
            </section>
          ) : (
            <>
              {closed ? (
                <div className="dt-banner is-lock" role="status">
                  <span>
                    <Lock size={14} /> Bulan ini sudah ditutup. Angkanya dibekukan dan catatan harian terkunci. Buka kembali bila perlu mengubahnya.
                  </span>
                </div>
              ) : (
                totals.pending > 0 && (
                  <div className="dt-banner" role="status">
                    <span>
                      <b>{totals.pending}</b> catatan pada mode Manual belum diisi.
                    </span>
                    <div className="dt-banner-actions">
                      <button type="button" className="outline-button" onClick={() => setSelected(totals.firstPending)}>
                        Isi satu per satu
                      </button>
                      <button type="button" className="outline-button" onClick={fillAllPending}>
                        Isi semua sesuai rencana
                      </button>
                    </div>
                  </div>
                )
              )}

              {!closed && (
                <section className="panel dt-day">
                  <DayStrip
                    days={days}
                    selectedIso={selected}
                    todayIso={todayIso}
                    statusOf={(iso) => dayTotals(rec.items, iso).status}
                    onSelect={setSelected}
                  />

                  {selectedDay && (
                    <div key={selected} className="dt-day-body">
                      <div className="dt-day-head">
                        <div>
                          <h2>{longDate(selected)}</h2>
                          <p>
                            {selectedDay.holiday
                              ? selectedDay.holiday.name
                              : selectedDay.weekend
                                ? 'Akhir pekan'
                                : selectedDay.leave
                                  ? 'Hari cuti Anda'
                                  : 'Hari kerja'}
                            {selected === todayIso && ' · Hari ini'}
                          </p>
                        </div>
                        <dl className="dt-day-totals">
                          <div>
                            <dt>Rencana</dt>
                            <dd>{formatRp(totalsOfDay.planned)}</dd>
                          </div>
                          <div>
                            <dt>Aktual</dt>
                            <dd>{formatRp(totalsOfDay.actual)}</dd>
                          </div>
                        </dl>
                      </div>

                      {listed.length === 0 ? (
                        <p className="dt-muted">Tidak ada pengeluaran terjadwal pada tanggal ini.</p>
                      ) : (
                        <ul className="dt-rows">
                          {listed.map((item) => (
                            <EntryRow
                              key={`${item.itemId}-${selected}`}
                              item={item}
                              iso={selected}
                              day={item.perDay.get(selected)}
                              future={future}
                              onSave={entriesState.saveEntry}
                              onInvalid={notify}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </section>
              )}

              <section className="panel table-panel dt-reconcile">
                <div className="panel-heading">
                  <div>
                    <h2>Rekonsiliasi {monthTitle}</h2>
                    <p>
                      {closed
                        ? 'Angka beku saat bulan ditutup'
                        : 'Anggaran lawan pengeluaran nyata sampai hari ini, beserta perkiraan akhir bulan'}
                    </p>
                  </div>
                  <div className="pv-toolbar">
                    <button type="button" className="outline-button" onClick={exportReconcile}>
                      <Download size={15} /> Export rekonsiliasi
                    </button>
                    {!closed && (
                      <button type="button" className="outline-button" onClick={exportDaily}>
                        <Download size={15} /> Export harian
                      </button>
                    )}
                  </div>
                </div>
                <ReconcileTable
                  items={viewItems}
                  totals={totals}
                  busyId={busyId}
                  readOnly={Boolean(closed)}
                  onModeChange={changeMode}
                  onJump={(iso) => iso && setSelected(iso)}
                />
              </section>
            </>
          )}

          {history.length > 0 && (
            <section className="panel table-panel dt-history">
              <div className="panel-heading">
                <div>
                  <h2>Riwayat bulan ditutup</h2>
                  <p>Angka beku tidak berubah walau tarif, aturan, atau kalender diubah kemudian</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>BULAN</th>
                      <th className="numeric">ANGGARAN</th>
                      <th className="numeric">TERPAKAI</th>
                      <th className="numeric">SELISIH</th>
                      <th className="numeric">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((c) => {
                      const t = totalsOfItems(c.items.map(closingToItem))
                      const [y, m] = c.month.split('-').map(Number)
                      return (
                        <tr key={c.month}>
                          <td>
                            <b>{monthLabelOf(c.month)}</b>
                          </td>
                          <td className="numeric">{formatRp(t.budget)}</td>
                          <td className="numeric">{formatRp(t.actualToDate)}</td>
                          <td className={`numeric ${t.variance >= 0 ? 'dt-save' : 'dt-over'}`}>
                            {t.variance >= 0 ? 'Hemat ' : 'Lebih '}
                            {formatRp(Math.abs(t.variance))}
                          </td>
                          <td className="numeric">
                            <button type="button" className="text-button" onClick={() => goTo(y, m)}>
                              Lihat
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
      <PageFooter />

      {confirm === 'close' && (
        <ConfirmDialog
          title="Tutup bulan"
          message={`Tutup ${monthTitle}? Angkanya dibekukan dan catatan harian bulan ini terkunci. Anda bisa membukanya kembali kapan saja.`}
          onClose={() => setConfirm(null)}
          onConfirm={handleClose}
        />
      )}
      {confirm === 'reopen' && (
        <ConfirmDialog
          title="Buka kembali bulan"
          message={`Buka kembali ${monthTitle}? Angka beku dihapus dan rekonsiliasi dihitung ulang dari aturan dan catatan saat ini.`}
          onClose={() => setConfirm(null)}
          onConfirm={handleReopen}
        />
      )}
    </>
  )
}
