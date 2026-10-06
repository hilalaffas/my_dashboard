/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HSTS hanya berarti di HTTPS; diabaikan browser jika diakses lewat HTTP
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
]

// Alamat backend untuk mode satu origin, mis. https://nama-api.onrender.com (tanpa garis miring di akhir).
// Dipakai bersama NEXT_PUBLIC_API_URL=/ agar cookie login menjadi first-party (aman dari pemblokiran cookie pihak ketiga).
const backendUrl = (process.env.BACKEND_URL || '').replace(/\/+$/, '')

const nextConfig = {
  // 'standalone' hanya diaktifkan saat build untuk Docker (NEXT_OUTPUT=standalone)
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async rewrites() {
    return backendUrl ? [{ source: '/api/:path*', destination: `${backendUrl}/api/:path*` }] : []
  },
}

export default nextConfig
