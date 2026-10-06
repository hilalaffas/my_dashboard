import Link from 'next/link'

/**
 * Tombol login di landing page. Selalu menuju /login, tidak pernah langsung ke dashboard.
 * Jika pengguna sudah punya sesi, halaman login yang menanyakan: lanjut atau masuk dengan akun lain.
 */
export function LoginLink({ className, label = 'Masuk' }) {
  return (
    <Link href="/login" className={className}>
      {label}
    </Link>
  )
}
