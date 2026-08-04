-- ════════════════════════════════════════════════════════════════════
--  Rachel entre lignes — Schéma de base de données Supabase
--  À exécuter dans : Supabase Dashboard → SQL Editor → New query → Run
--
--  Modèle de sécurité :
--   • Les VISITEURS (rôle « anon ») peuvent LIRE le contenu publié et
--     AJOUTER des commentaires, des likes et des entrées de livre d'or.
--   • Ils ne peuvent JAMAIS modifier ou supprimer une publication.
--   • L'ADMINISTRATEUR (rôle « authenticated », c.-à-d. vous, connecté)
--     a tous les droits : créer, modifier, supprimer, modérer.
--  Tout est appliqué côté serveur par Row Level Security (RLS).
-- ════════════════════════════════════════════════════════════════════

-- Extensions utiles
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
--  1. PUBLICATIONS (poèmes et/ou photos)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  kind         text not null default 'poem'
               check (kind in ('poem', 'photo', 'both')),
  content_html text default '',            -- HTML riche (rédigé par l'admin, assaini au rendu)
  excerpt      text default '',            -- résumé texte pour les cartes / SEO
  image_url    text,                       -- URL publique de l'image (bucket « media »)
  image_alt    text default '',
  tags         text[] default '{}',
  published    boolean not null default true,
  pinned       boolean not null default false,
  likes_count  integer not null default 0, -- dénormalisé, maintenu par trigger
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_created_idx   on public.posts (created_at desc);
create index if not exists posts_published_idx on public.posts (published);
create index if not exists posts_tags_idx      on public.posts using gin (tags);

-- ─────────────────────────────────────────────────────────────
--  2. COMMENTAIRES (imbriqués, modérables)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  parent_id   uuid references public.comments(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 60),
  body        text not null check (char_length(body) between 1 and 2000),
  hidden      boolean not null default false,  -- masqué par l'admin
  pinned      boolean not null default false,  -- épinglé par l'admin
  likes_count integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists comments_post_idx   on public.comments (post_id, created_at);
create index if not exists comments_parent_idx on public.comments (parent_id);

-- ─────────────────────────────────────────────────────────────
--  3. LIKES (publications & commentaires) — anonymes via un identifiant
--     de visiteur stocké dans le localStorage du navigateur.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, visitor_id)
);

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, visitor_id)
);

-- ─────────────────────────────────────────────────────────────
--  4. LIVRE D'OR
-- ─────────────────────────────────────────────────────────────
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 1 and 60),
  body        text not null check (char_length(body) between 1 and 3000),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists guestbook_created_idx on public.guestbook (created_at desc);

-- ─────────────────────────────────────────────────────────────
--  5. CONTENU DE SITE (page « À propos », citation d'accueil…)
--     Table clé/valeur pour les singletons éditables.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Valeurs par défaut
insert into public.site_content (key, value) values
  ('about', '{"title":"À propos","html":"<p>Écrivez ici votre histoire…</p>"}'::jsonb),
  ('home',  '{"quote":"Les mots sont des fenêtres, ou des murs.","author":"—"}'::jsonb)
on conflict (key) do nothing;

-- ════════════════════════════════════════════════════════════════════
--  TRIGGERS : maintien des compteurs et des dates de mise à jour
-- ════════════════════════════════════════════════════════════════════

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_posts_touch on public.posts;
create trigger trg_posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_comments_touch on public.comments;
create trigger trg_comments_touch before update on public.comments
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_guestbook_touch on public.guestbook;
create trigger trg_guestbook_touch before update on public.guestbook
  for each row execute function public.touch_updated_at();

-- Compteur de likes des publications
create or replace function public.sync_post_likes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_post_likes on public.post_likes;
create trigger trg_post_likes after insert or delete on public.post_likes
  for each row execute function public.sync_post_likes();

-- Compteur de likes des commentaires
create or replace function public.sync_comment_likes()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif (tg_op = 'DELETE') then
    update public.comments set likes_count = greatest(0, likes_count - 1) where id = old.comment_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_comment_likes on public.comment_likes;
create trigger trg_comment_likes after insert or delete on public.comment_likes
  for each row execute function public.sync_comment_likes();

-- ════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

alter table public.posts         enable row level security;
alter table public.comments      enable row level security;
alter table public.post_likes    enable row level security;
alter table public.comment_likes enable row level security;
alter table public.guestbook     enable row level security;
alter table public.site_content  enable row level security;

-- ── POSTS ─────────────────────────────────────────────────────
-- Lecture publique des publications publiées ; l'admin voit tout.
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (published = true or auth.role() = 'authenticated');

-- Écriture réservée à l'administrateur connecté.
drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── COMMENTS ──────────────────────────────────────────────────
-- Lecture : commentaires visibles pour tous ; l'admin voit les masqués.
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments
  for select using (hidden = false or auth.role() = 'authenticated');

-- Les visiteurs peuvent AJOUTER un commentaire, mais pas préréglé
-- épinglé/masqué (contrôle applicatif + valeurs par défaut).
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert with check (
    pinned = false and hidden = false
  );

-- Seul l'admin peut modifier / masquer / épingler.
drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update on public.comments
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seul l'admin peut supprimer.
drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete on public.comments
  for delete using (auth.role() = 'authenticated');

-- ── POST_LIKES ────────────────────────────────────────────────
drop policy if exists post_likes_read on public.post_likes;
create policy post_likes_read on public.post_likes for select using (true);

drop policy if exists post_likes_insert on public.post_likes;
create policy post_likes_insert on public.post_likes for insert with check (true);

-- Un visiteur peut retirer SON propre like (même visitor_id).
drop policy if exists post_likes_delete on public.post_likes;
create policy post_likes_delete on public.post_likes for delete using (true);

-- ── COMMENT_LIKES ─────────────────────────────────────────────
drop policy if exists comment_likes_read on public.comment_likes;
create policy comment_likes_read on public.comment_likes for select using (true);

drop policy if exists comment_likes_insert on public.comment_likes;
create policy comment_likes_insert on public.comment_likes for insert with check (true);

drop policy if exists comment_likes_delete on public.comment_likes;
create policy comment_likes_delete on public.comment_likes for delete using (true);

-- ── GUESTBOOK ─────────────────────────────────────────────────
drop policy if exists guestbook_read on public.guestbook;
create policy guestbook_read on public.guestbook
  for select using (hidden = false or auth.role() = 'authenticated');

drop policy if exists guestbook_insert on public.guestbook;
create policy guestbook_insert on public.guestbook
  for insert with check (hidden = false);

drop policy if exists guestbook_admin_update on public.guestbook;
create policy guestbook_admin_update on public.guestbook
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists guestbook_admin_delete on public.guestbook;
create policy guestbook_admin_delete on public.guestbook
  for delete using (auth.role() = 'authenticated');

-- ── SITE_CONTENT ──────────────────────────────────────────────
drop policy if exists site_content_read on public.site_content;
create policy site_content_read on public.site_content for select using (true);

drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
--  STOCKAGE DES IMAGES (bucket public « media »)
-- ════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Lecture publique des images.
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

-- Seul l'admin peut téléverser / remplacer / supprimer des images.
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
--  DONNÉES DE DÉMONSTRATION (facultatif — à supprimer en production)
-- ════════════════════════════════════════════════════════════════════
insert into public.posts (slug, title, kind, excerpt, content_html, tags, pinned)
values
  ('a-l-encre-du-soir', 'À l''encre du soir', 'poem',
   'Un poème sur le crépuscule et les mots que l''on garde.',
   '<p>Le soir descend sur les toits endormis,<br>et la lumière hésite entre deux silences.</p><p><em>Je garde tes mots comme on garde une braise.</em></p>',
   ARRAY['crépuscule','silence'], true),
  ('fenetre-ouverte', 'Fenêtre ouverte', 'poem',
   'Une respiration, une fenêtre, un matin.',
   '<p>Ouvre la fenêtre :<br>le matin n''attendait que toi.</p>',
   ARRAY['matin','espoir'], false)
on conflict (slug) do nothing;

-- ════════════════════════════════════════════════════════════════════
--  FIN. Pensez ensuite à créer votre compte administrateur :
--  Dashboard → Authentication → Users → Add user (avec e-mail + mot de
--  passe). Désactivez les inscriptions publiques dans Authentication →
--  Providers → Email → « Enable sign-ups » = OFF pour rester seul admin.
-- ════════════════════════════════════════════════════════════════════
