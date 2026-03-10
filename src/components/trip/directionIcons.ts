import type { MaterialIcons } from '@expo/vector-icons';
import type { RouteStep } from '@/src/services/directionsService';

export interface StepIconInfo {
  name: keyof typeof MaterialIcons.glyphMap;
  roundaboutExit?: number;
}

const EXIT_REGEX = /(\d+)(?:re|e|ère|ème)?\s*sortie/i;
const EXIT_REGEX_EN = /(?:take the |exit )?(\d+)(?:st|nd|rd|th)\s*exit/i;

function parseRoundaboutExit(instruction?: string): number | undefined {
  if (!instruction) return undefined;
  const match = instruction.match(EXIT_REGEX) ?? instruction.match(EXIT_REGEX_EN);
  if (match?.[1]) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 9) return n;
  }
  return undefined;
}

/** Direct mapping from Google maneuver string to MaterialIcons name */
function getManeuverIcon(maneuver: string): keyof typeof MaterialIcons.glyphMap {
  switch (maneuver) {
    case 'turn-left': return 'turn-left';
    case 'turn-right': return 'turn-right';
    case 'turn-slight-left': return 'turn-slight-left';
    case 'turn-slight-right': return 'turn-slight-right';
    case 'turn-sharp-left': return 'turn-sharp-left';
    case 'turn-sharp-right': return 'turn-sharp-right';
    case 'uturn-left': return 'u-turn-left';
    case 'uturn-right': return 'u-turn-right';
    case 'roundabout-left': return 'roundabout-left';
    case 'roundabout-right': return 'roundabout-right';
    case 'merge': return 'merge';
    case 'fork-left': return 'fork-left';
    case 'fork-right': return 'fork-right';
    case 'ramp-left': return 'ramp-left';
    case 'ramp-right': return 'ramp-right';
    case 'keep-left': return 'turn-slight-left';
    case 'keep-right': return 'turn-slight-right';
    case 'straight': return 'straight';
    default: return 'straight';
  }
}

export function getStepIconInfo(step: RouteStep): StepIconInfo {
  if (step.travelMode === 'TRANSIT') return { name: 'directions-transit' };
  if (step.travelMode === 'BICYCLING') return { name: 'directions-bike' };

  if (step.maneuver === 'roundabout-left' || step.maneuver === 'roundabout-right') {
    return {
      name: getManeuverIcon(step.maneuver),
      roundaboutExit: parseRoundaboutExit(step.instruction),
    };
  }

  if (step.maneuver) return { name: getManeuverIcon(step.maneuver) };
  if (step.travelMode === 'WALKING') return { name: 'directions-walk' };
  return { name: 'straight' };
}

export function getStepIcon(step: RouteStep): keyof typeof MaterialIcons.glyphMap {
  return getStepIconInfo(step).name;
}

/** Format meters: < 1000m → rounded to 10 ("330 m"), >= 1000m → "1,2 km" */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10;
    return `${Math.max(rounded, 10)} m`;
  }
  const km = meters / 1000;
  return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1).replace('.', ',')} km`;
}
