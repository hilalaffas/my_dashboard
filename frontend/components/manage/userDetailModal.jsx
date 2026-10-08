'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
import { adminApi } from '@/services/adminService'

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Popup edit detail pengguna: nama, username, email, dan (opsional) password baru. Peran tidak bisa diubah. */
export function UserDetailModal({ user, onClose, onSaved }) {
  const [fullName, setFullName] = useState(user.fullName)
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const changed =
    fullName.trim() !== user.fullName ||
    username.trim().toLowerCase() !== user.username ||
    email.trim().toLowerCase() !== (user.email ?? '') ||
    newPassword !== ''

  function validate() {
    if (!fullName.trim()) return 'Nama lengkap wajib diisi.'
    const name = username.trim()
    if (name.length < 3) return 'Username minimal 3 karakter.'
    if (!USERNAME_PATTERN.test(name)) return 'Username hanya boleh huruf, angka, titik, garis bawah, dan strip.'
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) return 'Format email tidak valid.'
    if (newPassword && newPassword.length < 8) return 'Password baru minimal 8 karakter.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validate()
    if (problem) return setError(problem)
    setSaving(true)
    setError('')
    try {
      const updated = await adminApi.updateUser(user.id, {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim() || null,
        newPassword: newPassword || null,
      })
      onSaved(updated, { passwordChanged: newPassword !== '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.')
      setSaving(false)
    }
  }

  return (
    <Modal title="Detail pengguna" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          Nama lengkap
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} autoFocus />
        </label>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={60}
          />
        </label>
        <label>
          Email (opsional)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anda@contoh.com"
            autoComplete="off"
            maxLength={160}
          />
        </label>
        <label>
          Password baru (opsional)
          <div className="lg-password mg-password">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kosongkan jika tidak diubah"
              autoComplete="new-password"
              maxLength={72}
            />
            <button type="button" className="lg-toggle" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
              {showPassword ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
        </label>
        <p className="pf-help">
          Username dan email dipakai untuk masuk. Jika diganti, beri tahu pemilik akun. Mengganti password tidak memutus sesi yang
          sedang aktif; untuk memutus akses, nonaktifkan akun.
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
          <button type="submit" className="primary-button" disabled={!changed || saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
