-- Data kini milik per pengguna. Data lama (jika ada) diserahkan ke admin tertua.
alter table categories add column owner_id uuid references users (id) on delete cascade;
alter table cost_estimates add column owner_id uuid references users (id) on delete cascade;

update categories
   set owner_id = (select id from users where role = 'ADMIN' order by created_at limit 1)
 where owner_id is null;
update cost_estimates
   set owner_id = (select id from users where role = 'ADMIN' order by created_at limit 1)
 where owner_id is null;

-- Baris tanpa pemilik (tidak ada admin saat migrasi) tidak bisa ditampilkan ke siapa pun, jadi dibuang
delete from categories where owner_id is null;
delete from cost_estimates where owner_id is null;

alter table categories alter column owner_id set not null;
alter table cost_estimates alter column owner_id set not null;

create index idx_categories_owner on categories (owner_id);
create index idx_cost_estimates_owner on cost_estimates (owner_id);

-- Profil kini diambil dari tabel users (nama lengkap dan email milik masing-masing pengguna)
drop table if exists profiles;
