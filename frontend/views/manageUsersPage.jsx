'use client'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/components/common/toastProvider'
import { CreateUserModal } from '@/components/manage/createUserModal'
import { UserDetailModal } from '@/components/manage/userDetailModal'
import { UserSwitch } from '@/components/manage/userSwitch'
import { adminApi } from '@/services/adminService'

/** Tab "Manage akun": daftar semua akun, buat akun baru, edit detail, dan aktif/nonaktifkan. Hanya dirender untuk superuser (ManageShell). */
export function ManageUsersPage() {
  const notify = useToast()
  const [users, setUsers] = useState(null)
  const [dialog, setDialog] = useState(null) // { kind: 'create' } | { kind: 'detail', user }
  const [pendingId, setPendingId] = useState('')

  const load = useCallback(async () => {
    try {
      setUsers(await adminApi.users())
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal memuat pengguna.')
      setUsers([])
    }
  }, [notify])

  useEffect(() => {
    void load()
  }, [load])

  function replaceUser(updated) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  async function handleToggle(target, enabled) {
    setPendingId(target.id)
    try {
      const updated = await adminApi.setEnabled(target.id, enabled)
      replaceUser(updated)
      notify(`Akun @${updated.username} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Gagal mengubah status akun.')
    } finally {
      setPendingId('')
    }
  }

  return (
    <>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Akun pengguna</h2>
            <p>Buat akun, ubah detail, dan aktifkan atau nonaktifkan akses. Akun nonaktif langsung tidak bisa masuk.</p>
          </div>
          <button className="primary-button" onClick={() => setDialog({ kind: 'create' })}>
            <Plus size={17} /> Akun baru
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NAMA</th>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>DETAIL</th>
                <th>DATA</th>
              </tr>
            </thead>
            <tbody>
              {users === null && (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Memuat…
                  </td>
                </tr>
              )}
              {users?.map((u) => {
                const isSuperuser = u.role === 'ADMIN'
                return (
                  <tr key={u.id}>
                    <td>
                      <b>{u.fullName}</b>
                    </td>
                    <td>@{u.username}</td>
                    <td>{u.email || '—'}</td>
                    <td>
                      <span className="category-pill">{isSuperuser ? 'Superuser' : 'Pengguna'}</span>
                    </td>
                    <td>
                      <div className="mg-status">
                        <UserSwitch
                          checked={u.enabled}
                          disabled={isSuperuser || pendingId === u.id}
                          onChange={(value) => handleToggle(u, value)}
                          label={`${u.enabled ? 'Nonaktifkan' : 'Aktifkan'} akun ${u.username}`}
                        />
                        <span className={`status ${u.enabled ? 'received' : 'planned'}`}>{u.enabled ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                    </td>
                    <td>
                      {isSuperuser ? (
                        <span className="mg-muted" title="Akun superuser diatur lewat tab Edit profil">
                          —
                        </span>
                      ) : (
                        <button className="text-button" onClick={() => setDialog({ kind: 'detail', user: u })}>
                          Detail
                        </button>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/users/${u.id}`} className="text-button">
                        Lihat data
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Belum ada akun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {dialog?.kind === 'create' && (
        <CreateUserModal
          onClose={() => setDialog(null)}
          onCreated={(created) => {
            setUsers((prev) => [...(prev ?? []), created].sort((a, b) => a.username.localeCompare(b.username)))
            setDialog(null)
            notify(`Akun @${created.username} berhasil dibuat.`)
          }}
        />
      )}
      {dialog?.kind === 'detail' && (
        <UserDetailModal
          user={dialog.user}
          onClose={() => setDialog(null)}
          onSaved={(updated, { passwordChanged }) => {
            replaceUser(updated)
            setDialog(null)
            notify(passwordChanged ? `Detail dan password @${updated.username} diperbarui.` : `Detail @${updated.username} diperbarui.`)
          }}
        />
      )}
    </>
  )
}
