-- Kolom tambahan tabel Cost: tiap pengguna membuat kolomnya sendiri (teks, angka, rupiah, tanggal, pilihan, centang).
-- Nilai disimpan terpisah dari tabel items dan cost_estimates, jadi data Accounts yang ada tidak berubah.
create table cost_columns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  name varchar(60) not null,
  type varchar(20) not null check (type in ('TEXT', 'NUMBER', 'CURRENCY', 'DATE', 'SELECT', 'CHECKBOX')),
  options text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_cost_columns_owner on cost_columns (owner_id, sort_order);

-- row_type + row_id menunjuk item Accounts (ITEM) atau estimasi manual (ESTIMATE); hapus kolom otomatis menghapus nilainya.
create table cost_cell_values (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references cost_columns (id) on delete cascade,
  row_type varchar(10) not null check (row_type in ('ITEM', 'ESTIMATE')),
  row_id uuid not null,
  cell_value text not null,
  unique (column_id, row_type, row_id)
);
create index idx_cost_cell_values_row on cost_cell_values (row_type, row_id);

alter table cost_columns enable row level security;
alter table cost_cell_values enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table cost_columns, cost_cell_values from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table cost_columns, cost_cell_values from authenticated;
  end if;
end
$$;
