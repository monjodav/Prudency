# Roadmap MVP — Prudency

> Derniere mise a jour : 06/03/2026

## Etat global

| Metrique | Valeur |
|----------|--------|
| Code ecrit | ~80% |
| Fonctionnel (hors paiement) | ~70% |
| Production-ready | ~50% |
| Cartes Trello total | 42 |
| Terminees | 19 |
| A tester | 15 |
| En cours (partiel) | 8 |
| Backlog | 0 |

---

## Priorite 1 — Bloquant MVP

### Paiement (RevenueCat)

Le seul vrai blocage pour la mise en production. Sans ca, tout ce qui est Premium fonctionne en mode flag local (`is_premium = false` pour tout le monde).

**A faire :**
- [ ] Integrer `react-native-purchases` (RevenueCat SDK)
- [ ] Configurer les produits dans le dashboard RevenueCat (mensuel / annuel)
- [ ] Creer un hook `useSubscription` qui sync le statut RevenueCat vers `is_premium` dans Supabase
- [ ] Modifier `usePremium.ts` pour lire depuis RevenueCat au lieu du flag local
- [ ] Ecran d'achat avec `Purchases.purchasePackage()`
- [ ] Restore purchases au login (`Purchases.restorePurchases()`)
- [ ] Webhook RevenueCat vers Edge Function pour mettre a jour `is_premium` cote serveur
- [ ] Tester le flow complet : achat, restoration, expiration, annulation

**Impact :** Debloque 3 cartes Trello (Passer version payante, Administrer souscription, Contacts multiples Premium)

**Fichiers concernes :**
- `src/hooks/usePremium.ts` (a modifier)
- `src/hooks/useSubscription.ts` (a creer)
- `src/services/premiumService.ts` (a modifier)
- `app/(profile)/subscription.tsx` (a modifier)
- `supabase/functions/revenuecat-webhook/` (a creer)

### Confirmation d'arrivee — rappels repetes

Actuellement : 1 seule notification overtime a l'heure d'arrivee estimee. Le Trello demande des rappels repetes toutes les 5 minutes apres l'overtime pour forcer la confirmation.

**A faire :**
- [ ] Ajouter des notifications recurrentes post-overtime dans `useTripNotifications.ts`
- [ ] Intervalle : toutes les 5 minutes (configurable via preferences)
- [ ] Stopper les rappels quand l'utilisatrice confirme ou que l'alerte est declenchee

**Fichiers concernes :**
- `src/hooks/useTripNotifications.ts`

---

## Priorite 2 — Features partielles a finir

### Alerter contact — escalade 2 phases

Le systeme d'alerte contact existe mais n'a qu'une seule phase.

**Etat actuel :**
- Phase 1 : SMS simple "Prends contact avec [nom]" — implementee
- Phase 2 : Apres delai configurable, envoi des donnees completes (localisation, trajet, notes) — **pas implementee**

**A faire :**
- [ ] Ajouter un delai configurable dans les preferences utilisatrice (defaut : 20 min)
- [ ] Creer un cron/scheduled function qui verifie le delai et envoie la phase 2
- [ ] Phase 2 inclut : localisation temps reel, trajet prevu, heure actuelle, heure d'arrivee estimee, notes
- [ ] Tester le flow complet : alerte -> phase 1 -> attente -> phase 2

**Fichiers concernes :**
- `supabase/functions/notify-contacts/` (a modifier)
- `supabase/functions/escalate-alert/` (a creer)
- `src/stores/preferencesStore.ts` (ajouter le delai)

### Anomalie detection — notification actionable

La detection d'anomalie existe (`anomalyDetection.ts`, `AnomalyDialog.tsx`) mais la push notification avec actions n'est pas faite.

**A faire :**
- [ ] Configurer des notification categories avec expo-notifications (actions : "Tout va bien" / "Alerte")
- [ ] Envoyer une push actionable quand une anomalie est detectee
- [ ] Gerer la reponse : "Tout va bien" -> reset, "Alerte" -> declenchement alerte
- [ ] Si pas de reponse apres 2 minutes -> alerte automatique

**Fichiers concernes :**
- `src/hooks/useAnomalyDetection.ts`
- `src/hooks/useNotifications.ts` (ajouter categories)
- `src/hooks/useTripNotifications.ts`

### Mode offline — queue d'alertes

La queue de locations offline existe et sync au retour reseau. Mais les alertes declenchees offline ne sont pas mises en queue.

**A faire :**
- [ ] Creer une queue locale pour les alertes declenchees hors ligne
- [ ] Au retour du reseau, envoyer les alertes en queue dans l'ordre
- [ ] Notifier l'utilisatrice que l'alerte a ete envoyee avec retard

**Fichiers concernes :**
- `src/hooks/useOfflineSync.ts`
- `src/services/locationService.ts`

---

## Priorite 3 — Post-MVP (peut attendre)

| Feature | Effort | Notes |
|---------|--------|-------|
| Nettoyage auto des preuves | Moyen | Cron job Supabase, suppression apres X jours sans alerte |
| Partage trajet premium/non-premium | Petit | Distinction des infos partagees selon le statut |
| Interface web de suivi | Gros | Marquee V2 dans le Trello |
| Bouton panique widget/shake/volume | Moyen | Marquee V2 |
| Message d'alerte personnalise (Premium) | Petit | Champ texte dans les preferences |
| Commentaires retrospectifs sur alertes | Petit | UI existe, backend a connecter |

---

## Cartes Trello — Etat actuel

### Terminees (19)

| # | Carte | Label |
|---|-------|-------|
| 1 | Saisir les informations d'un trajet | Trajet |
| 2 | Suivi GPS du trajet en cours | Trajet |
| 3 | Validation securisee du Trajet | Trajet, Premium, Securite |
| 4 | Designer un contact de confiance | Contacts |
| 5 | Validation du role de personne de confiance | Contacts |
| 6 | M'inscrire sur l'application | Configuration |
| 7 | Authentification utilisateur | Configuration |
| 8 | Fermer ma session | Configuration |
| 9 | Configurer les permissions de l'application | Configuration |
| 10 | Mettre a jour mon profil | Configuration |
| 11 | Recuperation de mot de passe | Configuration |
| 12 | Tutoriel de premiere utilisation (deprecie) | Configuration |
| 13 | Preserver l'autonomie durant le suivi | Technique |
| 14 | Garantir la confidentialite de mes informations | Securite |
| 15 | Cloture de compte | Securite |
| 16 | Acceder a mes trajets passes | Historique |
| 17 | Consulter les informations d'une alerte archivee | Historique |
| 18 | Voir le detail cartographique d'un trajet | Historique, Premium |
| 19 | Decouvrir l'offre premium | Premium |

### A tester (15)

| # | Carte | Label | Notes |
|---|-------|-------|-------|
| 1 | Systeme de notifications | Securite | Push + locales + in-app, ecran liste, badge, realtime |
| 2 | Etre alertee en cas de detection d'anomalie | Securite | Detection existe, notification actionable manquante |
| 3 | Alerter mon contact en cas de danger | Securite | SMS + push existent, escalade 2 phases manquante |
| 4 | Ajouter plusieurs contacts de securite | Premium | Limite free:1 / premium:5, enforcement a verifier |
| 5 | Confirmer que je suis bien arrivee | Trajet | Rappels repetes post-overtime manquants |
| 6 | Changer mon mot de passe actuel | Configuration | |
| 7 | Ajouter une note de contexte | Preuves, Premium | |
| + | 8 autres cartes deja en A tester avant cet audit | | |

### En cours — partiellement implementees (8)

| # | Carte | Label | Ce qui manque |
|---|-------|-------|---------------|
| 1 | Bouton panique immediat | Securite | Escalade 2 phases |
| 2 | Partager ma position GPS | Securite | Interface web V2 |
| 3 | Identification automatique anomalies | Securite | Notification actionable |
| 4 | Partage d'un trajet | Trajet | Distinction premium |
| 5 | Maintenir fonctionnalites sans reseau | Technique | Queue d'alertes offline |
| 6 | Nettoyage auto preuves | Securite | Cleanup data/notes auto |
| 7 | Passer a la version payante | Premium | **Pas de RevenueCat/Stripe** |
| 8 | Administrer ma souscription | Premium | **Pas de backend paiement** |

---

## Stack technique rappel

- **Frontend** : Expo (React Native) + TypeScript strict
- **Backend** : Supabase (Auth, Database, Edge Functions, Realtime)
- **Paiement** : RevenueCat (a integrer)
- **SMS** : OVH SMS API (via Edge Functions)
- **Push** : Expo Push Notifications
- **GPS** : expo-location avec tracking adaptatif batterie
