# Audit Final Report — Prudency App vs Figma + Trello

**Date**: 2026-02-20
**Scope**: 20 component sets, 31 Figma sections, 18 Trello cards
**Method**: Parallel agent audit (6 agents, Figma screenshots + code review)

---

## Executive Summary

The Prudency app has a solid foundation with most screens implemented, but significant gaps exist between the current code and the Figma designs. The audit identified **~130 gaps** across all component sets.

### Key Metrics

| Severity | Count | Description |
|----------|-------|-------------|
| **Critique** | 12 | Architectural mismatches, missing core flows |
| **Majeur/High** | 45 | Significant visual or functional gaps |
| **Medium** | 48 | Design alignment, missing features |
| **Mineur/Low** | 25+ | Text, spacing, polish issues |

### Systemic Issues (affect multiple screens)

1. **Theme mismatch**: Nearly ALL screens use light/white theme while Figma consistently uses dark navy/purple backgrounds. Only the profile hub is correctly dark-themed.
2. **Layout paradigm**: Figma uses full-screen dark map with bottom sheet overlays. Code uses separate full-screen pages with white backgrounds and ScrollViews.
3. **Missing Snackbar/Toast system**: Figma uses green/red snackbars with undo actions throughout. No snackbar component exists in code.
4. **Tab bar structure**: Figma shows 3 tabs (profile, shield/home, star). Code has 5 tabs.
5. **No French diacritiques**: All French text in code lacks accents (securite vs securite, preference vs preference).
6. **Logo branding**: Figma shows shield/P icon + "PRUDENCY" text at top of auth screens. Code only shows text at bottom.
7. **Mock data**: Several screens (contacts, guardian) use hardcoded mock data instead of real hooks/services that already exist.

---

## Critical Gaps (P0)

| # | Component Set | Gap | Impact |
|---|--------------|-----|--------|
| 1 | CS3 Home | Tab bar: 5 tabs vs 3 in Figma | Navigation architecture mismatch |
| 2 | CS4 Trip Create | Separate full-screen page vs bottom sheet overlay on map | Fundamental UX architecture difference |
| 3 | CS4 Trip Create | Light theme vs Figma dark theme | Complete visual mismatch |
| 4 | CS5 Trip Active | White ScrollView vs full-screen dark map with overlays | Layout paradigm mismatch |
| 5 | CS7 Trip Complete | No arrival confirmation modal with 15-min countdown | Missing core safety flow |
| 6 | CS9 Paused/Scheduled | Standalone white screens vs map-background floating cards | Complete redesign needed |
| 7 | CS10 Modify Trip | No edit mode for active trips | Missing core feature |
| 8 | CS11 Panic Button | Embedded in ScrollView vs floating map overlay | Not accessible from home/map |
| 9 | CS12 Contacts | Separate tabs vs unified screen with toggle | Architecture mismatch |
| 10 | CS14 Places | Separate tab vs bottom sheet on map | Navigation mismatch |
| 11 | CS17 Preferences | Completely wrong content (generic settings vs alert configuration) | Screen rewrite needed |
| 12 | CS19 About/Demo | Missing demo walkthrough flow (5 steps) | Feature missing |

---

## High Priority Gaps (P1)

### Auth (CS1-2)
- Facebook login completely missing (required by both Trello cards)
- OTP verification non-functional in production
- Add-contact screen design completely different from Figma (form vs map+circle button)
- Permission screen animations missing (concentric circles vs simple icons)
- Onboarding progress indicator: dots vs progress bar with moving picto

### Trip (CS3-7)
- Missing departure address input field
- Missing departure time / "Partir maintenant" section
- Missing transit route selection for public transport
- Destination search: inline autocomplete vs bottom sheet with saved/recent places
- No trip extension ("Prolonger") flow with reason selection
- No route deviation or prolonged stop detection
- No arrival detection via GPS proximity
- Password validation missing on trip complete (only biometric)
- No 15-minute countdown warning on arrival

### Notes/Pause/Alert (CS8-11)
- Notes: delete implemented but Trello says no delete allowed (edit/rectification only)
- Notes: missing user avatars, usernames, context menus
- Active trip: missing "Prolonger" and "Annuler" buttons
- Panic button: exclamation "!" vs shield icon
- Long-press duration: 2s vs 3s specified

### Contacts/Guardian/Places (CS12-14)
- Contacts tab uses mock local state instead of existing `useContacts()` hook
- Guardian tab uses hardcoded mock data
- No favorite/star toggle system
- No SMS validation flow for contacts
- Places: missing "Lieux recents" section
- No 3-dot context menus

### Profile/Settings (CS15-20)
- Profile save is placeholder (setTimeout, no Supabase call)
- Phone/email OTP verification flows missing
- System permissions management UI not built
- Missing all legal pages (CGU, CGV, mentions legales, politique confidentialite)
- Change password: Alert dialog vs dedicated screen
- Subscription: cards vs radio buttons, wrong feature lists

---

## Trello Card Movements

### Cards to Move

| Card | Name | Current | Target | Reason |
|------|------|---------|--------|--------|
| #35 | Authentification utilisateur | Termine | **En cours** | Facebook login missing |
| #24 | M'inscrire sur l'application | A tester | **En cours** | Facebook missing + CGU links non-navigable + OTP non-functional |
| #26 | Configurer les permissions | A tester | **En cours** | Permission management UI not built |
| #36 | Fermer ma session | Fonctionnalites | **A tester** | Core logout flow works with password confirmation |
| #32 | Bouton panique immediat | Fonctionnalites | **En cours** | Partial implementation exists |

### Cards to Keep in Current List

| Card | Name | List | Reason |
|------|------|------|--------|
| #1 | Saisir les infos d'un trajet | En cours | 2/5 criteria met, significant work remains |
| #7 | Identification auto comportements | En cours | Only overtime detection works |
| #12 | Ajouter une note de contexte | En cours | Significant rework needed (edit vs delete) |
| #15 | Partager ma position GPS | En cours | Scaffolding only, no real-time data |
| #43 | Partage d'un trajet | En cours | No direct implementation |
| #2 | Suivi GPS du trajet | Fonctionnalites | Route comparison not implemented |
| #3 | Confirmer arrivee | Fonctionnalites | Multiple core criteria unmet |
| #5 | Validation role contact | Fonctionnalites | SMS flow not built |
| #6 | Plusieurs contacts (Premium) | Fonctionnalites | Blocked by subscription system |
| #8 | Alertee detection anomalie | Fonctionnalites | Push notifications missing, wrong delay |
| #9 | Alerter contact danger | Fonctionnalites | Mostly unimplemented |
| #27 | Decouvrir offre premium | Fonctionnalites | Content mismatch, no payment |
| #28 | Passer version payante | Fonctionnalites | Payment not started |
| #39 | Mettre a jour profil | Fonctionnalites | Save is placeholder |
| #42 | Validation securisee trajet | Fonctionnalites | Password fallback missing |
| #4 | Designer contact confiance | A tester | Core flow works, needs hook wiring |

---

## Recommended Priority Order for Corrections

### Phase 1 — Architecture & Theme (systemic fixes)
1. Apply dark theme to ALL screens (currently only profile hub is dark)
2. Restructure tab bar from 5 to 3 tabs
3. Create shared Snackbar/Toast component
4. Create shared 3-dot context menu component
5. Merge contacts + guardian into single screen with toggle
6. Move places from tab to bottom sheet on map

### Phase 2 — Core Trip Flow
7. Convert trip creation to bottom sheet overlay on map
8. Add departure address input + departure time picker
9. Redesign active trip as full-screen map with bottom sheet
10. Add trip extension ("Prolonger") flow
11. Add arrival confirmation modal with 15-min countdown
12. Add trip modification during active trip
13. Implement password-based trip validation (fallback to biometric)

### Phase 3 — Safety Features
14. Add route deviation detection
15. Add prolonged stop detection
16. Fix panic button: floating map overlay with shield icon
17. Fix anomaly detection delays (2min not 5min)
18. Implement contact validation via SMS (Plivo)

### Phase 4 — Auth & Profile
19. Add Facebook login
20. Fix OTP verification for production
21. Redesign add-contact screen to match Figma
22. Rewrite preferences screen (alert configuration)
23. Add phone/email OTP verification in profile
24. Add legal pages (CGU, CGV, etc.)
25. Add demo walkthrough in About screen

### Phase 5 — Polish
26. Fix all text to match Figma copy exactly
27. Add French diacritiques throughout
28. Add logo branding (shield/P icon) to auth screens
29. Add permission screen animations (concentric circles)
30. Fix onboarding progress indicator
31. Wire real hooks into contacts/guardian (remove mock data)
32. Notes: replace delete with edit/rectification system

---

## Detailed Reports

- [CS1-2 Auth](audit-cs1-2-auth.md)
- [CS3-4 Home/Trip Create](audit-cs3-4-home-trip-create.md)
- [CS5-7 Trip Active/Problems/Complete](audit-cs5-7-trip-active-complete.md)
- [CS8-11 Notes/Pause/Modify/Alert](audit-cs8-11-notes-pause-alert.md)
- [CS12-14 Contacts/Guardian/Places](audit-cs12-14-contacts-guardian-places.md)
- [CS15-20 Profile/Security/Preferences/Subscription/About/Logout](audit-cs15-20-profile-settings.md)
