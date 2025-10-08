// Google Drive Configuration
export const GOOGLE_DRIVE_CONFIG = {
  // Google Drive folder ID for the PMS project files
  FOLDER_ID: '1E-UswgTvWITsG1xCCIgbVKtLjOburEhC',
  
  // Base URL for the Google Drive folder
  BASE_URL: 'https://drive.google.com/drive/folders/1E-UswgTvWITsG1xCCIgbVKtLjOburEhC?usp=drive_link',
  
  // File organization structure
  FOLDER_STRUCTURE: {
    PROJECTS: 'projects',
    STAGES: 'stages'
  },
  
  // Supported file types and size limits
  FILE_LIMITS: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo'
    ]
  },
  
  // API configuration (for future implementation)
  API: {
    SCOPES: ['https://www.googleapis.com/auth/drive'],
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  }
};

export default GOOGLE_DRIVE_CONFIG;
