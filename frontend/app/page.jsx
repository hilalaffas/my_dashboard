import { LandingPage } from '@/views/landingPage'
export const metadata = {
  title: 'Costly — Rencanakan Biaya Pribadi dengan Rapi dan Terstruktur',
  description:
    'Costly membantu Anda menyusun rencana biaya pribadi: kelompokkan ke kategori, catat estimasi debit dan kredit, lalu pantau saldo di satu dashboard yang aman.',
  openGraph: {
    title: 'Costly — Rencanakan Biaya Pribadi dengan Rapi dan Terstruktur',
    description: 'Susun kategori, catat estimasi debit dan kredit, lalu pantau saldo di satu dashboard.',
    type: 'website',
    locale: 'id_ID',
  },
}
export default function Home() {
  return <LandingPage />
}
