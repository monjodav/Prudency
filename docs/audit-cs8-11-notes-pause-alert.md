# Audit Report: Component Sets 8-11
## Trip Notes, Pause/Scheduled, Modify/Cancel, Panic Alert

**Date**: 2026-02-20
**Auditor**: Agent (CS8-11)
**Status**: Complete

---

## Component Set 8: Trip -- Notes

### Figma Reference
- **Node**: 681:51546 ("Ajouter une note")
- **Screens**: 5 variants visible:
  1. Map view with "Trajet en cours" banner + note icon shortcut
  2. Notes list screen (dark background, purple header, chat-style notes with user avatar, timestamp, three-dot menu)
  3. Notes list with context menu popup ("Modifier" / "Supprimer" actions)
  4. Notes list with green toast "Commentaire Modifie" (after editing)
  5. Notes list with red toast "Commentaire supprime" (after deletion)

### Figma Design Details
- **Background**: Dark navy/charcoal (#1A1B2E or similar)
- **Header**: "<" back arrow left, "Notes" centered title, dark background
- **Note items**: Each note shows a colored avatar circle (green), username ("Lea"), timestamp ("14h12"), note content text, and a three-dot (vertical ellipsis) menu icon on the right
- **Note categories/tags**: "Retard detecte" tag labels, "Tout vas bien | Retard de transport" inline tags
- **Modified notes**: Show "(modifie)" next to timestamp
- **Input bar**: At bottom, "Ajouter une note" placeholder in a rounded input field with a purple send arrow button
- **Context menu**: Rounded popup with "Modifier" (with pencil icon) and "Supprimer" (with trash icon)
- **Toasts**: Green toast for "Commentaire Modifie", red toast for "Commentaire supprime" -- both with "Annuler" action

### Code Implementation
- **Screen**: `app/(trip)/notes.tsx` (237 lines)
- **Hook**: `src/hooks/useTripNotes.ts` (47 lines)
- **Service**: `src/services/tripNotesService.ts` (78 lines)

### Gaps Found

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Theme mismatch -- light vs dark** | HIGH | Code uses light theme (white background `colors.gray[50]`, `colors.white` input container). Figma shows dark navy background with light text. Entire color scheme is inverted. |
| 2 | **Missing user avatar on notes** | HIGH | Figma shows a colored circle avatar with first letter/initial for each note. Code has no avatar rendering -- notes only show content, timestamp, and location. |
| 3 | **Missing username display** | HIGH | Figma shows "Lea" username next to each note. Code does not display any username -- just content text. |
| 4 | **Missing three-dot context menu** | HIGH | Figma shows a vertical ellipsis (three-dot) menu on each note, opening "Modifier" / "Supprimer" popup. Code has no context menu, no edit functionality, and no menu icon. |
| 5 | **Missing "Modifier" (edit) functionality** | HIGH | Figma shows ability to edit notes with "(modifie)" tag. Code/service has no `updateTripNote` function. Hook exposes `deleteNote` but not `updateNote`. Trello card explicitly states "La note ne peut pas etre supprimee, mais peut etre rectifiee en gardant l'historique des rectifications." -- current code does the opposite (allows delete, no edit). |
| 6 | **Delete should not be allowed (per Trello)** | HIGH | Trello card #12 states notes cannot be deleted but can be rectified. Code exposes `deleteTripNote` in service and `deleteNote` in hook. Figma does show "Supprimer" in menu, but Trello acceptance criteria explicitly forbids deletion. This needs clarification. |
| 7 | **Missing toast notifications** | MEDIUM | Figma shows green "Commentaire Modifie" and red "Commentaire supprime" toast banners with "Annuler" undo button. No toast/snackbar system in the code. |
| 8 | **Missing note tags/categories** | MEDIUM | Figma shows inline tags like "Retard detecte", "Tout vas bien", "Retard de transport". Code has no tag/category system for notes. |
| 9 | **Missing encryption toggle visual match** | LOW | Code has a "Chiffrer la note" toggle with lock icon. This is not visible in Figma designs. May be a code-only feature (acceptable), but should be validated. |
| 10 | **Input placeholder text differs** | LOW | Figma: "Ajouter une note" with send arrow. Code: "Ecrire une note..." with "Envoyer" text button. |
| 11 | **Note layout is card-based vs chat-style** | MEDIUM | Figma shows chat-bubble style notes (avatar + message). Code uses generic Card components with plain text layout. |

### Trello Card #12: "Ajouter une note de contexte"
- **Current List**: En cours
- **Acceptance Criteria Status**:
  - [x] Saisir une note textuelle -- implemented
  - [x] Note datee et horodatee -- timestamp shown
  - [ ] Note transmise en cas d'alerte -- not verified (alertService does not reference notes)
  - [x] Plusieurs notes durant le trajet -- supported via FlatList
  - [ ] Note ne peut pas etre supprimee -- **VIOLATION**: delete is implemented
  - [ ] Peut etre rectifiee avec historique des rectifications -- **NOT IMPLEMENTED**: no edit/rectification system
- **Recommended movement**: Keep in "En cours" -- significant rework needed

---

## Component Set 9: Trip -- Pause / Planifie

### Figma Reference -- Paused (693:52578)
- **Screens**: 3 variants:
  1. Collapsed: Map with purple banner "Trajet en pause / Reprise dans 10 min" + eye-off icon
  2. Expanded: Banner expanded showing Destination ("Gare du nord"), Contacts (2), Temps ecoule (3m 00s), Temps restant (12m 00s), progress bar, "Reprendre le trajet" button
  3. Expanded with route: Same as above but with route polyline visible on map

### Figma Reference -- Scheduled (467:46382)
- **Screens**: 3 variants:
  1. Collapsed: Map with purple banner "Trajet a venir / Debut du trajet a 14h" + eye-off icon
  2. Expanded: Banner showing Destination, Contacts, Temps ecoule (00m 00s), Temps restant (15m 00s), "Commencer le trajet" button, "Afficher le trajet" secondary button
  3. Expanded with route: Same + route polyline, "Masquer le trajet" toggle

### Figma Design Details (Paused)
- **Layout**: Full map background with floating purple overlay card at top
- **Banner**: Purple gradient card with walking icon, "Trajet en pause", "Reprise dans 10 min" in green text, eye icon toggle
- **Expanded card**: Shows destination, contacts count, elapsed/remaining time with slider, "Reprendre le trajet" blue button
- **Bottom bar**: Tab bar with profile/trip/favorites icons
- **Action buttons**: Floating action buttons on map (compass, stop, +)

### Figma Design Details (Scheduled)
- **Layout**: Same full map background with floating purple card
- **Banner**: "Trajet a venir", "Debut du trajet a 14h" in green text
- **Buttons**: "Commencer le trajet" (filled blue), "Afficher le trajet" / "Masquer le trajet" (outline)

### Code Implementation -- Paused
- **Screen**: `app/(trip)/paused.tsx` (219 lines)

### Code Implementation -- Scheduled
- **Screen**: `app/(trip)/scheduled.tsx` (324 lines)

### Gaps Found -- Paused Screen

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Completely different layout paradigm** | CRITICAL | Figma shows map-based screen with floating purple overlay card. Code shows a standalone white-background screen with centered pause icon, title, subtitle, warning banner, and action buttons -- no map as primary background. |
| 2 | **Missing expandable card overlay** | HIGH | Figma has a collapsible/expandable card that overlays the map showing destination, contacts, elapsed/remaining time with progress bar. Code has none of this -- just static text and buttons. |
| 3 | **Missing trip details in pause view** | HIGH | Figma shows: destination name, contacts count, elapsed time, remaining time, progress slider. Code shows only a warning about timer continuing and action buttons. |
| 4 | **Missing "Reprise dans X min" countdown** | MEDIUM | Figma banner shows "Reprise dans 10 min". Code has no countdown or scheduled resume timer. |
| 5 | **Color scheme mismatch** | HIGH | Figma: dark background with purple card overlay. Code: white background (`colors.white`), yellow/warning colored pause indicator. |
| 6 | **Missing floating action buttons** | MEDIUM | Figma shows compass, stop, and "+" floating buttons on the map. Not present in code. |
| 7 | **Missing tab bar** | MEDIUM | Figma shows bottom tab bar. Code has no tab bar on this screen (it's in the trip stack, not tabs). |
| 8 | **Missing eye icon toggle** | LOW | Figma has an eye/eye-off icon to expand/collapse the overlay card. Not in code. |

### Gaps Found -- Scheduled Screen

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Completely different layout paradigm** | CRITICAL | Same as paused -- Figma shows map + floating purple card. Code shows a white standalone screen with icon, trip card, and buttons. |
| 2 | **Missing map as primary background** | HIGH | Code puts map as a small component inside the view. Figma has map as the full screen background with overlays. |
| 3 | **Missing "Afficher/Masquer le trajet" toggle** | MEDIUM | Figma has a secondary button to show/hide the route on the map. Code has no route visibility toggle. |
| 4 | **Button text differs** | LOW | Figma: "Commencer le trajet". Code: "Demarrer maintenant". |
| 5 | **Missing contacts count in card** | MEDIUM | Figma shows "Contacts: 2" in the card. Code shows departure time and duration but not contact count. |
| 6 | **Missing elapsed/remaining time display** | HIGH | Figma shows "Temps ecoule: 00m 00s" and "Temps restant: 15m 00s" with progress bar. Code has none of this. |

---

## Component Set 10: Trip -- Modifier / Annuler

### Figma Reference -- Modifier (467:46453)
- **Screens**: 5 variants:
  1. Active trip expanded card with actions: "Terminer le trajet", "Mettre en pause le trajet", "Prolonger le trajet", "Annuler le trajet" (red text link)
  2. "Modifier mon trajet" form (empty state): Lieu de depart, "Utiliser ma position actuelle" button, Lieu d'arrivee, Temps (Depart, "Partir maintenant" toggle), Heure d'arrivee estimee, Transport mode selector (Marche/Transports/Velo/Voiture), Contact list with checkboxes, Position sharing toggle, Silent notifications toggle, "Enregistrer les modifications" button
  3. "Modifier mon trajet" form (filled state): Same with data filled in
  4. Loading state: "Trajet en cours de chargement"
  5. Saved confirmation: Map with green toast "Modifications enregistrees"

### Figma Reference -- Annuler (467:46069)
- **Screens**: 3 variants:
  1. Active trip with expanded card and action buttons including "Annuler le trajet" red link
  2. Cancel confirmation modal: "Annuler le trajet" title, "Es-tu sur de vouloir annuler ton trajet ?" text, "Retour a la map" primary button, "Annuler mon trajet" red text link
  3. Post-cancel: Map view with green toast "Trajet annule / Le trajet a bien ete annule" with "Annuler" undo

### Figma Design Details (Modifier)
- **Form fields**: Lieu de depart (with "Utiliser ma position actuelle" purple pill), Lieu d'arrivee, Depart time, "Partir maintenant" toggle, Heure d'arrivee estimee display
- **Transport selector**: 5 icons (Marche, Transports, Velo, Voiture) in a row with border selection
- **Contact section**: Avatar circles with names ("Alice", "Papa") and checkboxes
- **Toggles**: "Partager ma position" switch, "Notifications silencieuses (Sauf urgence)" switch
- **Submit button**: "Enregistrer les modifications" -- disabled when no changes, active purple when changes detected
- **Warning text**: "Tu disposes de 15 minutes pour finaliser ton trajet..."

### Figma Design Details (Annuler)
- **Modal**: Dark overlay with centered card, "X" close button, "Annuler le trajet" title, confirmation text, "Retour a la map" filled button, "Annuler mon trajet" red text link

### Code Implementation
- **Create/Modify**: `app/(trip)/create.tsx` (664 lines) -- used for both creation and modification
- **Active screen actions**: `app/(trip)/active.tsx` lines 182-200 -- has Notes, Pause, Arrivee quick actions

### Gaps Found -- Modify

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **No dedicated edit/modify mode** | CRITICAL | Figma shows a distinct "Modifier mon trajet" screen with pre-filled data from the active trip. Code's `create.tsx` is only for creation -- it has no edit mode that loads existing trip data. The `scheduled.tsx` has a `handleModify` that navigates to create, but create.tsx does not accept or use existing trip parameters. |
| 2 | **Missing departure location field** | HIGH | Figma shows "Lieu de depart" with "Utiliser ma position actuelle" button. Code's create screen only has destination input, no explicit departure address field. |
| 3 | **Missing departure time picker** | HIGH | Figma shows "Depart" time field with "Partir maintenant" toggle and time picker. Code has no departure time selection -- trip starts immediately. |
| 4 | **Missing estimated arrival display** | MEDIUM | Figma shows "Heure d'arrivee estimee: 14h07" with clock icon. Code does not display computed arrival time during creation. |
| 5 | **Missing position sharing toggle** | MEDIUM | Figma shows "Partager ma position" toggle switch. Not in code. |
| 6 | **Missing silent notifications toggle** | MEDIUM | Figma shows "Notifications silencieuses (Sauf urgence)" toggle. Not in code. |
| 7 | **Missing contact checkboxes** | MEDIUM | Figma shows contacts with checkbox selection (multi-select). Code has single-select radio-style contact selection with no checkbox UI. |
| 8 | **Missing "Enregistrer les modifications" submit** | HIGH | No save-modifications flow. Trip update in `useTrip` exists (`updateTrip`) but is never called from a modify screen. |
| 9 | **Missing modification toast** | LOW | Figma shows green "Modifications enregistrees" toast after saving. No toast system. |
| 10 | **Active trip action menu layout mismatch** | HIGH | Figma shows 4 action buttons in the expanded card: "Terminer le trajet", "Mettre en pause le trajet", "Prolonger le trajet", "Annuler le trajet". Code's active.tsx has 3 small icon-only actions (Notes, Pause, Arrivee) at the bottom -- no "Prolonger" or "Annuler" visible from active screen. |
| 11 | **Missing "Prolonger le trajet" action** | HIGH | Figma shows a "Prolonger le trajet" button on the active trip card. No extend/prolong trip functionality in code. |
| 12 | **Missing "Annuler le trajet" from active screen** | MEDIUM | Figma shows "Annuler le trajet" as red text link on active trip. Code's active.tsx has no cancel trip option -- only in paused.tsx and scheduled.tsx. |

### Gaps Found -- Cancel

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Cancel modal design mismatch** | MEDIUM | Figma modal: "X" close, title, text, "Retour a la map" button, "Annuler mon trajet" red link. Code modal (in paused.tsx): "Non, reprendre" outline button + "Oui, annuler" danger button side by side. Different layout and copy. |
| 2 | **Missing post-cancel toast** | LOW | Figma shows green toast "Trajet annule" with "Annuler" undo. Code navigates directly to tabs with no toast. |
| 3 | **Missing undo on cancel** | MEDIUM | Figma toast has "Annuler" undo action after trip cancellation. Not implemented. |

---

## Component Set 11: Alerte Panique

### Figma Reference (490:52423)
- **Screens**: 3 variants:
  1. **Idle state**: Map with large shield icon (blue/purple outline circle) at top center, floating action buttons, tab bar
  2. **Press-and-hold state**: Same layout but text appears "Appuie 3s pour alerter en urgence ta personne de confiance"
  3. **Alert sent state**: Shield icon turns red/pink with glow effect, text "Une alerte a ete envoyee a ta personne de confiance. Reste appuye sur le bouton pour desactiver l'alerte."

### Figma Design Details
- **Layout**: Full map background (same as home/active screen)
- **Panic button**: Large circular shield icon centered near top of screen (overlaying the map)
  - Idle: Blue/purple shield outline in white circle
  - Pressing: Same with instructional text below ("Appuie 3s pour alerter...")
  - Triggered: Red/pink glowing shield with alert text
- **Instructional text**: Appears only during press, below the button
- **Alert confirmation text**: "Une alerte a ete envoyee a ta personne de confiance. Reste appuye sur le bouton pour desactiver l'alerte."
- **Map**: Full screen background with user marker, notification/contacts FABs

### Code Implementation
- **Panic button**: `src/components/alert/AlertButton.tsx` (256 lines) -- long-press button with cancel window
- **Alert active screen**: `app/(trip)/alert-active.tsx` (322 lines) -- post-alert screen
- **Alert hook**: `src/hooks/useAlert.ts` (71 lines)
- **Alert service**: `src/services/alertService.ts` (115 lines)

### Gaps Found

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Panic button not on map screen** | CRITICAL | Figma shows the panic button as a floating shield icon directly on the map (home/active) screen. Code places `AlertButton` only inside `active.tsx` ScrollView, not as a map overlay. The button is not visible from the main map/home tab at all. |
| 2 | **Button visual design mismatch** | HIGH | Figma: Shield icon in a circle (matches app's shield branding). Code: Exclamation mark "!" text with "ALERTE" label. No shield icon used. |
| 3 | **Long-press duration differs** | LOW | Figma text: "Appuie 3s pour alerter". Code: `LONG_PRESS_DURATION_MS = 2000` (2 seconds). Should be 3000ms to match Figma. |
| 4 | **Cancel window behavior differs** | MEDIUM | Figma alert-sent state says "Reste appuye sur le bouton pour desactiver l'alerte" (keep pressing to deactivate). Code has a 3-second cancel countdown window then auto-confirms. Different deactivation UX. |
| 5 | **Alert-active screen completely different from Figma** | HIGH | Figma shows alert state as the same map screen with red glowing button. Code navigates to a completely separate `alert-active.tsx` screen with red background, warning icon, contacts list, 112 call button. This is a full-page dedicated alert screen, not a map overlay state. |
| 6 | **Missing shield icon throughout** | MEDIUM | Figma panic feature uses a distinct shield icon. Code uses warning/exclamation icons. Brand identity mismatch. |
| 7 | **alert-active.tsx adds features not in this Figma section** | INFO | Code's alert-active screen includes: contacts notification list, "Appeler le 112" emergency button, "Tout va bien" cancel button, duration counter. These may come from other Figma sections but are not shown in the panic button section (490:52423). They are useful additions. |

### Trello Card #32: "Bouton panique immediat"
- **Current List**: Fonctionnalites (backlog)
- **Acceptance Criteria Status**:
  - [ ] Bouton accessible en un geste (widget, shake, bouton volume) -- **V2** noted; current implementation requires navigating to active trip screen
  - [x] Alerte envoyee immediatement sans confirmation -- after long press + cancel window, yes
  - [ ] Localisation et preuves transmises si option selectionnee -- location sent, no proof/evidence system
  - [ ] Alerte precise qu'elle est manuelle (urgence) -- `type: 'manual'` sent but not displayed
  - [ ] Son/vibration confirme le declenchement -- vibration on alert-active screen, haptics on button press
- **Recommended movement**: Move to "En cours" -- partial implementation exists (AlertButton + alert-active screen), but significant UI/UX gaps remain

### Trello Card #9: "Alerter mon contact en cas de danger"
- **Current List**: Fonctionnalites (backlog)
- **Acceptance Criteria Status**:
  - [ ] Personne de confiance recoit un SMS -- SMS sending via `send-alert` Edge Function exists but untested in audit scope
  - [ ] Message contient demande de prise de contact -- not verified (Edge Function logic)
  - [ ] Lapse de temps configurable avant envoi complet des donnees -- **NOT IMPLEMENTED**
  - [ ] Message d'alerte personnalise (Premium) -- **NOT IMPLEMENTED**
  - [ ] Contenu alertes: texte, localisation temps reel, trajet prevu, heure, ETA, notes -- partial (location sent, notes not referenced in alert)
  - [ ] Lien carte avec trajet + position -- **NOT IMPLEMENTED** (no web tracking page)
  - [ ] Preuves/notes transmises -- notes not included in alert payload
  - [ ] Position en temps reel visible -- **NOT IMPLEMENTED** (no real-time web view)
  - [ ] Interface web responsive mobile avec code 6 chiffres -- **V2** noted, not implemented
- **Recommended movement**: Keep in "Fonctionnalites" -- mostly not implemented, foundational alert triggering exists

---

## Summary of All Gaps

### Critical Issues (require architectural changes)
1. **CS9 Paused/Scheduled**: Both screens need complete redesign to use map-as-background with floating overlay cards instead of standalone white screens
2. **CS10 Modify**: No edit mode exists for active trips -- `create.tsx` needs to support loading and editing existing trip data
3. **CS11 Panic**: Button should be a floating map overlay accessible from any map screen, not embedded in the active trip ScrollView

### High Priority Issues
4. **CS8 Notes**: Dark theme needed, missing avatars, usernames, context menus, edit functionality
5. **CS8 Notes**: Delete should be replaced with edit/rectification per Trello card requirements
6. **CS10 Active actions**: Missing "Prolonger le trajet" and "Annuler le trajet" from active trip screen
7. **CS10 Create/Modify**: Missing departure field, time picker, toggles (position sharing, silent notifications)
8. **CS11 Panic**: Button visual should use shield icon, not exclamation mark

### Medium Priority Issues
9. **CS8 Notes**: Missing tag system, toast notifications
10. **CS9 Paused**: Missing countdown timer, trip details in overlay
11. **CS10 Cancel**: Modal design differs, missing undo toast
12. **CS11 Panic**: Long-press should be 3s (not 2s), cancel behavior differs

### Recommended Trello Card Movements
| Card | Current List | Recommended List | Reason |
|------|-------------|-----------------|--------|
| #12 "Ajouter une note" | En cours | **Stay En cours** | Significant rework needed (edit vs delete, UI overhaul) |
| #32 "Bouton panique" | Fonctionnalites | **Move to En cours** | Partial implementation exists, needs UI/UX alignment |
| #9 "Alerter contact" | Fonctionnalites | **Stay Fonctionnalites** | Mostly unimplemented beyond basic trigger |

### New Cards Recommended
1. **"Modifier un trajet actif"** -- Add edit mode to create.tsx or build a dedicated modify screen
2. **"Prolonger un trajet"** -- Add time extension functionality from active trip
3. **"Toast/Snackbar system"** -- Needed across multiple screens for confirmations
4. **"Map overlay trip cards"** -- Redesign paused/scheduled/active to use map-based layout with floating cards
