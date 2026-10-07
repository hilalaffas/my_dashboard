const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// '/' = mode satu origin: browser hanya bicara ke domain frontend, yang meneruskan /api/* ke backend (lihat next.config.mjs).
// Selain itu: alamat backend lengkap (mis. http://localhost:4000), garis miring di akhir dibuang.
const API_URL = RAW_API_URL === '/' ? '' : RAW_API_URL.replace(/\/+$/, '')

export const isApiEnabled = Boolean(RAW_API_URL)

export async function request(path, method = 'GET', body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include', // kirim cookie sesi (httpOnly) ke backend
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  const data = text ? safeParse(text) : null
  if (!res.ok) {
    // Sesi habis atau tidak valid: beri tahu AuthProvider (kecuali saat sedang proses login/daftar)
    if (res.status === 401 && !path.startsWith('/api/auth/login') && !path.startsWith('/api/auth/google')) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    throw new Error(
      (data?.errors && Object.values(data.errors)[0]) || data?.message || 'Permintaan ke server gagal.',
    )
  }
  return data ?? undefined
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
