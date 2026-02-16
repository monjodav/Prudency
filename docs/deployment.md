# Guide de Déploiement — Prudency

## Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)
- EAS CLI (`npm install -g eas-cli`)
- Compte Supabase
- Compte Apple Developer (pour iOS)
- Compte Google Play Console (pour Android)
- Compte Plivo (pour SMS)

---

## 1. Setup Supabase

### Créer le projet

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet dans la région `eu-west-1` (Europe - RGPD)
3. Noter le `Project URL` et `anon key`

### Appliquer les migrations

```bash
# Se connecter à Supabase
npx supabase login

# Lier au projet distant
npx supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
npx supabase db push

# Vérifier le schéma
npx supabase db diff
```

### Configurer les secrets (Edge Functions)

```bash
# Secrets Plivo pour l'envoi de SMS
supabase secrets set PLIVO_AUTH_ID=your_auth_id
supabase secrets set PLIVO_AUTH_TOKEN=your_auth_token
supabase secrets set PLIVO_SENDER_NUMBER=+33XXXXXXXXX
```

### Configurer l'authentification

Dans le dashboard Supabase → Authentication → Providers :

1. **Email** : Activer (déjà par défaut)
2. **Apple** :
   - Service ID
   - Key ID
   - Private Key
3. **Google** :
   - Client ID
   - Client Secret

---

## 2. Configuration Expo

### Variables d'environnement

Créer `.env` à partir de `.env.example` :

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

### Configuration EAS

```bash
# Se connecter à Expo
eas login

# Configurer le projet
eas build:configure
```

Cela crée `eas.json` :

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

## 3. Déploiement Edge Functions

### Développement local

```bash
# Démarrer Supabase local
npx supabase start

# Lancer les fonctions
npx supabase functions serve
```

### Déploiement en production

```bash
# Déployer une fonction spécifique
npx supabase functions deploy send-alert
npx supabase functions deploy send-sms
npx supabase functions deploy check-trip-timeout
npx supabase functions deploy update-location
npx supabase functions deploy notify-contacts

# Ou déployer toutes les fonctions
npx supabase functions deploy
```

---

## 4. Push Notifications

### iOS (APNs)

1. Créer une clé APNs dans Apple Developer Portal
2. Télécharger le fichier `.p8`
3. Dans Supabase → Project Settings → Push Notifications :
   - Uploader la clé APNs
   - Renseigner Key ID et Team ID

### Android (FCM)

1. Créer un projet Firebase
2. Télécharger `google-services.json`
3. Générer une Server Key
4. Dans Supabase → Push Notifications :
   - Renseigner la FCM Server Key

### Configuration Expo

Dans `app.json` :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#6B46C1"
        }
      ]
    ]
  }
}
```

---

## 5. Build & Distribution

### Build de développement

```bash
# iOS Simulator
eas build --profile development --platform ios

# Android APK
eas build --profile development --platform android
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
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

---

## 6. Environnements

### Développement

- Supabase local (`supabase start`)
- Variables : `.env.local`
- Push via Expo Go

### Staging

- Projet Supabase dédié
- Variables : `.env.staging`
- Distribution interne via EAS

### Production

- Projet Supabase production (eu-west-1)
- Variables : `.env.production`
- Stores officiels

---

## 7. Monitoring

### Supabase

- Dashboard → Logs pour les Edge Functions
- Dashboard → Database → Query performance

### Expo

- EAS Build logs
- Expo Updates pour les mises à jour OTA

### Recommandations

- Configurer Sentry pour le crash reporting
- Configurer Analytics (Mixpanel, Amplitude)

---

## 8. Checklist pré-lancement

- [ ] Migrations appliquées en production
- [ ] RLS vérifié sur toutes les tables
- [ ] Edge Functions déployées et testées
- [ ] Push notifications configurées (APNs + FCM)
- [ ] Secrets Plivo configurés
- [ ] Variables d'environnement production renseignées
- [ ] Build production testé sur device réel
- [ ] Politique de confidentialité publiée
- [ ] CGU publiées
- [ ] Screenshots et métadonnées stores prêts
