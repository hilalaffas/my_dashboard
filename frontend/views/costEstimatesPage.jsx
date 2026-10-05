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
import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/confirmDialog'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { EstimateFormModal } from '@/components/estimates/estimateFormModal'
import { useEstimates } from '@/hooks/useEstimates'
import { exportCsv } from '@/lib/exportCsv'
import { formatRp } from '@/lib/formatters'
export function CostEstimatesPage() {
  const notify = useToast()
  const { rows, actions } = useEstimates(notify)
  const [dialog, setDialog] = useState(null)
  const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0)
  const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0)
  function handleExport() {
    exportCsv('cost-estimates.csv', [
      ['Type', 'Detail', 'Debit', 'Credit', 'Balance'],
      ...rows.map((r) => [r.type, r.detail, r.debit, r.credit, r.credit - r.debit]),
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
          <p>Detail debit, kredit, dan saldo dari cost estimate bulanan Anda.</p>
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
        <MetricCard icon={CircleDollarSign} label="Total debit" value={formatRp(totalDebit)} change="3.2%" />
        <MetricCard
          icon={WalletCards}
          label="Total credit"
          value={formatRp(totalCredit)}
          change="1.8%"
          tone="orange"
        />
        <MetricCard
          icon={Receipt}
          label="Net estimate"
          value={formatRp(totalCredit - totalDebit)}
          change="4.6%"
        />
        <MetricCard icon={Target} label="Line items" value={`${rows.length}`} change="12.5%" />
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
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="estimate-type">{row.type}</span>
                  </td>
                  <td>
                    <b>{row.detail}</b>
                  </td>
                  <td className="numeric debit-cell">{row.debit ? formatRp(row.debit) : '—'}</td>
                  <td className="numeric credit-cell">{row.credit ? formatRp(row.credit) : '—'}</td>
                  <td className="numeric balance-cell">{formatRp(row.credit - row.debit)}</td>
                  <td className="numeric">
                    <div className="row-actions">
                      <button
                        className="icon-action"
                        aria-label={`Ubah ${row.detail}`}
                        onClick={() => setDialog({ kind: 'edit', row })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-action danger"
                        aria-label={`Hapus ${row.detail}`}
                        onClick={() => setDialog({ kind: 'delete', row })}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Belum ada estimasi. Klik “New estimate” untuk menambah.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={2}>TOTAL</th>
                <th className="numeric">{formatRp(totalDebit)}</th>
                <th className="numeric">{formatRp(totalCredit)}</th>
                <th className="numeric">{formatRp(totalCredit - totalDebit)}</th>
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
