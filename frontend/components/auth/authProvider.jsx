'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isApiEnabled } from '@/services/apiClient'
import { authApi } from '@/services/authService'

// status: 'loading' | 'authenticated' | 'anonymous'
const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}

/**
 * authEnabled = false saat mode lokal (NEXT_PUBLIC_API_URL kosong): tidak ada login.
 * setUser dipakai halaman login setelah daftar/verifikasi/Google berhasil (sesi sudah dibuat server).
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState(isApiEnabled ? 'loading' : 'authenticated')
  const [user, setUserState] = useState(null)

  useEffect(() => {
    if (!isApiEnabled) return
    authApi
      .me()
      .then((u) => {
        setUserState(u)
        setStatus('authenticated')
      })
      .catch(() => setStatus('anonymous'))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      setUserState(null)
      setStatus('anonymous')
    }
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  const setUser = useCallback((u) => {
    setUserState(u)
    setStatus('authenticated')
  }, [])

  const login = useCallback(
    async (username, password) => {
      setUser(await authApi.login(username, password))
    },
    [setUser],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUserState(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(
    () => ({ authEnabled: isApiEnabled, status, user, login, logout, setUser }),
    [status, user, login, logout, setUser],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
