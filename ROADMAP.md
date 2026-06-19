# Royan Photo — Roadmap de développement

## Étape 0 — Prérequis (avant de coder)

- [ ] Créer un projet Supabase sur https://supabase.com
- [ ] Copier `.env.local.example` → `.env.local` et remplir les variables
- [ ] Exécuter `supabase/migrations/001_initial.sql` dans l'éditeur SQL Supabase
- [ ] Exécuter `supabase/seed.sql` pour les thèmes prédéfinis
- [ ] Créer le bucket Storage `photos` (public) et ses policies (voir le commentaire en bas du SQL)
- [ ] Générer les icônes PWA et les placer dans `public/icons/`

## Étape 1 — Installation & démarrage

```bash
cd "Royan Photo"
npm install
npm run dev
# → http://localhost:3000
```

## Étape 2 — MVP fonctionnel ✅

Ce qui est livré :

| Fonctionnalité                  | Statut |
|---------------------------------|--------|
| Création de partie              | ✅     |
| Rejoindre via code              | ✅     |
| Auth par pseudo (session cookie)| ✅     |
| Invitation par lien / partage   | ✅     |
| Mode défi quotidien (heure fixe)| ✅     |
| Mode défi surprise (aléatoire)  | ✅     |
| Génération de défi (host)       | ✅     |
| Thèmes prédéfinis (24 thèmes)   | ✅     |
| Variables {player}, {random_player} | ✅ |
| Thèmes personnalisés            | ✅     |
| Upload photo                    | ✅     |
| Révélation des photos           | ✅     |
| Vote (1 vote/personne)          | ✅     |
| Anti vote pour soi-même         | ✅     |
| Calcul des points               | ✅     |
| Classement général              | ✅     |
| Historique des défis            | ✅     |
| Résultats par défi              | ✅     |
| PWA manifest + meta             | ✅     |
| Mobile first + responsive       | ✅     |

## Étape 3 — Améliorations prioritaires

### 3a — Refresh temps réel (Supabase Realtime)

Connecter Supabase Realtime dans les composants client pour que :
- La liste des participants se mette à jour quand quelqu'un rejoint
- Le statut du défi change en direct
- Les votes arrivent en temps réel

```typescript
// Exemple dans un composant client
const supabase = createClient();
supabase
  .channel('challenges')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'challenges' }, payload => {
    // refresh state
  })
  .subscribe();
```

### 3b — Notifications push

- Intégrer les Web Push Notifications
- Notifier quand un défi est lancé, quand les votes ouvrent, quand les résultats tombent

### 3c — Partage via QR code

```bash
npm install qrcode react-qr-code
```
Afficher un QR code sur la page d'accueil du jeu pour faciliter l'invitation.

### 3d — Animations

- Confettis pour le gagnant du jour
- Transition slide entre les pages
- Animation du compteur de points

```bash
npm install framer-motion
```

## Étape 4 — Robustesse & qualité

### 4a — Tests

```bash
npm install -D vitest @testing-library/react @testing-library/user-event
```

Écrire des tests pour :
- `theme-processor.ts` — résolution des variables
- `GameService` — création / rejoint
- `VoteService` — calcul des points
- Composants UI critiques

### 4b — Gestion d'erreurs globale

- `error.tsx` boundaries dans chaque segment de route
- `not-found.tsx` page
- Retry automatique sur les actions qui échouent

### 4c — Rate limiting

- Limiter les uploads à 1/minute par participant
- Protéger la création de partie (anti-spam)

## Étape 5 — Features avancées

### 5a — Fin de partie automatique

Cron job Supabase (Edge Function) pour :
- Fermer automatiquement les votes à 22h
- Calculer les points
- Clôturer la partie après N jours

### 5b — Profil participant

- Photo de profil (Supabase Storage)
- Historique des victoires
- Partager son palmarès

### 5c — Réactions sur les photos

Ajouter des emojis-réactions sous chaque photo en plus du vote.

### 5d — Multi-parties

Permettre à un participant d'être dans plusieurs parties simultanément.

## Architecture de fichiers

```
src/
├── app/
│   ├── layout.tsx                    Root layout (PWA meta)
│   ├── page.tsx                      Landing / Rejoindre
│   ├── game/
│   │   ├── create/page.tsx           Créer une partie
│   │   └── [code]/
│   │       ├── layout.tsx            Game shell (header + bottomnav)
│   │       ├── page.tsx              Dashboard du jeu
│   │       ├── upload/page.tsx       Upload photo
│   │       ├── vote/page.tsx         Voter
│   │       ├── ranking/page.tsx      Classement
│   │       ├── history/page.tsx      Historique
│   │       └── results/[challengeId]/page.tsx
│   └── api/
│       ├── session/route.ts
│       └── game/[gameId]/today-challenge/route.ts
├── components/
│   ├── ui/                           Primitives: Button, Card, Input, Badge, Avatar…
│   ├── game/                         Domaine: ChallengeCard, PhotoGrid, VoteCard…
│   └── layout/                       Header, BottomNav
├── lib/
│   ├── supabase/                     client.ts, server.ts (+ admin)
│   ├── services/                     GameService, ChallengeService, PhotoService…
│   ├── actions/                      auth, challenge, photo, vote, game
│   ├── themes/                       default-themes, theme-processor
│   └── utils/                        cn, date, generate-code
├── hooks/                            useParticipant
├── middleware.ts                     Redirection si pas de session
└── types/                            index.ts, database.ts
```

## Système de points

| Événement            | Points |
|----------------------|--------|
| Vote reçu            | +1     |
| Gagnant du jour      | +3 bonus |

Ex: si vous recevez 4 votes et gagnez → 4 × 1 + 3 = **7 points**

En cas d'égalité, tous les co-gagnants reçoivent le bonus.

## Variables d'environnement

| Variable                        | Description                       |
|---------------------------------|-----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon publique                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé service role (serveur only)   |
| `NEXT_PUBLIC_APP_URL`           | URL de l'app (pour les liens)     |
| `SESSION_COOKIE_NAME`           | Nom du cookie de session          |
