# Audit CS3-4: Home / Map + Trip Creation

**Date**: 2026-02-20
**Figma sections audited**:
- "Creer / Commencer un trajet sans personne de confiance" (nodeId: 467:55270)
- "Creer / Commencer un trajet avec personne de confiance ajouté" (nodeId: 487:24364)

**Code files audited**:
- `app/(tabs)/index.tsx` (Home / Map screen)
- `app/(trip)/create.tsx` (Trip creation screen)
- `src/hooks/useTrip.ts`
- `src/services/tripService.ts`
- `src/components/map/TripMap.tsx`
- `src/components/trip/TripStatus.tsx`
- `src/components/alert/AlertButton.tsx`
- `src/components/places/PlacesList.tsx`
- `app/(tabs)/_layout.tsx`
- `app/(trip)/_layout.tsx`

---

## CS3: Home / Map Screen

### Figma Design Summary

The home screen in Figma shows:
1. **Full-screen map** (light style in Figma, but contextual dark style is acceptable)
2. **Shield/Prudency logo** centered at top, acting as a branded icon
3. **User location dot** (pink/magenta circle on map)
4. **Right-side floating buttons**: notification bell, contacts/group icon, "+" (add trip) button stacked vertically
5. **Recenter/locate button** at bottom-left
6. **Stop/record button** at bottom-left area
7. **Bottom tab bar** with 3 tabs: profile icon, shield (home), star (favorites) - simple 3-tab layout
8. **Alert button** (shield-exclamation) with "Appuie 3s pour alerter en urgence" hint text

### Gaps Found

#### G3-1: CRITICAL - Tab bar structure mismatch
- **Figma**: 3 tabs -- person (profile), shield/home (center, active), star (favorites)
- **Code**: 5 tabs -- Accueil, Lieux, Contacts, Proteges, Profil
- **Impact**: Completely different navigation structure. Figma uses a minimal 3-tab layout while code has 5 tabs.

#### G3-2: HIGH - Home screen layout architecture differs significantly
- **Figma**: Map is full-screen. Floating action buttons are on the RIGHT side (notification bell, contacts, "+" button stacked vertically). Locate/recenter button on bottom-left.
- **Code**: Map is full-screen. "Commencer un trajet" button is centered as a pill-shaped CTA. AlertButton is below it. A draggable bottom sheet with PlacesList occupies the lower portion.
- **Impact**: The button layout, positioning, and interaction paradigm differ fundamentally.

#### G3-3: HIGH - Bottom sheet not in Figma home screen
- **Figma**: Home screen has NO bottom sheet. It shows only floating buttons on top of the map.
- **Code**: Home screen has a draggable bottom sheet (SHEET_SNAP_LOW = 30% of screen, SHEET_SNAP_HIGH = 60%) showing a PlacesList.
- **Impact**: The bottom sheet is an extra element not present in the Figma home design.

#### G3-4: MEDIUM - Greeting text not in Figma
- **Figma**: No "Bonjour [name]" or "Ou allez-vous aujourd'hui ?" text on the home screen.
- **Code**: Header overlay shows `greeting` ("Bonjour {firstName}") and subtitle "Ou allez-vous aujourd'hui ?"
- **Impact**: Extra text elements not present in the Figma design.

#### G3-5: MEDIUM - Alert button appearance and positioning
- **Figma**: Shield-exclamation icon at top center of the map with hint text "Appuie 3s pour alerter en urgence" below it. Small circular button.
- **Code**: Large AlertButton component (120px default) positioned in the floating actions area (centered, below the start trip button). Red circular button with "!" and "ALERTE" text.
- **Impact**: Position, size, and visual design differ from Figma.

#### G3-6: MEDIUM - Active trip indicator style
- **Figma**: When trip is active, shows a bottom toast/card with trip info, route on map with markers.
- **Code**: Active trip shows a `TripStatusIndicator` badge near the top with a chevron to navigate to the active trip. No route preview on the home map.
- **Impact**: Active trip representation differs from Figma.

#### G3-7: LOW - Map style
- **Figma**: Map appears to use a light/standard Google Maps style with visible green areas and standard coloring.
- **Code**: Uses a custom dark map style (`DARK_MAP_STYLE`) with dark blues and purples.
- **Impact**: Visual mismatch, though this may be an intentional design decision for dark mode.

#### G3-8: LOW - Floating button icons differ
- **Figma**: Right side has notification bell, contacts/group, "+" icons as circular dark buttons.
- **Code**: Center has a pill-shaped "Commencer un trajet" with add icon, plus the AlertButton.
- **Impact**: Different button icons and layout.

---

## CS4: Trip Creation Screen

### Figma Design Summary

The trip creation flow in Figma shows a **bottom sheet overlay** on top of the map (not a separate page) with the following structure:

**"Ajouter un trajet" bottom sheet** (dark background, rounded top corners):
1. **Title**: "Ajouter un trajet" + subtitle explaining cancellation/extension
2. **Lieu de depart**: Input field ("D'ou pars-tu ?") + "Utiliser ma position actuelle" button (with blue location icon)
3. **Lieu d'arrivee**: Input field ("Ou vas-tu ?")
4. **Temps** section:
   - Label: "Indique ton heure de depart"
   - "Depart" label + time input ("13h")
   - "Partir maintenant" button (blue)
5. **Transport** section:
   - Label: "Choisis ton mode de transport"
   - 4 options: Marche, Transports, Velo, Voiture (icon + label, selectable)
6. **Contact** section:
   - Without contacts: Text explaining need for a trust contact + "Ajouter un contact de confiance +" link
   - With contacts: Shows contact avatars (Alice, Papa) with checkboxes
7. **Position**: "Partager ma position" toggle (on by default)
8. **Option**: "Notifications silencieuses (Sauf urgence)" toggle
9. **"Lancer le trajet"** button (purple/gradient)
10. **Footer text**: "Tu disposes de 15 minutes pour finaliser ton trajet. Passe ce delai, une alerte sera envoyee a ta personne de confiance."

**Search/arrival sheet**:
- "Lieu d'arrivee" label + search input with magnifying glass icon
- "Trajets enregistres" section (Maison, Chez Lila)
- "Trajets recents" section (CENTQUATRE, 45 Rue Emile Deschanel)
- "Confirmer le lieu" button
- When transport mode is "Transports": shows transit route options with metro/bus line details, time estimates, and radio buttons to select

**After destination selected**:
- Map shows route preview with departure/arrival markers
- Bottom sheet shows "Heure d'arrivee estimee" with calculated time (e.g. "14h07")

### Gaps Found

#### G4-1: CRITICAL - Trip creation is a separate page instead of a bottom sheet overlay
- **Figma**: Trip creation is a **bottom sheet on top of the map**, keeping the map visible behind. The sheet slides up from the bottom.
- **Code**: Trip creation is a **separate full-screen page** (`app/(trip)/create.tsx`) presented as a modal via Expo Router Stack. It uses a ScrollView with a light gray background (`colors.gray[50]`), no map visible behind.
- **Impact**: Fundamental UX architecture difference. Users lose map context.

#### G4-2: CRITICAL - Dark theme vs light theme
- **Figma**: Trip creation bottom sheet has a **dark background** (dark navy/purple) with light text on all fields.
- **Code**: Trip creation uses a **light theme** -- `backgroundColor: colors.gray[50]` (near white), with dark text and white cards.
- **Impact**: Complete visual theme mismatch.

#### G4-3: HIGH - Missing "Lieu de depart" (departure address) input
- **Figma**: Has both "Lieu de depart" and "Lieu d'arrivee" input fields. The departure field has "D'ou pars-tu ?" placeholder and an "Utiliser ma position actuelle" button below it.
- **Code**: Only has a "Destination" input field (arrival). No departure address input. The departure location is automatically obtained from `getCurrentLocation()` in a `useEffect`.
- **Impact**: User cannot manually enter a departure address as designed in Figma.

#### G4-4: HIGH - Missing departure time / "Partir maintenant" section
- **Figma**: Has a "Temps" section with "Depart" label, a time input ("13h"), and a "Partir maintenant" button.
- **Code**: No departure time selection at all. The trip starts immediately upon creation (`started_at: now.toISOString()`).
- **Impact**: Missing planned departure time functionality.

#### G4-5: HIGH - Estimated arrival time display missing
- **Figma**: After selecting a destination and transport mode, shows "Heure d'arrivee estimee" with the calculated time (e.g. "14h07").
- **Code**: Shows estimated duration via `formatDuration()` but does NOT show the estimated arrival time (e.g. "14h07").
- **Impact**: Missing key information display.

#### G4-6: HIGH - Duration picker is not in Figma
- **Figma**: No duration picker card with preset buttons (15, 30, 60, 120) or quick-adjust buttons (+5, -5, +15, +30). Duration is calculated automatically from the route.
- **Code**: Has an elaborate duration picker with `DURATION_PRESETS`, preset buttons, and quick adjust buttons (-5, +5, +15, +30) inside a Card component.
- **Impact**: Extra UI element not in Figma design. Figma relies on automatic route-based duration calculation.

#### G4-7: HIGH - Transit route selection not implemented
- **Figma**: When "Transports" (public transit) mode is selected, shows a list of transit options with metro/bus line details, departure/arrival times, and radio buttons to select the preferred route.
- **Code**: Transport mode selection only changes the mode for the Google Directions API call. No transit route option list or selection UI exists.
- **Impact**: Missing transit-specific UX for Paris public transport.

#### G4-8: HIGH - Search/arrival bottom sheet UI differs
- **Figma**: Destination search has its own dedicated bottom sheet with:
  - "Trajets enregistres" (saved places like Maison, Chez Lila with bookmark icons)
  - "Trajets recents" (recent destinations with location pin icons and address details)
  - "Confirmer le lieu" button
  - Purple location marker on map for the selected place
- **Code**: Uses inline autocomplete dropdown list below the input field. No saved places or recent trips shown. No "Confirmer le lieu" button.
- **Impact**: Completely different search/selection UX.

#### G4-9: MEDIUM - Contact section layout and behavior
- **Figma (without contacts)**: Shows explanation text about needing a trust contact + "Ajouter un contact de confiance +" link button.
- **Figma (with contacts)**: Shows contact avatar circles with names (Alice, Papa) and checkboxes.
- **Code (without contacts)**: Shows a warning banner with person-add icon and "Ajouter un contact" link -- reasonably close but styling differs (light theme vs dark theme).
- **Code (with contacts)**: Shows contact cards with person-circle icon, name, phone, checkmark indicator, and "Principal" badge -- functional but visually different from Figma's avatar-based design.
- **Impact**: Contact display differs visually though functionally similar.

#### G4-10: MEDIUM - Missing "Position" toggle (share location)
- **Figma**: Has a "Position - Partage de position en direct" section with a "Partager ma position" toggle switch (on by default).
- **Code**: No location sharing toggle exists in the trip creation form.
- **Impact**: Missing feature control.

#### G4-11: MEDIUM - Missing "Notifications silencieuses" toggle
- **Figma**: Has an "Option" section with "Notifications silencieuses (Sauf urgence)" toggle.
- **Code**: No silent notifications toggle exists.
- **Impact**: Missing feature control.

#### G4-12: MEDIUM - "Lancer le trajet" button styling
- **Figma**: Purple/gradient button with "Lancer le trajet" text.
- **Code**: Primary blue button with "Commencer" text and a navigate icon.
- **Impact**: Button text, color, and style differ.

#### G4-13: MEDIUM - Missing footer warning text
- **Figma**: "Tu disposes de 15 minutes pour finaliser ton trajet. Passe ce delai, une alerte sera envoyee a ta personne de confiance."
- **Code**: No such warning text displayed below the launch button.
- **Impact**: Missing important user guidance.

#### G4-14: LOW - Transport mode labels
- **Figma**: "Marche", "Transports", "Velo", "Voiture" with specific icons in dark-themed square buttons.
- **Code**: "Marche", "Voiture", "Transport", "Velo" with Ionicons in light-themed rounded rectangles. Note: order differs and "Transports" is "Transport" (singular).
- **Impact**: Minor text and ordering difference.

#### G4-15: LOW - Screen title
- **Figma**: "Ajouter un trajet" as the title inside the bottom sheet.
- **Code**: "Nouveau trajet" as the Stack screen header title.
- **Impact**: Minor text mismatch.

#### G4-16: LOW - Missing subtitle description
- **Figma**: "Tu pourras annuler ou prolonger ton trajet en cas de retard ou problemes a tout moment."
- **Code**: No subtitle/description text.
- **Impact**: Missing contextual help text.

---

## Trello Card Analysis

### Card: #1 "Saisir les informations d'un trajet"
- **Current List**: En cours
- **Card ID**: 698cdc675aa4a5dd34c129be

### Acceptance Criteria Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| User can enter departure address with current location button | PARTIAL | Code auto-detects GPS location but does NOT provide a text input for departure address. No "Utiliser ma position actuelle" button -- it's automatic. Missing manual departure address entry. |
| User can enter arrival address | YES | Destination input with Google Places autocomplete is implemented. |
| User can add intermediate stops (optional) | NO | No intermediate stops feature exists in the code. |
| System calculates and displays estimated trip duration | YES | Duration is calculated from Google Directions API and displayed via `formatDuration()`. |
| System records planned start time | PARTIAL | System records `started_at` as the current time when trip is created. However, there is no UI to set a planned/future start time as shown in Figma. |

### Recommended List
**Should remain in "En cours"** -- 2 out of 5 criteria are fully met, 2 are partial, and 1 is not implemented. Significant work remains.

---

## Summary of Priorities

### Critical (Must fix for Figma alignment)
1. **G4-1**: Trip creation should be a bottom sheet overlay on the map, not a separate page
2. **G4-2**: Trip creation should use dark theme to match Figma
3. **G3-1**: Tab bar structure needs redesign (3 tabs vs 5)

### High (Important functional gaps)
4. **G4-3**: Add departure address input with "Utiliser ma position actuelle" button
5. **G4-4**: Add departure time selection with "Partir maintenant" option
6. **G4-5**: Display estimated arrival time (not just duration)
7. **G4-6**: Remove manual duration picker (use route-calculated duration)
8. **G4-7**: Implement transit route selection for public transport
9. **G4-8**: Redesign destination search as bottom sheet with saved/recent places
10. **G3-2**: Redesign home screen button layout (right-side floating buttons)
11. **G3-3**: Remove bottom sheet from home screen

### Medium (Visual/feature gaps)
12. **G4-10**: Add "Partager ma position" toggle
13. **G4-11**: Add "Notifications silencieuses" toggle
14. **G4-12**: Fix launch button styling and text
15. **G4-13**: Add footer warning text
16. **G4-9**: Redesign contact section to match Figma avatar style
17. **G3-4**: Remove greeting text from home screen
18. **G3-5**: Fix alert button appearance and positioning
19. **G3-6**: Fix active trip indicator style

### Low (Minor polish)
20. **G4-14**: Fix transport mode order and labels
21. **G4-15**: Fix screen title
22. **G4-16**: Add subtitle description
23. **G3-7**: Consider map style alignment
24. **G3-8**: Fix floating button icons
