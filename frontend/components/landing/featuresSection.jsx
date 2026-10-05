import { BarChart3, Download, FileSpreadsheet, Layers, LayoutDashboard, Smartphone } from 'lucide-react'
import { delay } from '@/lib/delay'
const features = [
  {
    icon: Layers,
    title: 'Struktur tiga tingkat',
    text: 'Susun kategori, sub kategori, dan item. Tambah, ubah, atau hapus kapan saja.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Estimasi debit dan kredit',
    text: 'Catat rencana pengeluaran dan pemasukan. Saldo dihitung otomatis.',
  },
  {
    icon: BarChart3,
    title: 'Laporan per kategori',
    text: 'Lihat porsi setiap kategori dari total nominal Anda.',
  },
  { icon: Download, title: 'Ekspor ke CSV', text: 'Unduh data untuk dibuka di Excel atau spreadsheet lain.' },
  {
    icon: LayoutDashboard,
    title: 'Dashboard ringkas',
    text: 'Metrik, grafik, dan daftar estimasi terbaru dalam satu layar.',
  },
  {
    icon: Smartphone,
    title: 'Nyaman di ponsel',
    text: 'Tampilan menyesuaikan layar, dari ponsel sampai desktop.',
  },
]
export function FeaturesSection() {
  return (
    <section id="fitur" className="lp-section lp-features" aria-labelledby="lp-features-title">
      <span className="lp-orb lp-orb-c" aria-hidden="true" />
      <div className="lp-container">
        <p className="lp-eyebrow" data-reveal>
          Fitur
        </p>
        <h2 id="lp-features-title" className="lp-heading" data-reveal style={delay(80)}>
          Semua yang Anda perlukan untuk merencanakan biaya.
        </h2>
        <div className="lp-grid lp-grid-3">
          {features.map(({ icon: Icon, title, text }, i) => (
            <article key={title} className="lp-card" data-reveal style={delay((i % 3) * 110)}>
              <span className="lp-icon">
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
