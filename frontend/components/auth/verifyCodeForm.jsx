/** Langkah verifikasi email: kode 6 digit, kirim ulang (dengan hitung mundur), dan ubah email. */
export function VerifyCodeForm({
  code,
  busy,
  cooldown,
  onCodeChange,
  onSubmit,
  onResend,
  onChangeEmail,
  children,
}) {
  return (
    <form className="lg-form" onSubmit={onSubmit} noValidate>
      <label className="lg-label" htmlFor="lg-code">
        Kode verifikasi email
      </label>
      <input
        id="lg-code"
        className="lg-input lg-input-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
        placeholder="Masukkan 6 digit kode"
        autoFocus
      />

      {children}

      <button type="submit" className="lg-btn lg-btn-primary" disabled={busy || code.length !== 6}>
        {busy ? 'Memproses…' : 'Verifikasi email'}
      </button>

      <div className="lg-links">
        <button type="button" className="lg-link" onClick={onResend} disabled={busy || cooldown > 0}>
          {cooldown > 0 ? `Kirim ulang kode (${cooldown} dtk)` : 'Kirim ulang kode'}
        </button>
        <button type="button" className="lg-link" onClick={onChangeEmail}>
          Ubah email
        </button>
      </div>
    </form>
  )
}
