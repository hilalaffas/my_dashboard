'use client'
import { formatRp } from '@/lib/formatters'
import { ModeToggle } from './modeToggle'

function Variance({ value }) {
  if (Math.abs(value) < 0.005) return <span className="dt-even">Sesuai rencana</span>
  return value > 0 ? (
    <span className="dt-save">Hemat {formatRp(value)}</span>
  ) : (
    <span className="dt-over">Lebih {formatRp(-value)}</span>
  )
}

/** Rekonsiliasi per item: anggaran bulan ini, rencana dan aktual sampai hari ini, selisih, dan proyeksi akhir bulan. */
export function ReconcileTable({ items, totals, busyId, readOnly = false, onModeChange, onJump }) {
  return (
    <div className="table-wrap">
      <table className="dt-table">
        <thead>
          <tr>
            <th>ITEM</th>
            <th>MODE</th>
            <th className="numeric">ANGGARAN BULAN</th>
            <th className="numeric">RENCANA S/D HARI INI</th>
            <th className="numeric">AKTUAL</th>
            <th className="numeric">SELISIH</th>
            <th className="numeric">PROYEKSI</th>
            <th>PROGRES</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.itemId}>
              <td>
                <b>{item.name}</b>
                <small className="line-source">{item.path}</small>
                {!readOnly && item.pending > 0 && (
                  <button type="button" className="dt-pending" onClick={() => onJump(item.firstPending)}>
                    {item.pending} hari belum diisi
                  </button>
                )}
              </td>
              <td>
                <ModeToggle
                  mode={item.mode}
                  label={`Mode ${item.name}`}
                  disabled={readOnly || busyId === item.itemId}
                  onChange={(mode) => onModeChange(item.itemId, mode)}
                />
              </td>
              <td className="numeric">{formatRp(item.budget)}</td>
              <td className="numeric">{formatRp(item.plannedToDate)}</td>
              <td className="numeric">{formatRp(item.actualToDate)}</td>
              <td className="numeric">
                <Variance value={item.variance} />
              </td>
              <td className={`numeric${item.projection > item.budget + 0.005 ? ' dt-over' : ''}`}>{formatRp(item.projection)}</td>
              <td>
                <span className="dt-bar" role="img" aria-label={`Terpakai ${Math.round(item.progress * 100)} persen dari anggaran`}>
                  <i className={item.progress > 1 ? 'is-over' : ''} style={{ transform: `scaleX(${Math.min(item.progress, 1)})` }} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2}>TOTAL</th>
            <th className="numeric">{formatRp(totals.budget)}</th>
            <th className="numeric">{formatRp(totals.plannedToDate)}</th>
            <th className="numeric">{formatRp(totals.actualToDate)}</th>
            <th className="numeric">
              <Variance value={totals.variance} />
            </th>
            <th className="numeric">{formatRp(totals.projection)}</th>
            <th />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
