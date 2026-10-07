export interface FileShareRecord {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  share_token: string;
  expires_at: string | null;
  download_limit: number | null;
  download_count: number;
  is_revoked: boolean;
  created_at: string;
}

export interface CreateShareParams {
  file: File;
  expiresInHours: number | null; // 1, 24, 168 (7 days), or null (never)
  downloadLimit: number | null; // null (unlimited), 1, 5, 10
  onProgress?: (percent: number) => void;
}

export interface ShareValidationResult {
  isValid: boolean;
  reason?: 'not_found' | 'expired' | 'limit_reached' | 'revoked';
  share?: FileShareRecord;
  remainingDownloads?: number | null;
}
