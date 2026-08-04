-- ════════════════════════════════════════════════════════════════════
--  MIGRATION — Vague 2
--  À exécuter UNE SEULE FOIS dans Supabase → SQL Editor → New query.
--  Ce script est ADDITIF : il ne modifie pas les tables existantes.
--  Il ajoute : Lectures, Livres publiés, Abonnés à la newsletter.
-- ════════════════════════════════════════════════════════════════════

-- ── Réutilise le déclencheur de date déjà défini dans schema.sql ──────
--    (public.touch_updated_at existe déjà — on s'en sert ci-dessous.)

-- ════════════════════════════════════════════════════════════════════
--  1. LECTURES  (livres lus et recommandés)
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.readings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null default '',
  cover_url   text,
  description text not null default '',   -- résumé du livre
  review      text not null default '',   -- mon avis
  rating      smallint not null default 0 check (rating between 0 and 5),
  quotes      text[] not null default '{}',
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_readings_touch on public.readings;
create trigger trg_readings_touch before update on public.readings
  for each row execute function public.touch_updated_at();

alter table public.readings enable row level security;

drop policy if exists readings_read on public.readings;
create policy readings_read on public.readings
  for select using (published = true or auth.role() = 'authenticated');

drop policy if exists readings_admin_write on public.readings;
create policy readings_admin_write on public.readings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
--  2. LIVRES PUBLIÉS  (votre livre + livres mis en avant)
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null default '',
  cover_url   text,
  summary     text not null default '',   -- résumé
  buy_url     text,                        -- lien vers l'achat
  pinned      boolean not null default false, -- votre livre en tête
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_books_touch on public.books;
create trigger trg_books_touch before update on public.books
  for each row execute function public.touch_updated_at();

alter table public.books enable row level security;

drop policy if exists books_read on public.books;
create policy books_read on public.books
  for select using (published = true or auth.role() = 'authenticated');

drop policy if exists books_admin_write on public.books;
create policy books_admin_write on public.books
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
--  3. ABONNÉS NEWSLETTER  (collecte des e-mails, sans envoi automatique)
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- N'importe quel visiteur peut s'inscrire…
drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers
  for insert with check (true);

-- …mais SEUL l'administrateur peut consulter la liste des e-mails
-- (donnée personnelle : jamais exposée publiquement).
drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select using (auth.role() = 'authenticated');

drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete using (auth.role() = 'authenticated');

-- ── Fin de la migration ──────────────────────────────────────────────
