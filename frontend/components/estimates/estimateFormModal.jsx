'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
export function EstimateFormModal({ title, initial, onSubmit, onClose }) {
  const [type, setType] = useState(initial?.type ?? '')
  const [detail, setDetail] = useState(initial?.detail ?? '')
  const [debit, setDebit] = useState(String(initial?.debit ?? 0))
  const [credit, setCredit] = useState(String(initial?.credit ?? 0))
  const [error, setError] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    const debitValue = Number(debit)
    const creditValue = Number(credit)
    if (!type.trim() || !detail.trim()) return setError('Type dan detail wajib diisi.')
    if (!(debitValue >= 0) || !(creditValue >= 0)) return setError('Nominal tidak boleh negatif.')
    onSubmit({ type: type.trim(), detail: detail.trim(), debit: debitValue, credit: creditValue })
  }
  return (
    <Modal title={title} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Type
          <input value={type} onChange={(e) => setType(e.target.value)} autoFocus />
        </label>
        <label>
          Detail
          <input value={detail} onChange={(e) => setDetail(e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            Debit (Rp)
            <input type="number" min={0} value={debit} onChange={(e) => setDebit(e.target.value)} />
          </label>
          <label>
            Credit (Rp)
            <input type="number" min={0} value={credit} onChange={(e) => setCredit(e.target.value)} />
          </label>
        </div>
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
