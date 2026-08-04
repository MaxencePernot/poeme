# Rachel entre lignes ✒️

Un site personnel de **poésie et de photographie** : élégant, minimaliste,
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
