import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal, FlatList, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Colors } from '@/constants/theme';
import { fetchUserProfile, updateUserProfile, uploadAvatarImage, UserProfile } from '@/lib/api';
import HackerSelect from '@/components/hacker-select';
import AvatarRenderer from '@/components/avatar-renderer';

GoogleSignin.configure({
  webClientId: '738118505432-9cepk9gmep4scfcd8lvg1kummaa18f8a.apps.googleusercontent.com',
});

const SPECIALIZATIONS = ['Frontend Developer', 'Backend Ninja', 'Fullstack Wizard', 'UI/UX Designer', 'Cyber Security', 'QA Tester', 'Data Scientist', 'DevOps Ops', 'Mobile Dev'];
const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin'];
const GOALS = ['Seeking First Job', 'Prepping for Big Tech (FAANG)', 'Career Change', 'Looking for Promotion', 'Just for Fun'];
const DAILY_TIMES = ['< 1 hour (Casual)', '1-3 hours (Dedicated)', '4+ hours (Hardcore)'];
const WORK_STYLES = ['100% Remote', 'Hybrid', 'Office', 'Digital Nomad'];
const HACKER_ICONS = ['user-ninja', 'user-astronaut', 'user-secret', 'robot', 'ghost', 'skull', 'dragon', 'spider', 'mask', 'cat', 'terminal', 'bug'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Profile States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Avatar handling
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [editForm, setEditForm] = useState<Partial<UserProfile>>({
    username: '', title: '', main_language: '', goal: '', daily_time: '', work_style: '', github_link: '', avatar_url: ''
  });

  const scrollRef = useRef<ScrollView>(null);

  // Reset scroll position and edit mode every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsEditing(false);
      setShowAvatarModal(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id).then((data) => {
        if (data) {
          setProfile(data);
          setEditForm(data);
        } else {
          setEditForm({
            username: user.email?.split('@')[0] || 'Hacker',
            title: 'Junior Dev',
            main_language: 'JavaScript',
            goal: '', daily_time: '', work_style: '', github_link: '', avatar_url: ''
          });
        }
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const newProfile = await updateUserProfile({ id: user.id, ...editForm });
      setProfile(newProfile as UserProfile);
      await refreshProfile();
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', 'Could not save profile. ' + e.message);
    }
    setIsSaving(false);
  };

  const handlePickImage = async () => {
    if (!user) return;
    
    setShowAvatarModal(false); // Inchide modalul cand alegem sa deschidem galeria

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Error', 'We need access to your photos to change the avatar!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!pickerResult.canceled && pickerResult.assets[0].uri) {
      setIsUploadingImage(true);
      const publicUrl = await uploadAvatarImage(user.id, pickerResult.assets[0].uri);
      if (publicUrl) {
        setEditForm(p => ({ ...p, avatar_url: publicUrl }));
        await updateUserProfile({ id: user.id, avatar_url: publicUrl });
        await refreshProfile();
      } else {
        Alert.alert('Error', 'Could not upload image to server.');
      }
      setIsUploadingImage(false);
    }
  };

  const handlePickIcon = async (iconName: string) => {
    if (!user) return;
    const finalUrl = `icon:${iconName}`;
    setEditForm(p => ({ ...p, avatar_url: finalUrl }));
    setShowAvatarModal(false);
    // Salveaza direct pt sincronizare instant
    await updateUserProfile({ id: user.id, avatar_url: finalUrl });
    await refreshProfile();
  };

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // ignore error if not logged in with google
    }
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={[styles.header, isAuthenticated ? { justifyContent: 'space-between', alignItems: 'flex-start' } : { justifyContent: 'flex-end' }]}>
        {isAuthenticated && (
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.title, !isEditing && { fontSize: 28, marginBottom: 2 }]} numberOfLines={1}>HACKER_PROFILE</Text>
            <Text style={[styles.subtitle, !isEditing && { fontSize: 16, marginBottom: 0 }]} numberOfLines={1}>// {user?.email}</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: isEditing ? 120 : 100, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* === PROFILE INTERFACE (LOGGED IN) === */}
          <View style={[styles.content, !isEditing && { paddingBottom: 10 }]}>
            <View style={[styles.profileCard, !isEditing && { padding: 16, marginTop: 10 }]}>
              <TouchableOpacity 
                style={[styles.avatarWrapper, !isEditing && { marginBottom: 10 }]} 
                onPress={() => isEditing ? setShowAvatarModal(true) : undefined}
                disabled={!isEditing || isUploadingImage}
              >
                <View style={[styles.avatarContainer, isEditing && styles.avatarEditing, !isEditing && { width: 90, height: 90, borderRadius: 45 }]}>
                  {isUploadingImage ? (
                    <ActivityIndicator color={Colors.dark.primary} />
                  ) : (
                    <AvatarRenderer avatarUrl={editForm.avatar_url || profile?.avatar_url} size={isEditing ? 110 : 90} />
                  )}
                  {isEditing && !isUploadingImage && (
                    <View style={styles.editIconBadge}>
                      <Ionicons name="pencil" size={14} color="#000" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {!isEditing ? (
                // --- MOD VIZUALIZARE ---
                <>
                  <Text style={[styles.usernameText, { fontSize: 26, letterSpacing: 1 }]}>
                    {profile?.username || user?.email?.split('@')[0].toUpperCase()}
                  </Text>
                  <Text style={[styles.titleText, { fontSize: 16, marginBottom: 10 }]}>{profile?.title || 'Unknown Role'}</Text>
                  
                  <View style={[styles.tagsRow, { marginBottom: 10, gap: 8 }]}>
                    <View style={[styles.tag, { paddingHorizontal: 10, paddingVertical: 4 }]}>
                      <FontAwesome5 name="code" size={10} color={Colors.dark.background} />
                      <Text style={[styles.tagText, { fontSize: 12 }]}>{profile?.main_language || 'Binary'}</Text>
                    </View>
                    {profile?.work_style && (
                      <View style={[styles.tag, { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 4 }]}>
                        <Ionicons name="globe-outline" size={12} color={Colors.dark.text} />
                        <Text style={[styles.tagText, { color: Colors.dark.text, fontSize: 12 }]}>{profile.work_style}</Text>
                      </View>
                    )}
                  </View>

                  {profile?.goal && (
                    <View style={[styles.infoBox, { padding: 10, marginBottom: 15 }]}>
                      <Text style={[styles.infoBoxLabel, { fontSize: 12, marginBottom: 2 }]}>MISSION_OBJECTIVE:</Text>
                      <Text style={[styles.infoBoxText, { fontSize: 14 }]}>{profile.goal}</Text>
                    </View>
                  )}

                  <View style={[styles.statsRow, { paddingTop: 10 }]}>
                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { fontSize: 28 }]}>1</Text>
                      <Text style={[styles.statLabel, { fontSize: 12 }]}>LEVEL</Text>
                    </View>
                    <View style={[styles.statDivider, { height: 30 }]} />
                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { fontSize: 28 }]}>0</Text>
                      <Text style={[styles.statLabel, { fontSize: 12 }]}>XP</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.btnSecondaryBtn, { padding: 10, marginTop: 15 }]} onPress={() => {
                    setIsEditing(true);
                    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
                  }}>
                    <Text style={[styles.btnSecondaryText, { fontSize: 18 }]}>[ EDIT_PROFILE ]</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // --- MOD EDITARE ---
                <View style={styles.editForm}>
                  
                  <Text style={styles.inputLabel}>Alias (Username)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.username}
                    onChangeText={(t) => setEditForm(p => ({ ...p, username: t }))}
                    placeholder="ex: Neo"
                    placeholderTextColor="#555"
                  />

                  <HackerSelect 
                    label="Specialization"
                    value={editForm.title || ''}
                    options={SPECIALIZATIONS}
                    onChange={(v) => setEditForm(p => ({ ...p, title: v }))}
                  />

                  <HackerSelect 
                    label="Main Language"
                    value={editForm.main_language || ''}
                    options={LANGUAGES}
                    onChange={(v) => setEditForm(p => ({ ...p, main_language: v }))}
                  />

                  <HackerSelect 
                    label="Current Objective"
                    value={editForm.goal || ''}
                    options={GOALS}
                    onChange={(v) => setEditForm(p => ({ ...p, goal: v }))}
                  />
                  <Text style={styles.inputHelper}>// Your daily quests and AI interviewer will dynamically adjust to help you reach this goal.</Text>

                  <HackerSelect 
                    label="Daily Grind (Hours)"
                    value={editForm.daily_time || ''}
                    options={DAILY_TIMES}
                    onChange={(v) => setEditForm(p => ({ ...p, daily_time: v }))}
                  />
                  <Text style={styles.inputHelper}>// Determines the length and difficulty curve of your personalized daily quests.</Text>

                  <HackerSelect 
                    label="Work Style"
                    value={editForm.work_style || ''}
                    options={WORK_STYLES}
                    onChange={(v) => setEditForm(p => ({ ...p, work_style: v }))}
                  />

                  <Text style={styles.inputLabel}>GitHub Profile (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.github_link}
                    onChangeText={(t) => setEditForm(p => ({ ...p, github_link: t }))}
                    placeholder="github.com/username"
                    placeholderTextColor="#555"
                    autoCapitalize="none"
                  />

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.btnSecondaryBtn, { flex: 1, borderColor: '#555', marginTop: 0 }]} onPress={() => {
                      setIsEditing(false);
                      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
                    }}>
                      <Text style={[styles.btnSecondaryText, { color: '#888' }]}>[ CANCEL ]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnPrimary, { flex: 1, marginTop: 0 }]} onPress={handleSaveProfile} disabled={isSaving}>
                      <Text style={styles.btnPrimaryText}>{isSaving ? '...' : '[ SAVE ]'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {!isEditing && (
              <TouchableOpacity style={[styles.logoutBtn, { marginTop: 'auto', marginBottom: 20, padding: 10 }]} onPress={handleLogout}>
                <Text style={[styles.logoutBtnText, { fontSize: 18 }]}>[ DISCONNECT ]</Text>
              </TouchableOpacity>
            )}
          </View>
      </ScrollView>

      {/* AVATAR SELECTOR MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAvatarModal}
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAvatarModal(false)}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 40) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>[ SELECT AVATAR ]</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={28} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.uploadPhotoBtn} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={24} color={Colors.dark.background} />
              <Text style={styles.uploadPhotoText}>[ UPLOAD REAL PHOTO ]</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>--- OR CHOOSE HACKER ICON ---</Text>

            <View style={styles.iconGrid}>
              {HACKER_ICONS.map((icon) => {
                const isSelected = editForm.avatar_url === `icon:${icon}`;
                return (
                  <TouchableOpacity 
                    key={icon} 
                    style={[styles.iconBox, isSelected && styles.iconBoxSelected]} 
                    onPress={() => handlePickIcon(icon)}
                  >
                    <FontAwesome5 name={icon as any} size={28} color={isSelected ? Colors.dark.background : Colors.dark.primary} />
                  </TouchableOpacity>
                )
              })}
            </View>

          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'VT323_400Regular',
    color: Colors.dark.primary,
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    marginBottom: 20,
  },
  formContainer: {
    gap: 15,
  },
  inputLabel: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    marginBottom: 5,
    marginTop: 10,
  },
  inputHelper: {
    color: '#666',
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    marginTop: -5,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    padding: 15,
    borderRadius: 0,
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    marginBottom: 10,
  },
  btnPrimary: {
    backgroundColor: Colors.dark.primary,
    padding: 15,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: Colors.dark.background,
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
  },
  btnSecondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    padding: 15,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  btnSecondaryText: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
  },
  profileCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 0,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0, 255, 170, 0.05)',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarEditing: {
    borderStyle: 'dashed',
    borderColor: Colors.dark.primary,
    borderWidth: 3,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 5,
    backgroundColor: Colors.dark.primary,
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#111',
  },
  usernameText: {
    color: Colors.dark.text,
    fontFamily: 'VT323_400Regular',
    fontSize: 32,
    letterSpacing: 2,
  },
  titleText: {
    color: '#888',
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
    marginBottom: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
    justifyContent: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  tagText: {
    color: Colors.dark.background,
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 0,
    width: '100%',
    marginBottom: 20,
  },
  infoBoxLabel: {
    color: '#666',
    fontFamily: 'VT323_400Regular',
    fontSize: 14,
    marginBottom: 5,
  },
  infoBoxText: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 36,
  },
  statLabel: {
    color: '#888',
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    letterSpacing: 2,
  },
  editForm: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  logoutBtn: {
    marginTop: 30,
    alignSelf: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  logoutBtnText: {
    color: '#ff4444',
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: height * 0.8,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.dark.primary,
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
  },
  uploadPhotoBtn: {
    backgroundColor: Colors.dark.primary,
    padding: 15,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  uploadPhotoText: {
    color: Colors.dark.background,
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },
  orText: {
    color: '#555',
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  iconBoxSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary,
  },

  // Google login
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#555',
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    marginHorizontal: 15,
  },
  googleBtn: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  googleBtnText: {
    color: '#fff',
    fontFamily: 'VT323_400Regular',
    fontSize: 20,
  },

  // Stat divider
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
});
