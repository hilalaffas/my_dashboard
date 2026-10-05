'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
export function LoginPage() {
  const { authEnabled, status, login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    if (!authEnabled || status === 'authenticated') router.replace('/overview')
  }, [authEnabled, status, router])
  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password) return setError('Username dan password wajib diisi.')
    setSubmitting(true)
    setError('')
    try {
      await login(username.trim(), password)
      router.replace('/overview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.')
      setSubmitting(false)
    }
  }
  if (status !== 'anonymous')
    return (
      <div className="auth-loading" role="status">
        Memuat…
      </div>
    )
  return (
    <main className="login-page">
      <section className="panel login-card">
        <div className="login-brand">
          <span className="brand-mark">c</span>
          <span>costly</span>
        </div>
        <h1>Masuk</h1>
        <p className="login-subtitle">Masuk untuk mengakses dashboard Anda.</p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoFocus
            />
          </label>
          <label>
            Password
            <span className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Sembunyi' : 'Lihat'}
              </button>
            </span>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="primary-button login-submit" disabled={submitting}>
            {submitting ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </section>
    </main>
  )
}
