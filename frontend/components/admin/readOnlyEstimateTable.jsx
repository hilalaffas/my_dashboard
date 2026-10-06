import { formatRp } from '@/lib/formatters'

/** Tabel estimasi biaya, hanya tampilan. */
export function ReadOnlyEstimateTable({ rows }) {
  const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0)
  const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0)

  return (
    <div className="table-wrap">
      <table className="estimate-table">
        <thead>
          <tr>
            <th>TYPE</th>
            <th>DETAIL</th>
            <th className="numeric">DEBIT</th>
            <th className="numeric">CREDIT</th>
            <th className="numeric">BALANCE</th>
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
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-cell">
                Pengguna ini belum memiliki estimasi.
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
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
