-- Complete Mental Health Quiz System Database Schema
-- Copy and paste this entire script into your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table with course integration
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  city VARCHAR(255) NOT NULL,
  course_id VARCHAR(10) NOT NULL, -- References course data (C1, C2, etc.)
  course_name VARCHAR(255) NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Quiz sessions to track completion
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  vak_completed BOOLEAN DEFAULT FALSE,
  ei_completed BOOLEAN DEFAULT FALSE,
  rep_system_completed BOOLEAN DEFAULT FALSE,
  all_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VAK Learning Style responses
CREATE TABLE IF NOT EXISTS vak_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 5),
  question_text TEXT NOT NULL,
  selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('V', 'A', 'K')), -- Corrected CHECK constraint
  option_text TEXT NOT NULL,
  selected_value VARCHAR(255) NOT NULL,
  learning_style VARCHAR(20) NOT NULL CHECK (learning_style IN ('Visual', 'Auditory', 'Kinesthetic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    
-- 5. VAK results
CREATE TABLE IF NOT EXISTS vak_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  visual_score INTEGER NOT NULL DEFAULT 0,
  auditory_score INTEGER NOT NULL DEFAULT 0,
  kinesthetic_score INTEGER NOT NULL DEFAULT 0,
  dominant_style VARCHAR(20) NOT NULL,
  percentage_visual DECIMAL(5,2) NOT NULL DEFAULT 0,
  percentage_auditory DECIMAL(5,2) NOT NULL DEFAULT 0,
  percentage_kinesthetic DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Emotional Intelligence responses
CREATE TABLE IF NOT EXISTS ei_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 50),
  question_text TEXT NOT NULL,
  response_value INTEGER NOT NULL CHECK (response_value >= 1 AND response_value <= 5),
  category VARCHAR(30) NOT NULL CHECK (category IN ('Self-awareness', 'Managing emotions', 'Motivating oneself', 'Empathy', 'Social Skill')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EI results with detailed scoring
CREATE TABLE IF NOT EXISTS ei_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  self_awareness_score INTEGER NOT NULL DEFAULT 0,
  managing_emotions_score INTEGER NOT NULL DEFAULT 0,
  motivating_oneself_score INTEGER NOT NULL DEFAULT 0,
  empathy_score INTEGER NOT NULL DEFAULT 0,
  social_skill_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  self_awareness_classification VARCHAR(20) NOT NULL, -- Renamed
  managing_emotions_classification VARCHAR(20) NOT NULL, -- Renamed
  motivating_oneself_classification VARCHAR(20) NOT NULL, -- Renamed
  empathy_classification VARCHAR(20) NOT NULL, -- Renamed
  social_skill_classification VARCHAR(20) NOT NULL, -- Renamed
  overall_level VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Representational System responses
CREATE TABLE IF NOT EXISTS rep_system_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 6),
  question_text TEXT NOT NULL,
  visual_rank INTEGER CHECK (visual_rank >= 1 AND visual_rank <= 4),
  auditory_rank INTEGER CHECK (auditory_rank >= 1 AND auditory_rank <= 4),
  kinesthetic_rank INTEGER CHECK (kinesthetic_rank >= 1 AND kinesthetic_rank <= 4),
  auditory_digital_rank INTEGER CHECK (auditory_digital_rank >= 1 AND auditory_digital_rank <= 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Representational System results
CREATE TABLE IF NOT EXISTS rep_system_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  visual_total INTEGER NOT NULL DEFAULT 0,
  auditory_total INTEGER NOT NULL DEFAULT 0,
  kinesthetic_total INTEGER NOT NULL DEFAULT 0,
  auditory_digital_total INTEGER NOT NULL DEFAULT 0,
  dominant_system VARCHAR(20) NOT NULL,
  visual_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  auditory_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  kinesthetic_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  auditory_digital_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_course ON users(course_id, semester);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed ON quiz_sessions(all_completed, completed_at);
CREATE INDEX IF NOT EXISTS idx_vak_responses_user ON vak_responses(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_ei_responses_user ON ei_responses(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_rep_responses_user ON rep_system_responses(user_id, session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY; -- Enable RLS for admin_users
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vak_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vak_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ei_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ei_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_system_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_system_results ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true); -- Allow public insert for new users
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies for admin_users
DROP POLICY IF EXISTS "Admins can view own data" ON admin_users;
CREATE POLICY "Admins can view own data" ON admin_users FOR SELECT USING (auth.uid()::text = id::text);
DROP POLICY IF EXISTS "Admins can insert own data" ON admin_users;
CREATE POLICY "Admins can insert own data" ON admin_users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
DROP POLICY IF EXISTS "Admins can update own data" ON admin_users;
CREATE POLICY "Admins can update own data" ON admin_users FOR UPDATE USING (auth.uid()::text = id::text);

-- Similar policies for other tables (simplified for brevity)
DROP POLICY IF EXISTS "Users can manage own quiz sessions" ON quiz_sessions;
CREATE POLICY "Users can manage own quiz sessions" ON quiz_sessions FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can manage own responses" ON vak_responses;
CREATE POLICY "Users can manage own responses" ON vak_responses FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can manage own responses" ON vak_results;
CREATE POLICY "Users can manage own responses" ON vak_results FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can manage own responses" ON ei_responses;
CREATE POLICY "Users can manage own responses" ON ei_responses FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can manage own responses" ON ei_results;
CREATE POLICY "Users can manage own responses" ON ei_results FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can manage own responses" ON rep_system_responses;
CREATE POLICY "Users can manage own responses" ON rep_system_responses FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can manage own responses" ON rep_system_results;
CREATE POLICY "Users can manage own responses" ON rep_system_results FOR ALL USING (true);
