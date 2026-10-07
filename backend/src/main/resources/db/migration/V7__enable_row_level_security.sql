-- Pertahanan berlapis untuk Supabase: tabel di schema public otomatis bisa diakses lewat Data API (PostgREST)
-- memakai anon key. Aplikasi ini TIDAK memakai Data API (hanya koneksi JDBC sebagai pemilik tabel, yang tidak
-- terpengaruh RLS), jadi RLS dinyalakan tanpa policy = semua akses lewat Data API ditolak.
-- Catatan: flyway_schema_history sengaja tidak disentuh di sini (tabel milik Flyway yang sedang dipakai saat
-- migrasi berjalan). Amankan secara manual lewat SQL Editor Supabase setelah migrasi selesai.
alter table users enable row level security;
alter table categories enable row level security;
alter table sub_categories enable row level security;
alter table items enable row level security;
alter table cost_estimates enable row level security;

-- Role anon/authenticated hanya ada di Supabase; di Postgres biasa blok ini dilewati
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table users, categories, sub_categories, items, cost_estimates from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table users, categories, sub_categories, items, cost_estimates from authenticated;
  end if;
end
$$;