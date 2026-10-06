import { categoryTotal, subTotal } from '@/lib/accountsTree'
import { formatRp } from '@/lib/formatters'

/** Pohon kategori > sub kategori > item, hanya tampilan (tanpa tombol ubah/hapus). */
export function ReadOnlyAccountTree({ tree }) {
  if (tree.length === 0) return <p className="empty-cell">Pengguna ini belum memiliki kategori.</p>

  return (
    <div className="account-list">
      {tree.map((category) => (
        <section key={category.id} className="panel account-card">
          <div className="node-row">
            <div className="node-main">
              <b>{category.name}</b>
              <small>{category.subs.length} sub kategori</small>
            </div>
            <strong className="node-amount">{formatRp(categoryTotal(category))}</strong>
          </div>
          <div className="node-children">
            {category.subs.map((sub) => (
              <div className="sub-block" key={sub.id}>
                <div className="node-row">
                  <div className="node-main">
                    <b>{sub.name}</b>
                    <small>{sub.items.length} item</small>
                  </div>
                  <strong className="node-amount">{formatRp(subTotal(sub.items))}</strong>
                </div>
                <ul className="item-list">
                  {sub.items.map((item) => (
                    <li key={item.id} className="node-row item-row">
                      <span className="node-main">{item.name}</span>
                      <span className="node-amount">{formatRp(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
