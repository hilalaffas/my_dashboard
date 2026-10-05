'use client'
import { useEffect, useState } from 'react'
import { isApiEnabled } from '@/services/apiClient'
import { authApi } from '@/services/authService'

const defaults = { registrationEnabled: false, googleClientId: '' }

/** Mengambil pengaturan publik login dari server: apakah pendaftaran dan login Google aktif. */
export function useAuthConfig() {
  const [state, setState] = useState({ loaded: !isApiEnabled, failed: false, config: defaults })

  useEffect(() => {
    if (!isApiEnabled) return
    let alive = true
    authApi
      .config()
      .then((c) => {
        if (!alive) return
        setState({
          loaded: true,
          failed: false,
          config: {
            registrationEnabled: Boolean(c?.registrationEnabled),
            googleClientId: c?.googleClientId || '',
          },
        })
      })
      .catch(() => alive && setState({ loaded: true, failed: true, config: defaults }))
    return () => {
      alive = false
    }
  }, [])

  return state
}
