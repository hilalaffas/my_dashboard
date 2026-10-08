'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
import { adminApi } from '@/services/adminService'

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/

/** Membuat akun baru: hanya username dan password. Akun langsung aktif sebagai pengguna biasa. */
export function CreateUserModal({ onClose, onCreated }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function validate() {
    const name = username.trim()
    if (name.length < 3) return 'Username minimal 3 karakter.'
    if (!USERNAME_PATTERN.test(name)) return 'Username hanya boleh huruf, angka, titik, garis bawah, dan strip.'
    if (password.length < 8) return 'Password minimal 8 karakter.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validate()
    if (problem) return setError(problem)
    setSaving(true)
    setError('')
    try {
      onCreated(await adminApi.createUser(username.trim(), password))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun.')
      setSaving(false)
    }
  }

  return (
    <Modal title="Akun baru" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="mis. budi.santoso"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={60}
            autoFocus
          />
        </label>
        <label>
          Password
          <div className="lg-password mg-password">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              maxLength={72}
            />
            <button type="button" className="lg-toggle" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
              {showPassword ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
        </label>
        <p className="pf-help">
          Username disimpan dalam huruf kecil dan dipakai untuk masuk. Pemilik akun bisa mengganti password sendiri setelah masuk.
        </p>
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
            {saving ? 'Membuat…' : 'Buat akun'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
