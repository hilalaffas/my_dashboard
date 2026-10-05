'use client'
import { useEffect, useRef } from 'react'
import { loadGoogleScript } from '@/lib/loadGoogleScript'

/** Tombol resmi "Continue with Google" (Google Identity Services). Hasilnya ID token yang diverifikasi backend. */
export function GoogleSignInButton({ clientId, onCredential, onError }) {
  const containerRef = useRef(null)
  const handlers = useRef({ onCredential, onError })
  handlers.current = { onCredential, onError }

  useEffect(() => {
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        const el = containerRef.current
        if (cancelled || !el || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => handlers.current.onCredential(response.credential),
        })
        window.google.accounts.id.renderButton(el, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: Math.min(Math.max(el.offsetWidth, 200), 400),
        })
      })
      .catch(() => handlers.current.onError('Gagal memuat Google. Periksa koneksi internet Anda.'))
    return () => {
      cancelled = true
    }
  }, [clientId])

  return <div ref={containerRef} className="lg-google" />
}
