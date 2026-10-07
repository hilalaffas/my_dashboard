alter table users
  add column email varchar(160),
  add column email_verified boolean not null default false,
  add column verification_code_hash varchar(100),
  add column verification_expires_at timestamptz,
  add column verification_attempts integer not null default 0,
  add column verification_sent_at timestamptz;

create unique index uq_users_email on users (lower(email));