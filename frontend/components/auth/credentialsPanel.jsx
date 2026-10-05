'use client'
import { useState } from 'react'

/** Kolom email/username + password. Dipakai untuk masuk dan daftar; pesan error dikirim lewat children. */
export function CredentialsPanel({
  isSignup,
  email,
  password,
  busy,
  submitLabel,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  children,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="lg-panel" onSubmit={onSubmit} noValidate>
      <label className="lg-label" htmlFor="lg-email">
        {isSignup ? 'Alamat email' : 'Email atau username'}
      </label>
      <input
        id="lg-email"
        className="lg-input"
        type={isSignup ? 'email' : 'text'}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder={isSignup ? 'anda@contoh.com' : 'anda@contoh.com atau username'}
        autoComplete={isSignup ? 'email' : 'username'}
        autoCapitalize="none"
        spellCheck={false}
      />

      <label className="lg-label lg-label-spaced" htmlFor="lg-password">
        Password
      </label>
      <div className="lg-password">
        <input
          id="lg-password"
          className="lg-input lg-input-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={isSignup ? 'Minimal 8 karakter' : 'Password Anda'}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
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

      {children}

      <button type="submit" className="lg-btn lg-btn-primary" disabled={busy}>
        {busy ? 'Memproses…' : submitLabel}
      </button>
    </form>
  )
}
