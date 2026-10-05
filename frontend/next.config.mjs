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

const nextConfig = {
  // 'standalone' hanya diaktifkan saat build untuk Docker (NEXT_OUTPUT=standalone)
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
