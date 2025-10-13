-- SacredVerse Database Schema
-- This creates the tables needed to store user progress and metadata in Supabase

-- =====================================================
-- PART 1: USER METADATA TABLE
-- =====================================================
-- This table stores user streak information, points, and badges
-- Each user has exactly one row in this table

CREATE TABLE IF NOT EXISTS user_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_completed_date DATE,
  streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  badges INTEGER[] DEFAULT '{}', -- Array of badge numbers [3, 7, 30]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one metadata record per user
  UNIQUE(user_id)
);

-- =====================================================
-- PART 2: USER PROGRESS TABLE
-- =====================================================
-- This table stores daily deed completions
-- Each row represents one day's progress

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL, -- Which day in the content cycle (0-29)
  deed_index INTEGER NOT NULL, -- Which deed within the day (usually 0)
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user per day per deed
  UNIQUE(user_id, day_index, deed_index)
);

-- =====================================================
-- PART 3: INDEXES FOR PERFORMANCE
-- =====================================================
-- Indexes help speed up common queries

-- Index for looking up user metadata quickly
CREATE INDEX IF NOT EXISTS idx_user_metadata_user_id 
  ON user_metadata(user_id);

-- Index for looking up user progress quickly
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
  ON user_progress(user_id);

-- Index for finding progress by day
CREATE INDEX IF NOT EXISTS idx_user_progress_day 
  ON user_progress(user_id, day_index);

-- =====================================================
-- PART 4: ROW LEVEL SECURITY (RLS)
-- =====================================================
-- RLS ensures users can only see and modify their own data
-- This is a critical security feature!

-- Enable RLS on both tables
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own metadata
CREATE POLICY "Users can view their own metadata"
  ON user_metadata
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own metadata
CREATE POLICY "Users can insert their own metadata"
  ON user_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own metadata
CREATE POLICY "Users can update their own metadata"
  ON user_metadata
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update their own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete their own progress"
  ON user_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 5: UPDATED_AT TRIGGER
-- =====================================================
-- Automatically update the updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_metadata_updated_at
  BEFORE UPDATE ON user_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================
-- Run these after creating the tables to verify everything works

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('user_metadata', 'user_progress');

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN ('user_metadata', 'user_progress');
