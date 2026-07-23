import { supabase } from './supabase';

export interface Category {
  id: string;
  title: string;
  group_name?: string;
  icon: string;
  color: string;
  description: string;
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  category_id: string;
  title: string;
  options: AnswerOption[];
  explanation: string;
  difficulty: string;
}

export interface BossFight {
  id: string;
  category_id: string;
  company_name: string;
  title: string;
  description: string;
  xp_reward: number;
  unlock_threshold_percent: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  target_category_id?: string;
  required_questions: number;
}

export interface UserProfile {
  id: string;
  username: string;
  title: string;
  main_language: string;
  goal?: string;
  daily_time?: string;
  work_style?: string;
  github_link?: string;
  avatar_url: string;
  xp?: number;
  level?: number;
}

export interface UserProgress {
  id?: string;
  user_id: string;
  category_id: string;
  completed_questions: string[];
  progress_percent: number;
  updated_at?: string;
}

// Funcție ultra-eficientă pentru a lua Categoriile din Cloud
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

// Funcție ultra-eficientă pentru a lua Întrebările pentru o Categorie
export async function fetchQuestionsByCategory(categoryId: string): Promise<Question[]> {
  let query = supabase.from('questions').select('*');
  
  if (categoryId !== 'mock') {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  let results = data || [];
  
  // Dacă e mock, amestecăm și tăiem la primele 10
  if (categoryId === 'mock') {
    results = results.sort(() => 0.5 - Math.random()).slice(0, 10);
  }

  // Mapare din formatul bazei de date (cu options array de string-uri și correct_answer index) în formatul cerut de UI
  return results.map((q: any) => ({
    id: q.id,
    category_id: q.category_id,
    title: q.question, // DB column e 'question', UI folosește 'title'
    options: Array.isArray(q.options) 
      ? q.options.map((optText: string, idx: number) => ({
          id: idx.toString(),
          text: optText,
          isCorrect: idx === q.correct_answer
        }))
      : [],
    explanation: q.explanation,
    difficulty: q.difficulty || 'Medium'
  }));
}

// Lăm profilul utilizatorului
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('No profile found or error:', error.message);
    return null;
  }
  return data;
}

// Actualizăm (sau creăm) profilul utilizatorului
export async function updateUserProfile(profile: Partial<UserProfile> & { id: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile, updated_at: new Date() })
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
}

export async function addXpToProfile(userId: string, xpAmount: number): Promise<{ xp: number, level: number } | null> {
  const profile = await fetchUserProfile(userId);
  if (!profile) return null;
  
  const currentXp = profile.xp || 0;
  const newXp = currentXp + xpAmount;
  // Formula de level: la fiecare 100 XP primești un level (ex: 250 XP = lvl 3)
  const newLevel = Math.floor(newXp / 100) + 1;

  await updateUserProfile({
    id: userId,
    xp: newXp,
    level: newLevel
  });

  return { xp: newXp, level: newLevel };
}

// Upload Avatar în Supabase Storage
export async function uploadAvatarImage(userId: string, imageUri: string): Promise<string | null> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const ext = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading image to storage:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return null;
  }
}

// ---- PROGRESS API ----

export async function fetchUserProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
  return data || [];
}

export async function updateUserProgress(progress: UserProgress): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({ ...progress, updated_at: new Date() }, { onConflict: 'user_id,category_id' })
    .select()
    .single();

  if (error) {
    console.error('Error updating progress:', error);
    return null;
  }
  return data;
}

export async function bulkUpsertUserProgress(progresses: UserProgress[]): Promise<void> {
  if (!progresses.length) return;
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      progresses.map(p => ({ ...p, updated_at: new Date() })), 
      { onConflict: 'user_id,category_id' }
    );

  if (error) {
    console.error('Error bulk updating progress:', error);
    throw error;
  }
}

// ---- BOSSES & QUESTS API ----

export async function fetchBossFights(): Promise<BossFight[]> {
  const { data, error } = await supabase.from('boss_fights').select('*');
  if (error) { console.error('Error fetching boss fights:', error); return []; }
  return data || [];
}

export async function fetchDailyQuests(): Promise<DailyQuest[]> {
  const { data, error } = await supabase.from('daily_quests').select('*');
  if (error) { console.error('Error fetching daily quests:', error); return []; }
  return data || [];
}
