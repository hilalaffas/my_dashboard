'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/components/auth/authProvider'

/** Mengembalikan true bila pengguna saat ini superuser; selain itu diarahkan ke /overview. Backend tetap pemeriksa utama. */
export function useSuperuserGuard() {
  const { user } = useAuth()
  const router = useRouter()
  const isSuperuser = user?.role === 'ADMIN'

  useEffect(() => {
    if (!isSuperuser) router.replace('/overview')
  }, [isSuperuser, router])

  return isSuperuser
}
