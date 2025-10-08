# Supabase Storage Setup Guide

This guide explains how to set up the Supabase Storage bucket for the PMS application.

## Storage Bucket Configuration

The application now uses **Supabase Storage** instead of Google Drive for file management. This provides seamless integration with your existing authentication and database infrastructure.

### Manual Setup Steps

Since the Supabase MCP tools are temporarily unavailable, you'll need to create the storage bucket manually through the Supabase Dashboard:

1. **Navigate to Storage in Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Click on "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket"
   - Bucket name: `project-files`
   - Public bucket: **No** (keep it private for security)
   - File size limit: `52428800` (50MB)
   - Allowed MIME types: Configure to allow common file types (see below)

3. **Configure Storage Policies**

Navigate to the Policies tab and add the following policies:

#### Policy 1: Upload Files
```sql
CREATE POLICY "Users can upload files to accessible projects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' AND
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager' OR
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'employee' AND
      EXISTS (
        SELECT 1 FROM projects
        WHERE id = (storage.foldername(name))[1]::uuid
        AND assigned_employees @> ARRAY[auth.uid()]
      )
    )
  )
);
```

#### Policy 2: Download Files
```sql
CREATE POLICY "Users can download files from accessible projects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager' OR
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'employee' AND
      EXISTS (
        SELECT 1 FROM projects
        WHERE id = (storage.foldername(name))[1]::uuid
        AND assigned_employees @> ARRAY[auth.uid()]
      )
    ) OR
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'client' AND
      EXISTS (
        SELECT 1 FROM projects
        WHERE id = (storage.foldername(name))[1]::uuid
        AND client_id = auth.uid()
      )
    )
  )
);
```

#### Policy 3: Delete Files
```sql
CREATE POLICY "Managers and file uploaders can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager' OR
    owner = auth.uid()
  )
);
```

#### Policy 4: Update File Metadata
```sql
CREATE POLICY "Managers can update file metadata"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
)
WITH CHECK (
  bucket_id = 'project-files' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
);
```

### Allowed MIME Types

Configure these MIME types in the bucket settings:
- `image/jpeg`, `image/png`, `image/gif`, `image/svg+xml`, `image/webp`
- `application/pdf`
- `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `text/plain`, `text/csv`
- `application/zip`, `application/x-rar-compressed`, `application/x-7z-compressed`
- `video/mp4`, `video/quicktime`, `video/x-msvideo`, `video/webm`

## File Organization

Files are automatically organized in the following structure:
```
project-files/
├── {project_id}/
│   ├── {stage_id}/
│   │   └── {timestamp}-{filename}
│   └── {timestamp}-{filename}
```

## Features

### What's Changed
- **Storage Backend**: Migrated from Google Drive to Supabase Storage
- **File URLs**: Files now use Supabase Storage URLs instead of Google Drive links
- **Access Control**: Uses RLS policies for secure, role-based access
- **File Size**: Increased limit to 50MB (from 10MB)
- **UI Updates**: Removed Google Drive references, updated download buttons

### Benefits
1. **Seamless Integration**: No external API setup required
2. **Secure Access**: Built-in RLS policies control who can access files
3. **Better Performance**: Direct integration with Supabase infrastructure
4. **Simpler Maintenance**: No need to manage Google Drive credentials
5. **Consistent Experience**: Files work the same way as your database

## Usage

### For Managers
- Upload files to any project through Storage Manager or Stage File Manager
- Download files by clicking the download icon
- Delete files if needed

### For Employees
- Upload files to projects you're assigned to
- Download files from your assigned projects
- View all project files in Storage Manager

### For Clients
- View and download files from your projects
- Access files through Storage Manager

## Troubleshooting

### Files Not Uploading
1. Check that the `project-files` bucket exists in Supabase Storage
2. Verify storage policies are configured correctly
3. Ensure the file size is under 50MB
4. Check that the file type is in the allowed MIME types list

### Files Not Displaying
1. Verify the files table has the correct file URLs
2. Check that storage policies allow SELECT for your role
3. Confirm you have access to the project containing the files

### Access Denied Errors
1. Ensure you're authenticated (logged in)
2. Verify your role has the correct permissions in the storage policies
3. Check that you're assigned to the project (for employees)
4. Confirm you own the project (for clients)

## Database Schema

The existing `files` table is used to store file metadata:
- `file_url`: Now contains Supabase Storage public URLs
- `storage_path`: Contains the storage path (e.g., `project_id/stage_id/timestamp-filename`)
- All other fields remain unchanged

## Migration Complete

The application has been fully migrated to use Supabase Storage. Once you create the storage bucket and configure the policies as described above, file upload, download, and deletion will work seamlessly.
