'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
import { ChangePasswordModal } from '@/components/auth/changePasswordModal'
import { useToast } from '@/components/common/toastProvider'
import { initials } from '@/lib/initials'
import { profileApi } from '@/services/profileService'

export function ProfilePage() {
  const notify = useToast()
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState('')
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  useEffect(() => {
    let alive = true
    profileApi
      .get()
      .then((data) => {
        if (!alive) return
        setProfile(data)
        setFullName(data.fullName)
      })
      .catch((err) => alive && setLoadError(err instanceof Error ? err.message : 'Gagal memuat profil.'))
    return () => {
      alive = false
    }
  }, [])

  const changed = profile !== null && fullName.trim() !== profile.fullName

  async function handleSubmit(e) {
    e.preventDefault()
    const name = fullName.trim()
    if (!name) return setError('Nama lengkap wajib diisi.')
    setSaving(true)
    setError('')
    try {
      const updated = await profileApi.update(name)
      setProfile(updated)
      setFullName(updated.fullName)
      // Menyegarkan nama di topbar dan sidebar tanpa memuat ulang halaman
      if (user) setUser({ ...user, fullName: updated.fullName })
      notify('Profil berhasil diperbarui.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setFullName(profile.fullName)
    setError('')
  }

  if (loadError) {
    return (
      <section className="panel">
        <p className="form-error" role="alert">
          {loadError}
        </p>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="panel" role="status">
        <p className="pf-help">Memuat profil…</p>
      </section>
    )
  }

  const roleLabel = user?.role === 'ADMIN' ? 'Superuser' : 'Pengguna'

  return (
    <>
      <div className="pf-layout">
        <aside className="panel pf-identity">
          <div className="pf-avatar" aria-hidden="true">
            {initials(profile.fullName)}
          </div>
          <h2 className="pf-name">{profile.fullName}</h2>
          <p className="pf-username">@{profile.username}</p>
          <span className="pf-badge">{roleLabel}</span>
        </aside>

        <div className="pf-main">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Informasi akun</h2>
                <p>Hanya nama lengkap yang bisa diubah.</p>
              </div>
            </div>
            <form className="form pf-form" onSubmit={handleSubmit} noValidate>
              <label>
                Nama lengkap
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  maxLength={120}
                />
              </label>
              <div className="form-row">
                <label>
                  Username
                  <input value={profile.username} readOnly />
                </label>
                <label>
                  Email
                  <input value={profile.email ?? 'Belum diatur'} readOnly />
                </label>
              </div>
              <p className="pf-help">Username dan email dipakai untuk masuk, sehingga tidak bisa diubah.</p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="pf-actions">
                <button type="button" className="outline-button" onClick={handleReset} disabled={!changed || saving}>
                  Batalkan
                </button>
                <button type="submit" className="primary-button" disabled={!changed || saving}>
                  {saving ? 'Menyimpan…' : 'Simpan perubahan'}
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Keamanan</h2>
                <p>Ganti password secara berkala agar akun tetap aman.</p>
              </div>
              <button type="button" className="outline-button" onClick={() => setPasswordOpen(true)}>
                Ubah password
              </button>
            </div>
          </section>
        </div>
      </div>

      {passwordOpen && (
        <ChangePasswordModal
          onClose={() => setPasswordOpen(false)}
          onDone={() => {
            setPasswordOpen(false)
            notify('Password berhasil diubah.')
          }}
        />
      )}
    </>
  )
}
