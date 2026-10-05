import { Gauge, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { delay } from '@/lib/delay'
const items = [
  { icon: Lock, title: 'Login wajib', text: 'Semua fitur hanya bisa diakses setelah masuk.' },
  {
    icon: ShieldCheck,
    title: 'Sesi yang aman',
    text: 'Sesi disimpan di cookie httpOnly sehingga tidak bisa dibaca oleh skrip di browser.',
  },
  {
    icon: KeyRound,
    title: 'Password terlindungi',
    text: 'Password disimpan sebagai hash BCrypt, bukan teks asli.',
  },
  {
    icon: Gauge,
    title: 'Dibatasi otomatis',
    text: 'Percobaan login berulang yang gagal akan dikunci sementara.',
  },
]
export function SecuritySection() {
  return (
    <section id="keamanan" className="lp-section lp-security" aria-labelledby="lp-security-title">
      <div className="lp-container">
        <p className="lp-eyebrow lp-eyebrow-light" data-reveal>
          Keamanan
        </p>
        <h2 id="lp-security-title" className="lp-heading" data-reveal style={delay(80)}>
          Keuangan Anda hanya untuk Anda.
        </h2>
        <div className="lp-grid lp-grid-2">
          {items.map(({ icon: Icon, title, text }, i) => (
            <article key={title} className="lp-card lp-card-dark" data-reveal style={delay((i % 2) * 120)}>
              <span className="lp-icon lp-icon-light">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
