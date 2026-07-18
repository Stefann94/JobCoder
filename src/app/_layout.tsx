import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

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
  );
}
