import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'recent_places';
const MAX_RECENT = 10;

export interface RecentPlace {
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface RecentPlacesState {
  places: RecentPlace[];
  addPlace: (place: Omit<RecentPlace, 'timestamp'>) => void;
  loadPlaces: () => Promise<void>;
}

export const useRecentPlacesStore = create<RecentPlacesState>((set, get) => ({
  places: [],

  addPlace: (place) => {
    const existing = get().places;
    const key = `${place.lat.toFixed(5)},${place.lng.toFixed(5)}`;

    // Remove duplicate if same coordinates
    const filtered = existing.filter(
      (p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}` !== key,
    );

    const updated = [
      { ...place, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT);

    set({ places: updated });
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
  },

  loadPlaces: async () => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as RecentPlace[];
      if (Array.isArray(parsed)) {
        set({ places: parsed.slice(0, MAX_RECENT) });
      }
    } catch {
      // Corrupted data — ignore
    }
  },
}));
