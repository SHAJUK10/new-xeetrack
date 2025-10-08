/*
  # Fix tasks and global_comments tables to match application requirements

  1. Changes to tasks table
    - Add `created_by` column to track who created the task
    - Add constraint to reference profiles table

  2. Changes to global_comments table  
    - Add `author_name` column to cache the author's name
    - This avoids joins when displaying comments

  3. Security
    - No changes to existing RLS policies
    - New columns inherit same access controls
*/

-- Add created_by column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE tasks ADD COLUMN created_by uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add author_name column to global_comments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_comments' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE global_comments ADD COLUMN author_name text NOT NULL DEFAULT 'Unknown';
  END IF;
END $$;

-- Update existing tasks to set created_by (if any exist)
UPDATE tasks 
SET created_by = assigned_to 
WHERE created_by IS NULL;

-- Update existing global_comments to set author_name from profiles
UPDATE global_comments 
SET author_name = (
  SELECT COALESCE(profiles.full_name, profiles.email, 'Unknown')
  FROM profiles 
  WHERE profiles.id = global_comments.added_by
)
WHERE author_name = 'Unknown' OR author_name IS NULL;