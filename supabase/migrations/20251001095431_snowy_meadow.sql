/*
  # Create global_comments table for project discussions

  1. New Tables
    - `global_comments`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `text` (text, comment content)
      - `added_by` (uuid, foreign key to profiles)
      - `author_name` (text, cached author name)
      - `author_role` (text, cached author role)
      - `timestamp` (timestamptz, creation timestamp)

  2. Security
    - Enable RLS on `global_comments` table
    - Add policies for managers to view all comments
    - Add policies for employees to view comments in their assigned projects
    - Add policies for clients to view comments in their projects
    - Add policies for authenticated users to create comments

  3. Indexes
    - Add indexes for efficient querying by project_id and timestamp
*/

-- Create global_comments table
CREATE TABLE IF NOT EXISTS global_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  text text NOT NULL,
  added_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL CHECK (author_role IN ('manager', 'employee', 'client')),
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_comments_project_id ON global_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_global_comments_timestamp ON global_comments(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_global_comments_added_by ON global_comments(added_by);

-- Policies for managers (can view and create all comments)
CREATE POLICY "Managers can manage all global comments"
  ON global_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'manager'
    )
  );

-- Policies for employees (can view comments in their assigned projects and create comments)
CREATE POLICY "Employees can view comments in assigned projects"
  ON global_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'employee'
      AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = global_comments.project_id 
        AND auth.uid() = ANY(projects.assigned_employees)
      )
    )
  );

CREATE POLICY "Employees can create comments"
  ON global_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'employee'
    )
    AND added_by = auth.uid()
  );

-- Policies for clients (can view and create comments in their projects)
CREATE POLICY "Clients can view comments in their projects"
  ON global_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = global_comments.project_id 
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create comments in their projects"
  ON global_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client'
    )
    AND added_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = global_comments.project_id 
      AND projects.client_id = auth.uid()
    )
  );