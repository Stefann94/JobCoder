import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import OnboardingScreen from '@/components/onboarding-screen';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ProgressProvider } from '@/providers/ProgressProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.dark.primary} size="large" />
      </View>
    );
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
