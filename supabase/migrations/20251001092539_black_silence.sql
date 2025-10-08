/*
  # Add client_name column to projects table

  1. Changes
    - Add `client_name` column to `projects` table
    - Set it as TEXT type to store client names
    - Make it NOT NULL with a default empty string for existing records
    - Update existing records to populate client_name from profiles table

  2. Security
    - No changes to existing RLS policies
    - Column inherits same access controls as other project columns
*/

-- Add client_name column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE projects ADD COLUMN client_name TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Update existing projects to populate client_name from profiles table
UPDATE projects 
SET client_name = (
  SELECT COALESCE(profiles.full_name, profiles.email, 'Unknown Client')
  FROM profiles 
  WHERE profiles.id = projects.client_id
)
WHERE client_name = '' OR client_name IS NULL;

-- Set a default value for any remaining empty client_name fields
UPDATE projects 
SET client_name = 'Unknown Client'
WHERE client_name = '' OR client_name IS NULL;