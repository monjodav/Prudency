# Audit Report: Component Sets 15-20 (Profile, Security, Preferences, Subscription, About, Logout)

**Date**: 2026-02-20
**Auditor**: Claude (automated)
**Scope**: Profile hub screen + 5 sub-screens in `app/(profile)/`, plus logout flow

---

## CS15 - Profil (Modifier mon profil)

### Figma Design (nodeId: 467:50442)
The Figma section shows a multi-step flow:
1. **Profile hub** (dark theme) with avatar photo, user name, badge "Prudency Plus", menu items: "Infos personnelles", "A propos de Prudency", "Preferences", "Securite et confidentialite", bottom tab bar with 3 segments (profile/map/favorites)
2. **Edit profile** screen with avatar photo + "Modifier la photo" button, fields: Nom, Prenom, Email, Telephone (with format selector +33), "Modifier" button
3. **Phone edit** with keyboard
4. **Validation** step: "Verifie ton numero" with 6-digit OTP code input
5. **Email verification**: "Verifie ton mail" with 6-digit OTP code input
6. Error states for OTP (red highlighting on incorrect code)

### Code Implementation

**Profile hub screen**: `app/(tabs)/profile.tsx` (324 lines)
- Dark-themed screen with `colors.primary[950]` background
- Avatar with initials, display name, email
- Menu sections: "Mon compte" (Infos personnelles, Preferences, Securite et confidentialite, Abonnement), "Assistance" (Centre d'aide, Nous contacter, A propos)
- Logout button + Delete account link
- Uses `LogoutDialog` component

**Personal info screen**: `app/(profile)/personal-info.tsx` (197 lines)
- Light-themed (white background) -- **does NOT match Figma dark theme**
- Avatar with single initial letter (not photo)
- Fields: Prenom, Nom, Email, Telephone
- Edit/Save toggle flow
- Phone field is always disabled with "Modifier le numero" button shown only in edit mode

### Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Profile hub: Missing badge** | Medium | Figma shows "Prudency Plus" / "Standard" badge under user name. Code shows email instead. No subscription badge component. |
| 2 | **Profile hub: Section labels mismatch** | Low | Figma: "Tes informations", "Adapter Prudency a ton usage", "Securise Prudency a ton niveau". Code: "Mon compte", "Assistance". |
| 3 | **Profile hub: Missing "A propos de Prudency" in main section** | Low | Figma places "A propos de Prudency" in top section next to "Infos personnelles". Code places it under "Assistance" section. |
| 4 | **Profile hub: Bottom tab bar segment** | Low | Figma shows 3-segment tab bar at bottom (person/circle/star). Code relies on expo-router tab bar -- needs verification of matching. |
| 5 | **Personal info: Wrong theme** | High | Figma shows dark-themed edit screen (dark background, light text). Code uses white background with dark text. |
| 6 | **Personal info: No photo upload** | Medium | Figma shows a real avatar photo with camera icon overlay. Code shows initial letter in colored circle with text "Changer la photo". No actual photo upload logic. |
| 7 | **Personal info: Missing phone number verification flow** | High | Figma shows a complete "Verifie ton numero" screen with 6-digit OTP input. Code only has a placeholder "Modifier le numero" pressable with no navigation/logic. |
| 8 | **Personal info: Missing email verification flow** | High | Figma shows "Verifie ton mail" screen with 6-digit OTP input. Code has no email verification after change -- just a placeholder save with setTimeout. |
| 9 | **Personal info: Missing phone country code selector** | Medium | Figma shows a dropdown/selector for country code (+33). Code has simple text input. |
| 10 | **Personal info: Save is placeholder** | High | `handleSave` uses `setTimeout` mock. No actual Supabase user metadata update call. |

### Trello Card #39: "Mettre a jour mon profil"
**List**: Fonctionnalites (not started)
**Criteria status**:
- Modify nom, prenom, email, numero: **Partial** (UI exists but save is placeholder)
- Email modification requires validation: **NOT IMPLEMENTED** (no OTP flow)
- Modifications saved in real time: **NOT IMPLEMENTED** (placeholder)
- History of modifications conserved: **NOT IMPLEMENTED**

**Recommendation**: Keep in "Fonctionnalites". Significant work remains.

---

## CS16 - Securite & Confidentialite

### Figma Design (nodeId: 467:50729)
The Figma section shows:
1. **Security hub** (dark theme) with profile header, sections: "Autorisations systeme" (Localisation toggle with "Toujours actif", Notifications toggle, Camera), "Donnees de compte" (Changer le mot de passe), "Licences" (Supprimer les cookies, Gestion des donnees), "Informations legales" (Mentions legales, CGU, Politique de confidentialite, CGV)
2. **Mentions legales** screen (full-page legal text)
3. **CGU** screen
4. **Politique de confidentialite** screen
5. **CGV** screen
6. **Modifier mes cookies** screen with checkboxes
7. **Changer le mot de passe** flow: current password field, new password, confirm, with validation

### Code Implementation

**Security screen**: `app/(profile)/security.tsx` (256 lines)
- Light-themed (`colors.gray[50]` background) -- **does NOT match Figma dark theme**
- Sections: "Authentification" (Biometrie toggle, Changer le mot de passe), "Confidentialite" (Partage de position toggle, Conservation des donnees), "Mes donnees" (Exporter mes donnees), "Zone de danger" (Supprimer mon compte)
- Uses `useBiometric` hook (properly implemented with expo-local-authentication)
- Change password triggers an Alert dialog (not a dedicated screen)
- Delete account uses Alert dialog

### Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Wrong theme** | High | Figma: dark background. Code: light gray `colors.gray[50]` background. |
| 2 | **Missing system permissions section** | High | Figma shows toggles for Localisation, Notifications, Camera with status. Code has no system permission management UI. |
| 3 | **Missing "Mentions legales" screen** | Medium | Figma shows a dedicated screen with full legal text. Code has no route/screen for this. |
| 4 | **Missing "CGU" screen** | Medium | Figma shows a dedicated CGU screen. Not implemented. |
| 5 | **Missing "Politique de confidentialite" screen** | Medium | Figma shows a dedicated privacy policy screen. Not implemented. |
| 6 | **Missing "CGV" screen** | Medium | Figma shows a dedicated CGV screen. Not implemented. |
| 7 | **Missing cookies/data management** | Medium | Figma shows "Modifier mes cookies" with checkboxes. Not implemented. |
| 8 | **Change password: No dedicated screen** | Medium | Figma shows a full change-password flow (current + new + confirm). Code uses a basic Alert dialog with email reset only. |
| 9 | **Missing informations legales section** | Medium | Figma has a section linking to all legal documents. Code has none. |
| 10 | **Biometrie: Extra feature** | Info | Code has biometric toggle not shown in Figma. This is a valid addition but not in design. |
| 11 | **Missing "Exporter mes donnees" in Figma** | Info | Code includes RGPD data export. Figma does not show this -- valid addition. |

### Trello Card #26: "Configurer les permissions de l'application"
**List**: A tester
**Criteria status**:
- Autorisations clairement expliquees: **NOT IMPLEMENTED** (no permission UI)
- Comprend pourquoi chaque autorisation est requise: **NOT IMPLEMENTED**
- Activer/desactiver les autorisations: **NOT IMPLEMENTED** (code has biometric toggle but not system permissions)
- Alertes si autorisations critiques desactivees: **NOT IMPLEMENTED**
- Texte expliquant permissions changeability: **NOT IMPLEMENTED**

**Recommendation**: Move BACK to "En cours" or "Fonctionnalites". Card is in "A tester" but the core feature (system permission management UI) is not built.

---

## CS17 - Preferences

### Figma Design (nodeId: 467:50897)
The Figma section shows:
1. **Profile hub** with "Preferences" menu item
2. **Preferences screen** (dark theme) with sections:
   - "Alertes automatiques": Temps avant envoi d'alerte (slider: 15 min), Retard acceptable (slider: 15 min), Distance avant envoi d'alerte (slider: 2 km, with "Fonctionnalite a venir" yellow banner), Temps d'arret (slider: 10 min)
   - "Confirmations intelligentes": Securite Question a double sens (toggles: Annuler le trajet ON, Terminer le trajet ON), Question actuelle (editable: "Quel est le prenom de ton pere?"), Reponse actuelle validee (editable: "Roger")
   - "Mot de passe": Toggles for Annuler le trajet, Terminer le trajet
   - "Enregistrer" button at bottom

### Code Implementation

**Preferences screen**: `app/(profile)/preferences.tsx` (209 lines)
- Light-themed (`colors.gray[50]` background) -- **does NOT match Figma dark theme**
- Sections: "Notifications" (push, alertes sonores, retour haptique), "Localisation" (demarrage automatique), "Apparence" (mode sombre, langue, unites)
- Generic settings with Switch toggles
- No alert-specific configuration

### Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Wrong theme** | High | Figma: dark theme. Code: light gray. |
| 2 | **Completely different content** | Critical | Figma shows alert-configuration preferences (timing, distance, security questions). Code shows generic app settings (notifications, dark mode, language). These are fundamentally different screens. |
| 3 | **Missing alert timing configuration** | Critical | Figma: "Temps avant envoi d'alerte" (15 min slider), "Retard acceptable" (15 min slider), "Temps d'arret" (10 min slider). None implemented. |
| 4 | **Missing distance alert configuration** | High | Figma: "Distance avant envoi d'alerte" (2 km slider with "Fonctionnalite a venir" banner). Not implemented. |
| 5 | **Missing smart confirmations** | Critical | Figma: Security question setup for trip cancellation/completion (double question system with editable Q&A). Not implemented at all. |
| 6 | **Missing password protection toggles** | High | Figma: Password protection toggles for "Annuler le trajet" and "Terminer le trajet". Not implemented. |
| 7 | **Missing "Enregistrer" button** | Medium | Figma has a save button. Code has no save mechanism (toggle-based). |
| 8 | **Missing slider components** | High | Figma uses custom sliders for time/distance values. Code has no slider UI. |
| 9 | **Extra features not in Figma** | Info | Code has notifications, dark mode, language, units settings not shown in Figma design. May belong in a separate "Settings" screen. |

### Trello Card
No specific Trello card found for preferences configuration. The alert-related preferences likely fall under the trip/alert feature cards.

**Recommendation**: This screen needs a complete rewrite to match Figma. The current code appears to be generic placeholder settings.

---

## CS18 - Abonnement

### Figma Design (nodeId: 467:40231)
The Figma section shows:
1. **Map screen** with star tab at bottom navigating to subscription
2. **Subscription screen** (dark theme): Title "Mon abonnement", subtitle "Tu utilises actuellement Prudency en version Standart.", radio selection between "Standard" (Versions gratuite, selected) and "Prudency Plus" (Fonctionnalites a venir, disabled)
3. **Features list** under "Standard" with "Gratuit" badge: Garder mon trajet secret (checkmark), Ajout de notes (checkmark), Detection d'anomalie durant le trajet (checkmark), Envoie alerte a ta/tes personne(s) de confiance (checkmark)
4. **Legal disclaimer**: "Abonnement mensuel sans engagement, resiliable a tout moment. En continuant, tu acceptes les CGU, CGV et la Politique de confidentialite."
5. **CTA button**: "Activer le Prudency Plus" (but disabled with snackbar: "Fonctionnalite a venir. Les abonnements seront disponibles prochainement.")
6. **Snackbar behavior annotation**: Duration 2-3 seconds, non-blocking, no secondary action, CTA visible but functionally disabled

### Code Implementation

**Subscription screen**: `app/(profile)/subscription.tsx` (277 lines)
- Light-themed (white background) -- **does NOT match Figma dark theme**
- Header: "Choisissez votre plan" with subtitle
- Two plan cards: Free (0 EUR) and Premium (4,99 EUR/mois with "Recommande" badge)
- Feature lists with check/cross icons per plan
- Snackbar/Toast implemented for "Fonctionnalite a venir" message
- "Passer a Premium" button when premium selected

### Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Wrong theme** | High | Figma: dark theme. Code: white background. |
| 2 | **Layout mismatch** | High | Figma: radio buttons for plan selection (Standard selected, Prudency Plus grayed). Code: two separate cards with border highlight selection. |
| 3 | **Title mismatch** | Medium | Figma: "Mon abonnement". Code: "Choisissez votre plan". |
| 4 | **Subtitle mismatch** | Medium | Figma: "Tu utilises actuellement Prudency en version Standart." Code: "Debloquez toutes les fonctionnalites pour une protection optimale". |
| 5 | **Feature list content mismatch** | Medium | Figma: "Garder mon trajet secret", "Ajout de notes", "Detection d'anomalie", "Envoie alerte". Code: "3 contacts de confiance", "Trajets illimites", "Alertes manuelles", etc. Different feature sets. |
| 6 | **Missing legal disclaimer with links** | Medium | Figma: "tu acceptes les CGU, CGV et la Politique de confidentialite" (with blue links). Code: "Les paiements sont securises" (generic). |
| 7 | **Plan names mismatch** | Low | Figma: "Standard" and "Prudency Plus". Code: "Gratuit" and "Premium". |
| 8 | **Pricing display** | Medium | Figma shows no price for Plus (it's "a venir"). Code shows 4,99 EUR/mois. |
| 9 | **Snackbar**: implemented correctly | Info | Both show "Fonctionnalite a venir" toast/snackbar. Duration in code (2500-3500ms) matches Figma annotation (2-3 sec). |
| 10 | **Missing "Gratuit" badge on Standard** | Low | Figma shows a green "Gratuit" badge. Code uses a "Plan actuel" info badge. |

### Trello Cards

**#27 "Decouvrir l'offre premium"** (Fonctionnalites)
- Page dediee presentant fonctionnalites premium: **Partial** (page exists but content doesn't match Figma)
- Differences gratuit/premium claires: **Partial** (code has two plans but features don't match)
- Prix affiche: **YES** in code (4,99 EUR) but Figma says "a venir"
- Essai gratuit 1 semaine: **NOT IMPLEMENTED**
- Souscrire directement depuis l'app: **NOT IMPLEMENTED** (snackbar blocks)

**#28 "Passer a la version payante"** (Fonctionnalites)
- Choisir formule mensuelle/annuelle: **NOT IMPLEMENTED** (hardcoded monthly)
- Paiement via stores: **NOT IMPLEMENTED**
- Abonnement actif immediatement: **NOT IMPLEMENTED**
- Confirmation email: **NOT IMPLEMENTED**
- Fonctionnalites premium debloquees: **NOT IMPLEMENTED**

**Recommendation**: Both cards remain in "Fonctionnalites". The subscription screen exists but needs redesign to match Figma, and payment integration is not started.

---

## CS19 - A propos / Demo

### Figma Design (nodeId: 467:50606)
The Figma section shows:
1. **Profile hub** with "A propos de Prudency" menu item
2. **About screen** (dark theme): Prudency logo (shield "P" icon), "Prudency" title, "Ta protection au quotidien", "Version 1.0.0"
3. **Mission section**: "Notre mission" with description about safety
4. **Steps section**: "1. Cree un trajet", "2. Choisis ton cercle", description of how it works
5. **"Voir la demo" button** (purple, with play icon)
6. **Demo/Onboarding walkthrough** (5 steps): "Un cercle de confiance", "Garde tes trajets prives", "Des trajets plus sereins", "Une securite discrete", "C'est parti!" -- each with progress indicator, illustration, "Suivant"/"Passer la demo" buttons, final "Commencer" button

### Code Implementation

**About screen**: `app/(profile)/about.tsx` (220 lines)
- Light-themed (white background) -- **does NOT match Figma dark theme**
- Custom shield logo (purple/white geometric)
- "Prudency" title, "Securite des trajets" tagline, version display
- "A propos" text description
- "Liens utiles" section: Site web, Conditions d'utilisation, Politique de confidentialite, Centre d'aide (all external links)
- "Nous contacter" section: email, Instagram, Twitter
- Footer with copyright and "Fait avec coeur en France"

### Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Wrong theme** | High | Figma: dark theme. Code: white background. |
| 2 | **Missing "Notre mission" section** | Medium | Figma shows a dedicated mission statement. Code has a generic "A propos" paragraph. |
| 3 | **Missing step-by-step instructions** | Medium | Figma shows numbered steps explaining how Prudency works. Not in code. |
| 4 | **Missing "Voir la demo" button** | High | Figma has a prominent purple button to launch demo walkthrough. Not implemented. |
| 5 | **Missing demo/walkthrough flow** | Critical | Figma shows a complete 5-step onboarding demo with progress dots, illustrations, next/skip/start buttons. Entirely missing from code. |
| 6 | **Tagline mismatch** | Low | Figma: "Ta protection au quotidien". Code: "Securite des trajets". |
| 7 | **External links: valid additions** | Info | Code has useful links (CGU, privacy, help center, social media). These are not shown in Figma about screen but could be kept. |
| 8 | **Logo mismatch** | Low | Figma shows a "P" shield icon. Code renders a geometric shield shape (no "P" letter). |

### Trello Card
No specific Trello card found for the "A propos" or demo feature.

**Recommendation**: The about screen needs significant updates. The demo walkthrough is the biggest missing piece -- it may reuse or adapt the auth onboarding flow (`app/(auth)/onboarding.tsx`).

---

## CS20 - Deconnexion

### Figma Design (nodeId: 467:50866)
The Figma section shows:
1. **Profile hub** (dark theme): "Deconnexion" button (red/pink) at bottom, under "Cloture du compte" section
2. **Deconnexion modal** (centered): User avatar, "Deconnexion Prudency" title, warning text "Tu es sur le point de te deconnecter de ton compte sur cet appareil !", bold "Cette action supprimera les donnees stockees localement, notamment: la session active, l'historique recent affiche dans l'app, les parametres temporaires de l'application, ton role de personne de confiance", "(suppression definitive apres 30 jours)", "Je me deconnecte" button (red/green), "Annuler" button
3. **Password confirmation screen**: "Deconnexion Prudency", "Valide avec ton mot de passe pour te deconnecter", "Mot de passe *" input field with visibility toggle, "Mot de passe oublie?" link
4. **Behavior annotation**: Deconnexion erases: session active, historique recent, parametres temporaires, role de personne de confiance. Also: password confirmation required.

### Code Implementation

**Profile screen logout**: `app/(tabs)/profile.tsx`
- "Se deconnecter" button with red styling
- Triggers `LogoutDialog` component

**LogoutDialog**: `src/components/profile/LogoutDialog.tsx` (212 lines)
- Modal with "Deconnexion" title
- Consequences list (4 items): account deactivation, loss of access, contacts notified, 30-day data retention
- Password input with `secureEntry` and toggle
- "Confirmer la deconnexion" (danger button) and "Annuler" (ghost button)
- Verifies password via `authService.verifyPassword()` before proceeding
- Error handling for invalid password

### Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Modal vs 2-step flow** | Medium | Figma shows a 2-step flow: first a warning modal with avatar, then a separate password confirmation screen. Code combines both into a single modal dialog. |
| 2 | **Missing avatar in dialog** | Low | Figma shows user avatar photo at top of logout confirmation. Code dialog has no avatar, only a logout icon. |
| 3 | **Warning text differences** | Low | Figma: "Cette action supprimera les donnees stockees localement, notamment: la session active, l'historique recent, les parametres temporaires, ton role de personne de confiance". Code: similar but phrased differently as bullet points. |
| 4 | **Button label mismatch** | Low | Figma: "Je me deconnecte". Code: "Confirmer la deconnexion". |
| 5 | **Missing "Mot de passe oublie?" link** | Medium | Figma shows a "Mot de passe oublie?" link on the password confirmation screen. Not in code. |
| 6 | **Dialog theme** | Medium | Figma modal uses dark theme styling. Code dialog uses white/light background. |
| 7 | **Section label** | Low | Figma places logout under "Cloture du compte" section. Code has no section label -- logout button is standalone. |
| 8 | **Password verification: Implemented** | Info | Both require password confirmation before logout. Core logic matches. |

### Trello Card #36: "Fermer ma session"
**List**: Fonctionnalites
**Criteria status**:
- Bouton de deconnexion accessible depuis parametres: **YES**
- Deconnexion efface la session locale: **YES** (calls `signOut()`)
- Redirigee vers ecran de connexion: **YES** (auth gate handles redirect)
- Confirmation demandee avant deconnexion: **YES** (LogoutDialog)
- Prevenir des donnees locales supprimees avec exemples: **YES** (CONSEQUENCES list)

**Recommendation**: Move to "A tester". Core functionality is complete. Remaining work is visual polish (dark theme, 2-step flow, avatar).

---

## Summary of Cross-Cutting Issues

### 1. Theme Mismatch (ALL screens)
Every single profile sub-screen uses a light/white theme while Figma designs are consistently dark-themed (dark navy/purple backgrounds with light text). This is the single biggest systematic gap. The profile hub (`app/(tabs)/profile.tsx`) correctly uses dark theme, but all sub-screens revert to light.

### 2. Missing Accents/Diacritiques
All French text in code lacks accents: "Securite" instead of "Securite", "Preference" instead of "Preference", "Deconnexion" instead of "Deconnexion". This is a systematic i18n issue across all screens.

---

## Recommended Trello Card Movements

| Card | Current List | Recommended List | Reason |
|------|-------------|-----------------|--------|
| #39 "Mettre a jour mon profil" | Fonctionnalites | Fonctionnalites | Save is placeholder, verification flows missing |
| #26 "Configurer les permissions" | A tester | En cours | Permission management UI not built; card should not be in testing |
| #27 "Decouvrir l'offre premium" | Fonctionnalites | Fonctionnalites | Page exists but content mismatch with Figma; no payment |
| #28 "Passer a la version payante" | Fonctionnalites | Fonctionnalites | Payment integration not started |
| #36 "Fermer ma session" | Fonctionnalites | A tester | Core logout flow works with password confirmation |

---

## Priority Fixes

### Critical (blocks user flows)
1. **Preferences screen complete rewrite** -- Current code has generic settings instead of alert configuration (timing, distance, security questions)
2. **Profile save functionality** -- Replace setTimeout placeholder with actual Supabase update

### High (significant visual/functional gaps)
3. **Apply dark theme to all profile sub-screens** -- Systematic theme update needed
4. **Phone/email verification OTP flows** in personal-info
5. **System permissions management UI** in security screen
6. **Demo walkthrough** in about screen
7. **Alert timing/distance sliders** in preferences

### Medium (design alignment)
8. Add subscription badge to profile hub
9. Legal pages (CGU, CGV, mentions legales, politique de confidentialite)
10. Change password dedicated screen
11. Subscription screen layout (radio buttons, correct features, legal links)
12. "Mot de passe oublie?" link in logout dialog
13. Cookie management screen

### Low (polish)
14. Section label text alignment with Figma wording
15. Button label text matching
16. Avatar photo support
17. French diacritiques in all text strings
