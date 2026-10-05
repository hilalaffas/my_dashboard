create table users (
  id uuid primary key default gen_random_uuid(),
  username varchar(60) not null unique,
  password_hash varchar(100) not null,
  full_name varchar(120) not null,
  role varchar(20) not null default 'USER' check (role in ('ADMIN', 'USER')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
