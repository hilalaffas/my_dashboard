-- Entity Profile (tabel profiles) dipertahankan. V6 menghapus tabel ini, jadi dibuat ulang di sini agar
-- validasi Hibernate (ddl-auto: validate) lolos. "if not exists" membuat migrasi aman di database baru
-- maupun di database yang sudah pernah dimigrasi sampai V7. Tidak ada data awal.
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(120) not null,
  email varchar(160) not null
);

-- Sama seperti V7: tolak akses lewat Data API Supabase (aplikasi memakai JDBC sebagai pemilik tabel)
alter table profiles enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table profiles from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table profiles from authenticated;
  end if;
end
$$;
