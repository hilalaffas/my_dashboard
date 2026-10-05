'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from './authProvider'
/** Menahan tampilan halaman terlindungi sampai pengguna terbukti login. Backend tetap pemeriksa utama. */
export function AuthGate({ children }) {
  const { authEnabled, status } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (authEnabled && status === 'anonymous') router.replace('/login')
  }, [authEnabled, status, router])
  if (authEnabled && status !== 'authenticated')
    return (
      <div className="auth-loading" role="status">
        Memuat…
      </div>
    )
  return <>{children}</>
}
