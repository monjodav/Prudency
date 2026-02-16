# Guide de Deploiement -- Prudency

## Table des matieres

- [Prerequisites](#prerequisites)
- [1. Setup Supabase](#1-setup-supabase)
- [2. Configuration Expo](#2-configuration-expo)
- [3. Deploiement Edge Functions](#3-deploiement-edge-functions)
- [4. Push Notifications](#4-push-notifications)
- [5. Build et Distribution](#5-build-et-distribution)
- [6. Environnements](#6-environnements)
- [7. Monitoring](#7-monitoring)
- [8. Rollback](#8-rollback)
- [9. Depannage](#9-depannage)
- [10. Checklist pre-lancement](#10-checklist-pre-lancement)

---

## Prerequisites

| Outil | Version | Installation |
|-------|---------|-------------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Inclus avec Node.js |
| Expo CLI | derniere | `npm install -g expo-cli` |
| EAS CLI | derniere | `npm install -g eas-cli` |
| Supabase CLI | 2+ | `npm install -g supabase` |

**Comptes necessaires :**
- Compte [Supabase](https://supabase.com) (projet en region `eu-west-1` pour conformite RGPD)
- Compte [Apple Developer](https://developer.apple.com) (pour iOS)
- Compte [Google Play Console](https://play.google.com/console) (pour Android)
- Compte [Plivo](https://www.plivo.com) (pour l'envoi de SMS)
- Compte [Expo](https://expo.dev) (pour EAS Build et Submit)

---

## 1. Setup Supabase

### Creer le projet

1. Aller sur [supabase.com](https://supabase.com) et creer un compte
2. Creer un nouveau projet dans la region `eu-west-1` (Europe -- conformite RGPD)
3. Attendre l'initialisation du projet (environ 2 minutes)
4. Noter le `Project URL` et `anon key` depuis Settings > API

### Appliquer les migrations

```bash
# Se connecter a Supabase
npx supabase login

# Lier au projet distant
npx supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
npx supabase db push

# Verifier que le schema est a jour
npx supabase db diff
```

Les 7 migrations sont appliquees dans l'ordre (voir [database-schema.md](./database-schema.md#migrations)).

### Configurer les secrets (Edge Functions)

```bash
# Secrets Plivo pour l'envoi de SMS
supabase secrets set PLIVO_AUTH_ID=your_auth_id
supabase secrets set PLIVO_AUTH_TOKEN=your_auth_token
supabase secrets set PLIVO_SENDER_NUMBER=+33XXXXXXXXX
```

**Ne jamais exposer ces secrets cote client.** Ils sont uniquement accessibles depuis les Edge Functions via `Deno.env.get()`.

### Configurer l'authentification

Dans le dashboard Supabase > Authentication > Providers :

1. **Email** : Active par defaut. Configurer les templates d'email si necessaire.
2. **Apple Sign In** :
   - Service ID (depuis Apple Developer Portal)
   - Key ID
   - Private Key (.p8)
3. **Google Sign In** :
   - Client ID (depuis Google Cloud Console)
   - Client Secret
   - Redirect URL : configure automatiquement par Supabase

---

## 2. Configuration Expo

### Variables d'environnement

Creer `.env` a partir de `.env.example` :

```bash
cp .env.example .env
```

Remplir les valeurs :

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

**Ne jamais committer le fichier `.env`.** Il est dans `.gitignore`.

### Configuration EAS

```bash
# Se connecter a Expo
eas login

# Configurer le projet
eas build:configure
```

Fichier `eas.json` genere :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 3. Deploiement Edge Functions

### Developpement local

```bash
# Demarrer Supabase local
npx supabase start

# Lancer les fonctions en local
npx supabase functions serve
```

Les fonctions locales sont accessibles sur `http://localhost:54321/functions/v1/<nom-fonction>`.

### Deploiement en production

```bash
# Deployer une fonction specifique
npx supabase functions deploy send-sms
npx supabase functions deploy send-alert
npx supabase functions deploy check-trip-timeout
npx supabase functions deploy update-location
npx supabase functions deploy notify-contacts

# Deployer toutes les fonctions d'un coup
npx supabase functions deploy
```

Chaque Edge Function est un microservice independant. Voir la [reference API](./api-reference.md) pour les details.

---

## 4. Push Notifications

### iOS (APNs)

1. Creer une cle APNs dans le [Apple Developer Portal](https://developer.apple.com) > Keys
2. Telecharger le fichier `.p8`
3. Dans Supabase > Project Settings > Push Notifications :
   - Uploader la cle APNs
   - Renseigner le Key ID et le Team ID

### Android (FCM)

1. Creer un projet dans la [console Firebase](https://console.firebase.google.com)
2. Telecharger `google-services.json` et le placer a la racine du projet
3. Generer une Server Key dans Firebase > Project Settings > Cloud Messaging
4. Dans Supabase > Push Notifications :
   - Renseigner la FCM Server Key

### Configuration Expo

Dans `app.json`, ajouter le plugin notifications :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#FF649B"
        }
      ]
    ]
  }
}
```

---

## 5. Build et Distribution

### Build de developpement

```bash
# iOS Simulator
eas build --profile development --platform ios

# Android APK (test interne)
eas build --profile development --platform android
```

### Build preview (test interne)

```bash
# iOS (distribution interne via TestFlight ou lien direct)
eas build --profile preview --platform ios

# Android (APK de test)
eas build --profile preview --platform android
```

### Build de production

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Play Store)
eas build --profile production --platform android
```

### Soumission aux stores

```bash
# iOS (App Store Connect)
eas submit --platform ios

# Android (Google Play Console)
eas submit --platform android
```

### Mise a jour OTA (Over The Air)

Pour les mises a jour JS-only (sans changement natif) :

```bash
# Publier une mise a jour
eas update --branch production --message "Description du changement"
```

---

## 6. Environnements

| Environnement | Supabase | Variables | Distribution |
|---------------|----------|-----------|-------------|
| **Dev** | Local (`supabase start`) | `.env` | Expo Dev Client |
| **Staging** | Projet Supabase dedie | `.env.staging` | EAS Build interne |
| **Production** | Projet Supabase `eu-west-1` | `.env.production` | App Store / Play Store |

### Generer les types TypeScript

Apres chaque modification du schema :

```bash
# Depuis Supabase local
npx supabase gen types typescript --local > src/types/database.ts

# Depuis le projet distant
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts
```

---

## 7. Monitoring

### Supabase Dashboard

- **Logs** : Dashboard > Logs pour les Edge Functions et les requetes API
- **Database** : Dashboard > Database > Query Performance pour les requetes lentes
- **Auth** : Dashboard > Authentication > Users pour les utilisateurs connectes
- **Realtime** : Dashboard > Realtime pour les connexions actives

### Crash reporting

Integrer [Sentry](https://sentry.io) pour le suivi des erreurs :

```bash
npx expo install @sentry/react-native
```

### Analytics

Integrer un outil d'analytics (Mixpanel, PostHog, ou Amplitude) pour suivre :
- Nombre de trajets crees / completes
- Taux d'alertes declenchees
- Retention utilisateur
- Temps moyen d'un trajet

### Alertes de disponibilite

Configurer des alertes sur :
- Taux d'erreur des Edge Functions > 5%
- Temps de reponse API > 2s
- Espace disque base de donnees > 80%
- Echecs d'envoi SMS

---

## 8. Rollback

### Rollback des Edge Functions

Chaque deploiement cree une nouvelle version. Pour revenir a une version precedente :

```bash
# Lister les versions deployees
supabase functions list

# Re-deployer depuis le code source d'une version precedente
git checkout <commit-hash> -- supabase/functions/<nom-fonction>/
npx supabase functions deploy <nom-fonction>
```

### Rollback des migrations

Les migrations SQL sont irreversibles par defaut. Pour annuler :

1. Creer une nouvelle migration qui inverse les changements
2. Tester en local avec `npx supabase db push`
3. Appliquer en production

```bash
# Creer une migration de rollback
npx supabase migration new rollback_nom_migration

# Editer le fichier SQL pour inverser les changements
# Puis appliquer
npx supabase db push
```

**Ne jamais supprimer ou modifier une migration existante deja appliquee en production.**

### Rollback de l'app mobile

- **OTA (JS-only)** : Publier une mise a jour corrective via `eas update`
- **Build natif** : Soumettre une nouvelle version aux stores (delai de review Apple : 24-48h)

---

## 9. Depannage

### Problemes courants

#### "Missing Supabase environment variables"

Le fichier `.env` est absent ou incomplet.

```bash
# Verifier que le fichier existe
ls -la .env

# Copier depuis l'exemple
cp .env.example .env
# Puis remplir les valeurs
```

#### Les migrations echouent avec "relation already exists"

Les migrations ont deja ete appliquees partiellement.

```bash
# Verifier l'etat des migrations
npx supabase migration list

# Forcer le marquage comme appliquee
npx supabase migration repair <version> --status applied
```

#### Edge Function retourne 401

Le token JWT est absent ou expire.

- Verifier que le header `Authorization: Bearer <token>` est present
- Verifier que le token n'est pas expire (duree par defaut : 1h)
- Verifier que la session est bien rafraichie cote client (`autoRefreshToken: true`)

#### Edge Function retourne 503 "SMS service not configured"

Les secrets Plivo ne sont pas configures.

```bash
# Verifier les secrets
supabase secrets list

# Reconfigurer si necessaire
supabase secrets set PLIVO_AUTH_ID=xxx
supabase secrets set PLIVO_AUTH_TOKEN=xxx
supabase secrets set PLIVO_SENDER_NUMBER=+33xxx
```

#### Build EAS echoue

```bash
# Verifier les logs detailles
eas build:list

# Nettoyer le cache local
npx expo start --clear
```

#### Le tracking GPS ne fonctionne pas sur iOS

- Verifier les permissions dans `Info.plist` (gerees par expo-location)
- L'utilisateur doit autoriser "Always" pour le background tracking
- Verifier que le Background Mode "Location updates" est active

#### RLS bloque les requetes

```bash
# Tester en local sans RLS
npx supabase db reset

# Verifier les policies
# Dans le dashboard Supabase > Authentication > Policies
```

---

## 10. Checklist pre-lancement

### Infrastructure

- [ ] Projet Supabase cree en region `eu-west-1`
- [ ] Migrations appliquees en production
- [ ] RLS verifie sur toutes les tables (6 tables)
- [ ] Edge Functions deployees et testees
- [ ] Secrets Plivo configures
- [ ] Variables d'environnement production renseignees

### Authentification

- [ ] Apple Sign In configure et teste
- [ ] Google Sign In configure et teste
- [ ] Email/password fonctionne
- [ ] Tokens rafraichis automatiquement

### Notifications

- [ ] Push notifications configurees (APNs + FCM)
- [ ] SMS envoyes correctement via Plivo
- [ ] Templates de messages valides

### App mobile

- [ ] Build production teste sur device reel (iOS + Android)
- [ ] Permissions localisation fonctionnelles
- [ ] Tracking GPS optimise batterie
- [ ] Dark mode fonctionne

### Conformite

- [ ] Politique de confidentialite publiee
- [ ] CGU publiees
- [ ] Conformite RGPD verifiee (region EU, pas de vente de donnees)
- [ ] Screenshots et metadonnees stores prets

### Monitoring

- [ ] Crash reporting configure (Sentry)
- [ ] Analytics configure
- [ ] Alertes de disponibilite en place

---

**Voir aussi :**
- [Architecture](./architecture.md) -- vue d'ensemble technique
- [Schema BDD](./database-schema.md) -- structure de la base de donnees
- [Reference API](./api-reference.md) -- documentation des Edge Functions
- [Developpement local](./local-development.md) -- guide de setup local
