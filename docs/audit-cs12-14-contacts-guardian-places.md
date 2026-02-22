# Audit Report: Component Sets 12-14 (Contacts, Guardian/Proteges, Places)

**Date**: 2026-02-20
**Auditor**: Claude Agent (CS12-14)
**Status**: Complete

---

## Table of Contents

1. [Component Set 12: Contacts](#component-set-12-contacts)
2. [Component Set 13: Guardian / Proteges](#component-set-13-guardian--proteges)
3. [Component Set 14: Lieux (Places)](#component-set-14-lieux-places)
4. [Trello Card Analysis](#trello-card-analysis)
5. [Summary & Recommendations](#summary--recommendations)

---

## Component Set 12: Contacts

### Figma Sections Reviewed

| Section | Node ID | Status |
|---------|---------|--------|
| Ajouter une personne de confiance | 467:52858 | Partially Implemented |
| Supprimer une personne de confiance | 467:53044 | Partially Implemented |
| Ajouter/Supprimer favoris | 467:53260 | NOT Implemented |
| Recevoir une demande de contact | 467:55103 | Partially Implemented |

### Screen-by-Screen Analysis

#### 12.1 Contacts List (`app/(tabs)/contacts.tsx`)

**Figma Design** (467:52858, 467:53044, 467:53260):
- "Personnes de confiance" title with back arrow
- Tab toggle: "On me protege" / "Je protege"
- Helper text: "En cas de probleme, une alerte est automatiquement envoyee a tes contacts favoris."
- "Favoris" section header with favorited contacts (gold star filled)
- "Contacts enregistres" section, grouped alphabetically (A, X, etc.)
- Each contact row: avatar (photo), name, star toggle (outline/filled), 3-dot menu
- Bottom: info icon (left), "+" FAB button (right)
- Snackbars for: "Ajouter aux favoris" (green), "Retirer des favoris" (red)
- Delete flow: swipe/select -> "Supprimer" button -> confirmation modal -> success snackbar

**Current Code** (`contacts.tsx`):
- Title: "Contacts de confiance" (correct text)
- Subtitle: "X/3 contacts configures" (counter pattern)
- Uses `MockContact` local state instead of real `useContacts` hook / Supabase
- Uses a generic `Modal` + `ContactForm` for add/edit (white background form)
- `ContactCard` component: white background, initials avatar, name/phone/email, trash icon
- No tab toggle ("On me protege" / "Je protege")
- No "Favoris" section separation
- No star/favorite toggle functionality
- No 3-dot context menu
- No alphabetical grouping
- No "+" FAB button at bottom-right -- uses a full-width "Ajouter un contact" button instead
- No info icon at bottom-left
- No snackbar feedback (uses `Alert.alert` for delete confirmation)

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-C01 | HIGH | **No tab toggle "On me protege" / "Je protege"** -- Figma shows a segmented control at top to switch between people who protect you vs people you protect. Code has no such toggle. |
| GAP-C02 | HIGH | **Uses mock local state instead of real data** -- `contacts.tsx` uses `useState<MockContact[]>([])` instead of the existing `useContacts()` hook that connects to Supabase. The hook and service exist but are not wired in. |
| GAP-C03 | HIGH | **No favorite/star toggle** -- Figma shows a star icon on each contact to mark as favorite, with a "Favoris" section at top. No `is_favorite` field in `ContactCreateInput` or `TrustedContactRow`. |
| GAP-C04 | MEDIUM | **No "Favoris" section** -- No separation between favorites and regular contacts, no alphabetical grouping within the list. |
| GAP-C05 | MEDIUM | **No 3-dot context menu** -- Figma shows a vertical 3-dot menu per contact row. Code only has a delete trash icon. |
| GAP-C06 | MEDIUM | **Delete UX mismatch** -- Figma shows: select contacts -> "Supprimer" button with trash icon -> modal "Supprimer cette personne?" with explanation text -> success snackbar "Personne de confiance supprimee" (red) with "Annuler" action. Code uses native `Alert.alert`. |
| GAP-C07 | LOW | **"+" FAB missing** -- Figma has a circular "+" floating action button at bottom-right, plus an info icon at bottom-left. Code has full-width button pinned to bottom. |
| GAP-C08 | LOW | **ContactCard styling mismatch** -- Figma shows dark theme (purple/navy) contact cards with photo avatars. Code's `ContactCard` has white background with light theme styling (colors.white, colors.gray). Does not match the dark theme. |
| GAP-C09 | LOW | **No snackbar component** -- Figma uses green/red snackbars with "Annuler" action for add/remove favorites and delete. Code has no snackbar component. |
| GAP-C10 | MEDIUM | **ContactForm includes fields not in Figma** -- Form has email field, "Contact principal" switch, "Notification SMS" switch, "Notification push" switch. Figma form shows only: Prenom, Nom, Telephone, "Importer un contact" button, and "Envoyer une demande" button. |

#### 12.2 Add Contact during Onboarding (`app/(auth)/add-contact.tsx`)

**Figma Design** (467:52858 - middle screen):
- "Personnes de confiance" header with back arrow
- Fields: Prenom, Nom, Telephone (pre-filled if imported)
- "Importer un contact" button (with contact icon)
- "Envoyer une demande" primary button
- Permission modal: "Autoriser Prudency a acceder a vos contacts?" with options

**Current Code**:
- "Ajoute une personne de confiance" title (slightly different wording)
- "Importer depuis mes contacts" button (matches concept)
- Fields: Nom (single field), Telephone (matches)
- "Ajouter ce contact" button (different from "Envoyer une demande")
- "Plus tard" skip link
- Uses real `useContacts()` hook -- good

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-C11 | MEDIUM | **Field structure mismatch** -- Figma has separate "Prenom" and "Nom" fields. Code has a single "Nom" field. |
| GAP-C12 | LOW | **Button label mismatch** -- Figma says "Envoyer une demande" (sends a validation request). Code says "Ajouter ce contact" (directly adds). This reflects a deeper UX difference: Figma implies a validation flow, code does direct creation. |
| GAP-C13 | MEDIUM | **No validation status tracking** -- Figma shows "En cours de validation" state with a yellow snack bar after sending. Code directly creates the contact with no pending/validation state. |
| GAP-C14 | LOW | **Permission dialog** -- Figma shows a custom "Autoriser Prudency..." dialog. Code uses native OS permission dialog, which is acceptable. |

#### 12.3 Accept Contact Request (`app/accept-contact.tsx`)

**Figma Design** (467:55103):
- Shows SMS/iMessage with invitation text + link
- Notification screen with "Validation requise" entry
- "Personnes de confiance" screen with "Contacts en attente de validation" section showing "Valider" badge
- "Accepter la demande" bottom sheet with "Accepter" / "Refuser" buttons

**Current Code**:
- Deep link screen using `token` param
- States: loading, ready (with accept/refuse), accepted, refused, error
- Uses `OnboardingBackground` (purple gradient)
- Fetches invitation from `trusted_contacts` table by ID
- Accept: updates `notify_by_push` to true
- Refuse: deletes the contact

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-C15 | HIGH | **Validation flow incomplete** -- Figma shows a rich multi-step flow: SMS sent -> recipient taps link -> in-app notification "Validation requise" -> contacts list shows "en attente de validation" badge -> bottom sheet to accept. Code only handles the deep link acceptance screen, not the sender-side validation tracking. |
| GAP-C16 | MEDIUM | **No SMS sending mechanism** -- The validation flow requires sending an SMS with a link. No SMS service is integrated (Plivo mentioned in CLAUDE.md but not implemented). |
| GAP-C17 | MEDIUM | **Accept logic simplistic** -- Code sets `notify_by_push: true` on accept. Should properly update a `status` field (e.g., "pending" -> "active"). No `status` or `validation_status` column visible in the types. |
| GAP-C18 | LOW | **Screen styling** -- Code uses `OnboardingBackground` (purple gradient). Figma shows it as a proper in-app screen within "Personnes de confiance" section. |
| GAP-C19 | LOW | **Limit per contact not implemented** -- Figma notes mention 3-SMS limit with delays (2min, 1h, 1d). Code has no rate limiting. |

---

## Component Set 13: Guardian / Proteges

### Figma Sections Reviewed

| Section | Node ID | Status |
|---------|---------|--------|
| Les proteges | 517:72467 | Partially Implemented |
| Je recois une alerte | 683:52775 | Partially Implemented |

### Screen-by-Screen Analysis

#### 13.1 Guardian List / Proteges (`app/(tabs)/guardian.tsx`)

**Figma Design** (517:72467):
- "Personnes de confiance" header with back arrow
- Tab toggle: "On me protege" / "Je protege" (same as contacts, "Je protege" selected)
- "Les personnes dont je recois les alertes"
- "Contacts en attente de validation" section with "Valider" badges
- "Contacts" section listing protected people with status badges: "Alerte active", "Aucune activite", "Trajet en cours"
- Each contact has: avatar, name, status badge, 3-dot menu
- Action buttons per person: "Acceder a sa localisation", "Alerte manuelle"
- Map view showing person's real-time location with trip info panel
- "Retirer de mes proteges" modal with explanation and "Retirer" / "Annuler" buttons
- Detailed trip view: route on map, destination, temps ecoule / temps restant, notes section

**Current Code** (`guardian.tsx`):
- Title: "Mes proteges" (different from Figma's "Personnes de confiance")
- Subtitle: "X personnes sous votre protection"
- Uses hardcoded mock data (Marie Dupont, Sophie Martin)
- Status badges: "En securite", "Trajet en cours", "Alerte"
- Each card: avatar placeholder (initials), name, trip info, status badge, chevron
- Press navigates to `/(guardian)/track` for active/alert status
- No tab toggle ("On me protege" / "Je protege")
- No "Contacts en attente de validation" section
- No action buttons ("Acceder a sa localisation", "Alerte manuelle")
- No "Retirer de mes proteges" option
- No 3-dot context menu

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-G01 | HIGH | **No shared tab toggle with Contacts** -- Figma uses the same "Personnes de confiance" screen with "On me protege" / "Je protege" toggle. Code has separate `contacts.tsx` and `guardian.tsx` tabs with no toggle. These should be merged or at least share the toggle UI. |
| GAP-G02 | HIGH | **Uses hardcoded mock data** -- `protectedPeople` state is initialized with fake data, not connected to any service or Supabase query. |
| GAP-G03 | HIGH | **No "Contacts en attente de validation" section** -- Figma shows pending contacts with "Valider" badge at the top of the "Je protege" tab. Not implemented. |
| GAP-G04 | MEDIUM | **Missing action buttons** -- Figma shows "Acceder a sa localisation" and "Alerte manuelle" checkmark buttons per contact when an active trip/alert exists. Not implemented. |
| GAP-G05 | MEDIUM | **No "Retirer de mes proteges" flow** -- Figma shows a modal: "Tu es sur le point de retirer [Name] de tes proteges..." with "Retirer" / "Annuler" buttons and a red snackbar "[Name] a bien ete retire de la liste" with "Annuler" action. Not implemented. |
| GAP-G06 | LOW | **Missing 3-dot context menu** -- Figma shows vertical 3-dot menu per contact for additional actions. Not implemented. |
| GAP-G07 | LOW | **Status badge alignment** -- Figma shows colored badge chips (red "Alerte active", gray "Aucune activite", blue "Trajet en cours"). Code uses a `Badge` component but styling may differ. |

#### 13.2 Guardian Track (`app/(guardian)/track.tsx`)

**Figma Design** (517:72467 - right side screens):
- Full map view with route polyline
- "Information trajet [Name]" header with close (X) and phone icon
- Trip info: Destination, "Commence a", Temps ecoule, Temps restant
- Notes section with editable time-stamped notes
- Person info bar: avatar, battery %, phone icon, "Telephone allume", last update time, "Envoyer un message" / "Bloquer son compte" actions
- Bottom sheet with detailed info

**Current Code** (`track.tsx`):
- Map with `TripMap` component
- Info panel with: avatar, name, trip status, battery level
- Trip details: departure time, estimated arrival, destination
- Action buttons: "Appeler" and "Message" (placeholder implementations)
- "Fermer" button
- White theme (not dark like Figma)

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-G08 | HIGH | **Real-time location not implemented** -- Uses hardcoded position. No Supabase Realtime subscription for location updates. |
| GAP-G09 | MEDIUM | **Missing route polyline** -- Figma shows the trip route drawn on the map. Code only shows a static map with destination marker. |
| GAP-G10 | MEDIUM | **Missing notes section** -- Figma shows editable notes with timestamps in the trip detail view. Not implemented. |
| GAP-G11 | MEDIUM | **Missing "Telephone allume/eteint" status** -- Figma shows phone status indicator with "Derniere mise a jour" timestamp. Not implemented. |
| GAP-G12 | LOW | **Theme mismatch** -- Code uses white background. Figma shows dark map with dark info panel overlay. |
| GAP-G13 | LOW | **Missing close (X) and phone icon in header** -- Figma header has close button and direct call button. Code has a generic "Fermer" text button. |

#### 13.3 Alert Received (`app/(guardian)/alert-received.tsx`)

**Figma Design** (683:52775):
- SMS notification view (message from Prudency to contact)
- In-app notifications screen listing: "Alerte declenchee", "Validation requise", "Alerte declenchee annule", "Retard detecte", "Localisation partagee en direct", "Trajet fini", "Nouveau commentaire sur une alerte"
- Map view with alert info: route, person location, "Information trajet [Name]" header, battery %, phone status, last update

**Current Code** (`alert-received.tsx`):
- Red emergency screen with exclamation triangle icon
- "ALERTE" title, person name, "a besoin d'aide"
- Info card: triggered time, reason, location (tappable), battery level
- "Je prends en charge" button -> acknowledged banner
- Action cards: "Appeler [Name]", "Voir la position" (Google Maps), "Appeler les secours" (112)
- "Fermer" button
- Uses vibration pattern on mount

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-G14 | MEDIUM | **No notifications list screen** -- Figma shows a dedicated "Notifications" screen with various notification types. Code only has the alert-received emergency screen. A full notifications screen is missing. |
| GAP-G15 | MEDIUM | **No real-time map in alert view** -- Figma shows the alert with a live map. Code opens Google Maps externally instead. |
| GAP-G16 | LOW | **Alert acknowledgment flow** -- Code has "Je prends en charge" button which is a reasonable interpretation, but Figma doesn't explicitly show this pattern. |
| GAP-G17 | LOW | **Vibration/sound** -- Code vibrates on alert. Figma doesn't specify but the behavior is appropriate. |

---

## Component Set 14: Lieux (Places)

### Figma Sections Reviewed

| Section | Node ID | Status |
|---------|---------|--------|
| Enregistrer un lieu | 467:42570 | Partially Implemented |
| Enregistrer via lieux recents | 467:42737 | NOT Implemented |
| Modifier un lieu | 467:42878 | Partially Implemented |
| Supprimer un lieu enregistre | 467:43042 | Partially Implemented |
| Supprimer un lieu (recent) | 467:43141 | NOT Implemented |

### Screen-by-Screen Analysis

#### 14.1 Places List / Bottom Sheet on Map

**Figma Design** (467:42570):
- Places accessed via a **bottom sheet on the map** (swipe up from home/map screen)
- Two sections: "Lieux enregistres" and "Lieux recents"
- "Lieux enregistres": items with bookmark icon, name, 3-dot menu
- "+ Enregistrer un lieu" button
- "Lieux recents": items with clock icon, name, address, 3-dot menu
- Bottom sheet note: "Les lieux sont accessibles via un bottom sheet depuis la map. La bottom sheet est affichee via swipe up."

**Current Code** (`places/index.tsx`):
- **Standalone full screen** with dark background (not a bottom sheet on map)
- Title: "Mes lieux" with count
- Place cards: icon based on type, name, address, trash button
- "Ajouter un lieu" button (full-width)
- Empty state with icon + description + button

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-P01 | HIGH | **Places should be a bottom sheet on the map, not a separate tab** -- Figma clearly shows places as a draggable bottom sheet overlaying the map on the home screen. Code has it as a separate tab screen `/(tabs)/places/`. |
| GAP-P02 | HIGH | **No "Lieux recents" section** -- Figma shows recent places (from trip history) below saved places. Code only shows saved places. |
| GAP-P03 | MEDIUM | **Missing 3-dot menu per place** -- Figma shows vertical 3-dot menu with "Modifier" and "Supprimer" actions. Code only has a direct trash icon. |
| GAP-P04 | MEDIUM | **Missing bookmark icon** -- Figma uses bookmark icon for saved places. Code uses type-based icons (home, briefcase, heart, location). |
| GAP-P05 | LOW | **No "Enregistrer" action on recent places** -- Figma shows 3-dot menu on recent places with "Enregistrer" and "Supprimer" options. Not implemented. |

#### 14.2 Add/Save Place (`places/add.tsx`)

**Figma Design** (467:42570 - modal screens):
- Modal with close (X) button
- "Adresse" search field with search icon
- "Nomme le lieu" text field
- "Trajets recents" section showing recently visited places
- "Enregistrer le lieu" button (disabled until address selected and name entered)
- Success snackbar: "Lieu enregistre!" (green) with "Annuler" action

**Current Code**:
- Full screen with back arrow
- "Type de lieu" selector (Maison, Travail, Favori, Autre) -- NOT in Figma
- "Nom du lieu" input
- "Adresse" input with search button (geocoding via expo-location)
- Map preview when address found
- "Enregistrer" button
- Wired to real `usePlaces()` hook -- good

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-P06 | MEDIUM | **Should be a modal, not full screen** -- Figma shows add-place as a modal overlay with close (X). Code uses full-screen navigation. |
| GAP-P07 | MEDIUM | **"Type de lieu" selector not in Figma** -- Code has Maison/Travail/Favori/Autre type picker. Figma only shows address + name fields. |
| GAP-P08 | MEDIUM | **No "Trajets recents" suggestions** -- Figma shows recently visited addresses below the form as quick-select options. Not implemented. |
| GAP-P09 | LOW | **No success snackbar** -- Figma shows green "Lieu enregistre!" snackbar. Code just calls `router.back()`. |
| GAP-P10 | LOW | **Map preview not in Figma** -- Code shows a map preview after geocoding. Figma doesn't show this, but it's a nice UX addition. |

#### 14.3 Edit/Modify Place (`places/[id].tsx`)

**Figma Design** (467:42878):
- Same modal as add, pre-filled with existing data
- Address field pre-filled, name field pre-filled
- "Enregistrer les modifications" button (disabled until changes detected)
- Success snackbar: "Modifications enregistrees" (green) with "Annuler"
- Error snackbar: "Modifications non enregistrees" (red) with "Reessayer"

**Current Code**:
- Full screen with back arrow and delete button in header
- Same form as add (type selector, name, address, map preview)
- "Enregistrer les modifications" button -- matches Figma text
- Delete button in header + "Supprimer ce lieu" button at bottom
- Wired to `usePlaces()` hook -- good

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-P11 | MEDIUM | **Should be modal** -- Same as add, Figma shows modal. Code uses full screen. |
| GAP-P12 | LOW | **No disabled state detection** -- Figma specifies button disabled when no changes detected. Code disables based on empty fields, not change detection. |
| GAP-P13 | LOW | **No success/error snackbar** -- Figma shows green/red snackbar feedback. Code uses `Alert.alert` for errors and silent `router.back()` for success. |

#### 14.4 Delete Place

**Figma Design** (467:43042, 467:43141):
- For saved places: 3-dot menu -> "Supprimer" -> immediate deletion -> red snackbar "Lieu enregistre supprime / Le lieu 'X' a bien ete supprime" with "Annuler" (undo)
- For recent places: 3-dot menu -> "Supprimer" -> immediate deletion -> red snackbar "Lieu recent supprime / Le lieu a bien ete supprime" with "Annuler"
- Note: "Suppression immediate des lieux enregistres (pas de modale de confirmation lourde)"

**Current Code**:
- Delete via trash icon -> `Alert.alert` confirmation dialog -> delete
- Also delete from edit screen header button -> same `Alert.alert` confirmation

**Gaps**:

| Gap | Priority | Description |
|-----|----------|-------------|
| GAP-P14 | MEDIUM | **Confirmation dialog not wanted** -- Figma explicitly says "pas de modale de confirmation lourde" (no heavy confirmation modal). Code uses `Alert.alert`. Should be immediate delete with undo snackbar instead. |
| GAP-P15 | MEDIUM | **No undo functionality** -- Figma shows "Annuler" on the snackbar for rollback. Code has no undo mechanism after deletion. |
| GAP-P16 | MEDIUM | **No recent place deletion** -- Only saved places can be deleted. Recent places section doesn't exist. |

---

## Trello Card Analysis

### Card #4: Desinger un contact de confiance
- **List**: A tester
- **Key Criteria**:
  - Choose contact from phone contacts: IMPLEMENTED (add-contact.tsx has `handleImportContact`)
  - Enter contact name: IMPLEMENTED
  - Enter phone number manually: IMPLEMENTED
  - Contact is saved: IMPLEMENTED (via `useContacts.createContact`)
  - Multiple contacts can be entered: PARTIALLY (onboarding adds 1, contacts tab has local mock state)
  - Free version: 1 contact only: `APP_CONFIG.MAX_TRUSTED_CONTACTS` exists but contacts tab uses mock data
  - Premium: multiple contacts: NOT IMPLEMENTED (no premium check)
- **Recommended Move**: KEEP in "A tester" -- core functionality exists but contacts tab needs to use real `useContacts()` hook instead of mock state. The onboarding flow works properly.

### Card #5: Validation du role de personne de confiance
- **List**: Fonctionnalites
- **Key Criteria**:
  - SMS sent to contact: NOT IMPLEMENTED (no SMS service)
  - 3 SMS limit with delays: NOT IMPLEMENTED
  - Message explains role: PARTIALLY (accept-contact shows explanation text)
  - Contact can accept: IMPLEMENTED (accept-contact.tsx)
  - User notified of response: NOT IMPLEMENTED
  - User can delete contact anytime: IMPLEMENTED (contactService.deleteContact)
- **Recommended Move**: KEEP in "Fonctionnalites" -- the accept screen exists but the full validation flow (SMS sending, rate limiting, status tracking) is not implemented. Needs significant work.

### Card #6: Ajouter plusieurs contacts de securite
- **List**: Fonctionnalites
- **Key Criteria**:
  - Premium user can add multiple contacts: NOT IMPLEMENTED (no premium check, no subscription system)
  - Choose default contacts for trip: NOT IMPLEMENTED
- **Recommended Move**: KEEP in "Fonctionnalites" -- depends on premium/subscription system. Not started.

### Card #15: Partager ma position GPS
- **List**: En cours
- **Key Criteria**:
  - GPS position in alert: PARTIALLY (alert-received shows hardcoded location)
  - Real-time map link generated: NOT IMPLEMENTED
  - Battery status: PARTIALLY (shown in mock data, not real)
  - Contact can track movements: PARTIALLY (track.tsx exists but uses mock data)
  - Location updates regularly: NOT IMPLEMENTED (no Supabase Realtime)
  - Sharing stops at end of alert/validation: NOT IMPLEMENTED
- **Recommended Move**: KEEP in "En cours" -- scaffolding exists (track screen, alert screen) but no real-time data flow.

### Card #43: Partage d'un trajet
- **List**: En cours
- **Key Criteria**:
  - Trip sharing option during creation: NOT IMPLEMENTED
  - Trip and alerts visible in real-time: NOT IMPLEMENTED
  - Trusted contacts get full info, others limited (premium): NOT IMPLEMENTED
- **Recommended Move**: KEEP in "En cours" -- closely tied to #15 GPS sharing. No direct implementation yet.

---

## Summary & Recommendations

### Critical Architectural Issues

1. **Contacts + Guardian should share UI** -- Figma uses a single "Personnes de confiance" screen with a "On me protege" / "Je protege" toggle. Code has two completely separate tabs (`contacts.tsx` and `guardian.tsx`). These should be unified under one screen with a segmented control.

2. **Mock data throughout** -- Both `contacts.tsx` (local `useState`) and `guardian.tsx` (hardcoded array) use fake data. The `useContacts()` hook and `contactService` exist and are properly built but only used in the onboarding `add-contact.tsx` flow. Wire the real hook into the contacts tab.

3. **Places as bottom sheet, not tab** -- Figma clearly defines places as a bottom sheet accessible from the map home screen. Code has it as a full separate tab navigation. This requires restructuring the tab layout.

4. **Missing favorite system** -- The star/favorite toggle is central to the Figma contacts design but is completely absent from the data model (`contact.ts` types) and UI.

5. **No SMS/validation flow** -- The contact validation via SMS is a core feature (Card #5) with no backend implementation. Plivo is mentioned in CLAUDE.md but not integrated.

### Gap Count by Priority

| Priority | Count |
|----------|-------|
| HIGH | 8 |
| MEDIUM | 18 |
| LOW | 14 |
| **Total** | **40** |

### Recommended Trello Card Movements

| Card | Current List | Recommended List | Reason |
|------|-------------|-----------------|--------|
| #4 Desinger un contact de confiance | A tester | A tester | Core add flow works (onboarding). Contacts tab needs real hook wiring. |
| #5 Validation du role | Fonctionnalites | Fonctionnalites | Accept screen exists but SMS sending, rate limiting, and full validation flow are not built. |
| #6 Ajouter plusieurs contacts (Premium) | Fonctionnalites | Fonctionnalites | Blocked by subscription/premium system. |
| #15 Partager ma position GPS | En cours | En cours | Scaffolding only. No real-time data. |
| #43 Partage d'un trajet | En cours | En cours | No implementation yet. |

### Top Priority Actions

1. **Merge contacts + guardian into single "Personnes de confiance" screen with toggle**
2. **Wire `useContacts()` hook into contacts tab (replace mock state)**
3. **Add `is_favorite` field to trusted_contacts and implement favorite toggle**
4. **Add `validation_status` field to trusted_contacts (pending/active/refused)**
5. **Implement snackbar component for consistent feedback (used across contacts + places)**
6. **Move places from separate tab to bottom sheet on map**
7. **Add "Lieux recents" data source (from trip history)**
8. **Implement 3-dot context menu component (used in contacts + places)**
