'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useToast } from '@/components/common/toastProvider'
import { adminApi } from '@/services/adminService'

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/

export function ManageRegisterPage() {
  const notify = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState('')
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
    setCreated('')
    try {
      const user = await adminApi.createUser(username.trim(), password)
      setCreated(user.username)
      setUsername('')
      setPassword('')
      setShowPassword(false)
      notify(`Akun @${user.username} berhasil dibuat.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel mg-narrow">
      <div className="panel-heading">
        <div>
          <h2>Akun baru</h2>
          <p>Akun langsung aktif dengan peran pengguna biasa. Pemiliknya bisa mengganti password sendiri setelah masuk.</p>
        </div>
      </div>

      <form className="form mg-form" onSubmit={handleSubmit} noValidate>
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
            <button
              type="button"
              className="lg-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Sembunyi' : 'Lihat'}
            </button>
          </div>
        </label>
        <p className="pf-help">Username disimpan dalam huruf kecil dan dipakai untuk masuk.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {created && (
          <p className="mg-success" role="status">
            Akun <b>@{created}</b> siap dipakai. Berikan username dan password tadi kepada pemiliknya.{' '}
            <Link href="/admin/users" className="text-button">
              Lihat daftar pengguna
            </Link>
          </p>
        )}

        <div className="pf-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Membuat…' : 'Buat akun'}
          </button>
        </div>
      </form>
    </section>
  )
}
