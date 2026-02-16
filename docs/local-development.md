# Developpement Local -- Prudency

## Table des matieres

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancer l'application](#lancer-lapplication)
- [Supabase local](#supabase-local)
- [Edge Functions en local](#edge-functions-en-local)
- [Tests](#tests)
- [Lint et formatage](#lint-et-formatage)
- [Generation des types](#generation-des-types)
- [Commandes utiles](#commandes-utiles)
- [Problemes courants](#problemes-courants)

---

## Prerequisites

| Outil | Version | Verification |
|-------|---------|-------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.x | `git --version` |
| Supabase CLI | 2+ | `npx supabase --version` |
| Docker | 24+ | `docker --version` |

Docker est necessaire pour lancer Supabase en local (PostgreSQL, Auth, API, etc.).

### iOS (optionnel)

| Outil | Version |
|-------|---------|
| Xcode | 15+ |
| CocoaPods | 1.14+ |
| Simulateur iOS | iOS 17+ |

### Android (optionnel)

| Outil | Version |
|-------|---------|
| Android Studio | Hedgehog+ |
| Android SDK | API 34+ |
| Emulateur Android | API 34+ |

---

## Installation

```bash
# Cloner le repository
git clone <repo-url> prudency
cd prudency

# Installer les dependances
npm install
```

---

## Configuration

### Variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Editer `.env` avec les valeurs :

```env
# Supabase local
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key-locale>

# Google Maps (optionnel pour le dev)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Google Auth (optionnel pour le dev)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
```

Les cles Supabase locales sont affichees lors du `npx supabase start` (voir section suivante).

### TypeScript

Le projet utilise TypeScript en mode strict. La configuration est dans `tsconfig.json`. Les alias de chemin `@/` pointent vers la racine du projet.

---

## Lancer l'application

### Avec Expo Go (le plus simple)

```bash
# Demarrer le serveur de dev
npx expo start
```

Scanner le QR code avec l'app Expo Go (iOS/Android).

### Avec un dev client (recommande)

```bash
# Build du dev client
npx expo run:ios
# ou
npx expo run:android
```

Le dev client est necessaire pour les fonctionnalites natives (notifications, localisation background).

### Options de demarrage

```bash
npx expo start --clear      # Vider le cache Metro
npx expo start --ios         # Ouvrir directement sur simulateur iOS
npx expo start --android     # Ouvrir directement sur emulateur Android
```

---

## Supabase local

### Demarrage

```bash
# Demarrer tous les services Supabase (PostgreSQL, Auth, API, etc.)
npx supabase start
```

Cette commande affiche les URLs et cles locales :

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
anon key: eyJ...
service_role key: eyJ...
```

**Utiliser `anon key` comme valeur de `EXPO_PUBLIC_SUPABASE_ANON_KEY` dans `.env`.**

### Supabase Studio

Accessible sur `http://localhost:54323`. Permet de :
- Visualiser et editer les donnees
- Tester les requetes SQL
- Verifier les policies RLS
- Gerer les utilisateurs d'auth

### Appliquer les migrations

```bash
# Appliquer toutes les migrations
npx supabase db push

# Verifier les differences avec le schema local
npx supabase db diff

# Reinitialiser la base (perte des donnees)
npx supabase db reset
```

### Creer une nouvelle migration

```bash
# Creer un fichier de migration vide
npx supabase migration new nom_de_la_migration
```

Le fichier est cree dans `supabase/migrations/` avec un timestamp.

### Arreter Supabase

```bash
npx supabase stop
```

---

## Edge Functions en local

### Lancer les fonctions

```bash
# Servir toutes les fonctions
npx supabase functions serve
```

Les fonctions sont accessibles sur `http://localhost:54321/functions/v1/<nom-fonction>`.

### Tester une fonction

```bash
# Exemple : tester send-sms
curl -X POST http://localhost:54321/functions/v1/send-sms \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"to": "+33612345678", "message": "Test SMS"}'
```

Pour obtenir un JWT valide en local, creer un utilisateur via Supabase Studio ou via l'API :

```bash
# Creer un utilisateur test
curl -X POST http://localhost:54321/auth/v1/signup \
  -H "apikey: <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password123"}'
```

### Configurer les secrets locaux

Pour tester l'envoi de SMS en local, configurer les secrets Plivo :

```bash
# Creer un fichier .env pour les fonctions
echo "PLIVO_AUTH_ID=your_id" >> supabase/.env
echo "PLIVO_AUTH_TOKEN=your_token" >> supabase/.env
echo "PLIVO_SENDER_NUMBER=+33XXXXXXXXX" >> supabase/.env
```

---

## Tests

### Tests unitaires

```bash
# Lancer tous les tests
npm run test

# Lancer un test specifique
npm run test -- --testPathPattern=authService

# Mode watch
npm run test -- --watch
```

### Tests E2E

```bash
# Non configure pour le moment
npm run test:e2e
```

Les tests E2E seront configures avec Detox ou Maestro.

---

## Lint et formatage

### ESLint

```bash
# Verifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix
```

### Prettier

```bash
# Verifier le formatage
npm run format:check

# Formater le code
npm run format
```

### TypeScript

```bash
# Verifier les types sans compiler
npm run typecheck
```

---

## Generation des types

Apres chaque modification du schema de la base de donnees :

```bash
# Generer les types depuis Supabase local
npx supabase gen types typescript --local > src/types/database.ts
```

Les types generes sont utilises dans les services et les hooks pour le typage des requetes Supabase.

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npx expo start` | Demarrer le serveur de dev |
| `npx expo start --clear` | Demarrer avec cache vide |
| `npx expo run:ios` | Build et lancer sur iOS |
| `npx expo run:android` | Build et lancer sur Android |
| `npx supabase start` | Demarrer Supabase local |
| `npx supabase stop` | Arreter Supabase local |
| `npx supabase db push` | Appliquer les migrations |
| `npx supabase db reset` | Reinitialiser la BDD locale |
| `npx supabase db diff` | Voir les differences de schema |
| `npx supabase functions serve` | Lancer les Edge Functions |
| `npx supabase gen types typescript --local` | Generer les types TS |
| `npm run lint` | Lancer ESLint |
| `npm run format` | Formater avec Prettier |
| `npm run typecheck` | Verifier les types TypeScript |
| `npm run test` | Lancer les tests unitaires |

---

## Problemes courants

### "Error: Docker is not running"

Supabase local necessite Docker. Demarrer Docker Desktop avant `npx supabase start`.

### "Port 54321 already in use"

Un autre processus utilise le port Supabase.

```bash
# Arreter Supabase proprement
npx supabase stop

# Si necessaire, trouver et arreter le processus
lsof -i :54321
kill <PID>
```

### "Module not found: @/src/..."

L'alias `@/` n'est pas resolu. Verifier que `tsconfig.json` contient la configuration des paths et que Metro est redemarre :

```bash
npx expo start --clear
```

### "Invariant Violation: Native module cannot be null"

Un module natif n'est pas disponible dans Expo Go. Utiliser un dev client a la place :

```bash
npx expo run:ios
# ou
npx expo run:android
```

### Les modifications du schema ne sont pas prises en compte

Regenerer les types et redemarrer :

```bash
npx supabase db push
npx supabase gen types typescript --local > src/types/database.ts
npx expo start --clear
```

### "RLS policy violation" lors des requetes

- Verifier que l'utilisateur est connecte (JWT valide)
- Verifier que la policy RLS autorise l'operation (voir [database-schema.md](./database-schema.md#row-level-security-rls))
- En local, verifier les policies dans Supabase Studio (`http://localhost:54323`)

### Les SMS ne sont pas envoyes en local

Les secrets Plivo doivent etre configures dans `supabase/.env`. Voir la section [Edge Functions en local](#edge-functions-en-local).

---

**Voir aussi :**
- [Architecture](./architecture.md) -- vue d'ensemble technique
- [Schema BDD](./database-schema.md) -- structure de la base de donnees
- [Reference API](./api-reference.md) -- documentation des Edge Functions
- [Deploiement](./deployment.md) -- guide de mise en production
