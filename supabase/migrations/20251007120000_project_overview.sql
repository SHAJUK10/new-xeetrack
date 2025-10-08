-- Create table for Project Overview content
create table if not exists public.project_overviews (
  project_id uuid primary key,
  content text not null,
  created_by uuid not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Optional: add FK to projects if projects table exists
-- alter table public.project_overviews
--   add constraint project_overviews_project_id_fkey
--   foreign key (project_id) references public.projects (id) on delete cascade;

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_project_overviews_updated_at on public.project_overviews;
create trigger set_project_overviews_updated_at
before update on public.project_overviews
for each row execute function public.set_updated_at();



