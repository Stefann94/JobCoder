-- Creează tabela pentru Profile (Gamification)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  title TEXT,
  main_language TEXT,
  goal TEXT,
  daily_time TEXT,
  work_style TEXT,
  github_link TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Creează tabela pentru Categorii
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Creează tabela pentru Întrebări
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Creează tabela pentru Progresul Utilizatorilor în Categorii (Skill Trees)
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  completed_questions JSONB DEFAULT '[]'::jsonb NOT NULL,
  progress_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, category_id)
);


-- Activează securitatea RLS (Row Level Security) pentru tabele (ca să fie publice doar la citire)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Permite oricui să citească categoriile și întrebările (fără login obligatoriu pentru vizualizare)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Questions are public" ON questions FOR SELECT USING (true);

-- Permite utilizatorilor autentificați să-și citească și să-și modifice propriul profil
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Politici pentru user_progress (pot vedea/modifica doar progresul propriu)
CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Populează categoriile noastre de bază ca să nu le mai scrii tu de mână!
INSERT INTO categories (id, title, icon, color, description) VALUES
('frontend', 'Frontend Logic', 'desktop', '#39FF14', 'React, State Management, UI/UX, Performance'),
('backend', 'Backend Architecture', 'server', '#8B5CF6', 'APIs, Databases, Caching, Node.js'),
('database', 'Data Manipulation', 'database', '#F59E0B', 'SQL, NoSQL, Indexing, Queries'),
('behavioral', 'Behavioral & HR', 'users', '#EF4444', 'Teamwork, Conflict Resolution, Leadership');

-- =========================================================================
-- TRIGGERS: Auto-Creare Profil la Înregistrare
-- =========================================================================

-- Funcția care creează profilul
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, title, xp, level)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)), 
    'Lvl 1 Hacker', 
    0, 
    1
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger-ul care ascultă crearea conturilor
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
