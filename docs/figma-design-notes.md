# Notes de design Figma — Prudency MVP 1

> Extraites automatiquement du Figma (fichier `uK5ICnO6GCspUoD2DxbHNA`, page "Maquettes / MVP")
> Ces notes sont positionnees pres des component sets dans le Figma.

---

## 1. Parcours de connexion

### Regle de session (fondamentale)
- Une session active est conservee tant que l'utilisatrice ne se deconnecte pas et le token de session est valide
- L'app s'ouvre directement sur l'ecran d'accueil (Map)
- Pas de login systematique
- Pas de friction inutile
- Experience fluide et securisee

### Parcours de connexion
Le parcours de connexion intervient uniquement dans les cas suivants :
- L'utilisatrice s'est deconnectee volontairement
- L'utilisatrice a change de telephone
- La session a ete invalidee (ex. securite, mise a jour majeure)
- Par defaut, la connexion reste active. L'utilisatrice n'a pas a saisir son mot de passe a chaque ouverture de l'app.

### Resume ultra-synthese
La connexion n'est requise que si la session a ete interrompue. Prudency privilegie une experience fluide : l'utilisatrice reste connectee tant qu'elle ne se deconnecte pas.

### Cas d'erreurs connexion
- Compte supprime (30 jours depasses) : "Ce compte n'existe plus. Tu peux en creer un nouveau."
- Probleme reseau : "Impossible de se connecter pour le moment. Verifie ta connexion."

### Message d'erreur possible — Email (connexion)
- IF email vide : "Ajoute ton adresse email pour continuer."
- IF format email invalide : "Cette adresse email ne semble pas valide."
- IF email deja utilise : "Un compte existe deja avec cette adresse email."

### Message d'erreur possible — Mots de passe (connexion)
- IF mot de passe vide : "Saisi ton mot de passe"
- IF mot de passe incorrect : "Ton mot de passe est invalide"

---

## 2. Parcours d'inscription

### Parcours d'inscription
- Possibilite de s'inscrire/connexion via : Google, Apple
- Objectif : creer un compte securise, verifier l'identite de l'utilisatrice, obtenir les autorisations necessaires au bon fonctionnement de l'app.

### Saisie automatique
Lors de la saisie des informations personnelles, laisser le choix a l'utilisatrice d'utiliser la saisie automatique native du device (ex. autofill iOS / Android : nom, prenom, telephone, email).
- Utiliser les composants natifs du systeme quand disponibles
- Ne pas bloquer ni surcharger la saisie manuelle
- La saisie automatique reste optionnelle, jamais imposee
- Objectif : reduire la friction, accelerer l'inscription, limiter les erreurs de saisie.

### Message d'erreur possible — Email (inscription)
- IF email vide : "Ajoute ton adresse email pour continuer."
- IF format email invalide : "Ton mail est invalide"

### Message d'erreur possible — Mots de passe (inscription)
- IF mot de passe vide : "Choisis un mot de passe pour securiser ton compte."
- IF mot de passe trop court : "Ton mot de passe doit contenir au moins 8 caracteres."
- IF mot de passe pas assez robuste : "Ton mot de passe n'est pas assez robuste. Ajoute des chiffres ou des caracteres speciaux."

### Message d'erreur possible — Phone/prenom
- IF Prenom ou nom vide : "Ajoute ton prenom"
- IF numero vide : "Ajoute ton numero pour securiser ton compte."
- IF format invalide : "Ce numero ne semble pas valide."
- IF numero deja utilise : "Ce numero est deja associe a un compte."

### Message d'erreur possible — Phone (verification SMS)
- IF code errone : "Le code saisi est incorrect. Verifie-le et reessaie."
- IF code partiellement saisi : "Renseigne le code complet recu par SMS."
- IF code expire : "Ce code a expire. Demande-en un nouveau."
- IF trop d'essais incorrects : "Trop de tentatives. Reessaie dans quelques minutes."
- IF aucun code recu apres delai : "Tu n'as pas recu le code ? Verifie ton numero ou demande un nouvel envoi."
- IF erreur serveur / SMS non envoye : "Un souci est survenu lors de l'envoi du code. Reessaie dans un instant."

### Bouton "M'inscrire"
Une fois tous les champs actifs et RGPD accepte, button "m'inscrire" devient Default Bleue

### SI refuser (autorisation localisation)
SI il refuse d'accepter, renvoyer sur la page "AUTORISATION LOCALISATION 2"

### Parcours inscription app
Renvoyer vers app store avec le lien

---

## 3. Alerte Panique

### Bouton alerte (inactif)
Quand on appuie 1 fois sur l'alertes inactive le message de fonctionnement apparait. Quand l'utilisateur appuie plus de 2s une alerte est envoyee automatiquement a ses contacts favoris.

### Bouton alerte Active
Reste active jusqu'a desactivation.
Micro animation : Pulsation bouton quand bouton actif.

### Parcours d'alerte "bouton panique"
- Quand on appuie 1 fois sur l'alertes inactive, le message sur le fonctionnement apparait.
- IF utilisateur appuie plus de 2s, le telephone vibre et une alerte est envoyee automatiquement a ses contacts favoris.
- Message envoye : (a definir)
- If utilisateur annule l'alerte (appuie 3s pour annuler), une notification est envoyee a la personne de confiance pour l'informer.
- Message envoye : (a definir)

---

## 4. Accueil / Map

### Recentrer | Localisation
Apparait uniquement si localisation utilisateur decentree de la map.

### Bottom Sheet — Acces aux lieux
- Les lieux sont accessibles via un bottom sheet depuis la map.
- Le bottom sheet est affiche via swipe up.
- Deux sections : Lieux enregistres, Lieux recents

### Recherche
En appuyant sur entrer/go ou rechercher, le clavier disparait et le lieu s'affiche sur la carte. L'utilisateur peut alors enregistrer le lieu.

---

## 5. Lieux

### Ajouter un lieu manuellement
Action : bouton "+ Enregistrer un lieu"
Ouvre une modale / bottom sheet avec :
- Champ Adresse (avec recherche + autocomplete)
- Champ Nom du lieu (obligatoire)
- Liste des lieux recents (raccourci)
Le bouton "Enregistrer le lieu" est :
- Desactive si un champ est vide
- Active quand adresse + nom sont remplis

### Ajouter un lieu depuis les lieux recents
- Depuis Lieux recents, action via menu (:) -> Enregistrer
- Le formulaire est prerempli avec l'adresse
- L'utilisateur doit uniquement renseigner / confirmer le nom du lieu
- Meme logique de validation / snackbar que ci-precedents.

### Modifier un lieu
Action via menu (:) sur un lieu enregistre -> Modifier
Ouvre un bottom sheet avec :
- Adresse (modifiable)
- Nom du lieu (modifiable)

### Validation (modification lieu)
- Bouton "Enregistrer les modifications"
- Desactive si aucun changement detecte

### Succes | Snack bar (enregistrement lieu)
Snackbar vert : "Lieu enregistre - Ton lieu a bien ete enregistre"
Le lieu apparait immediatement dans Lieux enregistres.
Possibilite d'annuler.

### Erreur | Snack bar (enregistrement lieu)
Snackbar rouge : "Lieu non enregistre - Une erreur est survenue"
Bouton Reessayer

### Succes | Snack bar (modification lieu)
Snackbar vert : "Modifications enregistrees"
Le lieu est mis a jour dans la liste.

### Erreur | Snack bar (modification lieu)
Snackbar rouge : "Modifications non enregistrees"
Bouton Reessayer

### Supprimer un lieu
- Action via menu (:) -> Supprimer
- Suppression immediate des lieux enregistres (pas de modale de confirmation lourde)
- La suppression entraine une remise automatique dans les lieux enregistres

### Succes | Snack bar (suppression lieu)
- Snackbar rouge : Le lieu "[lieu]" a bien ete supprime
- Action Annuler possible (rollback temporaire)

---

## 6. Creation de trajet

### Lancer le trajet bouton
Deviens default une fois lieu d'arrivee et type de transports choisit, si non reste disable.

### Ajouter une personne de confiance (pendant creation)
Renvoyer vers la page ajout de contact pour en ajouter directement.

### Module de creation trajet
Les ecrans de creation et de suivi de trajet s'appuient sur des patterns de navigation existants (routing / directions).
Figma illustre des etats fonctionnels, pas des ecrans de guidage a implementer pixel-perfect.
Le composant map doit etre reutilisable pour la creation, le suivi et les anomalies, quel que soit le mode de transport.

---

## 7. Itineraire actif — Module de navigation

### Module d'itineraire actif — comportement attendu
Ce bloc ne correspond pas a un ecran specifique a designer. Il s'agit d'un module de navigation standard, fourni par le SDK de cartographie utilise (Google Maps / Mapbox / Apple Maps ou equivalent).

#### Fonctionnement attendu
- Lorsqu'un trajet est actif, l'application affiche :
  - le trace de l'itineraire
  - la position actuelle de l'utilisatrice
  - les etapes / instructions de navigation (comme dans une app de transport classique : metro, marche, velo, voiture)
- Ce module :
  - reutilise les composants natifs de navigation (turn-by-turn, etapes, distances)
  - ne necessite pas d'ecran dedie dans Figma
  - doit simplement etre integre dans le contexte Prudency

#### Role de Prudency sur ce module
Prudency ne remplace pas la navigation, elle la surveille :
- recuperation des evenements : debut du trajet, progression, detours, arrets prolonges, arrivee estimee / reelle
- declenchement de : pop-ups d'anomalie, demandes de confirmation, alertes vers les personnes de confiance
- La navigation reste standard, la logique de securite est propre a Prudency.

---

## 8. Problemes sur un trajet — Boite de dialogue

### Page SI Aucune reponse aux boites de dialogue precedentes
#### Contexte d'apparition
Cette pop-up apparait 10 minutes apres la derniere interaction de l'utilisatrice, uniquement si :
- une anomalie a ete detectee (retard, arret prolonge, changement de trajet, etc.)
- aucune reponse n'a ete donnee aux precedentes pop-ups / notifications liees au trajet.

#### Objectif
Verifier explicitement si l'utilisatrice est en securite avant de declencher une alerte automatique.

#### Comportement attendu
- Un compte a rebours de 5 minutes demarre a l'affichage de cette pop-up.
- Deux actions possibles :
  1. "Tout va bien" : Annule le compte a rebours, marque l'evenement comme resolu, aucune alerte n'est envoyee, le trajet reprend son etat normal (avec recalcul si necessaire)
  2. "Declencher une alerte maintenant" : Declenche immediatement l'alerte, envoie les informations du trajet a la/aux personne(s) de confiance, inclut l'historique du trajet (actions, anomalies detectees, notes automatiques)

#### Sans action de l'utilisatrice
- A la fin des 5 minutes sans interaction :
  - L'alerte est declenchee automatiquement
  - Le meme payload d'alerte est envoye (localisation, trajet, historique, preuves si disponibles)

#### Notes
- Cette pop-up est une derniere etape de confirmation avant alerte automatique
- Elle ne doit apparaitre qu'une seule fois par anomalie non resolue
- Elle ne remplace pas les pop-ups precedentes, elle intervient en filet de securite

### Pop up
Un compte a rebours s'affiche en live sur la boite de dialogue.

---

## 9. Cas par cas — Problemes de trajet

### 1. Retard de transport
**Avant :** ETA depassee ou proche du depassement. Trajet toujours coherent geographiquement.
**Action utilisateur :** Selectionne "Retard de transport"
**BACK :** Recalcul automatique de l'ETA, l'itineraire reste identique, ajout d'un tag retard_transport
**Effets :** Mise a jour ETA visible, pas d'alerte envoyee, si partage actif -> personne de confiance voit l'ETA mise a jour
- Pas d'ecran supplementaire

### 2. Detour imprevu / volontaire
**Avant :** Ecart detecte par rapport a l'itineraire initial.
**Action utilisateur :** Selectionne "Detour imprevu" ou "Detour volontaire"
**BACK :** Recalcul complet de l'itineraire a partir de la position actuelle, nouvelle ETA, remplacement de l'itineraire precedent
**Effets :** Le trajet continue avec un nouvel itineraire, suppression de l'etat "anomalie", log du changement (pour historique)

### 3. Travaux / route barree
**Action utilisateur :** Selectionne "Travaux / route barree"
**BACK :** Redirection vers le module de choix d'itineraire, proposer X alternatives, l'utilisateur valide un nouveau trajet
**Effets :** Nouvel itineraire actif, nouvelle ETA
- Ecran existant de selection d'itineraire

### 4. Changement de destination
**Action utilisateur :** Selectionne "Changement de destination"
**BACK :** Redirection vers : modifier trajet, selection destination, recalcul itineraire + ETA
**Effets :** Ancienne destination remplacee, trajet mis a jour
- Utilise le flow "Creer un trajet" (destination uniquement), pas de nouvel ecran

### 5. Attente (transport / ami / rendez-vous)
**Action utilisateur :** Selectionne "Attente"
**BACK :** Meme logique que pause personnelle, tag specifique attente
**Effets :** ETA ajustee, pas d'alerte immediate
- Identique a Pause cote logique

### 6. Pause volontaire
**Avant :** Position stable depuis X minutes.
**Action utilisateur :** Selectionne "Pause personnelle"
**BACK :** Trajet passe en etat pause, timer de pause lance, ETA recalculee = ETA + duree de pause
**Effets :** Aucune alerte, si depassement du temps max -> nouvelle popup
- Pas d'ecran supplementaire

### 7. Autre raison
**Action utilisateur :** Selectionne "Autre raison"
**BACK :** Recalcul automatique de l'itineraire + ETA, champ note facultatif
**Effets :** Trajet continue, historique enrichi
- Pas d'ecran supplementaire

### 8. Fatigue / besoin de s'arreter
**Action utilisateur :** Selectionne "Fatigue / besoin de s'arreter"
**BACK :** Deux options possibles : a. Recalcul ETA (pause), b. Declenchement manuel d'alerte (si l'utilisateur choisit)
**Effets :** Si alerte -> flow alerte, sinon -> pause + ETA ajustee
- Popup suffisante

### 9. Probleme technique
**Action utilisateur :** Selectionne "Probleme technique"
**BACK :** Recalcul automatique de l'itineraire, nouvelle ETA, marqueur incident_technique
**Effets :** Trajet continue, historique conserve
- Pas d'ecran supplementaire

### 10. Tout va bien
**CTA "Tout va bien" :** Revient au trajet et recalcule automatique de l'itineraire

### TOUT VA BIEN — Definition complete
"Tout va bien" = confirmation consciente que l'anomalie detectee est normale.
On desamorce l'escalade, on met a jour l'etat du trajet, et on evite l'envoi d'alerte.

Ce que "Tout va bien" ne fait PAS :
- Ne termine pas le trajet
- N'envoie aucune notification a la personne de confiance
- Ne supprime pas l'historique
- Ne desactive pas la surveillance future

**Resume :** Action "Tout va bien" confirme que l'anomalie detectee est normale. Annule toute escalade, met a jour l'etat du trajet et recalcule l'itineraire si necessaire (retard, detour). Ajoute une annotation systeme dans l'historique du trajet. Aucune notification n'est envoyee aux personnes de confiance.

---

## 10. Retard / Modification de trajet

### Retard de trajet
- Dans quel cas : Lorsque le trajet de l'utilisateur a un decalage de plus de 15 min par rapport a l'heure d'arrivee de base
- Apres cb de temps cette notification pop up s'affiche : Au bout de 15min
- Pendant combien de temps : 15 min

### Modification trajet (fin de trajet)
- Dans quel cas : Arrive a la fin de ton trajet sans aucune validation de fin de trajet
- Apres cb de temps cette notification pop up s'affiche : 0s
- Pendant combien de temps : 15min, Decompte

### Modification trajet — CTA "Tout va bien"
Revient au trajet et recalcule automatique de l'itineraire

### Prolonger / Modifier un trajet
Point d'entree :
- Bouton "Prolonger le trajet"
- OU declenchement automatique (retard, arret, detour)

---

## 11. Contacts de confiance

### Ajouter une personne de confiance
Renvoyer vers la page ajout de contact pour en ajouter directement.

### Contact (ajout via contacts natifs)
Renvoyer vers la page natif des contacts, permettre de valider et envoyer la demande une fois le contact selectionne.

### En cours de validation
Si l'utilisateur appui sur "en cours de validation", la snack barre informative apparait.

### Ajouter une autre personne de confiance
L'utilisateur doit supprimer sa personne de confiance actuelle pour que celui ci soit "actif". Un dialogue apparait pour expliquer le cas present.

### Ajouter un contact de confiance (depuis trajet)
Envoye sur la page d'ajout de contact de confiance. Une fois la demande envoyee, revenir sur cette page.
Voir Parcours "Ajouter une personnes de confiance"

---

## 12. Abonnement (MVP)

### Parcours abonnement (MVP)
- Les elements du parcours abonnement sont cliquables pour des raisons de comprehension UX et d'anticipation fonctionnelle.
- Aucune action reelle n'est declenchee en MVP 1 (pas de paiement, pas de changement de statut).
- Au clic, afficher une snackbar informative indiquant que la fonctionnalite n'est pas encore disponible.

**Texte snackbar (a valider) :** "Fonctionnalite a venir. L'abonnement sera disponible prochainement."

**Comportement attendu :**
- Pas de redirection vers un tunnel de paiement
- Pas de modification du statut utilisateur
- Snackbar non bloquante, disparition automatique (3-4s)

**Objectif :** Preparer le terrain pour la V1 sans creer de confusion ni de faux parcours fonctionnels.

**Important :**
- Ne pas implementer Apple/Google In-App Purchase, ni ecran "Choisir une formule", ni biometrie liee a l'abonnement dans le MVP 1.
- L'ecran sert de "placeholder produit" + clarification des features.

### Clique sur Prudency Plus
**Comportement :** Snackbar
- Duree : 2-3 secondes
- Non bloquante
- Pas d'action secondaire
- Aucun changement d'etat (pas de loading, pas de redirection)
- Le CTA reste visible mais desactive fonctionnellement

---

## 13. Deconnexion

### Module de deconnexion — action qui s'en suit
Dans Prudency, la deconnexion entraine automatiquement la desactivation du compte.
L'utilisatrice n'a plus acces aux trajets, alertes ni personnes de confiance, et toutes les relations de protection sont suspendues.
Les personnes de confiance (ou protegees) sont informees que le compte est inactif, sans detail ni justification.
Les donnees sont conservees de facon inactive pendant 30 jours. Si l'utilisatrice ne se reconnecte pas dans ce delai, le compte et toutes les donnees sont supprimes definitivement.

### Confirmation de deconnexion par mdp
L'utilisateur doit confirmer sa deconnexion du compte via mots de passe.

### Deconnexion
La deconnexion entraine la suppression de : la session active, l'historique recent affiche dans l'app, les parametres temporaires de l'application, ton role de personne de confiance.

---

## 14. Notes de trajet

Le design Figma montre un ecran "Notes" avec :
- Liste de notes avec auteur, heure, contenu
- Notes automatiques systeme intercalees (ex: "Retard detecte 14h15", "Tout vas bien 14h17")
- Input en bas pour "Ajouter une note"
- Possibilite de modifier une note existante
- Menu contextuel (:) par note
