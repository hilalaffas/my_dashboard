import { delay } from '@/lib/delay'
import { LoginLink } from './loginLink'
const bars = [52, 64, 71, 88, 84, 78]
const categories = [
  { name: 'Lifestyle', color: '#8fbf80', share: '42%' },
  { name: 'Saving', color: '#c8ddbd', share: '44%' },
  { name: 'Transport', color: '#e6c98d', share: '6%' },
]
export function HeroSection() {
  return (
    <section className="lp-section lp-hero" data-lp-hero aria-labelledby="lp-hero-title">
      <span className="lp-orb lp-orb-a" aria-hidden="true" />
      <span className="lp-orb lp-orb-b" aria-hidden="true" />
      <div className="lp-container lp-hero-inner">
        <div className="lp-hero-grid">
          <div>
            <p className="lp-eyebrow" data-reveal>
              Perencanaan biaya pribadi
            </p>
            <h1 id="lp-hero-title" className="lp-title" data-reveal style={delay(120)}>
              Tahu ke mana uang Anda pergi, <span className="lp-gradient-text">sebelum bulan berakhir.</span>
            </h1>
            <p className="lp-lead" data-reveal style={delay(240)}>
              Costly membantu Anda menyusun rencana biaya bulanan dengan rapi: kelompokkan ke kategori, catat
              estimasi debit dan kredit, lalu pantau saldo dalam satu dashboard.
            </p>
            <div className="lp-actions" data-reveal style={delay(360)}>
              <LoginLink className="lp-btn lp-btn-primary" label="Masuk ke dashboard" />
              <a href="#fitur" className="lp-btn lp-btn-ghost">
                Lihat fitur
              </a>
            </div>
            <p className="lp-note" data-reveal style={delay(480)}>
              Akses hanya untuk pengguna terdaftar.
            </p>
          </div>

          <div className="lp-mock-wrap" data-reveal="zoom" style={delay(300)}>
            <div className="lp-mock" aria-hidden="true">
              <div className="lp-mock-head">
                <span>Estimasi bulan ini</span>
                <em>Contoh tampilan</em>
              </div>
              <strong className="lp-mock-amount">Rp 6.750.000</strong>
              <div className="lp-bars">
                {bars.map((h, i) => (
                  <span key={i} className="lp-bar" style={{ height: `${h}%`, '--i': i }} />
                ))}
              </div>
              <ul className="lp-mock-list">
                {categories.map((c) => (
                  <li key={c.name}>
                    <span>
                      <i style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <b>{c.share}</b>
                  </li>
                ))}
              </ul>
            </div>
            <span className="lp-chip lp-chip-a" aria-hidden="true">
              Kategori › Sub kategori › Item
            </span>
            <span className="lp-chip lp-chip-b" aria-hidden="true">
              Saldo dihitung otomatis
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
