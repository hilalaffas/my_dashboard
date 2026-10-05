import { delay } from '@/lib/delay'
const problems = [
  {
    title: 'Catatan tercecer',
    text: 'Nominal tersebar di chat, catatan ponsel, dan spreadsheet yang berbeda-beda.',
  },
  {
    title: 'Tidak ada struktur',
    text: 'Tanpa kategori yang jelas, sulit melihat pos mana yang paling besar.',
  },
  {
    title: 'Saldo baru terasa di akhir',
    text: 'Tanpa estimasi di awal, kejutan baru muncul saat uang sudah menipis.',
  },
]
export function ProblemSection() {
  return (
    <section className="lp-section lp-problem" aria-labelledby="lp-problem-title">
      <div className="lp-container">
        <h2 id="lp-problem-title" className="lp-heading" data-reveal>
          Mengatur uang seharusnya tidak serumit ini.
        </h2>
        <p className="lp-sub" data-reveal style={delay(100)}>
          Tiga hal yang paling sering membuat rencana keuangan berantakan:
        </p>
        <div className="lp-grid">
          {problems.map((p, i) => (
            <article key={p.title} className="lp-card" data-reveal style={delay(i * 120)}>
              <span className="lp-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
