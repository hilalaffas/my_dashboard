'use client'
import { CircleDollarSign, Columns3, Download, Plus, Receipt, Target, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/confirmDialog'
import { MetricCard } from '@/components/common/metricCard'
import { PageFooter } from '@/components/common/pageFooter'
import { useToast } from '@/components/common/toastProvider'
import { ColumnFormModal } from '@/components/costs/columnFormModal'
import { PivotTable } from '@/components/costs/pivotTable'
import { EstimateFormModal } from '@/components/estimates/estimateFormModal'
import { useAccounts } from '@/hooks/useAccounts'
import { useCostColumns } from '@/hooks/useCostColumns'
import { useEstimates } from '@/hooks/useEstimates'
import { useMonthBudget } from '@/hooks/useMonthBudget'
import { useStoredState } from '@/hooks/useStoredState'
import { exportCsv } from '@/lib/exportCsv'
import { formatRp } from '@/lib/formatters'
import { buildGroups, collapsibleCategoryIds, itemsOf, sumItems } from '@/lib/pivot'

export function CostEstimatesPage() {
  const notify = useToast()
  const { tree, ready: accountsReady } = useAccounts(notify)
  const { rows: manualRows, actions, ready: estimatesReady } = useEstimates(notify)
  const cols = useCostColumns(notify)
  const { budgetOf, monthLabel, ready: budgetReady } = useMonthBudget(notify)
  const [collapsedIds, setCollapsedIds] = useStoredState('sims.cost.collapsed', [])
  const [dialog, setDialog] = useState(null) // estimasi manual: { kind: 'create' | 'edit' | 'delete', row? }
  const [colDialog, setColDialog] = useState(null) // kolom: { kind: 'add' | 'edit' | 'delete', column? }

  const groups = useMemo(() => buildGroups(tree, manualRows, budgetOf), [tree, manualRows, budgetOf])
  const collapsed = useMemo(() => new Set(collapsedIds), [collapsedIds])
  const all = useMemo(() => groups.flatMap(itemsOf), [groups])
  const total = sumItems(all)
  const ready = accountsReady && estimatesReady && cols.ready && budgetReady

  function toggle(id) {
    setCollapsedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleExport() {
    const header = ['Kategori', 'Sub kategori', 'Item', 'Debit', 'Credit', 'Balance', ...cols.columns.map((c) => c.name)]
    const body = groups.flatMap((cat) =>
      cat.subs.flatMap((sub) =>
        sub.items.map((item) => [
          cat.name,
          sub.name,
          item.name,
          item.debit,
          item.credit,
          item.credit - item.debit,
          ...cols.columns.map((c) => {
            const v = cols.valueOf(c.id, item.rowType, item.id) ?? ''
            return c.type === 'CHECKBOX' ? (v === 'true' ? 'Ya' : '') : v
          }),
        ]),
      ),
    )
    exportCsv('cost-estimates.csv', [header, ...body])
    notify('File CSV diunduh.')
  }

  async function submitColumn(body) {
    const ok =
      colDialog.kind === 'add'
        ? await cols.actions.addColumn(body)
        : await cols.actions.updateColumn(colDialog.column.id, { name: body.name, options: body.options })
    if (ok) {
      setColDialog(null)
      notify(colDialog.kind === 'add' ? 'Kolom ditambahkan.' : 'Kolom diperbarui.')
    }
    return ok
  }

  return (
    <div className="cost-detail-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Cost estimates
          </div>
          <h1>Rincian anggaran biaya</h1>
          <p>
            Kategori, sub kategori, dan item mengikuti Accounts. Gunakan New estimate untuk pemasukan atau biaya di luar
            Accounts.
          </p>
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
        <MetricCard icon={CircleDollarSign} label="Total debit" value={formatRp(total.debit)} />
        <MetricCard icon={WalletCards} label="Total credit" value={formatRp(total.credit)} tone="orange" />
        <MetricCard icon={Receipt} label="Net estimate" value={formatRp(total.balance)} />
        <MetricCard icon={Target} label="Line items" value={`${all.length}`} />
      </div>

      <section className="panel detail-table-panel">
        <div className="panel-heading">
          <div>
            <h2>Tabel pivot biaya</h2>
            <p>
              Anggaran {monthLabel || 'bulan ini'}. Klik tanda − atau + pada kategori dan sub kategori untuk menutup atau
              membuka rinciannya
            </p>
          </div>
          <div className="pv-toolbar">
            <button className="outline-button" onClick={() => setCollapsedIds([])}>
              Perluas semua
            </button>
            <button className="outline-button" onClick={() => setCollapsedIds(collapsibleCategoryIds(groups))}>
              Ciutkan semua
            </button>
            <button
              className="outline-button"
              onClick={() => setColDialog({ kind: 'add' })}
              disabled={!cols.supported}
              title={cols.supported ? 'Tambah kolom sendiri' : 'Kolom kustom membutuhkan backend'}
            >
              <Columns3 size={16} /> Kolom baru
            </button>
          </div>
        </div>

        <PivotTable
          groups={groups}
          collapsed={collapsed}
          columns={cols.columns}
          valueOf={cols.valueOf}
          ready={ready}
          onToggle={toggle}
          onCellSave={cols.actions.setCell}
          onInvalid={notify}
          onEditManual={(row) => setDialog({ kind: 'edit', row })}
          onDeleteManual={(row) => setDialog({ kind: 'delete', row })}
          onEditColumn={(column) => setColDialog({ kind: 'edit', column })}
          onMoveColumn={(column, direction) => cols.actions.moveColumn(column.id, direction)}
          onDeleteColumn={(column) => setColDialog({ kind: 'delete', column })}
        />
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

      {(colDialog?.kind === 'add' || colDialog?.kind === 'edit') && (
        <ColumnFormModal column={colDialog.column} onClose={() => setColDialog(null)} onSubmit={submitColumn} />
      )}
      {colDialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Hapus kolom"
          message={`Hapus kolom “${colDialog.column.name}”? Semua isinya ikut terhapus dan tidak bisa dikembalikan.`}
          onClose={() => setColDialog(null)}
          onConfirm={async () => {
            if (await cols.actions.removeColumn(colDialog.column.id)) {
              setColDialog(null)
              notify('Kolom dihapus.')
            }
          }}
        />
      )}
    </div>
  )
}
