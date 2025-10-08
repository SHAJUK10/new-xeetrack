-- Enable RLS
alter table public.project_overviews enable row level security;

-- Allow authenticated users to insert/update/delete their project's overview
create policy if not exists "allow all auth users on project_overviews"
on public.project_overviews
for all
to authenticated
using (true)
with check (true);

-- Optionally allow read for anon if needed (commented by default)
-- create policy if not exists "allow read to anon on project_overviews"
-- on public.project_overviews
-- for select
-- to anon
-- using (true);



