import {
  useFonts as useExpoFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Montserrat_200ExtraLight,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { Kalam_400Regular } from '@expo-google-fonts/kalam';

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    // Inter (primary font)
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Montserrat (logo font)
    Montserrat_200ExtraLight,
    Montserrat_400Regular,
    Montserrat_700Bold,
    // Kalam (handwritten accent font)
    Kalam_400Regular,
  });

  return { fontsLoaded, fontError };
}
