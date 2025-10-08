/*
  # Add project_type field to projects table

  1. New Column
    - `project_type` (text, optional project type)
    - Values: 'Logo', 'Stationery', 'Company Profile', 'Website', 'SEO', 'Hosting', 'Social Media', 'Software'

  2. Index
    - Add index for efficient filtering by project_type

  3. Constraint
    - Add CHECK constraint to ensure only valid project types
*/

-- Add project_type column to projects table
ALTER TABLE projects 
ADD COLUMN project_type text;

-- Add CHECK constraint for valid project types
ALTER TABLE projects 
ADD CONSTRAINT check_project_type 
CHECK (project_type IS NULL OR project_type IN (
  'Logo', 
  'Stationery', 
  'Company Profile', 
  'Website', 
  'SEO', 
  'Hosting', 
  'Social Media', 
  'Software'
));

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Update existing projects with default project type (optional)
-- UPDATE projects SET project_type = 'Website' WHERE project_type IS NULL;
