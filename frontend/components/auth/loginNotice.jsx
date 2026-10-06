import { LoginHeader } from './loginHeader'

/** Layar pemberitahuan dengan satu atau dua tombol (mis. "Anda sudah masuk", "Mode demo lokal"). */
export function LoginNotice({ title, subtitle, primaryLabel, onPrimary, secondaryLabel, onSecondary, busy }) {
  return (
    <>
      <LoginHeader title={title} subtitle={subtitle} />
      <div className="lg-step">
        <button type="button" className="lg-btn lg-btn-primary" onClick={onPrimary} disabled={busy}>
          {primaryLabel}
        </button>
        {secondaryLabel && (
          <button type="button" className="lg-btn lg-btn-outline" onClick={onSecondary} disabled={busy}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </>
  )
}
