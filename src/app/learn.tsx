import React from 'react';
import { StyleSheet, ScrollView, View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing, Colors } from '@/constants/theme';

export default function LearnScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const router = useRouter();

  const mockCurriculum = [
    { id: '1', title: 'Data Structures 101', type: 'THEORY', xp: 20, completed: true },
    { id: '2', title: 'Big O Notation', type: 'THEORY', xp: 20, completed: true },
    { id: '3', title: 'Arrays & Strings', type: 'QUIZ', xp: 50, completed: false },
    { id: '4', title: 'Two Pointers Technique', type: 'THEORY', xp: 20, completed: false },
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
          <ThemedText type="subtitle" style={styles.title}>> CURRICULUM_SYS</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>Initialize learning sequence...</ThemedText>
        </View>

        <View style={styles.courseSelect}>
          <ThemedText style={styles.courseLabel}>CURRENT MODULE:</ThemedText>
          <View style={styles.courseDropdown}>
            <ThemedText style={styles.courseDropdownText}>[ ALGORITHMS & DATA STRUCTS ]</ThemedText>
            <FontAwesome5 name="caret-down" size={16} color={Colors.dark.primary} />
          </View>
        </View>

        <View style={styles.timeline}>
          {mockCurriculum.map((lesson, index) => (
            <View key={lesson.id} style={styles.timelineNode}>
              <View style={styles.nodeLeft}>
                <View style={[styles.circle, lesson.completed && styles.circleCompleted]}>
                  {lesson.completed && <FontAwesome5 name="check" size={12} color="#000" />}
                </View>
                {index !== mockCurriculum.length - 1 && (
                  <View style={[styles.line, lesson.completed && styles.lineCompleted]} />
                )}
              </View>
              
              <Pressable 
                style={[styles.lessonCard, lesson.completed && styles.lessonCardCompleted]}
                onPress={() => router.push(`/quiz?category=algorithms`)}
              >
                <View style={styles.lessonHeader}>
                  <ThemedText style={[styles.lessonType, lesson.completed && styles.textCompleted]}>
                    {lesson.type}
                  </ThemedText>
                  <ThemedText style={[styles.lessonXp, lesson.completed && styles.textCompleted]}>
                    +{lesson.xp} XP
                  </ThemedText>
                </View>
                <ThemedText type="subtitle" style={[styles.lessonTitle, lesson.completed && styles.textCompleted]}>
                  {lesson.title}
                </ThemedText>
              </Pressable>
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
  
  courseSelect: { gap: Spacing.one },
  courseLabel: { fontFamily: 'VT323_400Regular', color: Colors.dark.textSecondary, fontSize: 16 },
  courseDropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.three, borderWidth: 1, borderColor: Colors.dark.primary, backgroundColor: '#111',
  },
  courseDropdownText: { fontFamily: 'VT323_400Regular', color: Colors.dark.primary, fontSize: 18, letterSpacing: 1 },

  timeline: { marginTop: Spacing.two, gap: 0 },
  timelineNode: { flexDirection: 'row', gap: Spacing.three },
  nodeLeft: { alignItems: 'center', width: 30 },
  circle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#333',
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', zIndex: 2
  },
  circleCompleted: { borderColor: Colors.dark.primary, backgroundColor: Colors.dark.primary },
  line: { width: 2, flex: 1, backgroundColor: '#333', marginTop: -4, marginBottom: -4, zIndex: 1 },
  lineCompleted: { backgroundColor: Colors.dark.primary },
  
  lessonCard: {
    flex: 1, padding: Spacing.three, borderWidth: 1, borderColor: '#333',
    backgroundColor: '#151515', marginBottom: Spacing.four,
  },
  lessonCardCompleted: { borderColor: Colors.dark.primary, backgroundColor: '#112211' },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.one },
  lessonType: { fontFamily: 'VT323_400Regular', color: Colors.dark.textSecondary, letterSpacing: 1 },
  lessonXp: { fontFamily: 'VT323_400Regular', color: '#F59E0B' }, // amber
  lessonTitle: { fontFamily: 'VT323_400Regular', fontSize: 20, color: '#FFFFFF' },
  textCompleted: { color: Colors.dark.primary, opacity: 0.8 },
});
