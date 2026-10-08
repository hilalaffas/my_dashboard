'use client'
import { Download, Layers, ListTree, Receipt, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { useAccounts } from '@/hooks/useAccounts'
import { categoryTotal } from '@/lib/accountsTree'
import { exportCsv } from '@/lib/exportCsv'
import { formatRp } from '@/lib/formatters'
export function ReportsPage() {
  const notify = useToast()
  const { tree } = useAccounts(notify)
  const total = tree.reduce((sum, c) => sum + categoryTotal(c), 0)
  const subCount = tree.reduce((sum, c) => sum + c.subs.length, 0)
  const itemCount = tree.reduce((sum, c) => sum + c.subs.reduce((n, s) => n + s.items.length, 0), 0)
  function handleExport() {
    const lines = [['Kategori', 'Sub kategori', 'Item', 'Nominal']]
    tree.forEach((c) =>
      c.subs.forEach((s) => s.items.forEach((i) => lines.push([c.name, s.name, i.name, i.amount]))),
    )
    exportCsv('accounts-report.csv', lines)
    notify('Laporan accounts diunduh.')
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Reports
          </div>
          <h1>Laporan per kategori</h1>
          <p>Ringkasan nominal dari struktur Accounts Anda.</p>
        </div>
        <div className="heading-actions">
          <button className="primary-button" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>
      <div className="metrics-grid">
        <MetricCard icon={Receipt} label="Total nominal" value={formatRp(total)} />
        <MetricCard icon={WalletCards} label="Kategori" value={`${tree.length}`} />
        <MetricCard icon={Layers} label="Sub kategori" value={`${subCount}`} />
        <MetricCard icon={ListTree} label="Item" value={`${itemCount}`} />
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Porsi per kategori</h2>
            <p>
              Atur datanya di halaman{' '}
              <Link href="/accounts" className="inline-link">
                Accounts
              </Link>
            </p>
          </div>
        </div>
        <div className="share-list">
          {tree.map((c) => {
            const value = categoryTotal(c)
            const percent = total ? Math.round((value / total) * 100) : 0
            return (
              <div className="share-row" key={c.id}>
                <div className="share-top">
                  <b>{c.name}</b>
                  <span>
                    {formatRp(value)} · {percent}%
                  </span>
                </div>
                <div className="share-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
          {tree.length === 0 && <p className="empty-cell">Belum ada kategori.</p>}
        </div>
      </section>
      <PageFooter />
    </>
  )
}
