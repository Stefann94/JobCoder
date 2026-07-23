import React from 'react';
import { StyleSheet, ScrollView, View, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, Colors } from '@/constants/theme';

export default function ArenaScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scrollView}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, Platform.select({ web: { paddingTop: 80, paddingBottom: 80 } })]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.container}>
        
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>> THE_ARENA</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>Select your combat protocol...</ThemedText>
        </View>

        <View style={styles.modesContainer}>
          
          {/* Code Challenge Mode (New LeetCode style) */}
          <Pressable style={[styles.modeCard, styles.codeCard]}>
            <View style={styles.modeIconBox}>
              <FontAwesome5 name="code" size={32} color={Colors.dark.primary} />
            </View>
            <View style={styles.modeContent}>
              <ThemedText style={styles.modeTitle}>CODE CHALLENGES</ThemedText>
              <ThemedText style={styles.modeDesc}>Write real code. Pass the tests. Earn massive XP.</ThemedText>
            </View>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>HARDCORE</ThemedText>
            </View>
          </Pressable>

          {/* Quick Mock Interview */}
          <Pressable style={styles.modeCard} onPress={() => router.push('/quiz?category=mock')}>
            <View style={styles.modeIconBox}>
              <FontAwesome5 name="stopwatch" size={32} color="#FBBF24" />
            </View>
            <View style={styles.modeContent}>
              <ThemedText style={[styles.modeTitle, { color: '#FBBF24' }]}>MOCK INTERVIEW</ThemedText>
              <ThemedText style={styles.modeDesc}>10 random multiple choice questions. Fast paced.</ThemedText>
            </View>
          </Pressable>

          {/* Boss Fights */}
          <Pressable style={[styles.modeCard, styles.bossCard]}>
            <View style={styles.modeIconBox}>
              <FontAwesome5 name="skull" size={32} color={Colors.dark.danger} />
            </View>
            <View style={styles.modeContent}>
              <ThemedText style={[styles.modeTitle, { color: Colors.dark.danger }]}>BOSS FIGHTS</ThemedText>
              <ThemedText style={styles.modeDesc}>Face specific company interview simulations.</ThemedText>
            </View>
            <FontAwesome name="lock" size={24} color="#333" style={styles.lockIcon} />
          </Pressable>

        </View>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: Colors.dark.background },
  contentContainer: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: Spacing.three },
  container: { maxWidth: MaxContentWidth, flexGrow: 1, gap: Spacing.four, width: '100%' },
  header: { gap: Spacing.half, marginTop: Spacing.two, borderBottomWidth: 1, borderBottomColor: '#333333', paddingBottom: Spacing.two },
  title: { fontFamily: 'VT323_400Regular', fontSize: 24, letterSpacing: 2, color: Colors.dark.primary },
  subtitle: { fontFamily: 'VT323_400Regular', opacity: 0.7, fontSize: 16, color: Colors.dark.textSecondary },
  
  modesContainer: {
    gap: Spacing.three,
  },
  modeCard: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  codeCard: {
    borderColor: Colors.dark.primary,
    backgroundColor: '#112211',
  },
  bossCard: {
    borderColor: '#3A1A1A',
    opacity: 0.8,
  },
  modeIconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222',
  },
  modeContent: {
    flex: 1,
    gap: Spacing.one,
  },
  modeTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  modeDesc: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#888888',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: -25,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 25,
    paddingVertical: 2,
    transform: [{ rotate: '45deg' }],
  },
  badgeText: {
    fontFamily: 'VT323_400Regular',
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockIcon: {
    position: 'absolute',
    right: Spacing.four,
  }
});
