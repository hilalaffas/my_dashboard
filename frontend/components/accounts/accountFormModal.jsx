'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
const levelLabel = { category: 'kategori', sub: 'sub kategori', item: 'item' }
export function AccountFormModal({ level, mode, parentLabel, initial, onSubmit, onClose }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(String(initial?.amount ?? 0))
  const [error, setError] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    const amountValue = Number(amount)
    if (!name.trim()) return setError(`Nama ${levelLabel[level]} wajib diisi.`)
    if (level === 'item' && !(amountValue >= 0)) return setError('Nominal tidak boleh negatif.')
    onSubmit({ name: name.trim(), amount: level === 'item' ? amountValue : 0 })
  }
  return (
    <Modal title={`${mode === 'create' ? 'Tambah' : 'Ubah'} ${levelLabel[level]}`} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {parentLabel && (
          <p className="modal-text">
            Di dalam: <b>{parentLabel}</b>
          </p>
        )}
        <label>
          Nama {levelLabel[level]}
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        {level === 'item' && (
          <label>
            Nominal (Rp)
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="primary-button">
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  )
}
