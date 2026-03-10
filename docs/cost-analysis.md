# Analyse des coûts API — Prudency

> Dernière mise à jour : 5 mars 2026

## 1. Services externes et tarification

| Service | Usage | Tarif unitaire | Free tier |
|---------|-------|----------------|-----------|
| **Supabase** (DB reads) | Requêtes SELECT | ~$1 / 1M au-delà | 5M/mois |
| **Supabase** (DB writes) | INSERT/UPDATE/DELETE | ~$10 / 1M au-delà | 1M/mois |
| **Supabase** (Realtime) | Messages temps réel | ~$10 / 1M au-delà | 2M/mois |
| **Supabase** (Edge Functions) | Invocations | ~$2 / 1M au-delà | 500k/mois |
| **Supabase** (Auth) | Vérification JWT | Inclus | Illimité |
| **OVH SMS** | SMS France métro | **~0.065€ / SMS** | Aucun |
| **Expo Push** | Notifications push | $0.001 / notif | 10k/mois |
| **Google Maps** — Directions | Calcul d'itinéraire | **$7 / 1k requêtes** | $200/mois de crédit |
| **Google Maps** — Autocomplete | Recherche d'adresses | **$2.83 / 1k requêtes** | Inclus dans crédit |
| **Google Maps** — Place Details | Détails d'un lieu | **$17 / 1k requêtes** | Inclus dans crédit |
| **Google Maps** — Geocoding | Géocodage inverse | **$5 / 1k requêtes** | Inclus dans crédit |
| **Google Maps** — SDK Maps | Affichage carte | $7 / 1k chargements | 28k/mois gratuits |

---

## 2. Coût par fonctionnalité

### 2.1 Création de trajet

| Étape | Appels | Coût estimé |
|-------|--------|-------------|
| `auth.getUser()` | 1 Auth | Gratuit |
| `trips.insert()` | 1 DB write | ~$0.00001 |
| Edge Function `notify-trip-started` | 1 invocation | ~$0.000002 |
| ↳ `trips.select()` + `profiles.select()` + `trusted_contacts.select()` | 3 DB reads | ~$0.000003 |
| ↳ `send-sms` × N contacts (via OVH) | N invocations + N SMS | **N × 0.065€** |
| ↳ `profiles.select()` (match phones) | 1 DB read | ~$0.000001 |
| ↳ `push_tokens.select()` | 1 DB read | ~$0.000001 |
| ↳ `send-push-notification` (Expo) | 1 invocation | ~$0.001 |

**Total par trajet créé : ~0.065€ × N contacts (SMS) + ~$0.002 (infra)**

> Avec 3 contacts SMS : **~0.20€ par trajet**

---

### 2.2 Alerte manuelle (SOS)

| Étape | Appels | Coût estimé |
|-------|--------|-------------|
| `auth.getUser()` | 1 Auth | Gratuit |
| Rate limit check `alerts.select(count)` | 1 DB read | ~$0.000001 |
| Edge Function `send-alert` | 1 invocation | ~$0.000002 |
| ↳ `trips.select()` + `trips.update()` | 2 DB ops | ~$0.00002 |
| ↳ `alerts.insert()` | 1 DB write | ~$0.00001 |
| ↳ `notifications.insert()` (in-app) | 1 DB write | ~$0.00001 |
| ↳ Push à l'utilisatrice (Expo) | 1 invocation + 1 push | ~$0.001 |
| ↳ Edge Function `notify-contacts` | 1 invocation | ~$0.000002 |
| ↳↳ `alerts.select()` + `trusted_contacts.select()` | 2 DB reads | ~$0.000002 |
| ↳↳ `send-sms` × N contacts (OVH) | N invocations + N SMS | **N × 0.065€** |
| ↳↳ Match profiles + push tokens | 2 DB reads | ~$0.000002 |
| ↳↳ `send-push-notification` (Expo) | 1 invocation | ~$0.001 |

**Total par alerte : ~0.065€ × N contacts (SMS) + ~$0.004 (infra)**

> Avec 3 contacts SMS : **~0.20€ par alerte**

---

### 2.3 Timeout automatique (cron)

| Étape | Appels | Coût estimé |
|-------|--------|-------------|
| Edge Function `check-trip-timeout` | 1 invocation | ~$0.000002 |
| ↳ `trips.select()` | 1 DB read | ~$0.000001 |
| ↳ `trip_locations.select()` (last) | 1 DB read | ~$0.000001 |
| ↳ `alerts.insert()` + `trips.update()` | 2 DB writes | ~$0.00002 |
| ↳ `notifications.insert()` (in-app) | 1 DB write | ~$0.00001 |
| ↳ Push à l'utilisatrice (Expo) | 1 invocation + 1 push | ~$0.001 |
| ↳ `notify-contacts` (chaîne complète) | Même que 2.2 | **N × 0.065€** |

**Total par timeout : ~0.065€ × N contacts + ~$0.004**

---

### 2.4 Arrivée confirmée

| Étape | Appels | Coût estimé |
|-------|--------|-------------|
| `auth.getUser()` | 1 Auth | Gratuit |
| `trips.update()` (status=completed) | 1 DB write | ~$0.00001 |
| Edge Function `notify-arrival` | 1 invocation | ~$0.000002 |
| ↳ `trips.select()` + `trips.update()` (arrival_notified) | 2 DB ops | ~$0.00002 |
| ↳ `trusted_contacts.select()` | 1 DB read | ~$0.000001 |
| ↳ `send-sms` × N contacts (OVH) | N invocations + N SMS | **N × 0.065€** |
| ↳ Push contacts Prudency (Expo) | 1 invocation | ~$0.001 |

**Total par arrivée : ~0.065€ × N contacts + ~$0.002**

---

### 2.5 Recherche d'adresse (création de trajet/lieu)

| Étape | Appels | Coût unitaire |
|-------|--------|---------------|
| Autocomplete (par frappe, debounced) | 1 par requête | **$0.00283** |
| Place Details (sélection) | 1 par lieu sélectionné | **$0.017** |
| Directions (calcul itinéraire) | 1–2 appels | **$0.007–0.014** |
| Reverse Geocode (position actuelle) | 0–1 appel | **$0.005** |

**Session typique de création de trajet (5 frappes + 1 sélection + 1 route) :**

> ~5 × $0.00283 + $0.017 + $0.007 = **~$0.038 par trajet créé**

---

### 2.6 Suivi GPS pendant un trajet

| Élément | Fréquence | Coût |
|---------|-----------|------|
| `trip_locations.insert()` | 1 write / 30s (normal) | ~2 writes/min |
| | 1 write / 10s (approche/alerte) | ~6 writes/min |
| Polling `useActiveTrip` | 1 DB read / 30s | ~2 reads/min |
| Realtime subscription `trips` | 1 channel ouvert | Inclus |
| Ping réseau `useNetworkStatus` | 1 fetch(google.com) / 15s | Gratuit |

**Trajet de 30 min (mode normal) :**
- ~60 DB writes (locations) + ~60 DB reads (polling) = ~120 ops
- Coût : **~$0.001**

**Trajet de 2h (mode normal → approche) :**
- ~300 DB writes + ~240 DB reads = ~540 ops
- Coût : **~$0.005**

---

### 2.7 Vérification téléphone (OTP)

| Étape | Appels | Coût |
|-------|--------|------|
| Edge Function `send-otp` | 1 invocation | ~$0.000002 |
| ↳ OVH SMS (code OTP) | 1 SMS | **0.065€** |
| ↳ `phone_verifications.insert()` | 1 DB write | ~$0.00001 |
| Edge Function `verify-otp` | 1 invocation | ~$0.000002 |
| ↳ `phone_verifications.select()` + `update()` | 2 DB ops | ~$0.00002 |

**Total par vérification : ~0.065€**

---

### 2.8 Vue gardien (monitoring)

| Élément | Fréquence | Coût/heure |
|---------|-----------|------------|
| `getProtectedPersons()` polling | 1 call / 30s = 120/h | Variable |
| ↳ Par protégé : `trips.select()` + `alerts.select()` | 2 DB reads × N protégés × 120/h | |
| Realtime `trip_locations` (détail) | 1 channel | Inclus |

**Avec 3 protégés, 1h de monitoring :**
- ~120 × (2 + 3×2) = ~960 DB reads/h
- Coût : **~$0.001/h**

---

### 2.9 Notifications in-app

| Élément | Fréquence | Coût |
|---------|-----------|------|
| `getNotifications()` query | On-demand | ~$0.000001 |
| `getUnreadCount()` polling | 1/min | ~$0.00006/h |
| Realtime `notifications` INSERT | 1 channel | Inclus |
| `markNotificationRead()` | Par tap | ~$0.00001 |

**Coût négligeable.**

---

## 3. Résumé — Coût par utilisatrice active/mois

### Hypothèses
- 15 trajets/mois
- 3 contacts de confiance
- 1 alerte/mois
- 5 recherches d'adresse/mois
- Trajet moyen de 30 min

| Poste | Calcul | Coût/mois |
|-------|--------|-----------|
| **SMS — trajets démarrés** | 15 × 3 × 0.065€ | **2.93€** |
| **SMS — arrivées** | 15 × 3 × 0.065€ | **2.93€** |
| **SMS — alertes** | 1 × 3 × 0.065€ | **0.20€** |
| **SMS — OTP** | ~1 × 0.065€ | **0.065€** |
| **Google Maps** | 15 × $0.038 + 5 × $0.003 | **$0.59** |
| **Expo Push** | ~100 notifs | **$0.00** (free tier) |
| **Supabase** (DB + Edge) | ~15k ops | **$0.00** (free tier) |

### Total par utilisatrice active : **~6.7€/mois**

> **Le SMS représente ~90% du coût.**

### Projection à l'échelle

| Utilisatrices actives | Coût SMS/mois | Google Maps/mois | Total/mois |
|----------------------|---------------|------------------|------------|
| 100 | ~612€ | ~$59 | **~670€** |
| 1 000 | ~6 120€ | ~$590 | **~6 700€** |
| 10 000 | ~61 200€ | ~$5 900 | **~67 000€** |
| 50 000 | ~306 000€ | ~$29 500 | **~336 000€** |

---

## 4. Recommandations d'optimisation

### PRIORITE HAUTE — Réduction des SMS (impact: ~90% du coût)

#### R1. Ne pas notifier les contacts par SMS au démarrage du trajet
**Économie : -33% des SMS (~2€/utilisatrice/mois)**

Le SMS "X a démarré un trajet" est informatif, pas critique. Réserver le SMS aux alertes et arrivées. Pour le démarrage, utiliser uniquement le push pour les contacts qui ont l'app.

```
Avant : 15 trajets × 3 contacts × 0.065€ = 2.93€/mois
Après : 0€ (push only)
```

#### R2. Regrouper les SMS en batch
**Économie : potentielle selon OVH**

Actuellement, chaque contact déclenche un appel séparé à `send-sms` → OVH. OVH supporte l'envoi en batch (liste de destinataires en un seul appel API). Cela réduirait les invocations Edge Function et potentiellement le coût.

#### R3. Rendre le SMS opt-in pour l'arrivée
**Économie : -30 à -50% des SMS selon le taux d'opt-out**

Proposer un réglage par contact : "Notifier par SMS à l'arrivée" (activé par défaut) vs "Push uniquement". Les contacts Prudency n'ont pas besoin de SMS s'ils reçoivent des push.

#### R4. Détecter les contacts Prudency et basculer automatiquement en push
**Économie : -100% SMS pour les contacts qui ont l'app**

Actuellement, un contact avec `notify_by_sms = true` ET qui est utilisatrice Prudency reçoit **les deux** (SMS + push). Logique recommandée :
- Si le contact a des push tokens actifs → push uniquement (gratuit)
- Sinon → SMS (payant)

---

### PRIORITE MOYENNE — Réduction Google Maps

#### R5. Cache des résultats Directions
**Économie : -30 à -50% des appels Directions**

Les itinéraires entre deux points ne changent pas souvent. Mettre en cache côté client (AsyncStorage) avec TTL de 15 min pour les mêmes origin/destination/mode.

#### R6. Limiter les appels Autocomplete avec debounce + minimum 3 caractères
**Économie : -40 à -60% des appels Autocomplete**

Vérifier que le debounce est suffisant (300ms+) et qu'on ne déclenche pas avant 3 caractères. Chaque frappe = un appel API.

#### R7. Utiliser Session Tokens pour Autocomplete + Details
**Économie : ~80% sur Place Details**

Google offre un pricing groupé : si un Autocomplete est suivi d'un Place Details avec le même session token, le Place Details est gratuit ($0.017 → $0.00). Il faut passer `sessiontoken` aux deux appels.

> **Impact estimé : de $0.038 à ~$0.010 par recherche, soit -74%**

#### R8. Utiliser la nouvelle Routes API au lieu de Directions API
**Économie : potentielle selon usage**

La nouvelle Google Routes API (v2) offre des champs computés plus flexibles et un pricing potentiellement meilleur ($5/1k pour routes basiques vs $7/1k pour Directions).

---

### PRIORITE BASSE — Optimisation infra Supabase

#### R9. Réduire le polling Guardian
**Économie : -50% DB reads pour les gardiens**

`useProtectedPersons` poll toutes les 30s. Remplacer par un Realtime subscription sur `trips` + `alerts` filtrée par les user_ids des protégés, au lieu du polling. Cela économiserait ~960 reads/h par gardien actif.

#### R10. Augmenter le staleTime de `useActiveTrip`
**Économie : réduction polling**

`staleTime: 10_000` (10s) + `refetchInterval: 30_000` (30s) + Realtime subscription. La subscription Realtime capture déjà les changements de trip en temps réel. Le polling à 30s est donc redondant. Passer à `refetchInterval: 120_000` (2 min) comme filet de sécurité, puisque le Realtime fait le travail.

#### R11. Ajouter une rétention des données notifications
**Impact : performance DB + RGPD**

La table `notifications` va croître indéfiniment. Ajouter un cron job pour purger les notifications > 90 jours.

#### R12. Batching des location writes
**Économie : -60 à -80% DB writes pendant le suivi**

Au lieu de 1 INSERT par position GPS, accumuler 5-10 positions et faire un seul INSERT batch toutes les 2-5 min. Le `locationService` a déjà un queue — l'exploiter plus agressivement.

---

## 5. Matrice impact/effort

| # | Recommandation | Économie/mois (1k users) | Effort |
|---|---------------|--------------------------|--------|
| R1 | Pas de SMS au démarrage | **-2 040€** | Faible |
| R4 | Push auto si contact Prudency | **-1 000 à -3 000€** | Moyen |
| R7 | Session tokens Google | **-$420** | Faible |
| R3 | SMS arrivée opt-in | **-1 000 à -2 000€** | Moyen |
| R5 | Cache Directions | **-$200** | Faible |
| R6 | Debounce Autocomplete | **-$150** | Faible |
| R9 | Realtime Guardian | Négligeable (free tier) | Moyen |
| R10 | Réduire polling trip | Négligeable | Faible |
| R12 | Batch location writes | Négligeable | Moyen |
| R2 | Batch SMS OVH | Variable | Moyen |
| R11 | Rétention notifications | Performance | Faible |

---

## 6. Quick wins (implémentables en < 1h)

1. **R1** — Supprimer l'appel SMS dans `notify-trip-started`, ne garder que le push
2. **R7** — Ajouter `sessiontoken` aux appels Autocomplete + Place Details
3. **R10** — Passer `refetchInterval` de 30s à 120s dans `useActiveTrip`
4. **R6** — Vérifier le debounce Autocomplete (min 300ms, min 3 chars)
