import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlobalLoading } from '@/components/global-loading';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { fetchCategories, Category, fetchDailyQuests, DailyQuest, fetchBossFights, BossFight } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useProgress } from '@/providers/ProgressProvider';
import AvatarRenderer from '@/components/avatar-renderer';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const { progress } = useProgress();
  const [categories, setCategories] = useState<Category[]>([]);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [bosses, setBosses] = useState<BossFight[]>([]);
  const [loading, setLoading] = useState(true);
  
  const scrollViewRef = useRef<any>(null);
  const navigation = useNavigation();

  const webPadding = Platform.select({ web: { paddingTop: 80 }, default: {} });

  useEffect(() => {
    // @ts-ignore - navigation types don't include tabPress by default
    const unsubscribe = navigation.addListener('tabPress', (e: any) => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    });
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {
    async function loadData() {
      const data = await fetchCategories();
      setCategories(data);
      const questsData = await fetchDailyQuests();
      setQuests(questsData);
      const bossesData = await fetchBossFights();
      setBosses(bossesData);
      setLoading(false);
    }
    loadData();
  }, []);

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.group_name || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  const handleStartMock = () => {
    router.push({
      pathname: '/quiz',
      params: { category: 'mock' }
    });
  };

  const handleStartQuiz = (categoryId: string) => {
    router.push({
      pathname: '/quiz',
      params: { category: categoryId }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, webPadding]}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.userInfo} onPress={() => router.push('/profile')}>
              <View style={styles.avatarContainer}>
                <AvatarRenderer avatarUrl={profile?.avatar_url} size={28} />
              </View>
              <View>
                <ThemedText style={styles.username}>
                  {profile?.username || user?.email?.split('@')[0].toUpperCase() || 'HACKER'}
                </ThemedText>
                <ThemedText style={styles.levelText}>
                  {profile?.title || 'Lvl 1 Hacker'}
                </ThemedText>
              </View>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.four }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#333' }}>
                <FontAwesome5 name="star" solid size={10} color={Colors.dark.primary} style={{ marginRight: 6 }} />
                <ThemedText style={{ fontFamily: 'VT323_400Regular', color: Colors.dark.primary, fontSize: 16 }}>
                  LVL {profile?.level || 1}
                </ThemedText>
              </View>
              <Pressable>
                <FontAwesome name="bell" size={22} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Daily Quest Card */}
          {(() => {
            const userLevel = profile?.level || 1;
            const todayDate = new Date().toISOString().split('T')[0];
            const isCompletedToday = profile?.last_daily_quest_at === todayDate;
            const isLocked = userLevel < 3;
            
            return (
              <View style={[styles.questCard, (isLocked || isCompletedToday) && { borderColor: '#333' }]}>
                <FontAwesome5 
                  name={isCompletedToday ? "check-circle" : (isLocked ? "lock" : "skull")} 
                  size={100} 
                  color="#222" 
                  style={styles.questWatermark} 
                />
                
                <View style={styles.questHeader}>
                  <FontAwesome 
                    name={isCompletedToday ? "check" : (isLocked ? "lock" : "warning")} 
                    size={16} 
                    color={isCompletedToday ? Colors.dark.primary : (isLocked ? "#FFF" : Colors.dark.warning)} 
                  />
                  <ThemedText style={[styles.questTitle, isCompletedToday && { color: Colors.dark.primary }]}>
                    DAILY ARENA
                  </ThemedText>
                </View>
                <ThemedText style={styles.questDescription}>
                  {isCompletedToday 
                    ? "You have already claimed today's reward! Come back tomorrow for a new challenge."
                    : isLocked 
                      ? "Reach Level 3 to unlock the Daily Arena. You must learn the fundamentals first!"
                      : "Survive 10 random technical questions from all the concepts you have learned so far."}
                </ThemedText>
                
                <View style={styles.questFooter}>
                  <ThemedText style={styles.questReward}>
                    Reward: {isCompletedToday ? "CLAIMED" : "+150 EXP"}
                  </ThemedText>
                  
                  {!isCompletedToday && !isLocked && (
                    <Pressable onPress={() => handleStartQuiz('daily_mix')} style={styles.questButton}>
                      <ThemedText style={styles.questButtonText}>ENTER ARENA</ThemedText>
                    </Pressable>
                  )}
                  {isLocked && (
                    <View style={[styles.questButton, { backgroundColor: '#333' }]}>
                      <ThemedText style={[styles.questButtonText, { color: '#888' }]}>LOCKED</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            );
          })()}

          {/* Skill Trees Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>SKILL TREES</ThemedText>
            
            {loading ? (
              <GlobalLoading message="FETCHING CLOUD" transparentBackground />
            ) : (
              Object.entries(groupedCategories).map(([groupName, groupCats]) => (
                <View key={groupName} style={{ marginBottom: Spacing.four, gap: Spacing.three }}>
                  <ThemedText style={styles.sectionSubtitle}>{groupName.toUpperCase()}</ThemedText>
                  {groupCats.map(category => {
                    const levelProg = progress[category.id]?.level_progress || {};
                    let computedLevel = 1;
                    while (levelProg[computedLevel.toString()] >= 80) {
                      computedLevel++;
                    }
                    if (computedLevel > 5) computedLevel = 5; // Max level 5
                    
                    const catLevel = computedLevel;
                    // Calculate visual progress based on completed levels (each level is 20%)
                    const catProgress = (computedLevel - 1) * 20 + (levelProg[computedLevel.toString()] || 0) * 0.2;
                    
                    return (
                      <Pressable key={category.id} onPress={() => handleStartQuiz(category.id)}>
                        {({ pressed }) => (
                          <View style={[styles.skillCard, pressed && styles.pressed]}>
                            <View style={styles.skillIconBox}>
                              <FontAwesome5 name={category.icon as any} size={20} color={category.color} />
                            </View>
                            <View style={styles.skillContent}>
                              <View style={styles.skillHeaderRow}>
                                <ThemedText style={styles.skillTitle}>{category.title}</ThemedText>
                                <ThemedText style={styles.skillLevel}>Lvl {catLevel}/5</ThemedText>
                              </View>
                              <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${catProgress}%` }]} />
                              </View>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={Colors.dark.textSecondary} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
          </View>

          {/* Upcoming Boss Fights */}
          {bosses.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: Colors.dark.danger }]}>
                UPCOMING BOSS FIGHTS
              </ThemedText>
              
              {bosses.map((boss) => {
                const userLevel = profile?.level || 1;
                const isLocked = userLevel < 4;

                const todayStr = new Date().toISOString().split('T')[0];
                let attemptsLeft = 2;
                if (profile?.last_boss_fight_at === todayStr) {
                   attemptsLeft = 2 - (profile?.boss_attempts || 0);
                }
                if (attemptsLeft < 0) attemptsLeft = 0;

                return (
                  <Pressable key={boss.id} onPress={() => !isLocked && router.push({ pathname: '/boss/[id]', params: { id: boss.id } })}>
                    {({ pressed }) => (
                      <View style={[styles.bossCard, pressed && !isLocked && styles.pressed, isLocked && { opacity: 0.6, borderColor: '#333' }]}>
                        <View style={[styles.bossIconBox, isLocked && { borderColor: '#555' }]}>
                          <ThemedText style={[styles.bossIconText, isLocked && { color: '#555' }]}>
                            {isLocked ? <FontAwesome name="lock" size={16} /> : boss.title.charAt(0)}
                          </ThemedText>
                        </View>
                        <View style={styles.bossContent}>
                          <ThemedText style={[styles.bossTitle, isLocked && { color: '#888' }]}>{boss.title}</ThemedText>
                          <ThemedText style={styles.bossSubtitle}>
                            {isLocked ? "Unlocks at Level 4" : boss.company_name}
                          </ThemedText>
                        </View>
                        {!isLocked && (
                          <View style={{ flexDirection: 'row', gap: 4, marginRight: 12 }}>
                            <FontAwesome5 name="heart" solid={attemptsLeft > 0} size={14} color={attemptsLeft > 0 ? '#EF4444' : '#444'} />
                            <FontAwesome5 name="heart" solid={attemptsLeft > 1} size={14} color={attemptsLeft > 1 ? '#EF4444' : '#444'} />
                          </View>
                        )}
                        <ThemedText style={[styles.bossDangerText, isLocked && { color: '#555' }]}>
                          {isLocked ? "LOCKED" : "DANGER"}
                        </ThemedText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: 100, // Make room for floating code button
    gap: Spacing.five,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.danger,
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  username: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.primary,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  levelText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  
  // Quest Card
  questCard: {
    backgroundColor: '#1C1C1C',
    borderWidth: 2,
    borderColor: '#2A4A33', // Subtle green border
    padding: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  questWatermark: {
    position: 'absolute',
    right: -10,
    top: 10,
    opacity: 0.3,
    transform: [{ rotate: '15deg' }],
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  questTitle: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.primary,
    fontSize: 24,
    letterSpacing: 2,
  },
  questDescription: {
    fontSize: 15,
    color: '#DDDDDD',
    marginBottom: Spacing.four,
    maxWidth: '80%',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  questReward: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  questButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  questButtonText: {
    fontFamily: 'VT323_400Regular',
    color: '#000000',
    fontSize: 18,
    letterSpacing: 1,
  },

  // Sections
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: 'VT323_400Regular',
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 2,
    marginBottom: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: Spacing.two,
  },
  sectionSubtitle: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.textSecondary,
    fontSize: 18,
    letterSpacing: 1,
  },

  // Skill Trees
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  skillIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  skillContent: {
    flex: 1,
    gap: 6,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#DDDDDD',
    letterSpacing: 1,
  },
  skillLevel: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    // Note: React Native doesn't support diagonal stripes natively without SVGs,
    // so we use a solid neon green which fits the retro vibe well.
  },

  // Boss Fights
  bossCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#3A1A1A',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  bossIconBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.dark.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bossIconText: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.danger,
    fontSize: 24,
  },
  bossContent: {
    flex: 1,
    gap: 4,
  },
  bossTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.dark.danger,
    letterSpacing: 1,
  },
  bossSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  bossDangerText: {
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.danger,
    fontSize: 20,
    letterSpacing: 2,
  },
});
