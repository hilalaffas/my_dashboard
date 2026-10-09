'use client'
import {
  ArrowUpRight,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  MoreHorizontal,
  Plus,
  Receipt,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { EstimateFormModal } from '@/components/estimates/estimateFormModal'
import { useAccounts } from '@/hooks/useAccounts'
import { useEstimates } from '@/hooks/useEstimates'
import { useMonthBudget } from '@/hooks/useMonthBudget'
import { buildCostLines, debitByType, totalsOf } from '@/lib/costLines'
import { exportCsv } from '@/lib/exportCsv'
import { formatCompactRp, formatRp } from '@/lib/formatters'

const SLICE_COLORS = ['#8fbf80', '#c8ddbd', '#e6c98d', '#df9f83', '#c9cdc7']
const TOP_SLICES = 4
const BAR_COUNT = 6
const TOP_ROWS = 4

/** Gradien donut dari irisan {amount}; cincin kosong bila belum ada pengeluaran. */
function donutBackground(slices, total) {
  if (total <= 0) return '#eef1ec'
  let start = 0
  const stops = slices.map((slice, i) => {
    const end = start + (slice.amount / total) * 100
    const stop = `${SLICE_COLORS[i]} ${start}% ${end}%`
    start = end
    return stop
  })
  return `conic-gradient(${stops.join(', ')})`
}

export function OverviewPage() {
  const notify = useToast()
  const { user } = useAuth()
  const { tree } = useAccounts(notify)
  const { rows: manualRows, actions } = useEstimates(notify)
  const { budgetOf } = useMonthBudget(notify)
  const [showAll, setShowAll] = useState(false)
  const [creating, setCreating] = useState(false)

  // Angka Overview dihitung dari baris yang sama dengan halaman Cost estimates
  const lines = useMemo(() => buildCostLines(tree, manualRows, budgetOf), [tree, manualRows, budgetOf])
  const { debit, credit, balance } = totalsOf(lines)
  const spendingRatio = credit > 0 ? (debit / credit) * 100 : null

  const byType = useMemo(() => debitByType(lines), [lines])
  const bars = byType.slice(0, BAR_COUNT)
  const maxBar = bars[0]?.amount ?? 0
  const slices = useMemo(() => {
    const top = byType.slice(0, TOP_SLICES)
    const rest = byType.slice(TOP_SLICES).reduce((sum, t) => sum + t.amount, 0)
    return rest > 0 ? [...top, { name: 'Lainnya', amount: rest }] : top
  }, [byType])

  const largest = useMemo(
    () =>
      lines
        .map((l) => ({ ...l, net: l.credit - l.debit }))
        .filter((l) => l.net !== 0)
        .sort((a, b) => Math.abs(b.net) - Math.abs(a.net)),
    [lines],
  )
  const displayed = showAll ? largest : largest.slice(0, TOP_ROWS)

  function handleExport() {
    exportCsv('cost-estimates.csv', [
      ['Type', 'Detail', 'Sumber', 'Debit', 'Credit'],
      ...lines.map((l) => [
        l.type,
        l.detail,
        l.source === 'account' ? `Accounts › ${l.group}` : 'Manual',
        l.debit,
        l.credit,
      ]),
    ])
    notify('Laporan CSV diunduh.')
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Personal finance dashboard
          </div>
          <h1>Good morning, {user?.fullName ?? 'User Testing'}.</h1>
          <p>Here&apos;s the latest picture of your cost estimate and monthly plan.</p>
        </div>
        <div className="heading-actions">
          <button className="outline-button" onClick={handleExport}>
            <Download size={16} /> Export report
          </button>
          <button className="primary-button" onClick={() => setCreating(true)}>
            <Plus size={17} /> New estimate
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard icon={CircleDollarSign} label="Total planned cost" value={formatRp(debit)} />
        <MetricCard icon={Receipt} label="Total income" value={formatRp(credit)} tone="orange" />
        <MetricCard
          icon={WalletCards}
          label="Available balance"
          value={formatRp(balance)}
          tone={balance < 0 ? 'orange' : 'green'}
        />
        <MetricCard
          icon={TrendingUp}
          label="Spending ratio"
          value={spendingRatio === null ? '—' : `${spendingRatio.toFixed(1)}%`}
        />
      </div>

      <div className="main-grid">
        <section className="panel trend-panel">
          <div className="panel-heading">
            <div>
              <h2>Cost by type</h2>
              <p>Largest planned costs, taken from your Accounts and estimates</p>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot planned" /> Planned
            </span>
            <b>
              {formatRp(debit)} <small>total planned</small>
            </b>
          </div>
          {bars.length > 0 ? (
            <div className="bar-chart single">
              {bars.map((item) => (
                <div className="bar-group" key={item.name} title={`${item.name}: ${formatRp(item.amount)}`}>
                  <div className="bars">
                    <span
                      className="bar planned-bar"
                      style={{ height: `${Math.max(6, (item.amount / maxBar) * 88)}%` }}
                    />
                  </div>
                  <small>{item.name}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-cell">
              Belum ada biaya. Tambahkan item di{' '}
              <Link href="/accounts" className="inline-link">
                Accounts
              </Link>
              .
            </p>
          )}
        </section>

        <section className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h2>Top cost estimates</h2>
              <p>Largest types in your plan</p>
            </div>
            <Link href="/reports" className="more-button" aria-label="Lihat laporan kategori">
              <MoreHorizontal size={19} />
            </Link>
          </div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: donutBackground(slices, debit) }}>
              <div>
                <strong>{formatCompactRp(debit)}</strong>
                <span>total cost</span>
              </div>
            </div>
          </div>
          <div className="category-list">
            {slices.map((item, i) => (
              <div className="category-row" key={item.name}>
                <span>
                  <i style={{ background: SLICE_COLORS[i] }} />
                  {item.name}
                </span>
                <b>
                  {formatCompactRp(item.amount)}
                  <small>{Math.round((item.amount / debit) * 100)}%</small>
                </b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Largest cost items</h2>
            <p>Biggest lines across Accounts and manual estimates</p>
          </div>
          {largest.length > TOP_ROWS && (
            <button className="text-button" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show less' : 'View all'} <ArrowUpRight size={15} />
            </button>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>DETAIL</th>
                <th>CATEGORY</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="table-detail">
                      <span className="row-icon">
                        <FileSpreadsheet size={16} />
                      </span>
                      <span>
                        <b>{row.detail}</b>
                        <small>{row.type}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill">{row.group}</span>
                  </td>
                  <td className={row.net > 0 ? 'positive amount' : 'amount'}>
                    {row.net > 0 ? '+' : '-'} {formatRp(Math.abs(row.net))}
                  </td>
                  <td>
                    <span className={`status ${row.net > 0 ? 'received' : 'planned'}`}>
                      {row.net > 0 ? 'Received' : 'Planned'}
                    </span>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    Belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <PageFooter />

      {creating && (
        <EstimateFormModal
          title="Estimasi baru"
          onClose={() => setCreating(false)}
          onSubmit={async (value) => {
            if (await actions.add(value)) {
              setCreating(false)
              notify('Estimasi ditambahkan. Lihat di Cost estimates.')
            }
          }}
        />
      )}
    </>
  )
}
