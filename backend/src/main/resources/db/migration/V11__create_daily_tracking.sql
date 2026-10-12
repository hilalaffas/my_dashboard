-- Fase 3: pelacakan pengeluaran harian.
-- mode AUTO   = terpotong otomatis sesuai jadwal aturan hitung; catatan harian hanya dipakai untuk koreksi.
-- mode MANUAL = pengguna mengisi pengeluaran nyata tiap hari; jadwal aturan hanya menjadi pembanding.
alter table budget_rules
  add column mode varchar(6) not null default 'AUTO' check (mode in ('AUTO', 'MANUAL'));

-- Satu catatan per item per tanggal: pengeluaran nyata (MANUAL) atau koreksi atas potongan otomatis (AUTO).
-- Jumlah 0 berarti "tidak ada pengeluaran hari itu"; menghapus catatan mengembalikan ke jadwal (AUTO) atau belum diisi (MANUAL).
create table daily_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  item_id uuid not null references items (id) on delete cascade,
  entry_date date not null,
  amount numeric(15, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (item_id, entry_date)
);
create index idx_daily_entries_owner_date on daily_entries (owner_id, entry_date);

alter table daily_entries enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table daily_entries from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table daily_entries from authenticated;
  end if;
end
$$;
