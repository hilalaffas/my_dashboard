'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
import { adminApi } from '@/services/adminService'

/** Tambah atau ubah satu hari libur. Tanggal harus unik: satu baris per tanggal. */
export function HolidayModal({ holiday, defaultYear, onClose, onSaved }) {
  const editing = Boolean(holiday)
  const [date, setDate] = useState(holiday?.date ?? `${defaultYear}-01-01`)
  const [name, setName] = useState(holiday?.name ?? '')
  const [kind, setKind] = useState(holiday?.kind ?? 'NATIONAL')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date) return setError('Tanggal wajib diisi.')
    if (!name.trim()) return setError('Nama libur wajib diisi.')
    setSaving(true)
    setError('')
    try {
      const body = { date, name: name.trim(), kind }
      const saved = editing ? await adminApi.updateHoliday(holiday.id, body) : await adminApi.createHoliday(body)
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan hari libur.')
      setSaving(false)
    }
  }

  return (
    <Modal title={editing ? 'Ubah hari libur' : 'Hari libur baru'} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          Tanggal
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} autoFocus />
        </label>
        <label>
          Nama
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Hari Raya Waisak" maxLength={120} />
        </label>
        <label>
          Jenis
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="NATIONAL">Libur nasional</option>
            <option value="COLLECTIVE">Cuti bersama</option>
          </select>
        </label>
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
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
