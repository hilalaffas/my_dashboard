'use client'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { categoryProgress } from '@/lib/dailyTracker'
import { formatRp } from '@/lib/formatters'
import { CategoryProgress } from './categoryProgress'

/** Ringkasan realisasi bulan berjalan untuk Overview dan Reports. Dirender hanya bila ada item yang dilacak. */
export function RealisationPanel({ rec, monthLabel }) {
  const { totals, items } = rec
  const save = totals.variance >= 0
  return (
    <section className="panel dt-real">
      <div className="panel-heading">
        <div>
          <h2>Realisasi {monthLabel}</h2>
          <p>Anggaran lawan pengeluaran nyata dari catatan harian</p>
        </div>
        <Link href="/accounts/daily" className="text-button">
          Buka harian <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="dt-real-stats">
        <div>
          <span>Terpakai s/d hari ini</span>
          <strong>{formatRp(totals.actualToDate)}</strong>
          <small>dari rencana {formatRp(totals.plannedToDate)}</small>
        </div>
        <div>
          <span>{save ? 'Hemat' : 'Melebihi rencana'}</span>
          <strong className={save ? 'dt-save' : 'dt-over'}>{formatRp(Math.abs(totals.variance))}</strong>
        </div>
        <div>
          <span>Proyeksi akhir bulan</span>
          <strong className={totals.projection > totals.budget + 0.005 ? 'dt-over' : undefined}>{formatRp(totals.projection)}</strong>
          <small>anggaran {formatRp(totals.budget)}</small>
        </div>
      </div>

      {totals.pending > 0 && (
        <p className="dt-note">
          {totals.pending} catatan Manual belum diisi.{' '}
          <Link href="/accounts/daily" className="inline-link">
            Isi sekarang
          </Link>
        </p>
      )}

      <CategoryProgress rows={categoryProgress(items)} />
    </section>
  )
}
