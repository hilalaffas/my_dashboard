'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
import { COLUMN_TYPES } from '@/lib/pivot'

/** Membuat kolom baru (pilih jenis) atau mengubah kolom (jenis terkunci, karena nilai yang ada terikat pada jenisnya). */
export function ColumnFormModal({ column, onClose, onSubmit }) {
  const editing = Boolean(column)
  const [name, setName] = useState(column?.name ?? '')
  const [type, setType] = useState(column?.type ?? 'TEXT')
  const [optionsText, setOptionsText] = useState((column?.options ?? []).join('\n'))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Nama kolom wajib diisi.')
    const options = optionsText
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean)
    if (type === 'SELECT' && options.length === 0) return setError('Tambahkan minimal satu pilihan.')
    setSaving(true)
    setError('')
    const ok = await onSubmit({ name: trimmed, type, options: type === 'SELECT' ? options : [] })
    if (!ok) setSaving(false)
  }

  return (
    <Modal title={editing ? 'Ubah kolom' : 'Kolom baru'} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          Nama kolom
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Jatuh tempo, Metode bayar, Catatan"
            maxLength={60}
            autoFocus
          />
        </label>

        <div className="pv-field">
          <span className="pv-field-label">Jenis isi</span>
          <div className="pv-types" role="radiogroup" aria-label="Jenis isi kolom">
            {COLUMN_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={type === option.value}
                className="pv-type"
                disabled={editing && type !== option.value}
                onClick={() => !editing && setType(option.value)}
              >
                <b>{option.label}</b>
                <small>{option.hint}</small>
              </button>
            ))}
          </div>
          {editing && <p className="pf-help">Jenis kolom tidak bisa diganti setelah dibuat.</p>}
        </div>

        {type === 'SELECT' && (
          <label>
            Pilihan (satu per baris)
            <textarea
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              rows={4}
              placeholder={'Tunai\nTransfer\nE-wallet'}
            />
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
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Menyimpan…' : editing ? 'Simpan' : 'Buat kolom'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
