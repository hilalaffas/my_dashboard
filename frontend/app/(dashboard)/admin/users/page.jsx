import { redirect } from 'next/navigation'

// Daftar pengguna sekarang ada di menu Manage → Manage akun
export default function Page() {
  redirect('/manage/users')
}
