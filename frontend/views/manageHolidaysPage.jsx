'use client'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmDialog } from '@/components/common/confirmDialog'
import { useToast } from '@/components/common/toastProvider'
import { HolidayModal } from '@/components/manage/holidayModal'
import { MONTHS, weekdayOfIso, WEEKDAYS } from '@/lib/budgetCalendar'
import { adminApi } from '@/services/adminService'

const KIND_LABEL = { NATIONAL: 'Libur nasional', COLLECTIVE: 'Cuti bersama' }

const dateText = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${WEEKDAYS[weekdayOfIso(iso) - 1]}, ${d} ${MONTHS[m - 1]} ${y}`
}

/** Tab "Hari libur" (superuser): daftar tanggal merah yang dipakai kalender semua pengguna. Pemerintah menetapkannya lewat SKB Tiga Menteri. */
export function ManageHolidaysPage() {
  const notify = useToast()
  const [year, setYear] = useState(null)
  const [items, setItems] = useState(null)
  const [dialog, setDialog] = useState(null) // { kind: 'form', holiday? } | { kind: 'delete', holiday }

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  const load = useCallback(
    async (y) => {
      setItems(null)
      try {
        setItems(await adminApi.holidays(y))
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Gagal memuat hari libur.')
        setItems([])
      }
    },
    [notify],
  )

  useEffect(() => {
    if (year) void load(year)
  }, [year, load])

  const yearOptions = year ? [year - 1, year, year + 1, year + 2] : []

  return (
    <>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Hari libur nasional dan cuti bersama</h2>
            <p>
              Dipakai kalender anggaran semua pengguna untuk menghitung hari kerja. Tanggal Idulfitri dan Iduladha ditetapkan Menteri
              Agama, perbaiki di sini bila berubah.
            </p>
          </div>
          <div className="pv-toolbar">
            <label className="mg-year">
              <span className="sr-only">Tahun</span>
              <select value={year ?? ''} onChange={(e) => setYear(Number(e.target.value))} disabled={!year} aria-label="Tahun">
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" onClick={() => setDialog({ kind: 'form' })} disabled={!year}>
              <Plus size={17} /> Hari libur baru
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>NAMA</th>
                <th>JENIS</th>
                <th className="numeric">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {items === null && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    Memuat…
                  </td>
                </tr>
              )}
              {items?.map((h) => (
                <tr key={h.id}>
                  <td>
                    <b>{dateText(h.date)}</b>
                  </td>
                  <td>{h.name}</td>
                  <td>
                    <span className={`status ${h.kind === 'NATIONAL' ? 'planned' : 'received'}`}>{KIND_LABEL[h.kind]}</span>
                  </td>
                  <td className="numeric">
                    <div className="row-actions">
                      <button className="icon-action" aria-label={`Ubah ${h.name}`} onClick={() => setDialog({ kind: 'form', holiday: h })}>
                        <Pencil size={15} />
                      </button>
                      <button className="icon-action danger" aria-label={`Hapus ${h.name}`} onClick={() => setDialog({ kind: 'delete', holiday: h })}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items?.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    Belum ada hari libur untuk {year}. Tambahkan sesuai SKB Tiga Menteri tahun itu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {dialog?.kind === 'form' && (
        <HolidayModal
          holiday={dialog.holiday}
          defaultYear={year}
          onClose={() => setDialog(null)}
          onSaved={(saved) => {
            setDialog(null)
            notify(dialog.holiday ? 'Hari libur diperbarui.' : 'Hari libur ditambahkan.')
            if (Number(saved.date.slice(0, 4)) === year) void load(year)
            else setYear(Number(saved.date.slice(0, 4)))
          }}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Hapus hari libur"
          message={`Hapus “${dialog.holiday.name}” (${dateText(dialog.holiday.date)})? Hari itu akan dihitung sebagai hari kerja biasa.`}
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            try {
              await adminApi.deleteHoliday(dialog.holiday.id)
              setItems((prev) => prev.filter((h) => h.id !== dialog.holiday.id))
              setDialog(null)
              notify('Hari libur dihapus.')
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Gagal menghapus hari libur.')
            }
          }}
        />
      )}
    </>
  )
}
