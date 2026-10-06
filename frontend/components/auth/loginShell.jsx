import { LoginAside } from './loginAside'

/** Kerangka dua kolom halaman login: konten di kiri, panel beranimasi di kanan. */
export function LoginShell({ children }) {
  return (
    <main className="lg-page">
      <div className="lg-frame">
        <section className="lg-form-side">
          <div className="lg-box">{children}</div>
        </section>
        <LoginAside />
      </div>
    </main>
  )
}
