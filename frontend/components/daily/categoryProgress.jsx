'use client'
import { formatRp } from '@/lib/formatters'

/** Anggaran lawan realisasi per kategori: batang terisi sesuai porsi yang sudah terpakai (merah bila melebihi anggaran). */
export function CategoryProgress({ rows }) {
  return (
    <ul className="dt-cats">
      {rows.map((row) => {
        const percent = Math.round(row.progress * 100)
        return (
          <li key={row.name} className="dt-cat">
            <div className="dt-cat-top">
              <b>{row.name}</b>
              <span>
                {formatRp(row.actualToDate)} <em>dari {formatRp(row.budget)}</em> · {percent}%
              </span>
            </div>
            <span className="dt-bar is-wide" role="img" aria-label={`${row.name}: terpakai ${percent} persen dari anggaran`}>
              <i className={row.progress > 1 ? 'is-over' : ''} style={{ transform: `scaleX(${Math.min(row.progress, 1)})` }} />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
