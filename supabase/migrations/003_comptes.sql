-- ════════════════════════════════════════════════════════════════════
--  MIGRATION — Vague 3 : Comptes utilisateurs
--  À exécuter UNE SEULE FOIS dans Supabase → SQL Editor → New query.
--
--  ⚠️  ORDRE IMPORTANT :
--     1) Exécutez ce script AVANT de réactiver les inscriptions publiques.
--        (À cet instant, vous êtes le seul compte : le script vous promeut
--         donc automatiquement administratrice.)
--     2) Ensuite seulement, réactivez les inscriptions dans
--        Authentication → Providers → Email (voir README).
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
--  1. QUI EST ADMINISTRATEUR ?
--  On ne peut plus se contenter de « est connecté » : n'importe quel
--  visiteur inscrit serait alors admin. On tient donc une liste explicite
--  des administrateurs, inaccessible depuis le site (aucune policy = aucun
--  accès via l'API publique ; seule la console SQL peut la modifier).
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
-- (Volontairement AUCUNE policy : la table est privée.)

-- Fonction utilitaire : l'utilisateur courant est-il administrateur ?
-- SECURITY DEFINER pour pouvoir lire la table privée admins.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Promotion automatique des comptes EXISTANTS (c'est-à-dire vous, seul
-- compte à ce stade). Les futurs inscrits ne seront PAS admin.
insert into public.admins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ════════════════════════════════════════════════════════════════════
--  2. PROFILS
--  Un profil simple par utilisateur. Ne contient PAS le statut admin
--  (géré séparément ci-dessus) pour éviter toute élévation de privilège.
-- ════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  display_name          text not null default '',
  subscribed_newsletter boolean not null default false,
  created_at            timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Lecture : son propre profil (l'admin peut tout lire).
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- Création / mise à jour : uniquement son propre profil.
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Création automatique du profil à l'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, subscribed_newsletter)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'subscribed_newsletter')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════
--  3. LIER COMMENTAIRES & PLUMES INVITÉES AUX COMPTES
-- ════════════════════════════════════════════════════════════════════
alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.guestbook
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- ════════════════════════════════════════════════════════════════════
--  4. RÉÉCRITURE DES RÈGLES DE SÉCURITÉ
--  Partout où « admin » valait « connecté », on utilise désormais
--  public.is_admin(). Et l'écriture publique (commentaires, plumes)
--  exige d'être connecté ET d'agir en son propre nom.
-- ════════════════════════════════════════════════════════════════════

-- ── POSTS ─────────────────────────────────────────────────────
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (published = true or public.is_admin());

drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ── COMMENTS ──────────────────────────────────────────────────
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments
  for select using (hidden = false or public.is_admin());

-- Ajout réservé aux personnes connectées, en leur propre nom.
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert with check (
    auth.uid() = user_id and pinned = false and hidden = false
  );

drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update on public.comments
  for update using (public.is_admin()) with check (public.is_admin());

-- Suppression : l'admin, ou l'auteur de son propre commentaire.
drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete on public.comments
  for delete using (public.is_admin());

drop policy if exists comments_owner_delete on public.comments;
create policy comments_owner_delete on public.comments
  for delete using (auth.uid() = user_id);

-- ── GUESTBOOK (Les Plumes Invitées) ───────────────────────────
drop policy if exists guestbook_read on public.guestbook;
create policy guestbook_read on public.guestbook
  for select using (hidden = false or public.is_admin());

drop policy if exists guestbook_insert on public.guestbook;
create policy guestbook_insert on public.guestbook
  for insert with check (auth.uid() = user_id and hidden = false);

drop policy if exists guestbook_admin_update on public.guestbook;
create policy guestbook_admin_update on public.guestbook
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists guestbook_admin_delete on public.guestbook;
create policy guestbook_admin_delete on public.guestbook
  for delete using (public.is_admin());

drop policy if exists guestbook_owner_delete on public.guestbook;
create policy guestbook_owner_delete on public.guestbook
  for delete using (auth.uid() = user_id);

-- ── SITE_CONTENT (accueil, à propos) ──────────────────────────
drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- ── READINGS (Lectures) ───────────────────────────────────────
drop policy if exists readings_read on public.readings;
create policy readings_read on public.readings
  for select using (published = true or public.is_admin());

drop policy if exists readings_admin_write on public.readings;
create policy readings_admin_write on public.readings
  for all using (public.is_admin()) with check (public.is_admin());

-- ── BOOKS (Mes livres) ────────────────────────────────────────
drop policy if exists books_read on public.books;
create policy books_read on public.books
  for select using (published = true or public.is_admin());

drop policy if exists books_admin_write on public.books;
create policy books_admin_write on public.books
  for all using (public.is_admin()) with check (public.is_admin());

-- ── NEWSLETTER ────────────────────────────────────────────────
drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select using (public.is_admin());

drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete using (public.is_admin());

-- Un utilisateur connecté peut retirer SA propre adresse (désabonnement).
drop policy if exists newsletter_self_delete on public.newsletter_subscribers;
create policy newsletter_self_delete on public.newsletter_subscribers
  for delete using (auth.jwt() ->> 'email' = email);

-- ── Fin de la migration ──────────────────────────────────────────────
-- Rappel : réactivez ensuite les inscriptions (Authentication → Email)
-- et renseignez les URL de redirection (voir README, section Vague 3).
