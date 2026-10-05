'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isApiEnabled } from '@/services/apiClient'
import { authApi } from '@/services/authService'
const AuthContext = createContext(null)
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
export function AuthProvider({ children }) {
  const [status, setStatus] = useState(isApiEnabled ? 'loading' : 'authenticated')
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (!isApiEnabled) return
    authApi
      .me()
      .then((u) => {
        setUser(u)
        setStatus('authenticated')
      })
      .catch(() => setStatus('anonymous'))
  }, [])
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      setStatus('anonymous')
    }
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])
  const login = useCallback(async (username, password) => {
    const u = await authApi.login(username, password)
    setUser(u)
    setStatus('authenticated')
  }, [])
  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setStatus('anonymous')
    }
  }, [])
  const value = useMemo(
    () => ({ authEnabled: isApiEnabled, status, user, login, logout }),
    [status, user, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
