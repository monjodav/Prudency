/** Dark map style for Google Maps — shared across all map instances. */
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a3e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#333350' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e0e1a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1e1e30' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

/**
 * Dimmed light map — mix between light and dark mode.
 * Uses lightness/saturation adjustments on the default light map
 * so the original structure (roads, buildings, parks) stays visible.
 */
export const DIMMED_LIGHT_MAP_STYLE = [
  // Darken everything globally
  { elementType: 'geometry', stylers: [{ lightness: -45 }, { saturation: -20 }] },
  // Keep labels readable
  { elementType: 'labels.text.fill', stylers: [{ lightness: -20 }] },
  { elementType: 'labels.text.stroke', stylers: [{ lightness: -50 }] },
  // Roads — less darkened so they stand out
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ lightness: -30 }, { saturation: -15 }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ lightness: -10 }],
  },
  // Highways — even more visible
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ lightness: -25 }, { saturation: -10 }],
  },
  // Water — darker but keep blue tint
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ lightness: -55 }, { saturation: -10 }],
  },
  // POI — hidden labels
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Parks — keep green tint
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ lightness: -40 }, { saturation: -10 }],
  },
];
