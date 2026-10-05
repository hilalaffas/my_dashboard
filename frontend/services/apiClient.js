const API_URL = process.env.NEXT_PUBLIC_API_URL
export const isApiEnabled = Boolean(API_URL)
export async function request(path, method = 'GET', body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include', // kirim cookie sesi (httpOnly) ke backend
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    // Sesi habis atau tidak valid: beri tahu AuthProvider (kecuali saat memang sedang login)
    if (res.status === 401 && path !== '/api/auth/login') window.dispatchEvent(new Event('auth:unauthorized'))
    const data = await res.json().catch(() => null)
    throw new Error(
      (data?.errors && Object.values(data.errors)[0]) || data?.message || 'Permintaan ke server gagal.',
    )
  }
  return res.status === 204 ? undefined : await res.json()
}
