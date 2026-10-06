'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
import { CredentialsPanel } from '@/components/auth/credentialsPanel'
import { FormMessage } from '@/components/auth/formMessage'
import { GoogleSignInButton } from '@/components/auth/googleSignInButton'
import { LoginHeader } from '@/components/auth/loginHeader'
import { LoginNotice } from '@/components/auth/loginNotice'
import { LoginShell } from '@/components/auth/loginShell'
import { VerifyCodeForm } from '@/components/auth/verifyCodeForm'
import { useAuthConfig } from '@/hooks/useAuthConfig'
import { authApi } from '@/services/authService'

const RESEND_SECONDS = 60

function copyFor(isSignup, step, email) {
  if (step === 'verify') {
    return {
      title: 'Periksa email Anda',
      subtitle: `Kami mengirim kode verifikasi ke ${email || 'email Anda'}`,
    }
  }
  if (isSignup)
    return { title: 'Buat akun Anda', subtitle: 'Mulai rapikan rencana biaya Anda di satu tempat' }
  return { title: 'Selamat datang kembali', subtitle: 'Masukkan kredensial Anda untuk mengakses akun' }
}

export function LoginPage() {
  const { authEnabled, status, user, login, logout, setUser } = useAuth()
  const router = useRouter()
  const { loaded, failed, config } = useAuthConfig()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [step, setStep] = useState('details') // 'details' | 'verify'
  const [showOptions, setShowOptions] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const [leaving, setLeaving] = useState(false) // true sejak login berhasil sampai pindah halaman (mencegah kedipan layar)
  const [cooldown, setCooldown] = useState(0)

  const isSignup = mode === 'signup'
  const googleEnabled = Boolean(config.googleClientId)
  const showPanel = isSignup || showOptions || !googleEnabled

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  /** Menjalankan aksi async dengan status "memproses" dan pesan error seragam. leaves = aksi ini berujung pindah ke dashboard. */
  async function run(task, { leaves = false } = {}) {
    setBusy(true)
    setMessage({ type: '', text: '' })
    if (leaves) setLeaving(true)
    try {
      await task()
    } catch (err) {
      if (leaves) setLeaving(false)
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Terjadi kesalahan.' })
    } finally {
      setBusy(false)
    }
  }

  function enterApp(sessionUser) {
    setUser(sessionUser)
    router.replace('/overview')
  }

  function switchMode(next) {
    setMode(next)
    setStep('details')
    setShowOptions(next === 'signup')
    setPassword('')
    setCode('')
    setMessage({ type: '', text: '' })
  }

  function handleCredentials(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      return setMessage({ type: 'error', text: 'Email dan password wajib diisi.' })
    }
    if (isSignup) {
      if (password.length < 8) return setMessage({ type: 'error', text: 'Password minimal 8 karakter.' })
      return run(async () => {
        await authApi.register(email.trim(), password)
        setStep('verify')
        setCooldown(RESEND_SECONDS)
        setMessage({ type: 'info', text: 'Kode dikirim dan berlaku 10 menit.' })
      })
    }
    return run(
      async () => {
        await login(email.trim(), password)
        router.replace('/overview')
      },
      { leaves: true },
    )
  }

  function handleVerify(e) {
    e.preventDefault()
    run(async () => enterApp(await authApi.verifyEmail(email.trim(), code)), { leaves: true })
  }

  function handleResend() {
    run(async () => {
      await authApi.resendCode(email.trim())
      setCooldown(RESEND_SECONDS)
      setMessage({ type: 'info', text: 'Kode baru dikirim.' })
    })
  }

  function handleGoogle(credential) {
    run(async () => enterApp(await authApi.google(credential)), { leaves: true })
  }

  // Mode lokal: tidak ada backend, jadi tidak ada login. Dijelaskan terang-terangan, bukan dialihkan diam-diam.
  if (!authEnabled) {
    return (
      <LoginShell>
        <LoginNotice
          title="Mode demo lokal"
          subtitle="Backend belum terhubung, sehingga login tidak tersedia. Data hanya tersimpan di browser ini."
          primaryLabel="Buka dashboard demo"
          onPrimary={() => router.push('/overview')}
        />
      </LoginShell>
    )
  }

  if (status === 'loading' || !loaded || leaving)
    return (
      <div className="auth-loading" role="status">
        Memuat…
      </div>
    )

  // Sudah punya sesi: tanya dulu, jangan langsung masuk ke dashboard
  if (status === 'authenticated') {
    return (
      <LoginShell>
        <LoginNotice
          title="Anda sudah masuk"
          subtitle={user ? `Masuk sebagai ${user.fullName} (@${user.username})` : 'Sesi Anda masih aktif.'}
          primaryLabel="Lanjutkan ke dashboard"
          onPrimary={() => router.push('/overview')}
          secondaryLabel="Masuk dengan akun lain"
          onSecondary={() => run(() => logout())}
          busy={busy}
        />
      </LoginShell>
    )
  }

  const { title, subtitle } = copyFor(isSignup, step, email.trim())
  const feedback = <FormMessage type={message.type}>{message.text}</FormMessage>

  return (
    <LoginShell>
      <LoginHeader title={title} subtitle={subtitle} />
      {failed && (
        <FormMessage type="error">Tidak dapat terhubung ke server. Pastikan backend berjalan.</FormMessage>
      )}

      <div key={`${mode}-${step}`} className="lg-step">
        {step === 'verify' ? (
          <VerifyCodeForm
            code={code}
            busy={busy}
            cooldown={cooldown}
            onCodeChange={setCode}
            onSubmit={handleVerify}
            onResend={handleResend}
            onChangeEmail={() => {
              setStep('details')
              setCode('')
              setMessage({ type: '', text: '' })
            }}
          >
            {feedback}
          </VerifyCodeForm>
        ) : (
          <>
            {!isSignup && googleEnabled && (
              <>
                <GoogleSignInButton
                  clientId={config.googleClientId}
                  onCredential={handleGoogle}
                  onError={(text) => setMessage({ type: 'error', text })}
                />
                <div className="lg-divider">
                  <span />
                  <em>atau</em>
                  <span />
                </div>
                <button
                  type="button"
                  className="lg-btn lg-btn-outline"
                  aria-expanded={showPanel}
                  onClick={() => setShowOptions((v) => !v)}
                >
                  {showOptions ? 'Sembunyikan opsi lain' : 'Tampilkan opsi lain'}
                </button>
              </>
            )}

            {showPanel && (
              <CredentialsPanel
                isSignup={isSignup}
                email={email}
                password={password}
                busy={busy}
                submitLabel={isSignup ? 'Buat akun' : 'Masuk'}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={handleCredentials}
              >
                {feedback}
              </CredentialsPanel>
            )}

            {!showPanel && feedback}
          </>
        )}
      </div>

      {step === 'details' &&
        (config.registrationEnabled ? (
          <p className="lg-switch">
            {isSignup ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              className="lg-link lg-link-strong"
              onClick={() => switchMode(isSignup ? 'signin' : 'signup')}
            >
              {isSignup ? 'Masuk' : 'Daftar'}
            </button>
          </p>
        ) : (
          <p className="lg-switch">Belum punya akun? Hubungi admin sistem.</p>
        ))}
    </LoginShell>
  )
}
