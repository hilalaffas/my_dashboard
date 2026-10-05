create table cost_estimates (
  id uuid primary key default gen_random_uuid(),
  type varchar(80) not null,
  detail varchar(120) not null,
  debit numeric(15, 2) not null default 0 check (debit >= 0),
  credit numeric(15, 2) not null default 0 check (credit >= 0),
  created_at timestamptz not null default now()
);
