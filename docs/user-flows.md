# User Flows -- Prudency

## Table des matieres

- [1. Trajet OK (Happy Path)](#1-trajet-ok-happy-path)
- [2. Modification / Annulation de trajet](#2-modification--annulation-de-trajet)
- [3. Probleme detecte (Timeout)](#3-probleme-detecte-timeout)
- [4. Alerte manuelle](#4-alerte-manuelle)
- [5. Reception d'alerte (Contact de confiance)](#5-reception-dalerte-contact-de-confiance)
- [6. Inscription et Onboarding](#6-inscription-et-onboarding)
- [7. Gestion des contacts de confiance](#7-gestion-des-contacts-de-confiance)
- [Notes techniques](#notes-techniques)
- [Cas limites et erreurs](#cas-limites-et-erreurs)

---

## 1. Trajet OK (Happy Path)

L'utilisateur cree un trajet, le demarre, et arrive a destination dans les temps.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase
    participant C as Contacts

    U->>A: Ouvre l'app (Home)
    U->>A: Appuie "Demarrer un trajet"
    A->>A: Navigue vers Create Trip
    U->>A: Configure duree (ex: 30 min)
    U->>A: Confirme le trajet
    A->>S: INSERT trips (status: 'active')
    S-->>A: Trip cree
    A->>A: Navigue vers Active Trip
    A->>A: Demarre tracking GPS

    loop Toutes les 30 secondes
        A->>S: update-location (lat, lng, battery)
    end

    U->>A: Appuie "Je suis arrivee"
    A->>S: UPDATE trips (status: 'completed')
    A->>A: Arrete tracking GPS
    A->>A: Navigue vers Home
    A-->>U: "Trajet termine avec succes"
```

---

## 2. Modification / Annulation de trajet

L'utilisateur modifie la duree ou annule un trajet en cours.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase

    Note over U,A: Trajet en cours

    alt Modification duree
        U->>A: Appuie "Modifier"
        A->>A: Affiche modal duree
        U->>A: Nouvelle duree (+15 min)
        A->>S: UPDATE trips (estimated_arrival_at)
        S-->>A: OK
        A-->>U: "Duree mise a jour"
    else Annulation
        U->>A: Appuie "Annuler le trajet"
        A->>A: Affiche confirmation
        U->>A: Confirme annulation
        A->>S: UPDATE trips (status: 'cancelled')
        A->>A: Arrete tracking GPS
        A->>A: Navigue vers Home
        A-->>U: "Trajet annule"
    end
```

---

## 3. Probleme detecte (Timeout)

L'utilisateur ne valide pas son arrivee dans les temps. Le systeme declenche une alerte automatique apres 5 minutes de depassement.

```mermaid
sequenceDiagram
    participant A as App
    participant S as Supabase
    participant EF as Edge Functions
    participant SMS as Plivo SMS
    participant C as Contacts

    Note over A,S: Trajet actif, heure d'arrivee depassee

    S->>EF: Cron: check-trip-timeout
    EF->>S: SELECT trips WHERE status='active' AND estimated_arrival_at < NOW() - 5min
    S-->>EF: Trip trouve (timeout)
    EF->>S: UPDATE trips (status: 'timeout')
    EF->>S: INSERT alerts (type: 'timeout')
    EF->>EF: notify-contacts

    par Notification Push
        EF->>C: Push notification
    and SMS
        EF->>SMS: send-sms (chaque contact)
        SMS-->>C: SMS "[Nom] n'a pas confirme son arrivee"
    end

    EF-->>S: Alert created, contacts notified
```

---

## 4. Alerte manuelle

L'utilisateur declenche une alerte volontairement (avec ou sans trajet actif).

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase
    participant EF as Edge Functions
    participant SMS as Plivo SMS
    participant C as Contacts

    U->>A: Maintient appuye le bouton d'alerte (3s)
    A->>A: Vibration haptique de confirmation
    A->>A: Recupere position GPS actuelle
    A->>EF: POST send-alert (type: 'manual', lat, lng, battery)

    EF->>S: INSERT alerts
    EF->>S: SELECT trusted_contacts WHERE user_id = ?
    S-->>EF: Liste des contacts

    par Pour chaque contact
        EF->>SMS: send-sms
        SMS-->>C: SMS "ALERTE: [Nom] a besoin d'aide. Position: [lien maps]"
        EF->>C: Push notification
    end

    EF-->>A: { alertId, notifiedContacts }
    A-->>U: "Alerte envoyee a X contacts"
    A->>A: Affiche ecran "Alerte active"
```

---

## 5. Reception d'alerte (Contact de confiance)

Un contact de confiance recoit une alerte et peut agir.

```mermaid
sequenceDiagram
    participant S as Systeme
    participant SMS as SMS
    participant C as Contact
    participant A as App Contact
    participant P as Prudency Backend

    S->>SMS: Envoi SMS alerte
    SMS->>C: "ALERTE: Marie a besoin d'aide"

    Note over C: Le contact recoit SMS + push

    alt Contact avec l'app installee
        C->>A: Ouvre la notification
        A->>A: Affiche details alerte (position, heure, batterie)
        C->>A: Appuie "Je prends en charge"
        A->>P: UPDATE alerts (status: 'acknowledged')
        P-->>A: OK
        A-->>C: "Merci, [Nom] est prevenu(e)"
    else Contact sans l'app
        C->>C: Clique sur le lien Maps dans le SMS
        C->>C: Voit la position sur Google Maps
        C->>C: Appelle la personne ou les secours
    end
```

---

## 6. Inscription et Onboarding

Nouveau utilisateur s'inscrit et configure l'app.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase

    U->>A: Ouvre l'app (premiere fois)
    A->>A: Affiche ecran Login

    alt Apple Sign In
        U->>A: Appuie "Continuer avec Apple"
        A->>A: expo-apple-authentication
        A-->>S: auth.signInWithOAuth('apple')
    else Google Sign In
        U->>A: Appuie "Continuer avec Google"
        A->>A: expo-auth-session + expo-web-browser
        A-->>S: auth.signInWithOAuth('google')
    else Email/Password
        U->>A: Appuie "S'inscrire avec email"
        A->>A: Navigue vers Register
        U->>A: Remplit email + mot de passe
        A->>S: auth.signUp({ email, password })
    end

    S-->>A: Session creee
    S->>S: Trigger: cree profile automatiquement

    A->>A: Navigue vers Onboarding
    A-->>U: "Bienvenue sur Prudency"

    Note over A,U: Etape 1: Permissions
    A-->>U: "Autoriser les notifications?"
    U->>A: Accepte
    A->>A: expo-notifications.requestPermissions()

    A-->>U: "Autoriser la localisation?"
    U->>A: Accepte (Always ou When in use)
    A->>A: expo-location.requestPermissions()

    Note over A,U: Etape 2: Contacts
    A-->>U: "Ajoutez vos contacts de confiance"
    U->>A: Ajoute 1-5 contacts
    A->>S: INSERT trusted_contacts

    U->>A: Termine l'onboarding
    A->>S: UPDATE profiles (onboarding_completed: true)
    A->>A: Navigue vers Home
```

---

## 7. Gestion des contacts de confiance

L'utilisateur ajoute, modifie ou supprime des contacts.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase

    U->>A: Navigue vers onglet Contacts
    A->>S: SELECT trusted_contacts WHERE user_id = ?
    S-->>A: Liste des contacts

    alt Ajouter un contact
        U->>A: Appuie "+"
        A->>A: Affiche formulaire
        U->>A: Remplit nom + telephone
        U->>A: Configure notifications (SMS, Push)
        U->>A: Valide
        A->>S: INSERT trusted_contacts
        S-->>A: Contact cree
        A-->>U: "Contact ajoute"
    else Modifier un contact
        U->>A: Appuie sur un contact
        A->>A: Affiche details
        U->>A: Modifie les infos
        A->>S: UPDATE trusted_contacts
        S-->>A: OK
    else Supprimer un contact
        U->>A: Swipe gauche sur contact
        U->>A: Appuie "Supprimer"
        A->>A: Affiche confirmation
        U->>A: Confirme
        A->>S: DELETE trusted_contacts
        S-->>A: OK
        A-->>U: "Contact supprime"
    end
```

---

## Notes techniques

### Strategie de tracking GPS

| Phase | Frequence | Precision | Condition |
|-------|-----------|-----------|-----------|
| Demarrage du trajet | 30s | `Accuracy.Balanced` | 2 premieres minutes |
| En cours de trajet | 60s | `Accuracy.Balanced` | Mode normal |
| Approche heure d'arrivee | 10s | `Accuracy.Balanced` | 15 min avant l'heure estimee |
| Alerte active | 5s | `Accuracy.High` | Alerte declenchee |
| Trajet termine | Stop | -- | Tracking arrete |

### Optimisation batterie

- Utiliser `expo-location` avec `accuracy: Accuracy.Balanced` par defaut
- Passer en `Accuracy.High` uniquement lors d'alertes actives
- Arreter le tracking des que le trajet est termine ou annule
- Monitorer le niveau de batterie et avertir l'utilisateur si < 15%
- Le niveau de batterie est inclus dans chaque mise a jour de position

---

## Cas limites et erreurs

### Perte de connexion reseau

- Les mises a jour de position sont mises en file d'attente localement
- L'alerte manuelle est tentee des que la connexion revient
- L'utilisateur voit un indicateur "hors ligne" dans l'app

### Batterie faible (< 15%)

- L'app affiche un avertissement a l'utilisateur
- Le niveau de batterie est envoye aux contacts lors d'une alerte
- La frequence de tracking est reduite pour economiser la batterie

### Permissions refusees

- Si la localisation est refusee : l'utilisateur peut creer un trajet mais sans tracking GPS
- Si les notifications sont refusees : l'alerte fonctionne mais les contacts ne recoivent pas de push
- L'app guide l'utilisateur vers les reglages systeme pour reactiver les permissions

### Maximum de contacts atteint

- L'insertion est bloquee par le trigger `enforce_max_contacts` (max 5)
- L'app affiche un message expliquant la limite
- L'utilisateur doit supprimer un contact existant avant d'en ajouter un nouveau

### Maximum de notes atteint

- L'insertion est bloquee par le trigger `enforce_max_trip_notes` (max 20)
- L'app affiche un message expliquant la limite

### Echec d'envoi SMS

- L'echec est consigne dans le tableau `failures` de la reponse `notify-contacts`
- Les autres contacts sont quand meme notifies
- L'utilisateur est informe du nombre de contacts effectivement notifies

---

**Voir aussi :**
- [Reference API](./api-reference.md) -- documentation des Edge Functions utilisees dans ces flows
- [Schema BDD](./database-schema.md) -- structure des donnees
- [Architecture](./architecture.md) -- vue d'ensemble technique
