import { supabase } from './supabaseClient';
import { FileShareRecord, CreateShareParams, ShareValidationResult } from '../types/fileShare';
import { downloadBlob } from '../utils/fileUtils';

const STORAGE_BUCKET = 'shared-files';
const LOCAL_STORAGE_KEY = 'fileforge_local_file_shares';

// Helper to generate high-entropy unguessable tokens
function generateShareToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  // 32-character high entropy token
  const cryptoArr = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(cryptoArr);
    for (let i = 0; i < cryptoArr.length; i++) {
      token += chars[cryptoArr[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return token;
}

// Local cache backup helpers
function getLocalShares(): FileShareRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalShare(share: FileShareRecord) {
  try {
    const existing = getLocalShares();
    const updated = [share, ...existing.filter(s => s.id !== share.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export class FileSharingService {
  /**
   * Uploads file to Supabase Storage and creates a record in file_shares table
   */
  static async createShare(
    params: CreateShareParams,
    user: { id: string; email?: string }
  ): Promise<{ share: FileShareRecord; shareUrl: string }> {
    const { file, expiresInHours, downloadLimit, onProgress } = params;

    const shareId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `share_${Date.now()}`;
    const shareToken = generateShareToken();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${shareId}/${sanitizedName}`;

    // Calculate expiry timestamp
    let expiresAt: string | null = null;
    if (expiresInHours && expiresInHours > 0) {
      const d = new Date();
      d.setHours(d.getHours() + expiresInHours);
      expiresAt = d.toISOString();
    }

    if (onProgress) onProgress(15);

    // 1. Upload to Supabase Storage
    let uploadSuccess = false;
    try {
      if (onProgress) onProgress(40);
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (storageError) {
        console.warn('Supabase storage upload returned error (will check bucket status):', storageError);
        // If bucket is not yet created in Supabase, throw informative error with migration hint
        if (storageError.message?.toLowerCase().includes('bucket') || storageError.message?.toLowerCase().includes('not found')) {
          throw new Error('Supabase Storage bucket "shared-files" not found. Please ensure the migration script in supabase/migrations/20261007_file_shares.sql is executed.');
        }
        throw new Error(storageError.message || 'Failed to upload file to storage');
      }
      uploadSuccess = true;
    } catch (err: any) {
      console.error('Storage upload failure:', err);
      throw err;
    }

    if (onProgress) onProgress(80);

    // 2. Insert record into file_shares table
    const newRecord: FileShareRecord = {
      id: shareId,
      user_id: user.id,
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      share_token: shareToken,
      expires_at: expiresAt,
      download_limit: downloadLimit || null,
      download_count: 0,
      is_revoked: false,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error: dbError } = await supabase
        .from('file_shares')
        .insert([
          {
            id: newRecord.id,
            user_id: newRecord.user_id,
            file_name: newRecord.file_name,
            storage_path: newRecord.storage_path,
            file_size: newRecord.file_size,
            mime_type: newRecord.mime_type,
            share_token: newRecord.share_token,
            expires_at: newRecord.expires_at,
            download_limit: newRecord.download_limit,
            download_count: 0,
            is_revoked: false,
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.warn('Database insert error in file_shares:', dbError);
        // Fallback save locally if database table not yet deployed
        saveLocalShare(newRecord);
      } else if (data) {
        newRecord.created_at = data.created_at || newRecord.created_at;
      }
    } catch (err) {
      console.warn('Database connection warning, saved locally:', err);
      saveLocalShare(newRecord);
    }

    if (onProgress) onProgress(100);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share/${shareToken}`;

    return { share: newRecord, shareUrl };
  }

  /**
   * Fetch all file shares for a given user
   */
  static async getUserShares(userId: string): Promise<FileShareRecord[]> {
    try {
      const { data, error } = await supabase
        .from('file_shares')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not query file_shares table, returning local shares:', error);
        return getLocalShares().filter(s => s.user_id === userId);
      }

      if (data) {
        return data as FileShareRecord[];
      }
    } catch (err) {
      console.warn('getUserShares fallback:', err);
    }

    return getLocalShares().filter(s => s.user_id === userId);
  }

  /**
   * Revoke an active share link
   */
  static async revokeShare(shareId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('file_shares')
        .update({ is_revoked: true })
        .eq('id', shareId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Revoke share db warning:', error);
      }
    } catch (err) {
      console.warn('Revoke error:', err);
    }

    // Update local cache
    const local = getLocalShares();
    const updated = local.map(s => s.id === shareId ? { ...s, is_revoked: true } : s);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    return true;
  }

  /**
   * Permanently delete a share and its storage file
   */
  static async deleteShare(shareId: string, storagePath: string, userId: string): Promise<boolean> {
    try {
      // Delete storage object
      if (storagePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      }

      // Delete database row
      await supabase
        .from('file_shares')
        .delete()
        .eq('id', shareId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Delete share error:', err);
    }

    // Clean local cache
    const local = getLocalShares();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local.filter(s => s.id !== shareId)));

    return true;
  }

  /**
   * Validate and retrieve public metadata for a shared file by token using secure RPC
   */
  static async getShareByToken(token: string): Promise<ShareValidationResult> {
    if (!token || token.trim().length === 0) {
      return { isValid: false, reason: 'not_found' };
    }

    // 1. Try secure public RPC function (SECURITY DEFINER)
    try {
      const { data, error } = await supabase.rpc('get_share_by_token', {
        p_token: token.trim(),
      });

      if (!error && data) {
        // Function returns record or null
        const row = Array.isArray(data) ? data[0] : data;
        if (row && row.share_token) {
          const isRevoked = !!row.is_revoked;
          const isExpired = row.expires_at ? new Date(row.expires_at) <= new Date() : false;
          const isLimitReached = row.download_limit ? row.download_count >= row.download_limit : false;

          if (isRevoked) return { isValid: false, reason: 'revoked', share: row };
          if (isExpired) return { isValid: false, reason: 'expired', share: row };
          if (isLimitReached) return { isValid: false, reason: 'limit_reached', share: row, remainingDownloads: 0 };

          const remainingDownloads = row.download_limit ? Math.max(0, row.download_limit - row.download_count) : null;
          return { isValid: true, share: row, remainingDownloads };
        } else if (row && row.is_valid === false) {
          return { isValid: false, reason: row.invalid_reason || 'not_found' };
        }
      }
    } catch (rpcErr) {
      console.warn('RPC get_share_by_token error, using fallback:', rpcErr);
    }

    // 2. Direct select fallback if RPC not yet deployed
    let share: FileShareRecord | null = null;
    try {
      const { data, error } = await supabase
        .from('file_shares')
        .select('*')
        .eq('share_token', token)
        .single();

      if (!error && data) {
        share = data as FileShareRecord;
      }
    } catch (err) {
      console.warn('Direct query fallback notice:', err);
    }

    // 3. Local fallback
    if (!share) {
      const local = getLocalShares();
      share = local.find(s => s.share_token === token) || null;
    }

    if (!share) {
      return { isValid: false, reason: 'not_found' };
    }

    if (share.is_revoked) {
      return { isValid: false, reason: 'revoked', share };
    }

    if (share.expires_at && new Date(share.expires_at) <= new Date()) {
      return { isValid: false, reason: 'expired', share };
    }

    if (share.download_limit && share.download_limit > 0 && share.download_count >= share.download_limit) {
      return { isValid: false, reason: 'limit_reached', share, remainingDownloads: 0 };
    }

    const remainingDownloads = share.download_limit
      ? Math.max(0, share.download_limit - share.download_count)
      : null;

    return {
      isValid: true,
      share,
      remainingDownloads,
    };
  }

  /**
   * Download a shared file using Supabase Storage signed URLs
   */
  static async downloadSharedFile(share: FileShareRecord): Promise<void> {
    // 1. Re-validate
    const validation = await this.getShareByToken(share.share_token);
    if (!validation.isValid) {
      throw new Error(
        validation.reason === 'expired'
          ? 'This share link has expired.'
          : validation.reason === 'limit_reached'
          ? 'The download limit for this file has been reached.'
          : validation.reason === 'revoked'
          ? 'This share link has been revoked by the owner.'
          : 'Invalid or missing share link.'
      );
    }

    // 2. Increment download count in background (atomic secure RPC)
    try {
      const { error: rpcError } = await supabase.rpc('increment_share_download_count', {
        p_token: share.share_token,
      });

      if (rpcError) {
        // Fallback parameter alias
        await supabase.rpc('increment_share_download_count', {
          token_input: share.share_token,
        });
      }
    } catch (e) {
      console.warn('Could not increment download count via RPC:', e);
    }

    // Update local cache count
    const local = getLocalShares();
    const updated = local.map(s => s.id === share.id ? { ...s, download_count: s.download_count + 1 } : s);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // 3. Create a short-lived (60 seconds) Signed Download URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(share.storage_path, 60, {
        download: share.file_name,
      });

    if (signedError || !signedData?.signedUrl) {
      // Direct blob download fallback
      const { data: blobData, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(share.storage_path);

      if (downloadError || !blobData) {
        throw new Error('Unable to retrieve file from storage. The file may have been moved or removed.');
      }

      downloadBlob(blobData, share.file_name);
      return;
    }

    // Trigger browser download via signed URL
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = signedData.signedUrl;
    a.download = share.file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 2000);
  }
}
