'use client'
import { ChevronsDownUp, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AccountFormModal } from '@/components/accounts/accountFormModal'
import { CategoryCard } from '@/components/accounts/categoryCard'
import { ConfirmDialog } from '@/components/common/confirmDialog'
import { useToast } from '@/components/common/toastProvider'
import { useAccounts } from '@/hooks/useAccounts'
const levelLabel = { category: 'Kategori', sub: 'Sub kategori', item: 'Item' }
export function AccountsPage() {
  const notify = useToast()
  const { tree: data, actions, ready } = useAccounts(notify)
  const [dialog, setDialog] = useState(null)
  const [collapsed, setCollapsed] = useState(new Set())
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    const has = (text) => text.toLowerCase().includes(q)
    return data.flatMap((c) => {
      if (has(c.name)) return [c]
      const subs = c.subs.flatMap((s) =>
        has(s.name)
          ? [s]
          : [{ ...s, items: s.items.filter((i) => has(i.name)) }].filter((x) => x.items.length),
      )
      return subs.length ? [{ ...c, subs }] : []
    })
  }, [data, query])
  function toggle(id) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function parentLabel(d) {
    const category = data.find((c) => c.id === d.categoryId)
    if (d.level === 'sub') return category?.name
    if (d.level === 'item') return `${category?.name} › ${category?.subs.find((s) => s.id === d.subId)?.name}`
    return undefined
  }
  async function handleSubmit(d, value) {
    const { categoryId = '', subId = '', itemId = '' } = d
    let ok = true
    if (d.mode === 'create') {
      if (d.level === 'category') ok = await actions.addCategory(value.name)
      if (d.level === 'sub') ok = await actions.addSub(categoryId, value.name)
      if (d.level === 'item') ok = await actions.addItem(categoryId, subId, value.name, value.amount)
    } else {
      if (d.level === 'category') ok = await actions.updateCategory(categoryId, value.name)
      if (d.level === 'sub') ok = await actions.updateSub(categoryId, subId, value.name)
      if (d.level === 'item')
        ok = await actions.updateItem(categoryId, subId, itemId, value.name, value.amount)
    }
    if (!ok) return
    notify(`${levelLabel[d.level]} ${d.mode === 'create' ? 'ditambahkan' : 'diperbarui'}.`)
    setDialog(null)
  }
  async function handleDelete(d) {
    const { categoryId = '', subId = '', itemId = '' } = d
    let ok = true
    if (d.level === 'category') ok = await actions.removeCategory(categoryId)
    if (d.level === 'sub') ok = await actions.removeSub(categoryId, subId)
    if (d.level === 'item') ok = await actions.removeItem(categoryId, subId, itemId)
    if (!ok) return
    notify(`${levelLabel[d.level]} dihapus.`)
    setDialog(null)
  }
  const allCollapsed = data.length > 0 && data.every((c) => collapsed.has(c.id))
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Accounts
          </div>
          <h1>Pengaturan accounts</h1>
          <p>Susun struktur kategori, sub kategori, dan item. Semua perubahan tersimpan otomatis.</p>
        </div>
        <div className="heading-actions">
          <button
            className="outline-button"
            onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(data.map((c) => c.id)))}
            disabled={data.length === 0}
          >
            {allCollapsed ? (
              <>
                <ChevronsUpDown size={16} /> Buka semua
              </>
            ) : (
              <>
                <ChevronsDownUp size={16} /> Ciutkan semua
              </>
            )}
          </button>
          <button
            className="primary-button"
            onClick={() => setDialog({ kind: 'form', mode: 'create', level: 'category' })}
          >
            <Plus size={17} /> Tambah kategori
          </button>
        </div>
      </div>

      <label className="search-box">
        <Search size={16} />
        <input
          type="search"
          placeholder="Cari kategori, sub kategori, atau item"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari accounts"
        />
      </label>

      <div className="account-list">
        {!ready && <p className="empty-cell">Memuat data…</p>}
        {ready && filtered.length === 0 && (
          <div className="panel empty-state">
            <b>{query ? 'Tidak ada hasil' : 'Belum ada kategori'}</b>
            <p>{query ? 'Coba kata kunci lain.' : 'Mulai dengan menambahkan kategori pertama Anda.'}</p>
          </div>
        )}
        {filtered.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            open={Boolean(query) || !collapsed.has(c.id)}
            onToggle={() => toggle(c.id)}
            onRequest={setDialog}
          />
        ))}
      </div>

      {dialog?.kind === 'form' && (
        <AccountFormModal
          level={dialog.level}
          mode={dialog.mode}
          parentLabel={parentLabel(dialog)}
          initial={dialog.initial}
          onClose={() => setDialog(null)}
          onSubmit={(v) => handleSubmit(dialog, v)}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title={`Hapus ${levelLabel[dialog.level].toLowerCase()}`}
          message={
            dialog.level === 'item'
              ? `Hapus “${dialog.label}”?`
              : `Hapus “${dialog.label}” beserta seluruh isinya?`
          }
          onClose={() => setDialog(null)}
          onConfirm={() => handleDelete(dialog)}
        />
      )}
    </>
  )
}
