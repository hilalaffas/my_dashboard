'use client'
import Link from 'next/link'
import { useAuth } from '@/components/auth/authProvider'
/** Tautan ke /login; berubah menjadi "Buka dashboard" jika sudah login atau saat mode lokal (tanpa login). */
export function LoginLink({ className, label = 'Masuk', signedInLabel = 'Buka dashboard' }) {
  const { authEnabled, status } = useAuth()
  const signedIn = !authEnabled || status === 'authenticated'
  return (
    <Link href={signedIn ? '/overview' : '/login'} className={className}>
      {signedIn ? signedInLabel : label}
    </Link>
  )
}
