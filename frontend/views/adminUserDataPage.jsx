'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ReadOnlyAccountTree } from '@/components/admin/readOnlyAccountTree'
import { ReadOnlyEstimateTable } from '@/components/admin/readOnlyEstimateTable'
import { useToast } from '@/components/common/toastProvider'
import { useSuperuserGuard } from '@/hooks/useSuperuserGuard'
import { adminApi } from '@/services/adminService'

export function AdminUserDataPage() {
  const { userId } = useParams()
  const notify = useToast()
  const isSuperuser = useSuperuserGuard()
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!isSuperuser || !userId) return
    Promise.all([adminApi.user(userId), adminApi.accounts(userId), adminApi.estimates(userId)])
      .then(([target, tree, rows]) => setData({ target, tree, rows }))
      .catch((err) => {
        notify(err instanceof Error ? err.message : 'Gagal memuat data pengguna.')
        setFailed(true)
      })
  }, [isSuperuser, userId, notify])

  if (!isSuperuser) return null

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Superuser · hanya lihat
          </div>
          <h1>{data ? `Data milik ${data.target.fullName}` : 'Data pengguna'}</h1>
          <p>
            {data
              ? `@${data.target.username} · ${data.target.email || 'tanpa email'}`
              : failed
                ? 'Data tidak dapat dimuat.'
                : 'Memuat…'}
          </p>
        </div>
        <div className="heading-actions">
          <Link href="/admin/users" className="outline-button">
            Kembali ke daftar
          </Link>
        </div>
      </div>

      {data && (
        <>
          <section className="panel adm-section">
            <div className="panel-heading">
              <div>
                <h2>Accounts</h2>
                <p>Kategori, sub kategori, dan item</p>
              </div>
            </div>
            <ReadOnlyAccountTree tree={data.tree} />
          </section>

          <section className="panel adm-section">
            <div className="panel-heading">
              <div>
                <h2>Cost estimates</h2>
                <p>Debit, kredit, dan saldo</p>
              </div>
            </div>
            <ReadOnlyEstimateTable rows={data.rows} />
          </section>
        </>
      )}
    </>
  )
}
