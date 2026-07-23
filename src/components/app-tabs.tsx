import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { ThemedText } from './themed-text';
import { Colors, Spacing } from '@/constants/theme';

export default function AppTabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabBarInner}>
        
        {/* Hub Tab */}
        <TabButton 
          icon="home" 
          label="Hub" 
          isFocused={state.index === 0} 
          onPress={() => navigation.navigate('index')} 
        />

        {/* Learn Tab */}
        <TabButton 
          icon="book" 
          label="Learn" 
          isFocused={state.index === 1} // Assuming index 1
          onPress={() => navigation.navigate('learn')} 
        />

        {/* Center Glowing Code Button */}
        <Pressable 
          style={styles.centerButtonWrapper}
          onPress={() => router.push('/arena')}
        >
          <View style={styles.centerButtonGlow}>
            <FontAwesome5 name="code" size={24} color="#000000" />
          </View>
          <ThemedText style={styles.centerButtonLabel}>Arena</ThemedText>
        </Pressable>

        {/* Leaderboard Tab */}
        <TabButton 
          icon="trophy" 
          label="Rank" 
          isFocused={state.index === 2} // Assuming index 2
          onPress={() => navigation.navigate('leaderboard')} 
        />

        {/* Stats Tab */}
        <TabButton 
          icon="bar-chart" 
          label="Stats" 
          isFocused={state.index === 3} 
          onPress={() => navigation.navigate('explore')} 
        />

      </View>
    </View>
  );
}

function TabButton({ isFocused, icon, label, onPress }: { isFocused: boolean, icon: string, label: string, onPress: () => void }) {
  const color = isFocused ? Colors.dark.primary : Colors.dark.textSecondary;
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <FontAwesome name={icon as any} size={22} color={color} style={{ marginBottom: 4 }} />
      <ThemedText style={[styles.tabLabel, { color }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -35,
  },
  centerButtonGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 4,
  },
  centerButtonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DDDDDD',
  }
});
