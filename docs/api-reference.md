# Reference API -- Edge Functions Prudency

## Table des matieres

- [Authentification](#authentification)
- [1. send-alert](#1-send-alert)
- [2. send-sms](#2-send-sms)
- [3. check-trip-timeout](#3-check-trip-timeout)
- [4. update-location](#4-update-location)
- [5. notify-contacts](#5-notify-contacts)
- [Rate Limiting](#rate-limiting)
- [Validation](#validation)
- [Codes d'erreur communs](#codes-derreur-communs)

---

## Authentification

Toutes les Edge Functions requierent un JWT valide dans le header `Authorization`.

```
Authorization: Bearer <JWT>
```

Le JWT est obtenu via Supabase Auth (connexion email, Apple, ou Google). Les Edge Functions verifient le token en creant un client Supabase avec le header d'autorisation et en appelant `supabase.auth.getUser()`.

### Exemple avec curl

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-alert \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "manual"}'
```

---

## 1. send-alert

Orchestre le declenchement d'une alerte : creation en BDD, envoi de notifications push, et appel a `send-sms` pour chaque contact.

### Endpoint

```
POST /functions/v1/send-alert
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | Oui | Bearer token JWT |
| Content-Type | Oui | application/json |

### Request Body

```typescript
{
  tripId?: string;           // UUID du trajet (optionnel -- alerte sans trajet possible)
  type: 'manual' | 'automatic' | 'timeout';
  reason?: string;           // Raison de l'alerte (max 500 caracteres)
  lat?: number;              // Latitude au declenchement (-90 a 90)
  lng?: number;              // Longitude au declenchement (-180 a 180)
  batteryLevel?: number;     // Niveau de batterie (0-100, entier)
}
```

### Exemple de requete

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-alert \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "manual",
    "reason": "Je me sens en danger",
    "lat": 48.8566,
    "lng": 2.3522,
    "batteryLevel": 45
  }'
```

### Response (200 OK)

```json
{
  "alertId": "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
  "notifiedContacts": [
    {
      "contactId": "c1d2e3f4-a5b6-7890-abcd-ef1234567890",
      "name": "Marie Dupont",
      "notifiedBySms": true,
      "notifiedByPush": true
    }
  ],
  "timestamp": "2026-02-16T14:30:00.000Z"
}
```

### Erreurs

| Code | Description |
|------|-------------|
| 400 | Payload invalide (validation Zod echouee) |
| 401 | Non authentifie ou token expire |
| 405 | Methode HTTP non autorisee (seul POST est accepte) |
| 429 | Rate limit depasse (max 10/minute) |
| 500 | Erreur interne |

### Schema de validation

```typescript
const sendAlertSchema = z.object({
  tripId: z.string().uuid().optional(),
  type: z.enum(['manual', 'automatic', 'timeout']),
  reason: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});
```

---

## 2. send-sms

Wrapper pour l'API REST Plivo. Envoie un SMS a un numero donne. Cette fonction est generalement appelee par `send-alert` ou `notify-contacts`, pas directement par le client.

### Endpoint

```
POST /functions/v1/send-sms
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | Oui | Bearer token JWT |
| Content-Type | Oui | application/json |

### Request Body

```typescript
{
  to: string;                // Numero au format E.164 (+33612345678)
  message: string;           // Contenu du SMS (1-1600 caracteres)
}
```

### Exemple de requete

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+33612345678",
    "message": "ALERTE: Marie a besoin d aide. Position: https://maps.google.com/?q=48.8566,2.3522"
  }'
```

### Response (200 OK)

```json
{
  "messageUuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "sent"
}
```

### Erreurs

| Code | Description |
|------|-------------|
| 400 | Numero ou message invalide (format E.164 requis, message 1-1600 chars) |
| 401 | Non authentifie |
| 405 | Methode HTTP non autorisee |
| 502 | Erreur Plivo (API inaccessible ou rejet) |
| 503 | Service SMS non configure (secrets Plivo manquants) |
| 500 | Erreur interne |

### Schema de validation

```typescript
const SendSmsInputSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format"),
  message: z.string().min(1).max(1600),
});
```

### Notes techniques

- Appelle l'API Plivo : `POST https://api.plivo.com/v1/Account/{AUTH_ID}/Message/`
- Authentification Plivo via Basic Auth (`PLIVO_AUTH_ID:PLIVO_AUTH_TOKEN` en base64)
- Les credentials Plivo sont lus via `Deno.env.get()` (secrets Supabase)
- La limite de 1600 caracteres correspond a 10 segments SMS concatenes
- Ne jamais appeler cette fonction directement depuis le client en production

---

## 3. check-trip-timeout

Verifie si un trajet a depasse son heure d'arrivee estimee + buffer de 5 minutes. Declenche une alerte automatique si necessaire.

### Endpoint

```
POST /functions/v1/check-trip-timeout
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | Oui | Bearer token JWT |
| Content-Type | Oui | application/json |

### Request Body

```typescript
{
  tripId: string;            // UUID du trajet a verifier
}
```

### Exemple de requete

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/check-trip-timeout \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'
```

### Response (200 OK)

```json
{
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "timeout",
  "alertTriggered": true,
  "alertId": "f1e2d3c4-b5a6-7890-abcd-ef1234567890"
}
```

### Erreurs

| Code | Description |
|------|-------------|
| 400 | tripId manquant ou invalide |
| 401 | Non authentifie |
| 404 | Trajet non trouve |
| 500 | Erreur interne |

### Notes techniques

- Appelee periodiquement par un cron job Supabase
- Le buffer avant alerte est de 5 minutes (`ALERT_TIMEOUT_BUFFER_MINUTES` dans la config)
- Seuls les trajets avec `status = 'active'` sont verifies
- Si timeout detecte : met a jour le trajet (`status: 'timeout'`), cree une alerte, et notifie les contacts

---

## 4. update-location

Met a jour la position GPS d'un trajet actif en inserant une nouvelle entree dans `trip_locations`.

### Endpoint

```
POST /functions/v1/update-location
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | Oui | Bearer token JWT |
| Content-Type | Oui | application/json |

### Request Body

```typescript
{
  tripId: string;            // UUID du trajet
  lat: number;               // Latitude (-90 a 90)
  lng: number;               // Longitude (-180 a 180)
  accuracy?: number;         // Precision en metres (> 0)
  speed?: number;            // Vitesse en m/s (>= 0)
  heading?: number;          // Direction en degres (0-360)
  batteryLevel?: number;     // Niveau de batterie (0-100, entier)
}
```

### Exemple de requete

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/update-location \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "lat": 48.8566,
    "lng": 2.3522,
    "accuracy": 10.5,
    "speed": 1.2,
    "heading": 180,
    "batteryLevel": 72
  }'
```

### Response (200 OK)

```json
{
  "success": true,
  "locationId": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

### Erreurs

| Code | Description |
|------|-------------|
| 400 | Payload invalide (coordonnees hors limites, tripId manquant) |
| 401 | Non authentifie |
| 403 | Le trajet n'appartient pas a l'utilisateur |
| 404 | Trajet non trouve ou non actif |
| 500 | Erreur interne |

### Schema de validation

```typescript
const UpdateLocationInputSchema = z.object({
  tripId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});
```

### Notes techniques

- Les positions sont enregistrees dans `trip_locations`
- Frequence d'appel : toutes les 30s en mode actif, toutes les 10s a l'approche de l'heure d'arrivee
- Frequence augmentee a 5s lors d'une alerte active
- La RLS sur `trip_locations` verifie l'appartenance du trajet via sous-requete

---

## 5. notify-contacts

Envoie des notifications (push + SMS) a tous les contacts de confiance d'un utilisateur pour une alerte donnee.

### Endpoint

```
POST /functions/v1/notify-contacts
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | Oui | Bearer token JWT |
| Content-Type | Oui | application/json |

### Request Body

```typescript
{
  alertId: string;           // UUID de l'alerte
}
```

### Exemple de requete

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/notify-contacts \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"alertId": "f1e2d3c4-b5a6-7890-abcd-ef1234567890"}'
```

### Response (200 OK)

```json
{
  "notifiedCount": 3,
  "failures": [
    {
      "contactId": "d4e5f6a7-b8c9-0123-defg-h12345678901",
      "reason": "Invalid phone number"
    }
  ]
}
```

### Erreurs

| Code | Description |
|------|-------------|
| 400 | alertId manquant ou invalide |
| 401 | Non authentifie |
| 404 | Alerte non trouvee |
| 500 | Erreur interne |

### Notes techniques

- Recupere tous les contacts de l'utilisateur depuis `trusted_contacts`
- Filtre les contacts selon leurs preferences : `notify_by_sms` et `notify_by_push`
- Appelle `send-sms` pour chaque contact avec SMS active
- Utilise Expo Notifications / Supabase Realtime pour les push notifications
- Les echecs d'envoi sont collectes dans le tableau `failures` mais ne bloquent pas les autres envois

---

## Rate Limiting

| Endpoint | Limite | Scope |
|----------|--------|-------|
| send-alert | 10 req/minute | par utilisateur |
| send-sms | 5 req/minute | par utilisateur |
| update-location | 60 req/minute | par utilisateur |
| check-trip-timeout | 1 req/minute | par trajet |
| notify-contacts | 5 req/minute | par utilisateur |

Le depassement du rate limit retourne une reponse `429 Too Many Requests`.

---

## Validation

Toutes les entrees sont validees avec [Zod](https://zod.dev). En cas d'echec de validation, la reponse contient les details des erreurs :

```json
{
  "error": "Invalid input",
  "details": {
    "to": ["Phone number must be in E.164 format"],
    "message": ["String must contain at least 1 character(s)"]
  }
}
```

Les Edge Functions utilisent Zod depuis le registry Deno :
```typescript
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
```

---

## Codes d'erreur communs

| Code HTTP | Signification | Cause probable |
|-----------|---------------|----------------|
| 400 | Bad Request | Payload invalide, validation Zod echouee |
| 401 | Unauthorized | Token JWT absent, invalide, ou expire |
| 403 | Forbidden | L'utilisateur n'a pas acces a cette ressource |
| 404 | Not Found | Ressource inexistante (trajet, alerte, etc.) |
| 405 | Method Not Allowed | Methode HTTP incorrecte (seul POST est accepte) |
| 429 | Too Many Requests | Rate limit depasse |
| 502 | Bad Gateway | API externe (Plivo) inaccessible ou en erreur |
| 503 | Service Unavailable | Service non configure (secrets manquants) |
| 500 | Internal Server Error | Erreur inattendue cote serveur |

### Format d'erreur standard

```json
{
  "error": "Description lisible de l'erreur"
}
```

Pour les erreurs de validation (400), le champ `details` est ajoute avec les erreurs par champ.

---

## CORS

Toutes les Edge Functions incluent les headers CORS suivants :

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

Les requetes `OPTIONS` (preflight) retournent `200 OK` avec ces headers.

---

**Voir aussi :**
- [Schema BDD](./database-schema.md) -- structure des tables utilisees par les Edge Functions
- [User Flows](./user-flows.md) -- parcours utilisateur impliquant les Edge Functions
- [Architecture](./architecture.md) -- vue d'ensemble technique
