create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(120) not null,
  email varchar(160) not null
);

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