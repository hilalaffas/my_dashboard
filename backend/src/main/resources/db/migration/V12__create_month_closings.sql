-- Fase 4: penutupan bulan. Angka rekonsiliasi sebuah bulan dibekukan, sehingga perubahan tarif, aturan, atau kalender
-- sesudahnya tidak mengubah angka bulan yang sudah lewat. Catatan harian pada bulan tertutup terkunci.
create table month_closings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  closing_month date not null check (extract(day from closing_month) = 1),
  closed_at timestamptz not null default now(),
  unique (owner_id, closing_month)
);

-- item_id sengaja tanpa foreign key: riwayat tetap utuh walau item Accounts dihapus kemudian; nama disimpan apa adanya.
create table month_closing_items (
  id uuid primary key default gen_random_uuid(),
  closing_id uuid not null references month_closings (id) on delete cascade,
  item_id uuid not null,
  item_name varchar(120) not null,
  category_name varchar(120) not null,
  sub_name varchar(120) not null,
  mode varchar(6) not null check (mode in ('AUTO', 'MANUAL')),
  budget numeric(15, 2) not null check (budget >= 0),
  planned_to_date numeric(15, 2) not null check (planned_to_date >= 0),
  actual numeric(15, 2) not null check (actual >= 0)
);
create index idx_month_closing_items_closing on month_closing_items (closing_id);

alter table month_closings enable row level security;
alter table month_closing_items enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table month_closings, month_closing_items from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table month_closings, month_closing_items from authenticated;
  end if;
end
$$;
