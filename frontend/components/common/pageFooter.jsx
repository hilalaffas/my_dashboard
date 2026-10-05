import { FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
export function PageFooter() {
  return (
    <footer>
      <span>
        Data tersimpan di perangkat Anda <b>•</b> Diperbarui baru saja
      </span>
      <Link href="/accounts" className="text-button">
        <FileSpreadsheet size={15} /> Manage source
      </Link>
    </footer>
  )
}
