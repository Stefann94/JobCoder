-- Create the Profile table (Gamification)
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

-- Create the Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  group_name TEXT DEFAULT 'General',
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the Questions table
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

-- Create the User Progress table (Skill Trees)
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  completed_questions JSONB DEFAULT '[]'::jsonb NOT NULL,
  progress_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, category_id)
);

-- Create the Daily Quests table
CREATE TABLE daily_quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  target_category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  required_questions INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the Boss Fights table
CREATE TABLE boss_fights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 200,
  unlock_threshold_percent INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- Enable Row Level Security for tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_fights ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read categories, questions, quests and bosses (no login required for viewing)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Questions are public" ON questions FOR SELECT USING (true);
CREATE POLICY "Daily Quests are public" ON daily_quests FOR SELECT USING (true);
CREATE POLICY "Boss Fights are public" ON boss_fights FOR SELECT USING (true);

-- Allow authenticated users to read and modify their own profile
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for user_progress (can only see/modify their own progress)
CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Populate our base categories
INSERT INTO categories (id, title, group_name, icon, color, description) VALUES
('frontend', 'Frontend Logic', 'Web Development', 'desktop', '#39FF14', 'React, State Management, UI/UX, Performance'),
('backend', 'Backend Architecture', 'Web Development', 'server', '#8B5CF6', 'APIs, Databases, Caching, Node.js'),
('database', 'Data Manipulation', 'Web Development', 'database', '#F59E0B', 'SQL, NoSQL, Indexing, Queries'),
('mobile', 'Mobile App Dev', 'Web Development', 'mobile', '#06B6D4', 'React Native, iOS, Android, Expo'),
('algorithms', 'Algorithms & Data Structs', 'Computer Science', 'code-braces', '#EF4444', 'Arrays, Lists, Trees, Big O notation'),
('networking', 'Networking & Security', 'Infrastructure', 'network-wired', '#10B981', 'TCP/IP, DNS, Cryptography, Firewalls'),
('devops', 'DevOps & Cloud', 'Infrastructure', 'cloud', '#3B82F6', 'Docker, Kubernetes, AWS, CI/CD'),
('behavioral', 'Behavioral & HR', 'Soft Skills', 'users', '#EC4899', 'Teamwork, Conflict Resolution, Leadership'),
('system_design', 'System Design', 'Software Engineering', 'sitemap', '#A855F7', 'Architecture, Scaling, Microservices, Caching'),
('security', 'App Security', 'Infrastructure', 'lock', '#EF4444', 'OAuth, JWT, XSS, CSRF, Cryptography'),
('testing', 'Testing & QA', 'Software Engineering', 'vial', '#F59E0B', 'Jest, Cypress, TDD, Unit Tests');

-- Create the Theory/Lessons table for each Category (Folder)
CREATE TABLE learning_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_markdown TEXT, 
  type TEXT DEFAULT 'theory',
  xp_reward INTEGER DEFAULT 50,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable security on the new table
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read lessons (they are public)
CREATE POLICY "Learning modules are public" ON learning_modules FOR SELECT USING (true);

-- Populate a few test lessons with warm and friendly language!
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('frontend', 'HTML & DOM Basics', 'Let''s start at the beginning! We''ll learn how a web page is structured and how we can modify its elements. Don''t worry, we''ll take it step by step!', 30, 1),
('frontend', 'CSS Magic: Flexbox', 'Have you ever tried to center a button and failed? We will shed light on this here. Flexbox is your best friend for beautiful page layouts.', 40, 2),
('frontend', 'Introduction to React', 'Now that you know the basics, it''s time to work like professionals. We will build your first interactive React component.', 50, 3),

('backend', 'What are REST APIs?', 'Think of an API like a waiter in a restaurant. You ask for data from your phone, it goes to the kitchen (server) and brings it back to you. Let''s see how it works!', 30, 1),
('backend', 'Let''s write our first server', 'We will write a few lines of code in Node.js to open our own local server that will respond to commands from the internet. It''s simpler than it seems!', 50, 2),

('database', 'Databases 101', 'Data is the heart of any application. Here we learn how to extract exactly what information we want from a huge table full of data.', 40, 1),

('mobile', 'Welcome to Mobile', 'Learn how to port your web knowledge into creating native iOS and Android applications.', 40, 1),

('algorithms', 'Big O Notation', 'The language of performance. Learn how to describe the speed and efficiency of your code like a senior engineer.', 50, 1),

('networking', 'How the Internet Works', 'TCP/IP, DNS, and HTTP. Let''s demystify what exactly happens when you type a URL into your browser.', 30, 1),

('devops', 'Containerization with Docker', 'Say goodbye to "it works on my machine". We''ll learn how to package apps so they run perfectly everywhere.', 50, 1),

('behavioral', 'STAR Method', 'How to answer any behavioral question during an HR interview like a pro using Situation, Task, Action, Result.', 40, 1),

('system_design', 'Scaling from 1 to 1M Users', 'What happens when your app goes viral? Learn the basics of horizontal scaling and load balancers.', 60, 1),

('security', 'Authentication vs Authorization', 'Who are you vs what are you allowed to do. We break down the absolute minimum security you need in a modern app.', 40, 1),

('testing', 'Writing your first Unit Test', 'Stop testing in production! Learn how to write code that tests your code automatically.', 40, 1);


-- =========================================================================
-- TRIGGERS: Auto-Create Profile on Registration
-- =========================================================================

-- The function that creates the profile
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

-- The trigger that listens to account creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================================
-- MOCK DATA: Daily Quests & Boss Fights
-- =========================================================================

-- Insert a daily quest so the window appears on the Hub!
INSERT INTO daily_quests (title, description, xp_reward, target_category_id, required_questions) VALUES
('Daily Quest', 'Survive 5 Technical Interview Questions.', 500, 'frontend', 5);

-- Insert a Boss Fight
INSERT INTO boss_fights (category_id, company_name, title, description, xp_reward, unlock_threshold_percent) VALUES
('algorithms', 'Google', 'The Search Giant', 'Survive a hardcore algorithmic assessment usually asked at Google.', 1000, 80);

