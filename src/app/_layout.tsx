import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import OnboardingScreen from '@/components/onboarding-screen';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ProgressProvider } from '@/providers/ProgressProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalLoading } from '@/components/global-loading';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <GlobalLoading message="SYSTEM INIT" transparentBackground={false} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <AnimatedSplashOverlay />
        <OnboardingScreen onComplete={() => {}} />
      </>
    );
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <Tabs 
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.dark.background } }}
        // @ts-expect-error type mismatch between Expo Router and react-navigation
        tabBar={(props) => <AppTabs {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="learn" />
        <Tabs.Screen name="leaderboard" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="arena" />
      </Tabs>
    </>
  );
}

export default function TabLayout() {
  const [loaded] = useFonts({
    VT323_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProgressProvider>
          <RootLayoutNav />
        </ProgressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
