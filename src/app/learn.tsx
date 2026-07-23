import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Platform, LayoutAnimation, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Colors } from '@/constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FileItem = { id: string; title: string; type: 'doc' | 'exec'; xp: number; progress: number; isLocked?: boolean };
type DirectoryItem = { id: string; title: string; desc: string; files: FileItem[] };

const DIRECTORIES: DirectoryItem[] = [
  {
    id: 'cs_fundamentals',
    title: '01_CS_FUNDAMENTALS',
    desc: 'The core algorithms, data structures, and computer science basics needed for any developer.',
    files: [
      { id: 'f1', title: 'big_o_notation.txt', type: 'doc', xp: 10, progress: 100 },
      { id: 'f2', title: 'arrays_and_strings.txt', type: 'doc', xp: 20, progress: 50 },
      { id: 'f3', title: 'hash_maps.txt', type: 'doc', xp: 20, progress: 0 },
      { id: 'f4', title: 'fundamental_assessment.exe', type: 'exec', xp: 100, progress: 0, isLocked: true },
    ]
  },
  {
    id: 'languages',
    title: '02_PROGRAMMING_LANGUAGES',
    desc: 'Choose your weapon. Deep dives into specific language syntax and OOP paradigms.',
    files: [
      { id: 'l1', title: 'java_oop_core.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'l2', title: 'csharp_oop_core.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'l3', title: 'python_basics.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'l4', title: 'javascript_es6.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'l5', title: 'cpp_memory_management.txt', type: 'doc', xp: 50, progress: 0 },
    ]
  },
  {
    id: 'frontend',
    title: '03_FRONTEND_ENGINEERING',
    desc: 'Master the browser. HTML, CSS, JavaScript, React, and Web Performance.',
    files: [
      { id: 'fe1', title: 'dom_manipulation.txt', type: 'doc', xp: 30, progress: 0 },
      { id: 'fe2', title: 'react_hooks_deepdive.txt', type: 'doc', xp: 40, progress: 0 },
      { id: 'fe3', title: 'css_grid_flexbox.txt', type: 'doc', xp: 30, progress: 0 },
      { id: 'fe4', title: 'frontend_mastery.exe', type: 'exec', xp: 150, progress: 0, isLocked: true },
    ]
  },
  {
    id: 'backend',
    title: '04_BACKEND_ENGINEERING',
    desc: 'Server-side logic, API design, and frameworks specific to your chosen language.',
    files: [
      { id: 'be1', title: 'rest_api_principles.txt', type: 'doc', xp: 30, progress: 100 },
      { id: 'be2', title: 'node_js_express.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'be3', title: 'spring_boot_java.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'be4', title: 'dotnet_core_csharp.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'be5', title: 'django_python.txt', type: 'doc', xp: 50, progress: 0 },
    ]
  },
  {
    id: 'databases',
    title: '05_DATABASES_AND_SQL',
    desc: 'Data persistence, relational models, querying, and NoSQL alternatives.',
    files: [
      { id: 'db1', title: 'sql_joins_and_indexes.txt', type: 'doc', xp: 40, progress: 0 },
      { id: 'db2', title: 'database_normalization.txt', type: 'doc', xp: 30, progress: 0 },
      { id: 'db3', title: 'mongodb_basics.txt', type: 'doc', xp: 30, progress: 0 },
    ]
  },
  {
    id: 'system_design',
    title: '06_SYSTEM_DESIGN',
    desc: 'Architecting scalable applications. Load balancing, microservices, and cloud infra.',
    files: [
      { id: 'sd1', title: 'scaling_from_0_to_1m.txt', type: 'doc', xp: 50, progress: 0 },
      { id: 'sd2', title: 'cap_theorem.txt', type: 'doc', xp: 30, progress: 0 },
      { id: 'sd3', title: 'microservices_vs_monolith.txt', type: 'doc', xp: 40, progress: 0 },
      { id: 'sd4', title: 'architect_certification.exe', type: 'exec', xp: 500, progress: 0, isLocked: true },
    ]
  }
];

const DirectoryCard = ({ dir, isExpanded, onToggle, onFilePress }: { dir: DirectoryItem, isExpanded: boolean, onToggle: () => void, onFilePress: (file: FileItem) => void }) => {
  return (
    <View style={styles.dirWrapper}>
      {/* Directory Header */}
      <Pressable onPress={onToggle} style={[styles.dirHeader, isExpanded && styles.dirHeaderActive]}>
        <View style={styles.dirHeaderLeft}>
          <FontAwesome5 
            name={isExpanded ? "folder-open" : "folder"} 
            size={20} 
            color={isExpanded ? Colors.dark.primary : Colors.dark.textSecondary} 
          />
          <ThemedText style={[styles.dirTitle, isExpanded && { color: Colors.dark.primary }]}>
            {dir.title}/
          </ThemedText>
        </View>
        <FontAwesome5 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={Colors.dark.textSecondary} 
        />
      </Pressable>

      {/* Directory Content (Files) */}
      {isExpanded && (
        <View style={styles.dirContent}>
          <ThemedText style={styles.dirDesc}>// {dir.desc}</ThemedText>
          
          <View style={styles.fileList}>
            {dir.files.map(file => (
              <Pressable 
                key={file.id} 
                onPress={() => onFilePress(file)}
                style={[styles.fileCard, file.isLocked && styles.fileCardLocked]}
              >
                <View style={styles.fileLeft}>
                  <FontAwesome5 
                    name={file.type === 'doc' ? 'file-alt' : 'terminal'} 
                    size={16} 
                    color={file.isLocked ? '#555' : (file.progress === 100 ? Colors.dark.primary : '#AAA')} 
                  />
                  <ThemedText style={[styles.fileTitle, file.isLocked && styles.textLocked, file.progress === 100 && styles.textCompleted]}>
                    {file.title}
                  </ThemedText>
                </View>
                
                <View style={styles.fileRight}>
                  {file.isLocked ? (
                    <FontAwesome5 name="lock" size={14} color="#555" />
                  ) : (
                    <>
                      <ThemedText style={styles.fileXp}>+{file.xp} XP</ThemedText>
                      {file.progress > 0 && (
                        <ThemedText style={[styles.fileProgress, file.progress === 100 && { color: Colors.dark.primary }]}>
                          [{file.progress}%]
                        </ThemedText>
                      )}
                    </>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default function LearnScreen() {
  const router = useRouter();
  const [expandedDirId, setExpandedDirId] = useState<string | null>(null);

  const toggleDir = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDirId(prev => (prev === id ? null : id));
  };

  const handleFilePress = (file: FileItem) => {
    if (file.isLocked) return;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header-ul așezat ca în profile.tsx */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{'>'} KNOWLEDGE_BASE</ThemedText>
        <ThemedText style={styles.subtitle}>// Browse directories to read theory files.</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fileSystem}>
          {DIRECTORIES.map(dir => (
            <DirectoryCard
              key={dir.id}
              dir={dir}
              isExpanded={expandedDirId === dir.id}
              onToggle={() => toggleDir(dir.id)}
              onFilePress={handleFilePress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 120, // Enough padding for bottom nav
    flexGrow: 1 
  },
  
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 30, // Pushed down like profile.tsx
    paddingBottom: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#222',
    marginBottom: 20
  },
  title: { fontFamily: 'VT323_400Regular', fontSize: 32, letterSpacing: 2, color: Colors.dark.primary, marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', fontStyle: 'italic', fontFamily: 'VT323_400Regular' },
  
  fileSystem: {
    gap: 15, // Space between folders
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  
  dirWrapper: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
    borderRadius: 0,
  },
  dirHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#151515',
  },
  dirHeaderActive: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  dirHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  dirTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#DDD',
    letterSpacing: 1,
  },
  
  dirContent: {
    padding: 15,
    gap: 15,
  },
  dirDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 5,
  },
  
  fileList: {
    gap: 10,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 0,
  },
  fileCardLocked: {
    opacity: 0.6,
    borderColor: '#1a1a1a',
    backgroundColor: '#0f0f0f',
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  fileTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#CCC',
  },
  textLocked: {
    color: '#555',
  },
  textCompleted: {
    color: Colors.dark.primary,
  },
  
  fileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  fileXp: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#F59E0B',
  },
  fileProgress: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#888',
  },
});
