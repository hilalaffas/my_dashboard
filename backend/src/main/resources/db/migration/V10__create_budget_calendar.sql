-- Fase 2 anggaran: hari libur (data bersama), cuti pengguna, dan aturan hitung per item Accounts.

-- Hari libur nasional dan cuti bersama. Satu baris per tanggal; superuser mengelolanya lewat menu Manage.
create table holidays (
  id uuid primary key default gen_random_uuid(),
  holiday_date date not null unique,
  name varchar(120) not null,
  kind varchar(12) not null check (kind in ('NATIONAL', 'COLLECTIVE')),
  created_at timestamptz not null default now()
);

-- Hari cuti pribadi: mengurangi hari kerja pada bulan tersebut.
create table leave_days (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  leave_date date not null,
  created_at timestamptz not null default now(),
  unique (owner_id, leave_date)
);

-- Cara sebuah item dihitung: per hari kalender (DAY), hari kerja (WORKDAY), atau mingguan (WEEK, pada hari week_day 1=Senin..7=Minggu).
-- basis RATE  = tarif per satuan dikali jumlah satuan bulan itu.
-- basis FORECAST = nominal bulanan item dibagi rata ke jumlah satuan bulan itu.
create table budget_rules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  item_id uuid not null unique references items (id) on delete cascade,
  unit varchar(10) not null check (unit in ('DAY', 'WORKDAY', 'WEEK')),
  basis varchar(10) not null check (basis in ('RATE', 'FORECAST')),
  rate numeric(15, 2),
  week_day integer not null default 1 check (week_day between 1 and 7),
  created_at timestamptz not null default now(),
  check (basis <> 'RATE' or rate is not null)
);
create index idx_budget_rules_owner on budget_rules (owner_id);
create index idx_leave_days_owner on leave_days (owner_id, leave_date);

alter table holidays enable row level security;
alter table leave_days enable row level security;
alter table budget_rules enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table holidays, leave_days, budget_rules from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table holidays, leave_days, budget_rules from authenticated;
  end if;
end
$$;

-- Data awal: SKB Tiga Menteri 2026 (17 libur nasional + 8 cuti bersama) dan 2027 (18 libur nasional + 8 cuti bersama).
-- Tanggal Idulfitri dan Iduladha ditetapkan Menteri Agama; bila berubah, superuser memperbaikinya di menu Manage.
insert into holidays (holiday_date, name, kind) values
  ('2026-01-01', 'Tahun Baru Masehi', 'NATIONAL'),
  ('2026-01-16', 'Isra Mikraj Nabi Muhammad SAW', 'NATIONAL'),
  ('2026-02-16', 'Cuti Bersama Tahun Baru Imlek', 'COLLECTIVE'),
  ('2026-02-17', 'Tahun Baru Imlek 2577 Kongzili', 'NATIONAL'),
  ('2026-03-18', 'Cuti Bersama Hari Suci Nyepi', 'COLLECTIVE'),
  ('2026-03-19', 'Hari Suci Nyepi (Tahun Baru Saka 1948)', 'NATIONAL'),
  ('2026-03-20', 'Cuti Bersama Idulfitri 1447 H', 'COLLECTIVE'),
  ('2026-03-21', 'Idulfitri 1447 H', 'NATIONAL'),
  ('2026-03-22', 'Idulfitri 1447 H', 'NATIONAL'),
  ('2026-03-23', 'Cuti Bersama Idulfitri 1447 H', 'COLLECTIVE'),
  ('2026-03-24', 'Cuti Bersama Idulfitri 1447 H', 'COLLECTIVE'),
  ('2026-04-03', 'Wafat Yesus Kristus', 'NATIONAL'),
  ('2026-04-05', 'Kebangkitan Yesus Kristus (Paskah)', 'NATIONAL'),
  ('2026-05-01', 'Hari Buruh Internasional', 'NATIONAL'),
  ('2026-05-14', 'Kenaikan Yesus Kristus', 'NATIONAL'),
  ('2026-05-15', 'Cuti Bersama Kenaikan Yesus Kristus', 'COLLECTIVE'),
  ('2026-05-27', 'Iduladha 1447 H', 'NATIONAL'),
  ('2026-05-28', 'Cuti Bersama Iduladha 1447 H', 'COLLECTIVE'),
  ('2026-05-31', 'Hari Raya Waisak 2570 BE', 'NATIONAL'),
  ('2026-06-01', 'Hari Lahir Pancasila', 'NATIONAL'),
  ('2026-06-16', 'Tahun Baru Islam 1448 H', 'NATIONAL'),
  ('2026-08-17', 'Proklamasi Kemerdekaan', 'NATIONAL'),
  ('2026-08-25', 'Maulid Nabi Muhammad SAW', 'NATIONAL'),
  ('2026-12-24', 'Cuti Bersama Natal', 'COLLECTIVE'),
  ('2026-12-25', 'Kelahiran Yesus Kristus (Natal)', 'NATIONAL'),
  ('2027-01-01', 'Tahun Baru 2027 Masehi', 'NATIONAL'),
  ('2027-01-05', 'Isra Mikraj Nabi Muhammad SAW', 'NATIONAL'),
  ('2027-02-05', 'Cuti Bersama Tahun Baru Imlek', 'COLLECTIVE'),
  ('2027-02-06', 'Tahun Baru Imlek 2578 Kongzili', 'NATIONAL'),
  ('2027-03-08', 'Hari Suci Nyepi (Tahun Baru Saka 1949)', 'NATIONAL'),
  ('2027-03-09', 'Cuti Bersama Idulfitri 1448 H', 'COLLECTIVE'),
  ('2027-03-10', 'Idulfitri 1448 H', 'NATIONAL'),
  ('2027-03-11', 'Idulfitri 1448 H', 'NATIONAL'),
  ('2027-03-12', 'Cuti Bersama Idulfitri 1448 H', 'COLLECTIVE'),
  ('2027-03-15', 'Cuti Bersama Idulfitri 1448 H', 'COLLECTIVE'),
  ('2027-03-25', 'Cuti Bersama Wafat Yesus Kristus', 'COLLECTIVE'),
  ('2027-03-26', 'Wafat Yesus Kristus', 'NATIONAL'),
  ('2027-03-28', 'Kebangkitan Yesus Kristus (Paskah)', 'NATIONAL'),
  ('2027-05-01', 'Hari Buruh Internasional', 'NATIONAL'),
  ('2027-05-06', 'Kenaikan Yesus Kristus', 'NATIONAL'),
  ('2027-05-17', 'Iduladha 1448 H', 'NATIONAL'),
  ('2027-05-18', 'Cuti Bersama Iduladha 1448 H', 'COLLECTIVE'),
  ('2027-05-19', 'Cuti Bersama Hari Raya Waisak', 'COLLECTIVE'),
  ('2027-05-20', 'Hari Raya Waisak 2571 BE', 'NATIONAL'),
  ('2027-06-01', 'Hari Lahir Pancasila', 'NATIONAL'),
  ('2027-06-06', 'Tahun Baru Islam 1449 H', 'NATIONAL'),
  ('2027-08-15', 'Maulid Nabi Muhammad SAW', 'NATIONAL'),
  ('2027-08-17', 'Proklamasi Kemerdekaan', 'NATIONAL'),
  ('2027-12-24', 'Cuti Bersama Natal', 'COLLECTIVE'),
  ('2027-12-25', 'Kelahiran Yesus Kristus (Natal)', 'NATIONAL'),
  ('2027-12-26', 'Isra Mikraj Nabi Muhammad SAW', 'NATIONAL');
