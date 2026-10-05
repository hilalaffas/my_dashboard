const quotes = [
  'Cara yang lebih tenang untuk merapikan biaya Anda.',
  'Rencanakan hari ini, tenang di akhir bulan.',
  'Semua rencana biaya, dalam satu tempat.',
]

/** Panel dekoratif di kanan halaman login. Semua animasinya murni CSS (lihat styles/pages/loginAside.css). */
export function LoginAside() {
  return (
    <aside className="lg-aside" aria-hidden="true">
      <div className="lg-aside-base" />
      <span className="lg-blob lg-blob-1" />
      <span className="lg-blob lg-blob-2" />
      <span className="lg-blob lg-blob-3" />
      <span className="lg-blob lg-blob-4" />
      <div className="lg-grain" />
      <span className="lg-line lg-line-1" />
      <span className="lg-line lg-line-2" />
      <div className="lg-quotes">
        {quotes.map((text, i) => (
          <p key={text} className="lg-quote" style={{ '--i': i }}>
            {text}
          </p>
        ))}
      </div>
    </aside>
  )
}
