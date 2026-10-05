let loading = null

/** Memuat skrip Google Identity Services satu kali saja. */
export function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Hanya di browser'))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      reject(new Error('Gagal memuat skrip Google'))
    }
    document.head.appendChild(script)
  })
  return loading
}
