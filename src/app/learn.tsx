import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Platform, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

// LayoutAnimation is enabled by default in the New Architecture (Fabric)

type FileItem = { id: string; title: string; desc: string; type: 'doc' | 'exec'; xp: number; progress: number; isLocked?: boolean };
type DirectoryItem = { id: string; title: string; desc: string; icon: string; color: string; files: FileItem[] };

export default function LearnScreen() {
  const router = useRouter();
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDirId, setCurrentDirId] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      // Fetch all categories from the database
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*');
        
      if (catError) throw catError;

      // Fetch all theory modules from the database
      const { data: modulesData, error: modError } = await supabase
        .from('learning_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (modError) throw modError;

      // Build the directory structure based on categories
      const builtDirectories: DirectoryItem[] = categoriesData.map((cat: any) => {
        const catModules = modulesData.filter((m: any) => m.category_id === cat.id);
        
        return {
          id: cat.id,
          title: cat.title,
          desc: cat.description,
          icon: cat.icon || 'folder',
          color: cat.color || Colors.dark.primary,
          files: catModules.map((m: any) => ({
            id: m.id,
            title: m.title,
            desc: m.description,
            type: m.type === 'theory' ? 'doc' : 'exec',
            xp: m.xp_reward,
            progress: 0,
            isLocked: false,
          }))
        };
      });

      // Keep only categories that have at least one theory file defined
      const activeDirectories = builtDirectories.filter(dir => dir.files.length > 0);
      
      setDirectories(activeDirectories);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToDir = (id: string | null) => {
    // Smooth fade & slide animation
    LayoutAnimation.configureNext(
      LayoutAnimation.create(300, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setCurrentDirId(id);
  };

  const handleFilePress = (file: FileItem) => {
    if (file.isLocked) return;
    // router.push(`/lesson/${file.id}`)
  };

  const activeDir = currentDirId ? directories.find(d => d.id === currentDirId) : null;

  const coreIds = ['frontend', 'backend', 'database', 'algorithms'];
  const coreDirectories = directories.filter(dir => coreIds.includes(dir.id));
  const advancedDirectories = directories.filter(dir => !coreIds.includes(dir.id));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{'>'} KNOWLEDGE_BASE</ThemedText>
        <ThemedText style={styles.subtitle}>
          {activeDir ? `// path: root/${activeDir.id}` : '// root/ - Select a directory to mount.'}
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText style={styles.loadingText}>Fetching files from mainframe...</ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!activeDir ? (
            // ROOT LEVEL - SHOW DIRECTORIES
            <View style={styles.grid}>
              {coreDirectories.length > 0 && (
                <View style={styles.groupContainer}>
                  <ThemedText style={styles.groupTitle}>CORE INTERVIEW ESSENTIALS</ThemedText>
                  <View style={styles.groupDivider} />
                  <View style={styles.gridCardsContainer}>
                    {coreDirectories.map(dir => (
                      <Pressable key={dir.id} style={[styles.gridCard, { overflow: 'hidden' }]} onPress={() => navigateToDir(dir.id)}>
                        <FontAwesome5 name={dir.icon as any} size={70} color={dir.color} style={styles.gridCardWatermark} />
                        <View style={styles.gridCardIconWrapper}>
                          <FontAwesome5 name={dir.icon as any} size={20} color={dir.color} />
                        </View>
                        <View style={styles.gridCardContent}>
                          <ThemedText style={styles.gridCardTitle} numberOfLines={2}>{dir.title.toUpperCase()}</ThemedText>
                          <ThemedText style={styles.gridCardSubtitle}>[ {dir.files.length} MODULES ]</ThemedText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {advancedDirectories.length > 0 && (
                <View style={styles.groupContainer}>
                  <ThemedText style={styles.groupTitle}>ADVANCED TOPICS</ThemedText>
                  <View style={styles.groupDivider} />
                  <View style={styles.gridCardsContainer}>
                    {advancedDirectories.map(dir => (
                      <Pressable key={dir.id} style={[styles.gridCard, { overflow: 'hidden' }]} onPress={() => navigateToDir(dir.id)}>
                        <FontAwesome5 name={dir.icon as any} size={70} color={dir.color} style={styles.gridCardWatermark} />
                        <View style={styles.gridCardIconWrapper}>
                          <FontAwesome5 name={dir.icon as any} size={20} color={dir.color} />
                        </View>
                        <View style={styles.gridCardContent}>
                          <ThemedText style={styles.gridCardTitle} numberOfLines={2}>{dir.title.toUpperCase()}</ThemedText>
                          <ThemedText style={styles.gridCardSubtitle}>[ {dir.files.length} MODULES ]</ThemedText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            // DIRECTORY LEVEL - SHOW FILES
            <View style={styles.fileSystem}>
              
              {/* CD .. BACK BUTTON */}
              <Pressable style={styles.backButton} onPress={() => navigateToDir(null)}>
                <FontAwesome5 name="chevron-left" size={14} color={Colors.dark.primary} />
                <ThemedText style={styles.backButtonText}>cd ..</ThemedText>
              </Pressable>

              <View style={styles.activeDirHeader}>
                <ThemedText style={styles.activeDirTitle}>{activeDir.title}/</ThemedText>
                <ThemedText style={styles.dirDesc}>// {activeDir.desc}</ThemedText>
              </View>
              
              <View style={styles.fileList}>
                {activeDir.files.map(file => (
                  <Pressable 
                    key={file.id} 
                    onPress={() => handleFilePress(file)}
                    style={[styles.fileCard, file.isLocked && styles.fileCardLocked]}
                  >
                    <View style={styles.fileMain}>
                      <View style={styles.fileHeader}>
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
                      </View>
                      {/* Warm description displayed here below the file title */}
                      <ThemedText style={styles.fileDesc}>{file.desc}</ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 120, 
    flexGrow: 1 
  },
  
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#222',
    marginBottom: 20
  },
  title: { fontFamily: 'VT323_400Regular', fontSize: 32, letterSpacing: 2, color: Colors.dark.primary, marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#888', fontStyle: 'italic', fontFamily: 'VT323_400Regular' },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginTop: 50
  },
  loadingText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888'
  },

  grid: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  
  groupContainer: {
    marginBottom: 35,
    gap: 12,
  },
  groupTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.dark.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  groupDivider: {
    height: 1,
    backgroundColor: Colors.dark.primary,
    opacity: 0.3,
    marginTop: -5,
    marginBottom: 10,
  },

  gridCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gridCardWatermark: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.08,
    transform: [{ rotate: '-15deg' }],
  },
  gridCardIconWrapper: {
    width: 38,
    height: 38,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardContent: {
    gap: 4,
  },
  gridCardTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#DDD',
    letterSpacing: 1,
    lineHeight: 20,
  },
  gridCardSubtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontFamily: 'VT323_400Regular',
    letterSpacing: 1,
  },

  fileSystem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  backButtonText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.dark.primary,
    letterSpacing: 1,
  },

  activeDirHeader: {
    marginBottom: 20,
  },
  activeDirTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#DDD',
    letterSpacing: 1,
    marginBottom: 5,
  },
  dirDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  
  fileList: {
    gap: 10,
  },
  fileCard: {
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
  fileMain: {
    gap: 8,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    color: '#CCC',
  },
  fileDesc: {
    fontSize: 13,
    color: '#777',
    paddingLeft: 26, // Liniat cu textul, nu cu iconița
    lineHeight: 18,
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
