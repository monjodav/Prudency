# Audit Report: Component Sets 5-7 -- Trip Active, Problems, Complete

**Date**: 2026-02-20
**Auditor**: CS5-7 Agent
**Scope**: Trip Active screen, Trip Problems dialogs, Trip Complete screen
**Files reviewed**: `app/(trip)/active.tsx`, `app/(trip)/complete.tsx`, and 12+ supporting components/hooks/services

---

## Component Set 5: Trip -- Actif (Itineraire actif)

### Figma Reference
- **Itineraire actif** (nodeId: 671:24987)
- **Prolonger mon trajet** (nodeId: 467:45993)

### Figma Design Summary

The Figma design shows the active trip screen as a **full-screen dark map** with:
1. A **top card** ("Trajet en cours / Ton trajet a demarre") with notification icon and close button
2. **Map** taking the full background with route polyline (blue/purple), departure marker, arrival marker
3. A **bottom navigation bar** with route info ("Via Bd Richard-Lenoir")
4. **Floating action buttons** on the right side (edit, share, contacts icons)
5. When expanded: a **bottom sheet** showing Destination, Contacts count, Temps ecoule/Temps restant with a **progress bar**, then 3 action buttons:
   - "Terminer le trajet" (primary, filled)
   - "Mettre en pause le trajet" (outlined)
   - "Prolonger le trajet" (outlined)
   - "Annuler le trajet" (red text link)
6. **Prolonger modal**: "Je souhaite prolonger mon trajet / Pour quelle raison?" with options: Retard de transport, Detour imprevu, Pause personnelle, Probleme technique, Autre raison
7. **Trip finished state**: header changes to "Trajet finis / Ton trajet est fini depuis 05m", "Terminer le trajet" becomes primary red/filled, progress bar at 100%

### Code Implementation Analysis

**File**: `app/(trip)/active.tsx` (315 lines)

### Visual/Layout Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **Background is white, not dark map** | HIGH | Code uses `backgroundColor: colors.white` (line 258). Figma shows a full-screen dark map as background with overlaid UI elements. |
| 2 | **Missing top status card design** | HIGH | Code uses `TripStatusIndicator` (a small badge/pill). Figma shows a full-width card with "Trajet en cours / Ton trajet a demarre" text, notification toggle icon, and close button. |
| 3 | **Map is embedded, not full-screen** | HIGH | `TripMap` is rendered inside a `ScrollView` with padding (line 146-158). Figma shows the map as the full background with overlay elements. |
| 4 | **Missing bottom navigation bar** | MEDIUM | Figma shows a bottom bar with route info ("Via Bd Richard-Lenoir") and direction icons. Code has no route info bar. |
| 5 | **Missing floating action buttons** | MEDIUM | Figma shows right-side floating buttons (edit, share, contacts). Code has a horizontal row of icons (Notes, Pause, Arrivee) at the bottom of a scroll view instead. |
| 6 | **Timer design differs** | MEDIUM | Code shows a centered timer with background pill. Figma shows Temps ecoule/Temps restant side-by-side with a horizontal progress bar. |
| 7 | **Missing "Annuler le trajet" link** | MEDIUM | Figma shows a red "Annuler le trajet" text link below the action buttons. Code has no cancel trip option on the active screen. |
| 8 | **Missing Contacts count display** | MEDIUM | Figma shows "Contacts: 2" next to destination. Code does not display the number of notified contacts. |
| 9 | **Missing destination display** | MEDIUM | Figma shows "Destination: Gare du nord" in the expanded sheet. Code does not display the destination name on the active screen. |
| 10 | **Prolonger modal options differ** | LOW | Figma: 5 reasons (Retard de transport, Detour imprevu, Pause personnelle, Probleme technique, Autre raison). Code uses `AnomalyDialog` with 10 options, which is richer but differs from the design. |
| 11 | **Missing progress bar** | MEDIUM | Figma shows a horizontal progress bar between elapsed/remaining time. Code's `TripTimer` only shows countdown text, no progress bar. |
| 12 | **Action buttons layout** | MEDIUM | Figma shows stacked full-width buttons in a bottom sheet. Code shows small icon+label items in a horizontal row. |

### Functional Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **No "Prolonger" modal with time picker** | HIGH | Figma shows a "Prolonger mon trajet" flow with reason selection then time update. Code navigates to AnomalyDialog (different purpose) but has no actual trip extension/duration update. |
| 2 | **No trip cancellation from active screen** | MEDIUM | Figma shows "Annuler le trajet" link. Code has `cancelTrip` in useTrip but no UI trigger on active screen. |
| 3 | **Missing route direction steps** | LOW | Figma shows route directions (turn-by-turn). Code fetches directions with `fetchDirections` but only uses the polyline, not the steps. |
| 4 | **No bottom sheet pattern** | MEDIUM | Figma uses a draggable bottom sheet for trip info. Code uses a simple ScrollView layout. |

---

## Component Set 6: Trip -- Problemes

### Figma Reference
- **J'ai un probleme sur mon trajet** (nodeId: 632:49950)

### Figma Design Summary

The Figma section shows multiple problem scenarios overlaid on the dark map:
1. **Route change detected**: Dialog "Changement de trajet detecte" with options to confirm the change, choose reasons
2. **Prolonged stop detected**: Dialog "Arret prolonge" with similar reason choices
3. **Delay detected during trip**: Dialog explaining the delay detection
4. **No response scenario**: Dialog with countdown asking if user is safe, with "Tout va bien" and alert trigger options
5. **Modify trip form**: Bottom sheet "Modifier mon trajet" allowing editing destination, time, etc.
6. **Update confirmation**: Loading spinner, then "Mise a jour effectuee"
7. **Notes/history page**: List of trip events and notes

### Code Implementation Analysis

**Components**: `AnomalyDialog.tsx`, `NoResponseDialog.tsx`, `useAnomalyDetection.ts`

### Visual/Layout Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **AnomalyDialog uses BottomSheet, Figma shows centered dialog** | MEDIUM | Figma shows a centered modal dialog. Code uses `BottomSheet` with `snapPoints={[0.75]}`. Style divergence but functional. |
| 2 | **Dialog titles differ per anomaly type** | MEDIUM | Figma shows different titles per anomaly type ("Changement de trajet detecte", "Arret prolonge", "Retard detecte"). Code shows one generic title "Que se passe-t-il?" for all. |
| 3 | **No context-specific description in anomaly dialog** | MEDIUM | Figma dialogs include explanatory text about what was detected. Code shows only the generic title. |
| 4 | **NoResponseDialog design differs** | MEDIUM | Figma shows "Es-tu en securite?" with a cleaner layout. Code has similar text but uses a standard Modal instead of the dark overlay shown in Figma. |
| 5 | **Missing "Modify trip" bottom sheet** | HIGH | Figma shows a "Modifier mon trajet" form (edit destination, duration, etc.). No such screen exists in code. |
| 6 | **Missing update loading/confirmation states** | MEDIUM | Figma shows loading spinner and "Mise a jour effectuee" confirmation. Code does not have these intermediate states. |

### Functional Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **No real-time route deviation detection** | HIGH | Figma implies detection of route changes in real-time. Code only detects overtime via `isOvertime` from `useActiveTrip`. No comparison of actual position vs. planned route. |
| 2 | **No prolonged stop detection** | HIGH | Figma shows "Arret prolonge" detection. Code has no speed/movement analysis to detect stops. |
| 3 | **No in-trip modification** | HIGH | Figma shows ability to modify trip (destination, duration) while active. Code has no modify/edit trip functionality during active trip. |
| 4 | **Anomaly reasons not sent to backend** | MEDIUM | `handleAnomalySelect` stores the reason in local state but does not persist it to Supabase or update the trip record. |
| 5 | **No configurable detection thresholds** | MEDIUM | Trello card #7 states "seuils de detection configurables selon le mode choisi". No threshold configuration exists. |
| 6 | **No push notification on anomaly detection** | MEDIUM | Trello card #8 requires "notification push envoyee des detection d'anomalie". Code only shows in-app dialogs, no push notification. |
| 7 | **No 2-minute response deadline** | MEDIUM | Trello card #8 states 2-minute response delay. Code uses `COUNTDOWN_SECONDS = 5 * 60` (5 minutes) in NoResponseDialog, and `NO_RESPONSE_DELAY_MS = 10 * 60 * 1000` (10 minutes) before showing the dialog. |

---

## Component Set 7: Trip -- Complete

### Figma Reference
- **Termine un trajet** (nodeId: 467:46238)

### Figma Design Summary

The Figma design shows 4 screens for trip completion:
1. **Timeout state**: Active trip card with "Trajet finis / Ton trajet est fini depuis 05m", red "Terminer le trajet" button, "Prolonger le trajet" button
2. **Arrival confirmation modal**: "Es-tu bien arrivee a destination?" with warning text: "Tu disposes de 15 minutes pour finaliser ton trajet. Passe ce delai, une alerte sera envoyee a ta personne de confiance." Two buttons: "Prolonger mon trajet" (primary) and "Terminer mon trajet" (outlined)
3. **Password validation screen**: "Trajet termine / Valide avec ton mot de passe" with password input field
4. **Success state**: Map with "Trajet termine / Trajet fini avec succes" toast notification

### Code Implementation Analysis

**File**: `app/(trip)/complete.tsx` (275 lines)

### Visual/Layout Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **No arrival confirmation modal** | HIGH | Figma shows "Es-tu bien arrivee a destination?" modal with 15-minute warning. Code goes directly to the complete screen. |
| 2 | **Password validation vs biometric** | HIGH | Figma shows password input field for validation ("Valide avec ton mot de passe"). Code uses biometric authentication via `useBiometric` hook. The Figma design expects password-based validation. |
| 3 | **Missing 15-minute countdown warning** | HIGH | Figma states "Tu disposes de 15 minutes pour finaliser ton trajet. Passe ce delai, une alerte sera envoyee." Code has no such countdown on the complete screen. |
| 4 | **Background is white, not dark** | MEDIUM | Figma shows a dark theme with map background. Code uses `backgroundColor: colors.white`. |
| 5 | **Success screen differs** | MEDIUM | Figma shows a simple toast notification "Trajet termine / Trajet fini avec succes" over the map. Code shows a full success screen with checkmark icon, summary card, and "Retour a l'accueil" button. |
| 6 | **Missing "Prolonger mon trajet" option on complete** | MEDIUM | Figma's arrival modal has "Prolonger mon trajet" as primary action. Code has no extend/prolong option on the complete screen. |
| 7 | **No re-prompt after 5 minutes** | MEDIUM | Trello card #3 states: "Si l'utilisatrice n'a pas repondu a la premiere demande, on renvoie une demande au bout de 5min par defaut (configurable)". Code has no re-prompt mechanism. |

### Functional Gaps

| # | Gap | Severity | Details |
|---|-----|----------|---------|
| 1 | **No arrival detection trigger** | HIGH | Trello card #3: "Arrive a destination, il faut demander instantanement a l'utilisateur si le trajet s'est bien passe". Code relies on user manually navigating to complete screen. No automatic arrival detection. |
| 2 | **No auto-alert after validation timeout** | HIGH | Trello card #3: "Si aucune validation apres delai de 5min par defaut, une alerte est declenchee". The `check-trip-timeout` Edge Function exists but uses `TIMEOUT_BUFFER_MINUTES` (from types), not the 15-minute deadline from Figma. |
| 3 | **No password-based validation** | MEDIUM | Figma clearly shows password input. Code only has biometric. Should support both (biometric when available, password fallback). |
| 4 | **"Signaler un probleme" navigates to home** | LOW | `handleReportIssue` (line 74-77) just resets and navigates home. Should navigate to a problem reporting flow. |
| 5 | **No notification to contacts on completion** | LOW | Trello card #3 mentions "[la personne de confiance recoit une notification de fin de trajet reussie][V2]" (marked V2, so acceptable to defer). |

---

## Trello Card Status Assessment

### Card #2: "Suivi GPS du trajet en cours" (Currently: Fonctionnalites)
**Criteria status**:
- [x] GPS active automatiquement au demarrage du trajet -- `useEffect` in active.tsx starts tracking
- [x] Position mise a jour en temps reel -- `useLocation` hook with `watchPositionAsync`
- [ ] Comparaison permanente position reelle vs itineraire prevu -- **NOT IMPLEMENTED** (only polyline drawn, no deviation check)
- [x] Batterie optimisee durant le suivi -- `Accuracy.Balanced`, 30s interval, 50m distance

**Recommendation**: Keep in **Fonctionnalites** -- route comparison is not implemented, blocking full completion.

### Card #3: "Confirmer que je suis bien arrivee" (Currently: Fonctionnalites)
**Criteria status**:
- [ ] A l'arrivee, l'application demande une confirmation -- **NOT IMPLEMENTED** (no automatic detection of arrival)
- [x] L'utilisatrice peut valider que tout va bien -- `handleConfirmArrival` exists
- [x] L'utilisatrice peut signaler un probleme -- "Signaler un probleme" button exists (but weak implementation)
- [ ] Si aucune validation apres delai, alerte declenchee -- **PARTIAL** (Edge Function exists but not triggered from complete screen)
- [ ] Demande instantanee a l'arrivee -- **NOT IMPLEMENTED**
- [ ] Re-prompt after 5min -- **NOT IMPLEMENTED**
- [ ] Auto-alert if no validation after timeout -- **PARTIAL**

**Recommendation**: Keep in **Fonctionnalites** -- multiple core criteria unmet.

### Card #7: "Identification automatique des comportements inhabituels" (Currently: En cours)
**Criteria status**:
- [ ] Detection detour significatif de l'itineraire -- **NOT IMPLEMENTED** (no route comparison logic)
- [x] Detection retard important sur heure d'arrivee estimee -- `isOvertime` in `useActiveTrip` detects when past estimated arrival
- [ ] Seuils de detection configurables selon le mode choisi -- **NOT IMPLEMENTED**
- [ ] Recalcul itineraire a valider / message encourageant notes -- **NOT IMPLEMENTED**

**Recommendation**: Keep in **En cours** -- only overtime detection is implemented, route deviation and configurable thresholds are missing.

### Card #8: "Etre alertee en cas de detection d'anomalie" (Currently: Fonctionnalites)
**Criteria status**:
- [ ] Notification push envoyee des detection d'anomalie -- **NOT IMPLEMENTED** (only in-app dialog)
- [ ] Notification explique clairement l'anomalie detectee -- **PARTIAL** (generic "Que se passe-t-il?" title)
- [x] Utilisatrice peut repondre "Tout va bien" ou "Alerte" -- Both options in `NoResponseDialog`
- [ ] Delai de reponse defini (ex: 2 minutes) -- **WRONG VALUE** (5 minutes in code vs 2 minutes specified)
- [x] Si pas de reponse, alerte automatiquement declenchee -- `onAutoAlert` called when countdown reaches 0

**Recommendation**: Keep in **Fonctionnalites** -- push notification not implemented, response delay incorrect.

### Card #42: "Validation securisee du Trajet" (Currently: Fonctionnalites)
**Criteria status**:
- [x] Validation biometrique implementee -- `useBiometric` hook used in complete.tsx
- [ ] Password-based validation -- **NOT IMPLEMENTED** (Figma shows password input, code only has biometric)

**Recommendation**: Keep in **Fonctionnalites** -- password fallback not implemented, and this is labeled Premium.

---

## Summary of Critical Gaps

### Architecture Issues
1. **Screen layout fundamentally different**: Code uses white ScrollView pattern; Figma uses full-screen dark map with overlays and bottom sheets
2. **No trip modification during active trip**: A core Figma flow (modify destination/duration) is entirely missing
3. **No arrival detection**: The app relies on manual user action, not GPS proximity detection

### Priority Fixes (Recommended Order)
1. **P0**: Redesign active.tsx to use full-screen map with bottom sheet overlay (matches Figma pattern)
2. **P0**: Implement arrival detection using GPS proximity to destination
3. **P0**: Add trip extension ("Prolonger") flow with duration update
4. **P0**: Add arrival confirmation modal with 15-minute countdown and auto-alert
5. **P1**: Implement route deviation detection (compare position vs polyline)
6. **P1**: Add "Modifier mon trajet" bottom sheet for in-trip editing
7. **P1**: Support password-based trip validation as fallback to biometric
8. **P1**: Add context-specific anomaly dialog titles and descriptions
9. **P2**: Add push notifications for anomaly detection
10. **P2**: Make detection thresholds configurable
11. **P2**: Add bottom navigation bar with route info
12. **P2**: Add floating action buttons on map

### Files Requiring Changes
- `app/(trip)/active.tsx` -- Major redesign needed
- `app/(trip)/complete.tsx` -- Add arrival confirmation modal, password validation, countdown
- `src/components/trip/AnomalyDialog.tsx` -- Context-specific titles
- `src/components/trip/NoResponseDialog.tsx` -- Fix countdown to 2 minutes
- `src/hooks/useAnomalyDetection.ts` -- Add route deviation and stop detection
- `src/hooks/useActiveTrip.ts` -- Add arrival proximity detection
- `src/services/tripService.ts` -- Add `extendTrip` and `modifyTrip` functions
- **NEW**: `app/(trip)/extend.tsx` or extend modal component
- **NEW**: `src/components/trip/ArrivalConfirmation.tsx`
- **NEW**: `src/hooks/useRouteDeviation.ts`
