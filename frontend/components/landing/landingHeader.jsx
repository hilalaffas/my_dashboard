import Link from 'next/link'
import { LoginLink } from './loginLink'
export function LandingHeader() {
  return (
    <header className="lp-header">
      <div className="lp-header-inner">
        <Link href="/" className="lp-brand" aria-label="Costly, beranda">
          <span className="brand-mark">c</span>
          <span>costly</span>
        </Link>
        <nav className="lp-nav" aria-label="Navigasi halaman">
          <a href="#fitur">Fitur</a>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#keamanan">Keamanan</a>
          <a href="#faq">FAQ</a>
        </nav>
        <LoginLink className="lp-btn lp-btn-primary lp-btn-small" />
      </div>
    </header>
  )
}
