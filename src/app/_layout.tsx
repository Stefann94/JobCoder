import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import OnboardingScreen from '@/components/onboarding-screen';
import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProgressProvider } from '@/providers/ProgressProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@jobcoder_onboarding_done';

export default function TabLayout() {
  const [loaded] = useFonts({
    VT323_400Regular,
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProgressProvider>
          {showOnboarding ? (
            <>
              <AnimatedSplashOverlay />
              <OnboardingScreen onComplete={handleOnboardingComplete} />
            </>
          ) : (
            <>
              <AnimatedSplashOverlay />
              <Tabs 
                screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.dark.background } }}
                tabBar={(props) => <AppTabs {...props} />}
              >
                <Tabs.Screen name="index" />
                <Tabs.Screen name="explore" />
              </Tabs>
            </>
          )}
        </ProgressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
