import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type MapTheme = 'auto' | 'light' | 'dark';

const MAP_THEME_KEY = 'map_theme';

interface PreferencesState {
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  loadPreferences: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  mapTheme: 'auto',

  setMapTheme: (theme) => {
    set({ mapTheme: theme });
    SecureStore.setItemAsync(MAP_THEME_KEY, theme);
  },

  loadPreferences: async () => {
    const stored = await SecureStore.getItemAsync(MAP_THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      set({ mapTheme: stored });
    }
  },
}));
