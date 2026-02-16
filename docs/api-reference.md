# Référence API — Edge Functions Prudency

Toutes les Edge Functions sont des microservices Deno exécutés dans l'environnement Supabase.

## Authentification

Toutes les Edge Functions (sauf exceptions documentées) requièrent un JWT valide dans le header `Authorization`.

```
Authorization: Bearer <JWT>
```

---

## 1. send-alert

Orchestre le déclenchement d'une alerte : création en BDD, envoi de notifications push, et appel à `send-sms` pour chaque contact.

### Endpoint

```
POST /functions/v1/send-alert
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | ✅ | Bearer token JWT |
| Content-Type | ✅ | application/json |

### Request Body

```typescript
{
  tripId?: string;           // UUID du trajet (optionnel - alerte sans trajet possible)
  type: 'manual' | 'automatic' | 'timeout';
  reason?: string;           // Raison de l'alerte
  lat?: number;              // Latitude au déclenchement
  lng?: number;              // Longitude au déclenchement
  batteryLevel?: number;     // Niveau de batterie (0-100)
}
```

### Response (200 OK)

```typescript
{
  alertId: string;           // UUID de l'alerte créée
  notifiedContacts: Array<{
    contactId: string;
    name: string;
    notifiedBySms: boolean;
    notifiedByPush: boolean;
  }>;
  timestamp: string;         // ISO 8601
}
```

### Errors

| Code | Description |
|------|-------------|
| 400 | Payload invalide |
| 401 | Non authentifié |
| 429 | Rate limit dépassé (max 10/minute) |
| 500 | Erreur interne |

---

## 2. send-sms

Wrapper pour l'API REST Plivo. Envoie un SMS à un numéro donné.

### Endpoint

```
POST /functions/v1/send-sms
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | ✅ | Bearer token JWT |
| Content-Type | ✅ | application/json |

### Request Body

```typescript
{
  to: string;                // Numéro au format E.164 (+33612345678)
  message: string;           // Contenu du SMS (max 160 chars)
}
```

### Response (200 OK)

```typescript
{
  messageUuid: string;       // UUID Plivo du message
  status: 'queued' | 'sent';
}
```

### Errors

| Code | Description |
|------|-------------|
| 400 | Numéro ou message invalide |
| 401 | Non authentifié |
| 429 | Rate limit Plivo |
| 500 | Erreur Plivo |

### Notes

- Appelle l'API Plivo : `POST https://api.plivo.com/v1/Account/{AUTH_ID}/Message/`
- Les credentials Plivo sont lus via `Deno.env.get()`
- Ne jamais exposer cette fonction publiquement

---

## 3. check-trip-timeout

Vérifie si un trajet a dépassé son heure d'arrivée estimée + buffer. Déclenche une alerte automatique si nécessaire.

### Endpoint

```
POST /functions/v1/check-trip-timeout
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | ✅ | Bearer token JWT |
| Content-Type | ✅ | application/json |

### Request Body

```typescript
{
  tripId: string;            // UUID du trajet à vérifier
}
```

### Response (200 OK)

```typescript
{
  tripId: string;
  status: 'active' | 'timeout' | 'alerted';
  alertTriggered: boolean;
  alertId?: string;          // Si alerte déclenchée
}
```

### Notes

- Appelée périodiquement par un cron job Supabase
- Le buffer avant alerte est de 5 minutes (configurable)

---

## 4. update-location

Met à jour la position GPS d'un trajet actif.

### Endpoint

```
POST /functions/v1/update-location
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | ✅ | Bearer token JWT |
| Content-Type | ✅ | application/json |

### Request Body

```typescript
{
  tripId: string;            // UUID du trajet
  lat: number;               // Latitude
  lng: number;               // Longitude
  accuracy?: number;         // Précision en mètres
  speed?: number;            // Vitesse en m/s
  heading?: number;          // Direction en degrés
  batteryLevel?: number;     // Niveau de batterie
}
```

### Response (200 OK)

```typescript
{
  success: boolean;
  locationId: string;        // UUID de la position enregistrée
}
```

### Notes

- Les positions sont enregistrées dans `trip_locations`
- Appelée toutes les 30s pendant un trajet actif
- Fréquence augmentée à 10s à l'approche de l'heure d'arrivée

---

## 5. notify-contacts

Envoie des notifications (push + SMS) à tous les contacts de confiance d'un utilisateur pour une alerte donnée.

### Endpoint

```
POST /functions/v1/notify-contacts
```

### Headers

| Header | Requis | Description |
|--------|--------|-------------|
| Authorization | ✅ | Bearer token JWT |
| Content-Type | ✅ | application/json |

### Request Body

```typescript
{
  alertId: string;           // UUID de l'alerte
}
```

### Response (200 OK)

```typescript
{
  notifiedCount: number;     // Nombre de contacts notifiés
  failures: Array<{
    contactId: string;
    reason: string;
  }>;
}
```

### Notes

- Récupère tous les contacts de l'utilisateur avec `notify_by_sms: true` ou `notify_by_push: true`
- Appelle `send-sms` pour chaque contact avec SMS activé
- Utilise Supabase Realtime pour les push notifications

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| send-alert | 10 req/minute/user |
| send-sms | 5 req/minute/user |
| update-location | 60 req/minute/user |
| check-trip-timeout | 1 req/minute/trip |
| notify-contacts | 5 req/minute/user |

---

## Validation

Toutes les entrées sont validées avec Zod. Exemple pour `send-alert` :

```typescript
import { z } from 'zod';

const sendAlertSchema = z.object({
  tripId: z.string().uuid().optional(),
  type: z.enum(['manual', 'automatic', 'timeout']),
  reason: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});
```
