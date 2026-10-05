'use client'
import { ChevronRight, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { categoryTotal, subTotal } from '@/lib/accountsTree'
import { formatRp } from '@/lib/formatters'
export function CategoryCard({ category, open, onToggle, onRequest }) {
  const categoryId = category.id
  return (
    <section className="panel account-card">
      <div className="node-row category-row-node">
        <button
          className={`chevron ${open ? 'open' : ''}`}
          aria-label={open ? 'Ciutkan' : 'Buka'}
          aria-expanded={open}
          onClick={onToggle}
        >
          <ChevronRight size={16} />
        </button>
        <div className="node-main">
          <b>{category.name}</b>
          <small>{category.subs.length} sub kategori</small>
        </div>
        <strong className="node-amount">{formatRp(categoryTotal(category))}</strong>
        <div className="row-actions">
          <button
            className="icon-action"
            aria-label={`Tambah sub kategori di ${category.name}`}
            onClick={() => onRequest({ kind: 'form', mode: 'create', level: 'sub', categoryId })}
          >
            <FolderPlus size={15} />
          </button>
          <button
            className="icon-action"
            aria-label={`Ubah ${category.name}`}
            onClick={() =>
              onRequest({
                kind: 'form',
                mode: 'edit',
                level: 'category',
                categoryId,
                initial: { name: category.name, amount: 0 },
              })
            }
          >
            <Pencil size={15} />
          </button>
          <button
            className="icon-action danger"
            aria-label={`Hapus ${category.name}`}
            onClick={() => onRequest({ kind: 'delete', level: 'category', categoryId, label: category.name })}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {open && (
        <div className="node-children">
          {category.subs.length === 0 && <p className="empty-cell">Belum ada sub kategori.</p>}
          {category.subs.map((sub) => (
            <div className="sub-block" key={sub.id}>
              <div className="node-row">
                <div className="node-main">
                  <b>{sub.name}</b>
                  <small>{sub.items.length} item</small>
                </div>
                <strong className="node-amount">{formatRp(subTotal(sub.items))}</strong>
                <div className="row-actions">
                  <button
                    className="icon-action"
                    aria-label={`Tambah item di ${sub.name}`}
                    onClick={() =>
                      onRequest({ kind: 'form', mode: 'create', level: 'item', categoryId, subId: sub.id })
                    }
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    className="icon-action"
                    aria-label={`Ubah ${sub.name}`}
                    onClick={() =>
                      onRequest({
                        kind: 'form',
                        mode: 'edit',
                        level: 'sub',
                        categoryId,
                        subId: sub.id,
                        initial: { name: sub.name, amount: 0 },
                      })
                    }
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-action danger"
                    aria-label={`Hapus ${sub.name}`}
                    onClick={() =>
                      onRequest({ kind: 'delete', level: 'sub', categoryId, subId: sub.id, label: sub.name })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <ul className="item-list">
                {sub.items.map((item) => (
                  <li className="node-row item-row" key={item.id}>
                    <span className="node-main">{item.name}</span>
                    <span className="node-amount">{formatRp(item.amount)}</span>
                    <div className="row-actions">
                      <button
                        className="icon-action"
                        aria-label={`Ubah ${item.name}`}
                        onClick={() =>
                          onRequest({
                            kind: 'form',
                            mode: 'edit',
                            level: 'item',
                            categoryId,
                            subId: sub.id,
                            itemId: item.id,
                            initial: { name: item.name, amount: item.amount },
                          })
                        }
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-action danger"
                        aria-label={`Hapus ${item.name}`}
                        onClick={() =>
                          onRequest({
                            kind: 'delete',
                            level: 'item',
                            categoryId,
                            subId: sub.id,
                            itemId: item.id,
                            label: item.name,
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
