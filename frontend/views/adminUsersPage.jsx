'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/common/toastProvider'
import { useSuperuserGuard } from '@/hooks/useSuperuserGuard'
import { adminApi } from '@/services/adminService'

export function AdminUsersPage() {
  const notify = useToast()
  const isSuperuser = useSuperuserGuard()
  const [users, setUsers] = useState(null)

  useEffect(() => {
    if (!isSuperuser) return
    adminApi
      .users()
      .then(setUsers)
      .catch((err) => {
        notify(err instanceof Error ? err.message : 'Gagal memuat pengguna.')
        setUsers([])
      })
  }, [isSuperuser, notify])

  if (!isSuperuser) return null

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Superuser
          </div>
          <h1>Pengguna</h1>
          <p>Lihat daftar pengguna dan data masing-masing. Akses ini hanya untuk membaca.</p>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NAMA</th>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users === null && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Memuat…
                  </td>
                </tr>
              )}
              {users?.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.fullName}</b>
                  </td>
                  <td>@{u.username}</td>
                  <td>{u.email || '—'}</td>
                  <td>
                    <span className="category-pill">{u.role === 'ADMIN' ? 'Superuser' : 'Pengguna'}</span>
                  </td>
                  <td>
                    <span className={`status ${u.enabled ? 'received' : 'planned'}`}>
                      {u.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/users/${u.id}`} className="text-button">
                      Lihat data
                    </Link>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Belum ada pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
