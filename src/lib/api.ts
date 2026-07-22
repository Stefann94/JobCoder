import { supabase } from './supabase';

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export interface Question {
  id: string;
  category_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
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
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
  return data || [];
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
