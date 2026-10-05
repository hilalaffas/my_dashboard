'use client'
import {
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  MoreHorizontal,
  Plus,
  Receipt,
  TrendingUp,
  WalletCards,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { EstimateFormModal } from '@/components/estimates/estimateFormModal'
import { categoryData, monthlyData, transactions } from '@/data/mockData'
import { useEstimates } from '@/hooks/useEstimates'
import { exportCsv } from '@/lib/exportCsv'
export function OverviewPage() {
  const notify = useToast()
  const { user } = useAuth()
  const { rows, actions } = useEstimates(notify)
  const [range, setRange] = useState('This month')
  const [showAll, setShowAll] = useState(false)
  const [creating, setCreating] = useState(false)
  const displayed = useMemo(() => (showAll ? transactions : transactions.slice(0, 4)), [showAll])
  function handleExport() {
    exportCsv('cost-estimates.csv', [
      ['Type', 'Detail', 'Debit', 'Credit'],
      ...rows.map((r) => [r.type, r.detail, r.debit, r.credit]),
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
        <MetricCard icon={CircleDollarSign} label="Total planned cost" value="Rp 6.75 jt" change="1.4%" />
        <MetricCard icon={Receipt} label="Total spent" value="Rp 6.80 jt" change="2.7%" tone="orange" />
        <MetricCard icon={WalletCards} label="Available balance" value="Rp 95 rb" change="8.4%" />
        <MetricCard icon={TrendingUp} label="Saving rate" value="43.4%" change="4.2%" />
      </div>

      <div className="main-grid">
        <section className="panel trend-panel">
          <div className="panel-heading">
            <div>
              <h2>Monthly cost overview</h2>
              <p>Track planned costs against actual spending</p>
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Pilih rentang tanggal"
            >
              <option>This month</option>
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot planned" /> Planned
            </span>
            <span>
              <i className="legend-dot actual" /> Actual
            </span>
            <b>
              {range === 'This month' ? 'Rp 6.80 jt' : 'Rp 39.91 jt'} <small>total actual</small>
            </b>
          </div>
          <div className="bar-chart">
            {monthlyData.map((item, index) => (
              <div className="bar-group" key={item.month}>
                <div className="bars">
                  <span className="bar planned-bar" style={{ height: `${item.value * 8}%` }} />
                  <span
                    className="bar actual-bar"
                    style={{
                      height: `${(item.value + (index === 3 ? 0.08 : index === 4 ? 0.03 : -0.05)) * 8}%`,
                    }}
                  />
                </div>
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h2>Top cost estimates</h2>
              <p>Largest items in your plan</p>
            </div>
            <Link href="/reports" className="more-button" aria-label="Lihat laporan kategori">
              <MoreHorizontal size={19} />
            </Link>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <div>
                <strong>Rp 6.75</strong>
                <span>million total</span>
              </div>
            </div>
          </div>
          <div className="category-list">
            {categoryData.map((item) => (
              <div className="category-row" key={item.name}>
                <span>
                  <i style={{ background: item.color }} />
                  {item.name}
                </span>
                <b>
                  {item.amount}
                  <small>{item.value}%</small>
                </b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent cost estimates</h2>
            <p>Your latest planned and actual entries</p>
          </div>
          <button className="text-button" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : 'View all'} <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>DETAIL</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((row) => (
                <tr key={row.detail}>
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
                    <span className="category-pill">{row.category}</span>
                  </td>
                  <td>{row.date}</td>
                  <td className={row.positive ? 'positive amount' : 'amount'}>
                    {row.positive ? '+' : '-'} {row.value}
                  </td>
                  <td>
                    <span className={`status ${row.positive ? 'received' : 'planned'}`}>
                      {row.positive ? 'Received' : 'Planned'}
                    </span>
                  </td>
                </tr>
              ))}
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
