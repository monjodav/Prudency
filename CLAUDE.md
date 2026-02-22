# CLAUDE.md — Projet Prudency

## Identité projet
- **Nom** : Prudency - Sécurité des trajets
- **Cible** : Femmes 18-44 ans
- **Stack** : Expo (React Native) + Supabase (Auth, Database, Edge Functions, Realtime)
- **Plateformes** : iOS + Android

## Principes de craftsmanship

### Code Quality
- TypeScript strict mode obligatoire (`strict: true` dans tsconfig)
- Aucun `any` autorisé — utiliser `unknown` + type guards si nécessaire
- Chaque fichier doit avoir un seul responsable (Single Responsibility Principle)
- Nommage explicite : pas d'abréviations sauf conventions universelles (id, url, api)
- Fonctions < 30 lignes, fichiers < 300 lignes (sauf exceptions justifiées)
- Pas de code mort, pas de `console.log` en production
- Commentaires uniquement pour le "pourquoi", jamais pour le "quoi"

### Architecture
- Feature-based architecture (chaque feature est autonome)
- Séparation stricte : UI / Logic (hooks) / Services / Types
- Pas de logique métier dans les composants — tout passe par des hooks custom
- Les Edge Functions sont des microservices indépendants
- Chaque Edge Function a son propre dossier avec types, validation, et tests

### Conventions de nommage
- **Composants** : PascalCase (`TripCard.tsx`)
- **Hooks** : camelCase avec prefix `use` (`useTrip.ts`)
- **Services** : camelCase (`tripService.ts`)
- **Types** : PascalCase avec suffix explicite (`TripStatus`, `AlertPayload`)
- **Edge Functions** : kebab-case (`send-alert/index.ts`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_TRIP_DURATION`)
- **Fichiers de config** : camelCase (`supabaseClient.ts`)

### Patterns obligatoires
- Zod pour la validation de toutes les entrées (API, forms, params)
- React Query (TanStack Query) pour le data fetching + cache
- Zustand pour le state global léger (auth, trip en cours)
- Expo Router pour la navigation (file-based routing)
- Expo Notifications pour les push notifications
- expo-location pour le tracking GPS
- expo-apple-authentication pour Apple Sign In
- expo-auth-session + expo-web-browser pour Google Sign In
- expo-secure-store pour le stockage sécurisé des tokens
- OVH SMS API pour l'envoi de SMS aux contacts de confiance (via Edge Functions)

### Sécurité
- Row Level Security (RLS) activé sur TOUTES les tables Supabase
- Jamais de `service_role` key côté client
- Chiffrement des données sensibles (notes de trajet)
- Tokens JWT vérifiés dans chaque Edge Function
- Rate limiting sur les endpoints critiques (alertes)
- Aucune donnée vendue ou exploitée — conformité RGPD

### Git
- Conventional commits obligatoires : `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Une branche par feature : `feature/nom-feature`
- PR obligatoire pour merge sur `main`
- Pas de force push sur `main` ou `develop`

### Tests
- Tests unitaires pour les services et hooks critiques
- Tests E2E pour les parcours utilisateur principaux (Detox ou Maestro)
- Couvrir les scénarios : trajet OK, alerte manuelle, alerte auto, edge cases réseau

### Performance
- Tracking GPS optimisé batterie : actif au démarrage, à l'approche de l'heure d'arrivée, et lors d'alerte
- Pas de tracking permanent
- Images/médias compressés
- Lazy loading des écrans non critiques

### Documentation
- Chaque Edge Function documentée (input/output/erreurs)
- README par feature dans son dossier
- Schéma BDD à jour dans `docs/database-schema.md`
- Instructions de déploiement dans `docs/deployment.md`

## Commandes utiles
```bash
# Dev
npx expo start                    # Lancer le dev server
npx expo run:ios                  # Build iOS
npx expo run:android              # Build Android

# Supabase
npx supabase start                # Lancer Supabase local
npx supabase db push              # Appliquer les migrations
npx supabase functions serve      # Lancer les Edge Functions en local
npx supabase gen types typescript --local > src/types/database.ts

# Tests
npm run test                      # Tests unitaires
npm run test:e2e                  # Tests E2E

# Lint & Format
npm run lint                      # ESLint
npm run format                    # Prettier
```

## Structure du projet
```
prudency/
├── CLAUDE.md
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (providers, auth gate)
│   ├── (auth)/                   # Groupe auth (non authentifié)
│   ├── (tabs)/                   # Groupe principal (authentifié)
│   └── (trip)/                   # Groupe trajet (modal/stack)
├── src/
│   ├── components/               # Composants réutilisables
│   ├── hooks/                    # Hooks custom
│   ├── services/                 # Couche d'accès données
│   ├── stores/                   # Zustand stores
│   ├── types/                    # Types TypeScript
│   ├── utils/                    # Utilitaires
│   ├── config/                   # Configuration
│   └── theme/                    # Design system
├── supabase/
│   ├── migrations/               # Migrations SQL
│   └── functions/                # Edge Functions
└── docs/                         # Documentation
```

## Variables d'environnement
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```
