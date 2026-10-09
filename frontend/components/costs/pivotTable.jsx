'use client'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { formatRp } from '@/lib/formatters'
import { buildPivotRows, isNumericType, itemsOf, sumItems } from '@/lib/pivot'
import { ColumnHeader } from './columnHeader'
import { formatCell, PivotCell } from './pivotCell'

const money = (n) => (n ? formatRp(n) : '—')
const FIXED_COLUMNS = 7 // kategori, sub, item, debit, credit, balance, aksi

function Toggle({ expanded, label, onClick }) {
  return <button type="button" className="pv-toggle" aria-expanded={expanded} aria-label={label} onClick={onClick} />
}

function CustomCells({ row, ctx }) {
  return ctx.columns.map((column) => {
    if (row.kind === 'item') {
      const { item } = row
      return (
        <td key={column.id} className={`pv-custom pv-t-${column.type.toLowerCase()}`}>
          <PivotCell
            column={column}
            value={ctx.valueOf(column.id, item.rowType, item.id)}
            onCommit={(value) => ctx.onCellSave(column.id, item.rowType, item.id, value)}
            onInvalid={ctx.onInvalid}
          />
        </td>
      )
    }
    // Baris ringkasan: kolom angka dan rupiah dijumlahkan; jenis lain dikosongkan
    if (isNumericType(column.type) && row.items?.length) {
      const total = row.items.reduce((n, it) => n + (Number(ctx.valueOf(column.id, it.rowType, it.id)) || 0), 0)
      return (
        <td key={column.id} className={`pv-custom pv-agg pv-t-${column.type.toLowerCase()}`}>
          {total ? formatCell(column, String(total)) : ''}
        </td>
      )
    }
    return <td key={column.id} className="pv-custom" />
  })
}

function TailCell({ row, ctx }) {
  if (row.kind !== 'item') return <td className="pv-tail" />
  const { item } = row
  if (item.rowType === 'ITEM') {
    return (
      <td className="pv-tail">
        <Link href="/accounts" className="pv-link" aria-label={`Atur ${item.name} di Accounts`}>
          Atur
        </Link>
      </td>
    )
  }
  return (
    <td className="pv-tail">
      <div className="row-actions">
        <button className="icon-action" aria-label={`Ubah ${item.name}`} onClick={() => ctx.onEditManual(item.raw)}>
          <Pencil size={15} />
        </button>
        <button className="icon-action danger" aria-label={`Hapus ${item.name}`} onClick={() => ctx.onDeleteManual(item.raw)}>
          <Trash2 size={15} />
        </button>
      </div>
    </td>
  )
}

function PivotRow({ row, ctx }) {
  const sum = sumItems(row.items ?? [])
  const className = `pv-row pv-${row.kind}${ctx.isNew(row.key) ? ' is-new' : ''}`

  const values = (
    <>
      <td className="pv-num pv-debit">{money(sum.debit)}</td>
      <td className="pv-num pv-credit">{money(sum.credit)}</td>
      <td className="pv-num pv-balance">{sum.debit || sum.credit ? formatRp(sum.balance) : '—'}</td>
      <CustomCells row={row} ctx={ctx} />
      <TailCell row={row} ctx={ctx} />
    </>
  )

  if (row.kind === 'cat-total') {
    return (
      <tr className={className}>
        <td colSpan={3} className="pv-total-label">
          Total {row.cat.name}
        </td>
        {values}
      </tr>
    )
  }

  const catExpanded = row.kind !== 'cat-collapsed'
  const catCell = row.catSpan ? (
    <td rowSpan={row.catSpan} className="pv-group pv-cat">
      <div className="pv-group-inner">
        {row.kind !== 'cat-empty' && (
          <Toggle
            expanded={catExpanded}
            label={`${catExpanded ? 'Ciutkan' : 'Buka'} ${row.cat.name}`}
            onClick={() => ctx.onToggle(row.cat.id)}
          />
        )}
        <span className="pv-group-name">{row.cat.name}</span>
      </div>
    </td>
  ) : null

  if (row.kind === 'cat-collapsed' || row.kind === 'cat-empty') {
    return (
      <tr className={className}>
        {catCell}
        <td colSpan={2} className="pv-muted">
          {row.kind === 'cat-empty'
            ? 'Belum ada sub kategori'
            : `${row.cat.subs.length} sub · ${row.items.length} item`}
        </td>
        {values}
      </tr>
    )
  }

  const subExpanded = row.kind !== 'sub-collapsed'
  const subCell = row.subSpan ? (
    <td rowSpan={row.subSpan} className="pv-group pv-sub">
      <div className="pv-group-inner">
        {row.kind !== 'sub-empty' && (
          <Toggle
            expanded={subExpanded}
            label={`${subExpanded ? 'Ciutkan' : 'Buka'} ${row.sub.name}`}
            onClick={() => ctx.onToggle(row.sub.id)}
          />
        )}
        <span className="pv-group-name">{row.sub.name}</span>
      </div>
    </td>
  ) : null

  let itemCell
  if (row.kind === 'item')
    itemCell = (
      <td className="pv-item">
        {row.item.name}
        {row.item.hint && <small className="pv-hint">{row.item.hint}</small>}
      </td>
    )
  else if (row.kind === 'sub-total') itemCell = <td className="pv-item pv-subtotal-label">Subtotal</td>
  else if (row.kind === 'sub-collapsed') itemCell = <td className="pv-muted">{row.items.length} item</td>
  else itemCell = <td className="pv-muted">Belum ada item</td>

  return (
    <tr className={className}>
      {catCell}
      {subCell}
      {itemCell}
      {values}
    </tr>
  )
}

/**
 * Tabel pivot bentuk tabular: kategori, sub kategori, dan item berjajar ke samping (sel gabungan),
 * tombol − / + di sel kategori dan sub untuk menutup atau membuka bloknya. Kolom kustom ada di kanan.
 */
export function PivotTable({
  groups,
  collapsed,
  columns,
  valueOf,
  ready,
  onToggle,
  onCellSave,
  onInvalid,
  onEditManual,
  onDeleteManual,
  onEditColumn,
  onMoveColumn,
  onDeleteColumn,
}) {
  const rows = buildPivotRows(groups, collapsed)

  // Hanya baris yang baru muncul setelah tabel tampil (mis. blok dibuka) yang diberi animasi masuk
  const seen = useRef(new Set())
  const animate = seen.current.size > 0
  useEffect(() => {
    seen.current = new Set(rows.map((r) => r.key))
  })

  const ctx = {
    columns,
    valueOf,
    onToggle,
    onCellSave,
    onInvalid,
    onEditManual,
    onDeleteManual,
    isNew: (key) => animate && !seen.current.has(key),
  }

  const all = groups.flatMap(itemsOf)
  const total = sumItems(all)

  return (
    <div className="pv-wrap">
      <table className="pv-table">
        <thead>
          <tr>
            <th scope="col">KATEGORI</th>
            <th scope="col">SUB KATEGORI</th>
            <th scope="col">ITEM</th>
            <th scope="col" className="pv-num">
              DEBIT
            </th>
            <th scope="col" className="pv-num">
              CREDIT
            </th>
            <th scope="col" className="pv-num">
              BALANCE
            </th>
            {columns.map((column, i) => (
              <ColumnHeader
                key={column.id}
                column={column}
                canMoveLeft={i > 0}
                canMoveRight={i < columns.length - 1}
                onEdit={onEditColumn}
                onMove={onMoveColumn}
                onDelete={onDeleteColumn}
              />
            ))}
            <th scope="col" className="pv-tail">
              AKSI
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PivotRow key={row.key} row={row} ctx={ctx} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={FIXED_COLUMNS + columns.length} className="empty-cell">
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
        {rows.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={3}>TOTAL</td>
              <td className="pv-num">{formatRp(total.debit)}</td>
              <td className="pv-num">{formatRp(total.credit)}</td>
              <td className="pv-num">{formatRp(total.balance)}</td>
              {columns.map((column) => {
                const sum = isNumericType(column.type)
                  ? all.reduce((n, it) => n + (Number(valueOf(column.id, it.rowType, it.id)) || 0), 0)
                  : 0
                return (
                  <td key={column.id} className={`pv-custom pv-agg pv-t-${column.type.toLowerCase()}`}>
                    {sum ? formatCell(column, String(sum)) : ''}
                  </td>
                )
              })}
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
