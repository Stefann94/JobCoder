-- Creează tabela pentru Profile (Gamification)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
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

-- Activează securitatea RLS (Row Level Security) pentru tabele (ca să fie publice doar la citire)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Permite oricui să citească categoriile și întrebările (fără login obligatoriu pentru vizualizare)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Questions are public" ON questions FOR SELECT USING (true);

-- Permite utilizatorilor autentificați să-și citească și să-și modifice propriul profil
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Populează categoriile noastre de bază ca să nu le mai scrii tu de mână!
INSERT INTO categories (id, title, icon, color, description) VALUES
('frontend', 'Frontend Logic', 'desktop', '#39FF14', 'React, State Management, UI/UX, Performance'),
('backend', 'Backend Architecture', 'server', '#8B5CF6', 'APIs, Databases, Caching, Node.js'),
('database', 'Data Manipulation', 'database', '#F59E0B', 'SQL, NoSQL, Indexing, Queries'),
('behavioral', 'Behavioral & HR', 'users', '#EF4444', 'Teamwork, Conflict Resolution, Leadership');
