'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
import { authApi } from '@/services/authService'
export function ChangePasswordModal({ onClose, onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function handleSubmit(e) {
    e.preventDefault()
    if (!current) return setError('Password saat ini wajib diisi.')
    if (next.length < 8) return setError('Password baru minimal 8 karakter.')
    if (next !== confirm) return setError('Konfirmasi password tidak sama.')
    setSaving(true)
    setError('')
    try {
      await authApi.changePassword(current, next)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal title="Ubah password" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Password saat ini
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoFocus
          />
        </label>
        <label>
          Password baru
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>
        <label>
          Ulangi password baru
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
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
