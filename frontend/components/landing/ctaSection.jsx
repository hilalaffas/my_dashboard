import { delay } from '@/lib/delay'
import { LoginLink } from './loginLink'
export function CtaSection() {
  return (
    <section className="lp-section lp-cta" aria-labelledby="lp-cta-title">
      <span className="lp-glow" aria-hidden="true" />
      <div className="lp-container lp-cta-inner">
        <h2 id="lp-cta-title" className="lp-heading lp-heading-center" data-reveal>
          Siap merapikan rencana biaya Anda?
        </h2>
        <p className="lp-sub lp-sub-center" data-reveal style={delay(120)}>
          Masuk dan mulai susun kategori pertama Anda.
        </p>
        <div data-reveal="zoom" style={delay(240)}>
          <LoginLink className="lp-btn lp-btn-primary lp-btn-large" label="Klik untuk Login" />
        </div>
        <p className="lp-note lp-note-light" data-reveal="fade" style={delay(360)}>
          Hanya untuk pengguna terdaftar.
        </p>
      </div>
    </section>
  )
}
