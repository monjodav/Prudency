# Audit CS1-2 : Auth (Connexion + Inscription)

**Date** : 2026-02-20
**Auditeur** : Agent CS1-2
**Figma fileKey** : `uK5ICnO6GCspUoD2DxbHNA`

---

## Table des matieres

1. [CS1 - Parcours de connexion](#cs1---parcours-de-connexion)
2. [CS2 - Parcours d'inscription](#cs2---parcours-dinscription)
3. [Trello Card Assessment](#trello-card-assessment)
4. [Resume des gaps](#resume-des-gaps)

---

## CS1 - Parcours de connexion

**Figma section** : "Parcours de connexion" (nodeId: `467:39797`)
**Ecrans Figma** : Page de chargement, Connexion/Empty, Connexion/Filled, Connexion/Error, Compte supprime (dialog)

### Ecran : Page de chargement (`app/(auth)/loading.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 1.1 | Logo SVG manquant | **majeur** | Figma affiche le logo icone Prudency (bouclier/P) au-dessus du texte "PRUDENCY". Le code utilise uniquement le texte `<Text>PRUDENCY</Text>` sans icone SVG. Le fichier `assets/images/logo.svg` existe mais n'est pas utilise. |
| 1.2 | Position du logo | mineur | Dans Figma, le logo + texte sont centres verticalement (logo a y=355, texte a y=441 sur un ecran de 852px). Le code centre bien verticalement avec `justifyContent: 'center'`, ce qui est correct. |
| 1.3 | Fond ellipse violet | mineur | Le code utilise un `View` avec borderRadius pour l'ellipse, tandis que Figma montre un blur radial. L'`OnboardingBackground` est utilise sur d'autres ecrans mais pas sur loading.tsx qui a sa propre implementation. Leger ecart visuel possible. |

### Ecran : Connexion (`app/(auth)/login.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 2.1 | Logo icone Prudency absent en haut | **majeur** | Figma montre le logo icone (bouclier/P) + texte "PRUDENCY" en haut de l'ecran (y=110). Le code affiche seulement `<Text>PRUDENCY</Text>` en bas de l'ecran (dans `logoContainer`). Il n'y a pas de header avec le logo en haut. |
| 2.2 | Titre/sous-titre differents | **majeur** | Figma : titre "Connexion", sous-titre "Accede a ton espace". Code : titre "Connexion" (OK), sous-titre "Bon retour parmi nous !" (different). |
| 2.3 | Position du "Mot de passe oublie ?" | mineur | Figma : le lien est aligne a droite (x=123 sur un conteneur de 264px). Code : le lien est centre (`alignItems: 'center'`). Devrait etre `alignItems: 'flex-end'`. |
| 2.4 | Texte du lien d'inscription | mineur | Figma : "Tu n'as pas encore de compte ? Inscris-toi !". Code : "Tu n'as pas encore de compte ?\nInscris-toi !". Le retour a la ligne est present dans le code mais pas dans Figma. |
| 2.5 | "Continuer avec google" (casse) | mineur | Figma : "Continuer avec google" (g minuscule). Code : "Continuer avec Google" (G majuscule). Ecart mineur de typographie. |
| 2.6 | Bouton Apple absent dans Figma | mineur | Le code affiche un bouton "Continuer avec Apple" sur iOS, mais Figma ne montre qu'un seul bouton social (Google). Ce n'est pas forcement un gap negatif (ajout utile), mais pas dans le design. |
| 2.7 | Etat disabled du bouton | mineur | Figma montre l'etat Empty avec un bouton "Me connecter" qui semble grise/disabled. Le code gere correctement cet etat avec `disabled={!isFormValid}` et un style `disabledContainer: { backgroundColor: colors.gray[600] }`. OK. |
| 2.8 | Etats d'erreur | mineur | Figma montre les erreurs sous les inputs (rouge, "Ton mail est invalide", "Ton mot de passe est invalide"). Le code gere les erreurs inline avec `errors.email` et `errors.password`. Les messages sont legerement differents : Figma "Ton mail est invalide" vs code "Cette adresse email ne semble pas valide." et Figma "Ton mot de passe est invalide" vs code "Ton mot de passe est invalide" (OK). |

### Ecran : Compte supprime (dialog) (`app/(auth)/login.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 3.1 | Dialog "Compte supprime" manquant | **critique** | Figma (nodeId `686:20116`) montre un overlay modal "Compte supprime - Ce compte n'existe plus. Tu peux en creer un nouveau." avec un bouton "Ok". Le code gere l'erreur `user_not_found` mais affiche le message inline dans `errors.submit` au lieu d'un dialog/modal overlay comme dans Figma. |

### Ecran : Mot de passe oublie (`app/(auth)/forgot-password.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 4.1 | Ecran absent du Figma | mineur | L'ecran `forgot-password.tsx` n'a pas de design Figma correspondant dans la section "Parcours de connexion". Il est cependant bien implemente fonctionnellement avec un bouton retour, champ email, et etat "email envoye". Le design est coherent avec le reste de l'app. |

---

## CS2 - Parcours d'inscription

**Figma section** : "Parcours d'inscriptions" (nodeId: `467:39881`)
**Ecrans Figma** : Page chargement, Connexion/Empty (duplicata), Inscription/Empty, Inscription/Filled, Inscription/Error, Demande des infos, Info (filled+error), Confirmation Numero, Confirmation Numero/Error, Numero (filled), Autorisation Localisation 1, Autorisation Localisation 2, Autorisation Notification, Onboarding (welcome, 5 etapes, final), Ajout personne de confiance, Map Accueil

### Ecran : Inscription (`app/(auth)/register.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 5.1 | Logo icone Prudency absent en haut | **majeur** | Meme probleme que connexion : Figma montre le logo icone + texte "PRUDENCY" en haut (y=110). Code : uniquement texte "PRUDENCY" en bas. |
| 5.2 | "Mot de passe oublie ?" present sur inscription | **majeur** | L'ecran d'inscription dans Figma montre bien un lien "Mot de passe oublie ?" (identique a la connexion). Le code l'inclut aussi, mais le lien n'a pas de `onPress` handler - c'est un `Pressable` sans navigation (`register.tsx:145-147`). Sur login.tsx, le handler navigue vers `forgot-password`. |
| 5.3 | Bouton label | OK | Figma : "M'inscrire". Code : "M'inscrire". OK. |
| 5.4 | Lien vers connexion | OK | Figma : "Tu as deja un compte ? Connecte-toi !". Code : "Tu as deja un compte ?\nConnecte-toi !". Meme ecart de retour a la ligne que pour connexion. |
| 5.5 | Facebook login manquant | **majeur** | Trello specifie "L'utilisatrice peut s'inscrire via reseau social (Google, Apple, **Facebook**)". Le code n'implemente que Google et Apple. Facebook est totalement absent de `useSocialAuth.ts`. |

### Ecran : Tes informations / Personal Info (`app/(auth)/personal-info.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 6.1 | Logo icone en haut | **majeur** | Meme probleme : Figma montre logo icone + texte "PRUDENCY" en haut. Code : uniquement texte en bas. |
| 6.2 | Champs corrects | OK | Figma montre 3 inputs (Prenom, Nom, Telephone) + checkbox CGU + bouton "M'inscrire". Le code a exactement ces elements. |
| 6.3 | Checkbox design | mineur | Figma utilise un composant `Checkbox` (24x24). Le code utilise un custom View (20x20 avec ms scaling). Leger ecart de taille. |
| 6.4 | Position du formulaire | mineur | Figma : le formulaire commence a y=320. Code : `paddingTop: scaledSpacing(100)` ce qui correspond a ~100px depuis le haut. Le header (titre + sous-titre) prend de la place supplementaire, mais le formulaire semble visuellement plus haut dans le code que dans Figma (Figma a le logo en haut qui pousse le contenu vers le bas). |
| 6.5 | Nom marque comme optionnel | OK | Trello indique "nom **optionnel**". Le code a `label="Nom"` (sans asterisque) vs `label="Prenom *"` et `label="Telephone *"`. Conforme. |

### Ecran : Verification numero (`app/(auth)/verify-phone.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 7.1 | Position du contenu | mineur | Figma : contenu commence a y=177. Code : `paddingTop: scaledSpacing(100)` + header. La position relative est coherente. |
| 7.2 | OTP inputs - espacement | mineur | Figma : inputs de 32x48 avec gap=8 entre eux. Certains ont un gap de 40px (apres chaque paire). Code : gap uniforme de `scaledSpacing(8)`. Figma semble avoir un groupement par paires (0, 40, 80, 120, 160, 200) suggerant des gaps variables. Le code a un gap uniforme. |
| 7.3 | Texte "Recevoir un nouveau code" | OK | Present dans Figma et dans le code. Position alignee. |
| 7.4 | Bouton "Commencer" en bas | OK | Figma : Button a y=733. Code : bouton en bas avec spacer. Coherent. |
| 7.5 | Etat d'erreur | OK | Figma montre "Le code saisi est incorrect." en rouge. Code : gere l'erreur avec message "Le code saisi est incorrect. Verifie-le et reessaie." (texte legerement plus long). |
| 7.6 | OTP - securite DEV_BYPASS | **critique** | Le code contient `const DEV_BYPASS_OTP = __DEV__ ? '123456' : null;` avec un TODO pour implementer la verification server-side. En production `__DEV__` serait false donc le bypass serait null, mais il n'y a AUCUNE implementation reelle de verification OTP. L'ecran est non-fonctionnel en production. |
| 7.7 | Logo PRUDENCY manquant dans Figma | mineur | Figma ne montre pas le logo "PRUDENCY" en bas de cet ecran, mais le code l'affiche. Ajout non-aligné avec le design. |

### Ecran : Autorisation Localisation 1 (`app/(auth)/permissions-location.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 8.1 | Titre incorrect | **majeur** | Figma : "Verifie ton numeros" (sic, erreur dans Figma aussi). Code : "Verifie ton numero". Ce titre est IDENTIQUE a l'ecran de verification de numero, ce qui est une erreur. Le titre devrait etre lie a la localisation ("Activer la localisation" ou similaire). L'erreur est dans Figma ET recopiee dans le code. |
| 8.2 | Icone - animation manquante | **majeur** | Figma montre un design specifique avec des cercles concentriques roses/violets et une icone bouclier (shield-check). Le code utilise un simple `Ionicons navigate-outline` dans un cercle semi-transparent. L'identite visuelle de cet ecran est tres differente. |
| 8.3 | Dialog systeme iOS | OK | Figma montre le dialog systeme iOS "Autoriser Prudency a acceder a votre position" avec 3 options. Le code utilise `Location.requestForegroundPermissionsAsync()` qui declenche bien ce dialog natif. |
| 8.4 | Boutons | mineur | Figma : 2 boutons "Activer ma localisation" (primary) et "Plus tard" (ghost, 40px height). Code : 2 boutons identiques. Le code utilise taille md (48px) pour les deux. Figma montre le bouton "Plus tard" plus petit (40px) = taille sm. |
| 8.5 | Position des boutons | mineur | Figma : boutons a y=700. Code : boutons dans un `buttonContainer` sans position fixe. Devrait etre ancre en bas. |

### Ecran : Autorisation Localisation 2 - Denied (`app/(auth)/permissions-location.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 9.1 | Icone differente | **majeur** | Figma : meme design avec cercles concentriques + shield-check. Code : `location-outline` icon. |
| 9.2 | Bouton largeur | mineur | Figma : bouton principal a 326px de large (deborde des 264px standard). Code : utilise `fullWidth` dans le buttonContainer de 100%. Pas forcement un probleme si les paddings sont corrects. |
| 9.3 | Texte coherent | OK | Figma et code ont le meme texte explicatif. |

### Ecran : Autorisation Notification (`app/(auth)/permissions-notifications.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 10.1 | Icone manquante | **majeur** | Figma montre un design avec cercles concentriques roses/violets + icone cloche (bell). Code : `notifications-outline` Ionicon dans un cercle simple. Meme probleme que localisation. |
| 10.2 | Boutons taille | mineur | Figma : bouton "Plus tard" a 40px height (ghost). Code : utilise le meme variant mais pas explicitement size="sm". |

### Ecran : Onboarding (`app/(auth)/onboarding.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 11.1 | Progress Indicator manquant | **majeur** | Figma montre un composant `Progress Indicator` (barre de progression) en haut de chaque slide (y=44, width=393, height=38). Le code utilise des pagination dots (cercles en bas de l'ecran). Ce sont deux patterns d'UI tres differents. |
| 11.2 | Picto Prudency en haut | **majeur** | Figma montre un petit picto Prudency (24x24) qui se deplace le long de la progress bar selon l'etape. Le code n'a pas ce composant. |
| 11.3 | Welcome slide - titre avec emoji | mineur | Figma : "Bienvenue sur Prudency, Lea (coeur bleu emoji)". Code : "Bienvenue sur Prudency, {name}" sans emoji. |
| 11.4 | Boutons welcome | OK | Figma : "Commencer la demo" + "Passer la demo". Code : "Commencer la demo" + "Passer la demo". Correct. |
| 11.5 | Slide finale - un seul bouton | OK | Figma montre un seul bouton "Commencer" sur la derniere slide. Code : bouton "Commencer" quand `isFinal`. Correct. |
| 11.6 | Nombre de slides | OK | Figma montre 6 etapes (welcome + 4 contenu + final "C'est parti !"). Code : 6 STEPS. Coherent. |
| 11.7 | Position contenu | mineur | Figma : texte a y=177. Code : contenu centre verticalement avec `justifyContent: 'center'`. La position exacte peut varier. |

### Ecran : Ajout personne de confiance (`app/(auth)/add-contact.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 12.1 | Design tres different | **critique** | Le Figma (nodeId `481:14369`) montre un design completement different : fond avec capture d'ecran de carte (map), un gros bouton circulaire (212x212) pour importer un contact, des textes explicatifs sur le role du contact, et des boutons en bas. Le code montre un formulaire classique avec icone, import contacts, divider, champs nom/telephone manuels. La structure et le concept sont differents. |
| 12.2 | Textes explicatifs manquants | **majeur** | Figma montre deux paragraphes : "Elle recevra une alerte uniquement si ton trajet n'est pas finalise a temps ou si tu declenches une alerte." et "Cette personne devra accepter ta demande avant de pouvoir etre alertee." Le code a un seul texte : "Cette personne sera prevenue si quelque chose ne va pas pendant ton trajet." |
| 12.3 | Fond visuel | **majeur** | Figma montre un fond de carte avec overlay sombre (comme l'ecran principal). Le code utilise un fond uni avec ellipse violette. |
| 12.4 | Bouton d'import | **majeur** | Figma montre un gros bouton circulaire (Button 5, 212x212) pour l'import. Le code a un bouton outline classique "Importer depuis mes contacts". |

### Ecran : Accept Contact (`app/accept-contact.tsx`)

| # | Gap | Severite | Detail |
|---|-----|----------|--------|
| 13.1 | Pas de design Figma | mineur | Cet ecran existe dans le code mais n'a pas de design Figma correspondant. Il gere l'acceptation d'invitation par lien. Le design est coherent avec le reste de l'app. |

---

## Trello Card Assessment

### Card #35 : "Authentification utilisateur" (id: `698cdc675aa4a5dd34c12a02`)

**Liste actuelle** : Termine
**Liste recommandee** : **En cours** (`698cdc675aa4a5dd34c12999`)

| Critere | Statut | Detail |
|---------|--------|--------|
| Connexion email/mot de passe | OK | Implemente dans `login.tsx` avec `useAuth().signIn()` |
| Connexion via Google | OK | Implemente via `useSocialAuth().signInWithGoogle()` |
| Connexion via Apple | OK | Implemente via `useSocialAuth().signInWithApple()` (iOS only) |
| Connexion via Facebook | **NON** | Totalement absent du code. `useSocialAuth.ts` n'inclut que Google et Apple. Aucun hook `useFacebookAuth` n'existe. |
| Session reste active (sauf deconnexion manuelle) | OK | Gere par `useAuthStore` + Supabase session persistence |
| Message d'erreur clair si identifiants incorrects | OK | Messages d'erreur geres dans le catch block de `handleLogin()` |

**Raison du changement** : Facebook login est manquant. C'est un critere explicitement mentionne dans la description de la carte. La carte devrait repasser en "En cours" jusqu'a l'implementation de Facebook auth.

### Card #24 : "M'inscrire sur l'application" (id: `698cdc675aa4a5dd34c129ec`)

**Liste actuelle** : A tester
**Liste recommandee** : **En cours** (`698cdc675aa4a5dd34c12999`)

| Critere | Statut | Detail |
|---------|--------|--------|
| Inscription email/mot de passe | OK | Implemente dans `register.tsx` avec `useAuth().signUp()` |
| Inscription via Google | OK | Implemente via `useSocialAuth().signInWithGoogle()` |
| Inscription via Apple | OK | Implemente via `useSocialAuth().signInWithApple()` (iOS only) |
| Inscription via Facebook | **NON** | Totalement absent (meme probleme que connexion) |
| Email de confirmation envoye | PARTIEL | Supabase envoie automatiquement un email de confirmation, mais aucun ecran de "verification email" n'est present dans le code. L'utilisatrice est redirigee directement vers `personal-info`. |
| Donnees de base collectees (nom optionnel, prenom, numero) | OK | `personal-info.tsx` collecte prenom (requis), nom (optionnel), telephone (requis). Conforme. |
| CGU et politique de confidentialite acceptees | PARTIEL | Checkbox present dans `personal-info.tsx` avec texte "J'accepte les Conditions generales et la Politique de confidentialite." Cependant, les liens ne sont pas navigables - ce sont des `<Text style={styles.termsLink}>` sans handler `onPress`. |

**Raison du changement** : Facebook login manquant + liens CGU non navigables + pas d'ecran de confirmation email. La carte devrait repasser en "En cours".

---

## Resume des gaps

### Gaps critiques (bloquants)

| # | Ecran | Gap |
|---|-------|-----|
| 3.1 | Login | Dialog "Compte supprime" absent - affiche inline au lieu d'un modal overlay |
| 7.6 | Verify Phone | OTP non fonctionnel en production - aucune verification server-side implementee |
| 12.1 | Add Contact | Design completement different du Figma (formulaire classique vs design avec map/gros bouton) |

### Gaps majeurs (importants)

| # | Ecran | Gap |
|---|-------|-----|
| 1.1 | Loading | Logo icone SVG non affiche (uniquement texte) |
| 2.1 | Login | Logo icone + texte absents en haut d'ecran |
| 2.2 | Login | Sous-titre different ("Bon retour parmi nous !" vs "Accede a ton espace") |
| 5.1 | Register | Logo icone + texte absents en haut d'ecran |
| 5.2 | Register | "Mot de passe oublie ?" n'a pas de handler onPress |
| 5.5 | Register | Facebook login manquant (requis par Trello) |
| 6.1 | Personal Info | Logo icone + texte absents en haut d'ecran |
| 8.1 | Permissions Location | Titre incorrect ("Verifie ton numero" au lieu d'un titre lie a la localisation) |
| 8.2 | Permissions Location | Icone/animation tres differente du Figma (cercles concentriques vs icone simple) |
| 9.1 | Permissions Location 2 | Meme probleme d'icone |
| 10.1 | Permissions Notification | Meme probleme d'icone |
| 11.1 | Onboarding | Progress Indicator (barre) remplace par des dots de pagination |
| 11.2 | Onboarding | Picto Prudency mobile sur la progress bar absent |
| 12.2 | Add Contact | Textes explicatifs detailles manquants |
| 12.3 | Add Contact | Fond visuel (carte) manquant |
| 12.4 | Add Contact | Bouton d'import (gros cercle) remplace par bouton outline |

### Gaps mineurs (cosmetiques)

| # | Ecran | Gap |
|---|-------|-----|
| 2.3 | Login | "Mot de passe oublie ?" centre au lieu d'aligne a droite |
| 2.4 | Login | Retour a la ligne dans le texte d'inscription |
| 2.5 | Login | "Google" avec G majuscule vs g minuscule dans Figma |
| 2.6 | Login | Bouton Apple present dans le code mais pas dans Figma |
| 5.4 | Register | Retour a la ligne dans le texte de connexion |
| 6.3 | Personal Info | Taille checkbox (20px vs 24px Figma) |
| 7.2 | Verify Phone | Gap uniforme entre OTP inputs vs gaps variables dans Figma |
| 7.7 | Verify Phone | Logo PRUDENCY en bas non present dans Figma |
| 8.4 | Permissions | Bouton "Plus tard" devrait etre size="sm" (40px) au lieu de md (48px) |
| 10.2 | Permissions Notification | Meme probleme de taille bouton ghost |
| 11.3 | Onboarding | Emoji coeur bleu manquant dans le titre de bienvenue |

### Pattern recurrent : Logo en haut d'ecran

Tous les ecrans de connexion et d'inscription dans Figma montrent un header avec :
- Logo icone Prudency (bouclier/P) de ~40x57px
- Texte "PRUDENCY" en dessous (~203x42px)
- Position : centre horizontal, y~110

Le code place systematiquement le texte "PRUDENCY" en bas d'ecran sans l'icone.
**Impact** : L'identite visuelle de la marque est significativement differente.
**Recommandation** : Creer un composant `<PrudencyLogo />` reutilisable qui inclut l'icone SVG et le texte, et le placer en haut de chaque ecran auth.

### Pattern recurrent : Icones animations permissions

Les ecrans de permissions (localisation, notifications) dans Figma utilisent un design specifique avec :
- Cercles concentriques roses/violets (animation)
- Icone specifique au centre (shield-check, bell)

Le code utilise des icones Ionicons simples dans un cercle transparent.
**Recommandation** : Creer un composant `<PermissionAnimation />` avec les cercles concentriques SVG.

---

## Trello Card Movements (recommandes)

| Card ID | Card Name | Liste actuelle | Liste cible | Raison |
|---------|-----------|---------------|-------------|--------|
| `698cdc675aa4a5dd34c12a02` | #35 Authentification utilisateur | Termine | **En cours** (`698cdc675aa4a5dd34c12999`) | Facebook login manquant |
| `698cdc675aa4a5dd34c129ec` | #24 M'inscrire sur l'application | A tester | **En cours** (`698cdc675aa4a5dd34c12999`) | Facebook login manquant + liens CGU non navigables + OTP non fonctionnel |
