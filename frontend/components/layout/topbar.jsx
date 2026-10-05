'use client'
import { ArrowUpRight, Bell, ChevronDown, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
import { ChangePasswordModal } from '@/components/auth/changePasswordModal'
import { Popover } from '@/components/common/popover'
import { useToast } from '@/components/common/toastProvider'
import { navItems } from '@/data/navigation'
import { initials } from '@/lib/initials'
import { resetAppData } from '@/lib/resetAppData'
const notifications = [
  'Pengeluaran bulan ini mencapai 97% dari target.',
  'Tambahkan kategori baru di halaman Accounts.',
]
export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const notify = useToast()
  const { authEnabled, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const displayName = user?.fullName ?? 'User Testing'
  const isActive = (href) => (pathname.startsWith(href) ? 'active' : '')
  async function handleLogout() {
    await logout()
    router.replace('/login')
  }
  return (
    <header className="topbar">
      <div className="top-brand">
        <button
          className="mobile-menu"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
        </button>
        <span className="brand-mark">c</span>
        <strong>costly</strong>
      </div>
      <nav className="top-nav" aria-label="Navigasi utama">
        {navItems.map(({ label, href }) => (
          <Link key={href} href={href} className={isActive(href)}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        {navItems.map(({ label, href }) => (
          <Link key={href} href={href} className={isActive(href)} onClick={() => setMenuOpen(false)}>
            {label}
            <ArrowUpRight size={14} />
          </Link>
        ))}
      </div>
      <div className="top-actions">
        <Popover
          trigger={
            <>
              <Bell size={18} />
              <i />
            </>
          }
          triggerClassName="icon-button"
          label="Notifikasi"
        >
          {() => (
            <div className="popover-list">
              {notifications.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          )}
        </Popover>
        <Popover
          trigger={
            <>
              <div className="avatar">{initials(displayName)}</div>
              <span>{displayName}</span>
              <ChevronDown size={15} />
            </>
          }
          triggerClassName="profile-button"
          label="Menu profil"
        >
          {(close) => (
            <>
              <Link href="/accounts" className="popover-item" onClick={close}>
                Kelola accounts
              </Link>
              {authEnabled ? (
                <>
                  <button
                    className="popover-item"
                    onClick={() => {
                      close()
                      setPasswordOpen(true)
                    }}
                  >
                    Ubah password
                  </button>
                  <button
                    className="popover-item"
                    onClick={() => {
                      close()
                      void handleLogout()
                    }}
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <button className="popover-item" onClick={resetAppData}>
                  Reset data contoh
                </button>
              )}
            </>
          )}
        </Popover>
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
    </header>
  )
}
