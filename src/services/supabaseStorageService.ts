import { supabase } from '../superBaseClient';

const STORAGE_BUCKET = 'project-files';

interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

class SupabaseStorageService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    this.isInitialized = true;
  }

  async uploadFile(
    file: File,
    projectId: string,
    stageId?: string,
    uploaderId?: string
  ): Promise<UploadResult> {
    if (!this.isInitialized || !supabase) {
      return {
        success: false,
        error: 'Storage service not initialized'
      };
    }

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = stageId
        ? `${projectId}/${stageId}/${timestamp}-${sanitizedFileName}`
        : `${projectId}/${timestamp}-${sanitizedFileName}`;

      console.log('Uploading file to Supabase Storage:', storagePath);

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            uploader: uploaderId || 'unknown'
          }
        });

      if (error) {
        console.error('Error uploading file:', error);
        return {
          success: false,
          error: error.message
        };
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      console.log('File uploaded successfully:', data.path);

      return {
        success: true,
        path: data.path,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    if (!this.isInitialized || !supabase) {
      console.error('Storage service not initialized');
      return false;
    }

    try {
      console.log('Deleting file from Supabase Storage:', storagePath);

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      console.log('File deleted successfully:', storagePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  getPublicUrl(storagePath: string): string {
    if (!supabase) {
      return '';
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }

  async downloadFile(storagePath: string): Promise<Blob | null> {
    if (!this.isInitialized || !supabase) {
      console.error('Storage service not initialized');
      return null;
    }

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(storagePath);

      if (error) {
        console.error('Error downloading file:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  async listFiles(projectId: string, stageId?: string): Promise<string[]> {
    if (!this.isInitialized || !supabase) {
      console.error('Storage service not initialized');
      return [];
    }

    try {
      const path = stageId ? `${projectId}/${stageId}` : projectId;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(path);

      if (error) {
        console.error('Error listing files:', error);
        return [];
      }

      return data.map(file => file.name);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const supabaseStorageService = new SupabaseStorageService();
export default supabaseStorageService;
