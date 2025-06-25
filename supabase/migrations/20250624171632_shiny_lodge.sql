/*
  # Create user profiles and stroke recovery tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `stroke_date` (date, nullable)
      - `stroke_type` (text, nullable) 
      - `mobility_level` (integer, 1-10 scale)
      - `recovery_goals` (text array, nullable)
      - `turtle_name` (text, default 'Shelly')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `daily_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `date` (date)
      - `exercises_completed` (integer, default 0)
      - `mood_rating` (integer, 1-5 scale)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

    - `exercise_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `exercise_type` (text)
      - `duration` (integer, seconds)
      - `difficulty_level` (integer, 1-5 scale)
      - `completed` (boolean, default false)
      - `created_at` (timestamp)

    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `achievement_type` (text)
      - `unlocked_at` (timestamp)

    - `education_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `lesson_id` (text)
      - `completed` (boolean, default false)
      - `quiz_score` (integer, nullable)
      - `completed_at` (timestamp, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stroke_date date,
  stroke_type text,
  mobility_level integer DEFAULT 5 CHECK (mobility_level >= 1 AND mobility_level <= 10),
  recovery_goals text[],
  turtle_name text DEFAULT 'Shelly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily progress tracking
CREATE TABLE IF NOT EXISTS daily_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  exercises_completed integer DEFAULT 0,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Exercise sessions
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  exercise_type text NOT NULL,
  duration integer DEFAULT 0,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  unlocked_at timestamptz DEFAULT now()
);

-- Educational progress
CREATE TABLE IF NOT EXISTS education_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  completed boolean DEFAULT false,
  quiz_score integer,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for daily_progress
CREATE POLICY "Users can manage own daily progress"
  ON daily_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for exercise_sessions
CREATE POLICY "Users can manage own exercise sessions"
  ON exercise_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for achievements
CREATE POLICY "Users can read own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policies for education_progress
CREATE POLICY "Users can manage own education progress"
  ON education_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());