-- Enable RLS on files table
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert files
CREATE POLICY "Authenticated users can insert files"
  ON public.files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to select files
CREATE POLICY "Authenticated users can select files"
  ON public.files
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update files"
  ON public.files
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files"
  ON public.files
  FOR DELETE
  TO authenticated
  USING (true);
