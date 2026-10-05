import { delay } from '@/lib/delay'
const steps = [
  {
    title: 'Susun kategori',
    text: 'Buat kategori seperti Pengeluaran atau Tabungan, lalu pecah menjadi sub kategori dan item.',
  },
  {
    title: 'Catat estimasi',
    text: 'Masukkan rencana debit dan kredit untuk bulan ini. Saldo langsung terlihat.',
  },
  {
    title: 'Pantau dan ekspor',
    text: 'Buka laporan per kategori dan unduh sebagai CSV kapan pun diperlukan.',
  },
]
export function StepsSection() {
  return (
    <section id="cara-kerja" className="lp-section lp-steps" aria-labelledby="lp-steps-title">
      <div className="lp-container">
        <p className="lp-eyebrow" data-reveal>
          Cara kerja
        </p>
        <h2 id="lp-steps-title" className="lp-heading" data-reveal style={delay(80)}>
          Mulai dalam tiga langkah.
        </h2>
        <ol className="lp-steps-list">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="lp-step"
              data-reveal={i % 2 ? 'right' : 'left'}
              style={delay(i * 140)}
            >
              <span className="lp-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
