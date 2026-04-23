-- admin_emails tablosu + whitelist + RLS
create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz default now()
);

insert into public.admin_emails (email) values ('portomarketin@gmail.com')
on conflict do nothing;

alter table public.admin_emails enable row level security;

drop policy if exists "self check" on public.admin_emails;
create policy "self check" on public.admin_emails
  for select using (auth.jwt() ->> 'email' = email);
