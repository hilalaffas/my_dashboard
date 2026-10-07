create table profiles (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(120) not null,
  email varchar(160) not null
);

insert into profiles (full_name, email) values ('User Testing', 'user.testing@email.com');