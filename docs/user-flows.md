# User Flows — Prudency

Ce document décrit les parcours utilisateur principaux de l'application.

---

## 1. Trajet OK (Happy Path)

L'utilisateur crée un trajet, le démarre, et arrive à destination dans les temps.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase
    participant C as Contacts

    U->>A: Ouvre l'app (Home)
    U->>A: Appuie "Démarrer un trajet"
    A->>A: Navigue vers Create Trip
    U->>A: Configure durée (ex: 30 min)
    U->>A: Confirme le trajet
    A->>S: INSERT trips (status: 'active')
    S-->>A: Trip créé
    A->>A: Navigue vers Active Trip
    A->>A: Démarre tracking GPS

    loop Toutes les 30 secondes
        A->>S: update-location (lat, lng, battery)
    end

    U->>A: Appuie "Je suis arrivé(e)"
    A->>S: UPDATE trips (status: 'completed')
    A->>A: Arrête tracking GPS
    A->>A: Navigue vers Home
    A-->>U: "Trajet terminé avec succès"
```

---

## 2. Modification / Annulation de trajet

L'utilisateur modifie la durée ou annule un trajet en cours.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase

    Note over U,A: Trajet en cours

    alt Modification durée
        U->>A: Appuie "Modifier"
        A->>A: Affiche modal durée
        U->>A: Nouvelle durée (+15 min)
        A->>S: UPDATE trips (estimated_arrival_at)
        S-->>A: OK
        A-->>U: "Durée mise à jour"
    else Annulation
        U->>A: Appuie "Annuler le trajet"
        A->>A: Affiche confirmation
        U->>A: Confirme annulation
        A->>S: UPDATE trips (status: 'cancelled')
        A->>A: Arrête tracking GPS
        A->>A: Navigue vers Home
        A-->>U: "Trajet annulé"
    end
```

---

## 3. Problème détecté (Timeout)

L'utilisateur ne valide pas son arrivée dans les temps. Le système déclenche une alerte automatique.

```mermaid
sequenceDiagram
    participant A as App
    participant S as Supabase
    participant EF as Edge Functions
    participant SMS as Plivo SMS
    participant C as Contacts

    Note over A,S: Trajet actif, heure d'arrivée dépassée

    S->>EF: Cron: check-trip-timeout
    EF->>S: SELECT trips WHERE status='active' AND estimated_arrival_at < NOW() - 5min
    S-->>EF: Trip trouvé (timeout)
    EF->>S: UPDATE trips (status: 'timeout')
    EF->>S: INSERT alerts (type: 'timeout')
    EF->>EF: notify-contacts

    par Notification Push
        EF->>C: Push notification
    and SMS
        EF->>SMS: send-sms (chaque contact)
        SMS-->>C: SMS "⚠️ [Nom] n'a pas confirmé son arrivée"
    end

    EF-->>S: Alert created, contacts notified
```

---

## 4. Alerte manuelle

L'utilisateur déclenche une alerte volontairement (avec ou sans trajet actif).

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as App
    participant S as Supabase
    participant EF as Edge Functions
    participant SMS as Plivo SMS
    participant C as Contacts

    U->>A: Maintient appuyé le bouton d'alerte (3s)
    A->>A: Vibration haptique de confirmation
    A->>S: Récupère position GPS actuelle
    A->>EF: POST send-alert (type: 'manual', lat, lng, battery)

    EF->>S: INSERT alerts
    EF->>S: SELECT trusted_contacts WHERE user_id = ?
    S-->>EF: Liste des contacts

    par Pour chaque contact
        EF->>SMS: send-sms
        SMS-->>C: SMS "🆘 ALERTE: [Nom] a besoin d'aide. Position: [lien maps]"
        EF->>C: Push notification
    end

    EF-->>A: { alertId, notifiedContacts }
    A-->>U: "Alerte envoyée à X contacts"
    A->>A: Affiche écran "Alerte active"
```

---

## 5. Réception d'alerte (Contact de confiance)

Un contact de confiance reçoit une alerte et peut agir.

```mermaid
sequenceDiagram
    participant S as Système
    participant SMS as SMS
    participant C as Contact
    participant A as App Contact
    participant P as Prudency Backend

    S->>SMS: Envoi SMS alerte
    SMS->>C: "🆘 ALERTE: Marie a besoin d'aide"

    Note over C: Le contact reçoit SMS + push

    alt Contact avec l'app installée
        C->>A: Ouvre la notification
        A->>A: Affiche détails alerte (position, heure, batterie)
        C->>A: Appuie "Je prends en charge"
        A->>P: UPDATE alerts (status: 'acknowledged')
        P-->>A: OK
        A-->>C: "Merci, [Nom] est prévenu(e)"
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

    U->>A: Ouvre l'app (première fois)
    A->>A: Affiche écran Login

    alt Apple Sign In
        U->>A: Appuie "Continuer avec Apple"
        A->>A: expo-apple-authentication
        A-->>S: auth.signInWithOAuth('apple')
    else Google Sign In
        U->>A: Appuie "Continuer avec Google"
        A->>A: expo-auth-session
        A-->>S: auth.signInWithOAuth('google')
    else Email/Password
        U->>A: Appuie "S'inscrire avec email"
        A->>A: Navigue vers Register
        U->>A: Remplit email + mot de passe
        A->>S: auth.signUp({ email, password })
    end

    S-->>A: Session créée
    S->>S: Trigger: crée profile automatiquement

    A->>A: Navigue vers Onboarding
    A-->>U: "Bienvenue sur Prudency"

    Note over A,U: Étape 1: Permissions
    A-->>U: "Autoriser les notifications?"
    U->>A: Accepte
    A->>A: expo-notifications.requestPermissions()

    A-->>U: "Autoriser la localisation?"
    U->>A: Accepte (Always ou When in use)
    A->>A: expo-location.requestPermissions()

    Note over A,U: Étape 2: Contacts
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
        U->>A: Remplit nom + téléphone
        U->>A: Configure notifications (SMS, Push)
        U->>A: Valide
        A->>S: INSERT trusted_contacts
        S-->>A: Contact créé
        A-->>U: "Contact ajouté"
    else Modifier un contact
        U->>A: Appuie sur un contact
        A->>A: Affiche détails
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
        A-->>U: "Contact supprimé"
    end
```

---

## Notes techniques

### GPS Tracking Strategy

1. **Au démarrage du trajet** : Haute fréquence (30s) pendant 2 minutes
2. **En cours de trajet** : Basse fréquence (60s)
3. **À l'approche de l'heure d'arrivée** : Haute fréquence (10s)
4. **Lors d'une alerte** : Temps réel (5s)

### Optimisation batterie

- Utiliser `expo-location` avec `accuracy: Accuracy.Balanced`
- Passer en `Accuracy.High` uniquement lors d'alertes
- Arrêter le tracking dès que le trajet est terminé
- Monitorer le niveau de batterie et avertir si < 15%
