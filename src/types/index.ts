export type ToolCategory = 'image' | 'pdf' | 'convert' | 'compress' | 'edit';

export type ProcessingState = 'idle' | 'uploading' | 'processing' | 'optimizing' | 'finalizing' | 'completed' | 'error';

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  category: 'image' | 'pdf';
  type: ToolCategory;
  shortDesc: string;
  longDesc: string;
  iconName: string;
  accentColor: string;
  badge?: string;
  acceptedFormats: string[];
  outputFormat: string;
  supportsMultiple: boolean;
  popular?: boolean;
  seoTitle: string;
  seoDesc: string;
  seoFaqs: { q: string; a: string }[];
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  pageCount?: number;
  rotation?: number;
}

export interface ProcessedResult {
  fileName: string;
  blob: Blob;
  downloadUrl: string;
  originalSize: number;
  processedSize: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
  pageCount?: number;
  savingsPercentage?: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  monthlyUsage: number;
  filesProcessed: number;
  savedBytes: number;
  emailVerified?: boolean;
  avatarUrl?: string;
}

export interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  plan: string | null;
  monthly_usage: number | null;
  files_processed: number | null;
  saved_bytes: number | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  fileName: string;
  timestamp: number;
  originalSize: number;
  processedSize: number;
  status: 'success' | 'failed';
}

export * from './fileShare';

