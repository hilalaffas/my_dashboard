import { delay } from '@/lib/delay'
const faqs = [
  {
    q: 'Bagaimana cara mendapatkan akun?',
    a: 'Jika pendaftaran dibuka, Anda bisa mendaftar sendiri di halaman login dengan verifikasi email. Jika tidak, akun dibuat oleh admin sistem, jadi hubungi admin Anda.',
  },
  {
    q: 'Apakah bisa dipakai di ponsel?',
    a: 'Bisa. Tampilan menyesuaikan ukuran layar, sehingga nyaman di ponsel, tablet, maupun desktop.',
  },
  {
    q: 'Bisakah saya mengekspor data?',
    a: 'Bisa. Daftar cost estimates dan laporan accounts dapat diunduh sebagai file CSV.',
  },
]
export function FaqSection() {
  return (
    <section id="faq" className="lp-section lp-faq" aria-labelledby="lp-faq-title">
      <div className="lp-container lp-faq-box">
        <h2 id="lp-faq-title" className="lp-heading" data-reveal>
          Pertanyaan yang sering muncul
        </h2>
        {faqs.map((f, i) => (
          <details key={f.q} className="lp-faq-item" data-reveal="fade" style={delay(i * 100)}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
