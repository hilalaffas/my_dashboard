'use client'
import {
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  Pencil,
  Plus,
  Receipt,
  Target,
  Trash2,
  WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/confirmDialog'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { EstimateFormModal } from '@/components/estimates/estimateFormModal'
import { useAccounts } from '@/hooks/useAccounts'
import { useEstimates } from '@/hooks/useEstimates'
import { buildCostLines, totalsOf } from '@/lib/costLines'
import { exportCsv } from '@/lib/exportCsv'
import { formatRp } from '@/lib/formatters'

export function CostEstimatesPage() {
  const notify = useToast()
  const { tree, ready: accountsReady } = useAccounts(notify)
  const { rows: manualRows, actions, ready: estimatesReady } = useEstimates(notify)
  const [dialog, setDialog] = useState(null)

  const lines = useMemo(() => buildCostLines(tree, manualRows), [tree, manualRows])
  const { debit: totalDebit, credit: totalCredit, balance } = totalsOf(lines)
  const ready = accountsReady && estimatesReady

  function handleExport() {
    exportCsv('cost-estimates.csv', [
      ['Type', 'Detail', 'Sumber', 'Debit', 'Credit', 'Balance'],
      ...lines.map((l) => [
        l.type,
        l.detail,
        l.source === 'account' ? `Accounts › ${l.group}` : 'Manual',
        l.debit,
        l.credit,
        l.credit - l.debit,
      ]),
    ])
    notify('File CSV diunduh.')
  }

  return (
    <div className="cost-detail-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Cost estimates
          </div>
          <h1>Rincian anggaran biaya</h1>
          <p>Item dari Accounts tampil otomatis di sini. Gunakan New estimate untuk pemasukan atau biaya di luar Accounts.</p>
        </div>
        <div className="heading-actions">
          <button className="outline-button" onClick={handleExport}>
            <Download size={16} /> Export report
          </button>
          <button className="primary-button" onClick={() => setDialog({ kind: 'create' })}>
            <Plus size={17} /> New estimate
          </button>
        </div>
      </div>

      <div className="metrics-grid cost-metrics">
        <MetricCard icon={CircleDollarSign} label="Total debit" value={formatRp(totalDebit)} />
        <MetricCard icon={WalletCards} label="Total credit" value={formatRp(totalCredit)} tone="orange" />
        <MetricCard icon={Receipt} label="Net estimate" value={formatRp(balance)} />
        <MetricCard icon={Target} label="Line items" value={`${lines.length}`} />
      </div>

      <section className="panel detail-table-panel">
        <div className="panel-heading">
          <div>
            <h2>Rincian anggaran biaya</h2>
            <p>Daftar lengkap pengeluaran berdasarkan tipe dan detail</p>
          </div>
          <button className="outline-button" onClick={handleExport}>
            <FileSpreadsheet size={16} /> Source sheet
          </button>
        </div>
        <div className="table-wrap">
          <table className="estimate-table">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>DETAIL</th>
                <th className="numeric">DEBIT</th>
                <th className="numeric">CREDIT</th>
                <th className="numeric">BALANCE</th>
                <th className="numeric">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id}>
                  <td>
                    <span className="estimate-type">{line.type}</span>
                  </td>
                  <td>
                    <b>{line.detail}</b>
                    <small className="line-source">
                      {line.source === 'account' ? `Accounts › ${line.group}` : 'Manual'}
                    </small>
                  </td>
                  <td className="numeric debit-cell">{line.debit ? formatRp(line.debit) : '—'}</td>
                  <td className="numeric credit-cell">{line.credit ? formatRp(line.credit) : '—'}</td>
                  <td className="numeric balance-cell">{formatRp(line.credit - line.debit)}</td>
                  <td className="numeric">
                    {line.source === 'account' ? (
                      <Link href="/accounts" className="inline-link" aria-label={`Atur ${line.detail} di Accounts`}>
                        Atur di Accounts
                      </Link>
                    ) : (
                      <div className="row-actions">
                        <button
                          className="icon-action"
                          aria-label={`Ubah ${line.detail}`}
                          onClick={() => setDialog({ kind: 'edit', row: line })}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-action danger"
                          aria-label={`Hapus ${line.detail}`}
                          onClick={() => setDialog({ kind: 'delete', row: line })}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    {ready ? (
                      <>
                        Belum ada data. Tambahkan item di{' '}
                        <Link href="/accounts" className="inline-link">
                          Accounts
                        </Link>{' '}
                        atau klik “New estimate”.
                      </>
                    ) : (
                      'Memuat…'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={2}>TOTAL</th>
                <th className="numeric">{formatRp(totalDebit)}</th>
                <th className="numeric">{formatRp(totalCredit)}</th>
                <th className="numeric">{formatRp(balance)}</th>
                <th />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <PageFooter />

      {dialog?.kind === 'create' && (
        <EstimateFormModal
          title="Estimasi baru"
          onClose={() => setDialog(null)}
          onSubmit={async (v) => {
            if (await actions.add(v)) {
              setDialog(null)
              notify('Estimasi ditambahkan.')
            }
          }}
        />
      )}
      {dialog?.kind === 'edit' && (
        <EstimateFormModal
          title="Ubah estimasi"
          initial={dialog.row}
          onClose={() => setDialog(null)}
          onSubmit={async (v) => {
            if (await actions.update(dialog.row.id, v)) {
              setDialog(null)
              notify('Estimasi diperbarui.')
            }
          }}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Hapus estimasi"
          message={`Hapus “${dialog.row.detail}” dari daftar?`}
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            if (await actions.remove(dialog.row.id)) {
              setDialog(null)
              notify('Estimasi dihapus.')
            }
          }}
        />
      )}
    </div>
  )
}
