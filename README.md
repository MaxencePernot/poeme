# Rachel entre lignes ✒️

Un site personnel de **poésie, de lecture et de photographie** : élégant, minimaliste,
apaisant. Construit avec **React + Vite + Tailwind CSS + Supabase**, prêt à
déployer sur **Netlify**.

Palette blanc / violet pastel / vert pastel, animations discrètes, éditeur de
texte riche, commentaires imbriqués, likes, galerie avec agrandissement, livre
d'or modérable, et un véritable tableau de bord d'administration protégé.

---

## ✨ Fonctionnalités

- **Accueil** — bannière animée, citation éditable, statistiques, derniers poèmes et photos.
- **Recueil de poèmes** — recherche, filtres par tag, pagination.
- **Publications riches** — texte seul, image seule ou les deux ; titre, date, tags, contenu WYSIWYG.
- **Éditeur riche** (façon Word/Notion) — gras, italique, souligné, barré, tailles, couleurs, polices, citations, listes, liens, alignements, images, emojis.
- **Commentaires** — imbriqués (réponses), likes, anti-spam (honeypot + validation). Modération admin : modifier, masquer, épingler, supprimer.
- **Likes** — compteur + animation, un like par navigateur.
- **Galerie** — grille responsive, agrandissement plein écran (clavier ← → Échap).
- **Livre d'or** — messages libres, corrigeables/masquables/supprimables par l'admin.
- **À propos** — page éditable en direct par l'admin.
- **Administration** — connexion sécurisée, tableau de bord, gestion complète.
- **Technique** — SEO + Open Graph par page, favicon, sitemap, robots.txt, URL propres, lazy loading, code splitting, protection XSS, RLS Supabase.

---

## 🚀 Démarrage rapide

### 1. Prérequis

- [Node.js](https://nodejs.org) **18 ou 20+**
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Netlify](https://netlify.com) (gratuit) pour le déploiement

### 2. Installation

```bash
npm install
```

### 3. Créer le projet Supabase

1. Sur [supabase.com](https://supabase.com), créez un nouveau projet.
2. Ouvrez **SQL Editor → New query**, collez tout le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql), puis cliquez sur **Run**.
   Cela crée les tables, les triggers, **toutes les règles de sécurité (RLS)**
   et le bucket d'images `media`.
3. Créez **votre** compte administrateur :
   **Authentication → Users → Add user** (e-mail + mot de passe).
4. **Important — restez seul admin** :
   **Authentication → Providers → Email** → désactivez *« Enable sign-ups »*.
   Ainsi, personne ne peut créer de compte : vous êtes le seul administrateur.

### 4. Configurer les variables d'environnement

Copiez le modèle puis renseignez vos valeurs :

```bash
cp .env.example .env
```

Dans **Supabase → Project Settings → API**, récupérez :

| Variable                  | Où la trouver                              |
| ------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`       | *Project URL*                              |
| `VITE_SUPABASE_ANON_KEY`  | *Project API keys → `anon` `public`*       |

> Ces clés sont **publiques par conception**. La sécurité repose sur les règles
> RLS définies dans le schéma, pas sur le secret de la clé.

### 5. Lancer en local

```bash
npm run dev
```

Le site s'ouvre sur `http://localhost:5173`. Connectez-vous via l'icône
🔒 discrète en haut à droite, ou directement sur `/connexion`.

---

## 📦 Déploiement sur Netlify

### Option A — via Git (recommandé)

1. Poussez le projet sur GitHub / GitLab.
2. Sur Netlify : **Add new site → Import an existing project**.
3. Netlify détecte `netlify.toml` automatiquement :
   - *Build command* : `npm run build`
   - *Publish directory* : `dist`
4. **Site settings → Environment variables** : ajoutez `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` et `VITE_SUPABASE_BUCKET`.
5. Déployez. 🎉

### Option B — en ligne de commande

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

> Après le déploiement, pensez à mettre à jour l'URL du site dans
> `index.html`, `public/robots.txt`, `public/sitemap.xml` et
> `src/components/ui/Seo.jsx` (constante `BASE`).

---

## 🗂️ Architecture

```
rachel-entre-lignes/
├── index.html                 # Métadonnées SEO / Open Graph de base
├── netlify.toml               # Build, redirections SPA, en-têtes de sécurité
├── tailwind.config.js         # Palette, typographie, animations
├── public/                    # favicon, robots.txt, sitemap.xml, _redirects
├── supabase/schema.sql        # Tables + triggers + RLS + bucket (à exécuter)
└── src/
    ├── main.jsx               # Point d'entrée (providers, routeur)
    ├── App.jsx                # Définition des routes
    ├── index.css              # Styles globaux + prose des poèmes + animations
    ├── lib/                   # supabase, sanitisation XSS, stockage, utils
    ├── context/AuthContext.jsx# Session administrateur
    ├── hooks/                 # usePosts, useComments, useLikes, useGuestbook…
    ├── components/
    │   ├── layout/            # Navbar, Footer, Layout
    │   ├── ui/                # Icônes, boutons, toasts, en-têtes, pagination
    │   ├── poems/             # Carte, contenu, tags, partage
    │   ├── comments/          # Formulaire + fil imbriqué
    │   ├── gallery/           # Lightbox
    │   ├── editor/            # Éditeur riche TipTap + barre d'outils
    │   └── admin/             # Coquille, route protégée, formulaire de post
    └── pages/                 # Accueil, Poèmes, Détail, Galerie, Livre d'or,
        └── admin/             # À propos, Connexion, 404 + tableau de bord
```

---

## 🔐 Sécurité

- **Authentification** via Supabase Auth (session persistante, jetons rafraîchis).
- **Row Level Security** sur toutes les tables : les visiteurs ne peuvent que
  lire le contenu publié et ajouter commentaires / likes / entrées de livre
  d'or. Toute modification ou suppression de publication exige une session
  administrateur — **appliqué côté serveur**, impossible à contourner depuis le
  navigateur.
- **Protection XSS** : le HTML riche des poèmes est assaini avec `DOMPurify`
  avant affichage ; les commentaires et le livre d'or sont du texte brut
  (échappé par React).
- **Anti-spam** : champ piège (*honeypot*) + validation de longueur + détection
  de motifs. Pour aller plus loin, vous pouvez ajouter
  [hCaptcha](https://www.hcaptcha.com) ou une *Edge Function* de limitation.
- **En-têtes de sécurité** (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
  configurés dans `netlify.toml`.

---

## 🎨 Personnalisation

- **Couleurs & polices** : `tailwind.config.js` (objet `colors`, `fontFamily`).
- **Citation d'accueil** et **page À propos** : modifiables en direct une fois
  connecté (aucun code à toucher).
- **Textes d'interface** : dans les composants de `src/pages` et `src/components`.
- **Emojis / couleurs de l'éditeur** : `src/components/editor/MenuBar.jsx`.

---

## 🧭 Idées d'évolution

- Newsletter (via une *Edge Function* Supabase + un service d'e-mails).
- Notifications e-mail à chaque nouveau commentaire.
- Mode sombre (la palette s'y prête bien).
- Flux RSS des poèmes.
- Statistiques de visite (Netlify Analytics ou Plausible).

---

## 📄 Licence

Projet personnel — adaptez-le librement à vos poèmes et à votre lumière.

---

## 🆕 Mise à jour — Vague 2 (Lectures, Livres, Plumes Invitées, Newsletter)

Cette version ajoute quatre nouveautés. **Une seule action est requise de votre côté** : exécuter le script SQL de migration (les tables n'existent pas encore dans votre base).

### À faire une fois dans Supabase
1. Ouvrez **Supabase → SQL Editor → New query**.
2. Copiez tout le contenu de `supabase/migrations/002_vague2.sql`, collez-le, cliquez **Run**.
   Ce script est **additif** : il ne touche pas à vos données existantes. Il crée les tables `readings` (Lectures), `books` (Livres) et `newsletter_subscribers` (Abonnés), avec leurs règles de sécurité.

### Ce que ça apporte
- **Lectures** (`/lectures`) : fiches de livres lus, avec couverture, note en étoiles, avis et citations. Gérées depuis **Admin → Lectures**.
- **Livres publiés** (`/livres`) : votre livre et vos recommandations, avec bouton « Acheter ». Votre livre peut être épinglé (« à l'honneur »). Gérés depuis **Admin → Livres publiés**.
- **Les Plumes Invitées** : l'ancien « Livre d'or », renommé et rouvert comme espace d'écriture partagée. L'ancienne adresse `/livre-d-or` redirige vers la nouvelle.
- **Newsletter** : un champ d'inscription dans le pied de page **collecte les adresses e-mail**. Vous les consultez et les exportez (CSV, ou copie en un clic) depuis **Admin → Abonnés**. L'envoi des lettres se fait avec l'outil de votre choix — le site ne fait que rassembler les adresses.

---

## 🆕 Mise à jour — Vague 3 (Comptes utilisateurs)

Les visiteurs peuvent désormais **créer un compte** (e-mail + mot de passe) pour commenter et partager dans « Les Plumes Invitées ». Les commentaires anonymes ne sont plus possibles, ce qui limite le spam.

### ⚠️ Changement de sécurité important
Jusqu'ici, « être administrateur » revenait à « être connecté ». Comme n'importe qui peut maintenant s'inscrire, ce raccourci deviendrait dangereux. La migration ci-dessous **redéfinit l'admin** : vous êtes reconnue via une liste privée d'administrateurs, et le script **vous y ajoute automatiquement** (car vous êtes le seul compte existant au moment où vous l'exécutez).

### À faire, DANS CET ORDRE
1. **D'abord, la base.** Supabase → SQL Editor → New query → collez tout `supabase/migrations/003_comptes.sql` → **Run**.
   Ce script crée les profils, la sécurité admin, et vous promeut administratrice. Exécutez-le **avant** d'ouvrir les inscriptions.
2. **Réactivez les inscriptions.** Authentication → Providers (ou Sign In) → **Email** → activez **« Allow new users to sign up »** (l'inverse de ce qu'on avait fait au tout début).
3. **Configurez les URL de redirection** (indispensable pour la réinitialisation de mot de passe et la confirmation d'e-mail). Authentication → **URL Configuration** :
   - **Site URL** : `https://rachelentrelignes.netlify.app`
   - **Redirect URLs** : ajoutez `https://rachelentrelignes.netlify.app/**`
4. **Déployez les fichiers** du site sur GitHub (Netlify redéploie).

> Faites l'étape 1 **avant** de mettre le nouveau site en ligne : la reconnaissance de l'administratrice dépend de cette migration. Tant que vous ne l'avez pas lancée, le nouvel espace admin ne vous reconnaîtra pas. (Votre site actuel reste en ligne tant que vous n'avez pas envoyé les nouveaux fichiers, donc rien ne presse.)

### Confirmation d'e-mail (facultatif)
Pour exiger une vérification de l'adresse à l'inscription : Authentication → Providers → Email → activez **« Confirm email »**. Notez que l'envoi d'e-mails de Supabase est **limité** en usage gratuit ; pour un vrai trafic, configurez un fournisseur SMTP (Authentication → Emails/SMTP) — par exemple Brevo, gratuit. Sans confirmation activée, les comptes sont utilisables immédiatement.

### Ajouter un autre administrateur (si besoin, plus tard)
Dans SQL Editor :
```sql
insert into public.admins (user_id)
select id from auth.users where email = 'adresse@exemple.com';
```

### Les pages de compte
- `/inscription` — créer un compte (avec option newsletter)
- `/connexion` — se connecter (les visiteurs vont vers leur profil, vous vers l'admin)
- `/mot-de-passe-oublie` puis `/reinitialiser-mot-de-passe` — réinitialisation
- `/profil` — nom affiché, préférence newsletter, changement de mot de passe, déconnexion
