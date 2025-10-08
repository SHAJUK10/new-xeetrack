# Project Type Feature - Database Migration

## Overview
This document explains how to apply the database migration for the new project type feature.

## Migration File
The migration file is located at: `supabase/migrations/20250102000002_project_type.sql`

## Manual Application
If you have access to your Supabase dashboard, you can apply this migration manually:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250102000002_project_type.sql`
4. Execute the SQL

## Migration Contents
The migration adds:
- `project_type` column to the `projects` table
- CHECK constraint for valid project types
- Index for efficient filtering
- Valid project types: Logo, Stationery, Company Profile, Website, SEO, Hosting, Social Media, Software

## Features Added
1. **Project Creation**: Managers can now select a project type when creating projects
2. **Project Filtering**: Managers can filter projects by type in the dashboard
3. **Project Display**: Project cards now show the project type as a badge
4. **Database Support**: Full database schema support for project types

## Testing
After applying the migration:
1. Create a new project and select a project type
2. Use the project type filter in the manager dashboard
3. Verify project cards display the project type badge
4. Test editing existing projects to add project types
