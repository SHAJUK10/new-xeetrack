/*
  # Add task creation policies for employees

  1. New Policies
    - Allow employees to create tasks for themselves in their assigned projects
    - Ensure employees can only create tasks in projects they are assigned to
    - Maintain existing security for managers and other roles

  2. Security
    - Employees can only create tasks in their assigned projects
    - Employees can only assign tasks to themselves
    - Maintain existing RLS policies for other operations
*/

-- Policy for employees to create tasks in their assigned projects
CREATE POLICY "Employees can create tasks in assigned projects"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'employee'
    )
    AND assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND auth.uid() = ANY(projects.assigned_employees)
    )
  );



