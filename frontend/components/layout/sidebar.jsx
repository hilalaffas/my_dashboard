'use client'
import { ChevronDown, CircleDollarSign, MoreHorizontal, Settings2, Target } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/auth/authProvider'
import { Modal } from '@/components/common/modal'
import { Popover } from '@/components/common/popover'
import { adminNavItem, navItems } from '@/data/navigation'
import { initials } from '@/lib/initials'
import { resetAppData } from '@/lib/resetAppData'
export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { authEnabled, user, logout } = useAuth()
  const [dialog, setDialog] = useState(null)
  const displayName = user?.fullName ?? 'User Testing'
  const items = user?.role === 'ADMIN' ? [...navItems, adminNavItem] : navItems
  async function handleLogout() {
    await logout()
    router.replace('/login')
  }
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">c</span>
        <span>costly</span>
      </div>
      <div className="workspace">
        <div className="avatar">UT</div>
        <div>
          <b>User Testing&apos;s workspace</b>
          <small>Personal finance</small>
        </div>
        <ChevronDown size={15} />
      </div>
      <nav className="side-nav" aria-label="Navigasi utama">
        <p>Workspace</p>
        {items.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={pathname.startsWith(href) ? 'active' : ''}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <p className="side-label">Manage</p>
        <button onClick={() => setDialog('settings')}>
          <Settings2 size={18} />
          Settings
        </button>
        <button onClick={() => setDialog('help')}>
          <CircleDollarSign size={18} />
          Help center
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="goal-card">
          <Target size={18} />
          <div>
            <b>Monthly goal</b>
            <span>Keep costs under Rp 7 jt</span>
          </div>
          <strong>97%</strong>
        </div>
        <div className="user-row">
          <div className="avatar dark">{initials(displayName)}</div>
          <div>
            <b>{displayName}</b>
            <small>
              {user
                ? `@${user.username} · ${user.role === 'ADMIN' ? 'Superuser' : 'Pengguna'}`
                : 'Mode lokal'}
            </small>
          </div>
          <Popover
            trigger={<MoreHorizontal size={18} />}
            triggerClassName="more-button"
            label="Menu pengguna"
          >
            {(close) => (
              <>
                <button
                  className="popover-item"
                  onClick={() => {
                    close()
                    setDialog('settings')
                  }}
                >
                  Pengaturan data
                </button>
                {authEnabled && (
                  <button
                    className="popover-item"
                    onClick={() => {
                      close()
                      void handleLogout()
                    }}
                  >
                    Keluar
                  </button>
                )}
              </>
            )}
          </Popover>
        </div>
      </div>

      {dialog === 'settings' && (
        <Modal title="Pengaturan" onClose={() => setDialog(null)}>
          <p className="modal-text">
            Cache data di browser ini (mode lokal) akan dihapus dan dikembalikan ke data contoh. Data di
            server tidak terpengaruh.
          </p>
          <div className="modal-actions">
            <button className="outline-button" onClick={() => setDialog(null)}>
              Batal
            </button>
            <button className="danger-button" onClick={resetAppData}>
              Reset data
            </button>
          </div>
        </Modal>
      )}
      {dialog === 'help' && (
        <Modal title="Help center" onClose={() => setDialog(null)}>
          <ul className="modal-list">
            <li>
              <b>Accounts</b> — atur kategori, sub kategori, dan item.
            </li>
            <li>
              <b>Cost estimates</b> — tambah, ubah, hapus baris estimasi, lalu ekspor ke CSV.
            </li>
            <li>
              <b>Reports</b> — ringkasan per kategori dari data Accounts.
            </li>
          </ul>
          <div className="modal-actions">
            <button className="primary-button" onClick={() => setDialog(null)}>
              Mengerti
            </button>
          </div>
        </Modal>
      )}
    </aside>
  )
}
