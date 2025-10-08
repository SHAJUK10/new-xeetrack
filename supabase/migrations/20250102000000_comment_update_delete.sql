/*
  # Add UPDATE and DELETE policies for global_comments table

  1. New Policies
    - Allow users to update their own comments
    - Allow users to delete their own comments
    - Allow managers to update/delete any comment
    - Allow employees to update/delete comments in their assigned projects
    - Allow clients to update/delete comments in their projects

  2. Security
    - Maintain existing RLS policies
    - Add granular permissions for update/delete operations
*/

-- Policies for updating global comments
CREATE POLICY "Users can update their own comments"
  ON global_comments
  FOR UPDATE
  TO authenticated
  USING (added_by = auth.uid())
  WITH CHECK (added_by = auth.uid());

CREATE POLICY "Managers can update any comment"
  ON global_comments
  FOR UPDATE
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

CREATE POLICY "Employees can update comments in assigned projects"
  ON global_comments
  FOR UPDATE
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
  )
  WITH CHECK (
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

CREATE POLICY "Clients can update comments in their projects"
  ON global_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client'
      AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = global_comments.project_id 
        AND projects.client_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client'
      AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = global_comments.project_id 
        AND projects.client_id = auth.uid()
      )
    )
  );

-- Policies for deleting global comments
CREATE POLICY "Users can delete their own comments"
  ON global_comments
  FOR DELETE
  TO authenticated
  USING (added_by = auth.uid());

CREATE POLICY "Managers can delete any comment"
  ON global_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'manager'
    )
  );

CREATE POLICY "Employees can delete comments in assigned projects"
  ON global_comments
  FOR DELETE
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

CREATE POLICY "Clients can delete comments in their projects"
  ON global_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client'
      AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = global_comments.project_id 
        AND projects.client_id = auth.uid()
      )
    )
  );



