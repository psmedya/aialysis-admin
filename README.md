# AIALYSIS Admin Panel

Production-ready yonetim paneli. Stack:

- Next.js 16 (App Router, Turbopack default)
- TypeScript 5
- Tailwind CSS v4 + shadcn/ui (Radix)
- Supabase SSR auth (`@supabase/ssr`)
- TanStack Query v5
- React Hook Form + Zod
- Recharts, lucide-react, date-fns, sonner, next-themes

## Calistirma

```bash
npm install
cp .env.example .env.local   # degerleri doldur
npm run dev
```

Tarayicida: http://localhost:3000 → `/login` (sadece admin_emails tablosundaki email ile).

## ENV

| Key                            | Aciklama                                             |
| ------------------------------ | ---------------------------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL       | Supabase proje URL                                   |
| NEXT_PUBLIC_SUPABASE_ANON_KEY  | Anon key (tarayici tarafi)                           |
| SUPABASE_SERVICE_ROLE_KEY      | Service role — server route'larda (opsiyonel)       |

## Admin whitelisting

Supabase'de `admin_emails` tablosu:

```sql
create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz default now()
);
insert into admin_emails (email) values ('portomarketin@gmail.com') on conflict do nothing;
-- RLS: anon kullanicinin kendi email'ini dogrulamasina izin ver
alter table public.admin_emails enable row level security;
create policy "self check" on public.admin_emails
  for select using (auth.jwt() ->> 'email' = email);
```

## Deploy (Vercel)

```bash
cd /Users/nn/aialysis-admin
git init && git add -A && git commit -m "init admin panel"
# GitHub repo yarat, push
vercel
# veya dashboard uzerinden proje ekle
```

Vercel environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Opsiyonel custom domain: `admin.aialysis.live` (CNAME → cname.vercel-dns.com).

## Yapi

```
app/
  (auth)/login           → Supabase OTP login
  (panel)/
    layout.tsx           → Sidebar + topbar + admin guard
    page.tsx             → Dashboard
    config/              → Remote Config editor
    users/[id]           → Kullanici listesi + detay
    matches/[id]         → Mac yonetimi + override
    predictions/         → Tahmin listesi, sonuc override, sil
    crons/               → Cron monitor + manuel tetikle
    functions/           → Edge Function playground
    forum/reports        → Forum + raporlar (iskelet)
    blog/new             → Blog yazi olustur (iskelet)
    analytics/           → DAU/WAU/MAU (iskelet)
    settings/            → Bakim modu, flags, kill switch
  api/
    trigger-function     → Edge function proxy
  denied                 → Yetkisiz erisim
proxy.ts                 → Auth middleware (Next 16)
lib/supabase/            → client/server/admin/middleware helpers
components/              → app-sidebar, stats-card, providers
```
