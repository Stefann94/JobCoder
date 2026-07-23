import React from 'react';
import { StyleSheet, ScrollView, View, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function LeaderboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const { profile } = useAuth();

  const mockUsers = [
    { rank: 1, name: 'ZER0_COOL', xp: 9500, title: 'CTO', isCurrentUser: false },
    { rank: 2, name: 'CRASH_OVERRIDE', xp: 8200, title: 'Principal Architect', isCurrentUser: false },
    { rank: 3, name: 'ACID_BURN', xp: 7500, title: 'Staff Engineer', isCurrentUser: false },
    { rank: 4, name: 'CEREAL_KILLER', xp: 6100, title: 'Senior Engineer', isCurrentUser: false },
    { rank: 5, name: profile?.username || 'HACKER_1337', xp: profile?.xp || 420, title: profile?.title || 'Intern', isCurrentUser: true },
    { rank: 6, name: 'PHANTOM_PHREAK', xp: 300, title: 'Intern', isCurrentUser: false },
    { rank: 7, name: 'LORD_NIKON', xp: 150, title: 'Intern', isCurrentUser: false },
  ];

  return (
    <ScrollView
      style={styles.scrollView}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, Platform.select({ web: { paddingTop: 80, paddingBottom: 80 } })]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.container}>
        
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>{'>'} GLOBAL_RANKINGS</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>Fetching top operatives from mainframe...</ThemedText>
        </View>

        <View style={styles.tableHeader}>
          <ThemedText style={[styles.colRank, styles.headerText]}>#</ThemedText>
          <ThemedText style={[styles.colName, styles.headerText]}>OPERATIVE</ThemedText>
          <ThemedText style={[styles.colXp, styles.headerText]}>XP</ThemedText>
        </View>

        <View style={styles.leaderboardList}>
          {mockUsers.map((user) => (
            <View 
              key={user.rank} 
              style={[
                styles.userRow, 
                user.isCurrentUser && styles.currentUserRow
              ]}
            >
              <View style={styles.colRank}>
                {user.rank <= 3 ? (
                  <FontAwesome5 
                    name="trophy" 
                    size={16} 
                    color={user.rank === 1 ? '#FBBF24' : user.rank === 2 ? '#9CA3AF' : '#B45309'} 
                  />
                ) : (
                  <ThemedText style={[styles.rankText, user.isCurrentUser && styles.currentText]}>
                    {user.rank}
                  </ThemedText>
                )}
              </View>
              
              <View style={styles.colName}>
                <ThemedText style={[styles.nameText, user.isCurrentUser && styles.currentText]}>
                  {user.name}
                </ThemedText>
                <ThemedText style={[styles.titleText, user.isCurrentUser && styles.currentTitleText]}>
                  {user.title}
                </ThemedText>
              </View>

              <View style={styles.colXp}>
                <ThemedText style={[styles.xpText, user.isCurrentUser && styles.currentText]}>
                  {user.xp}
                </ThemedText>
              </View>
            </View>
          ))}
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
  
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: { fontFamily: 'VT323_400Regular', color: Colors.dark.textSecondary, letterSpacing: 1 },
  
  leaderboardList: {
    gap: Spacing.one,
  },
  userRow: {
    flexDirection: 'row',
    padding: Spacing.three,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
  },
  currentUserRow: {
    backgroundColor: '#112211',
    borderColor: Colors.dark.primary,
  },
  
  colRank: { width: 40, alignItems: 'center', justifyContent: 'center' },
  colName: { flex: 1, justifyContent: 'center' },
  colXp: { width: 60, alignItems: 'flex-end', justifyContent: 'center' },

  rankText: { fontFamily: 'VT323_400Regular', fontSize: 18, color: '#888' },
  nameText: { fontFamily: 'VT323_400Regular', fontSize: 20, color: '#DDD', letterSpacing: 1 },
  titleText: { fontFamily: 'VT323_400Regular', fontSize: 14, color: '#666' },
  xpText: { fontFamily: 'VT323_400Regular', fontSize: 18, color: Colors.dark.primary },

  currentText: { color: Colors.dark.primary },
  currentTitleText: { color: Colors.dark.primary, opacity: 0.7 },
});
