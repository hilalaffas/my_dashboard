alter table users enable row level security;
alter table categories enable row level security;
alter table sub_categories enable row level security;
alter table items enable row level security;
alter table cost_estimates enable row level security;

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