create table categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  created_at timestamptz not null default now()
);

create table sub_categories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  name varchar(120) not null,
  created_at timestamptz not null default now()
);
create index idx_sub_categories_category on sub_categories (category_id);

create table items (
  id uuid primary key default gen_random_uuid(),
  sub_category_id uuid not null references sub_categories (id) on delete cascade,
  name varchar(120) not null,
  amount numeric(15, 2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now()
);
create index idx_items_sub_category on items (sub_category_id);
