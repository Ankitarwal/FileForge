-- ==============================================================================
-- FileForge Secure File Sharing - Production-Safe Schema & Security Policies
-- ==============================================================================

-- 1. Performance & Lookup Indexes (Idempotent)
CREATE INDEX IF NOT EXISTS idx_file_shares_token 
  ON public.file_shares (share_token);

CREATE INDEX IF NOT EXISTS idx_file_shares_user_created 
  ON public.file_shares (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_shares_active_expiry 
  ON public.file_shares (is_revoked, expires_at);

CREATE INDEX IF NOT EXISTS idx_file_shares_storage_path 
  ON public.file_shares (storage_path);


-- 2. Enable Row Level Security on public.file_shares
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;


-- 3. Owner RLS Policies for public.file_shares
DROP POLICY IF EXISTS "Authenticated users can insert own file shares" ON public.file_shares;
DROP POLICY IF EXISTS "Authenticated users can select own file shares" ON public.file_shares;
DROP POLICY IF EXISTS "Authenticated users can update own file shares" ON public.file_shares;
DROP POLICY IF EXISTS "Authenticated users can delete own file shares" ON public.file_shares;
DROP POLICY IF EXISTS "Public can select active unexpired shares" ON public.file_shares;

-- Policy 1: Authenticated users can insert records only for their own user_id
CREATE POLICY "Authenticated users can insert own file shares"
ON public.file_shares
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = user_id
);

-- Policy 2: Authenticated users can select only their own file shares
CREATE POLICY "Authenticated users can select own file shares"
ON public.file_shares
FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated'
  AND auth.uid() = user_id
);

-- Policy 3: Authenticated users can update only their own file shares
CREATE POLICY "Authenticated users can update own file shares"
ON public.file_shares
FOR UPDATE
TO authenticated
USING (
  auth.role() = 'authenticated'
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = user_id
);

-- Policy 4: Authenticated users can delete only their own file shares
CREATE POLICY "Authenticated users can delete own file shares"
ON public.file_shares
FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated'
  AND auth.uid() = user_id
);


-- 4. Drop Existing Functions to allow updated return types
DROP FUNCTION IF EXISTS public.get_share_by_token(text);
DROP FUNCTION IF EXISTS public.increment_share_download_count(text);
DROP FUNCTION IF EXISTS public.can_access_shared_file(text);


-- 5. Public Share Lookup Function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_share_by_token(p_token text)
RETURNS TABLE (
  id uuid,
  share_token text,
  file_name text,
  file_size bigint,
  mime_type text,
  storage_path text,
  expires_at timestamptz,
  download_limit integer,
  download_count integer,
  is_revoked boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.share_token,
    s.file_name,
    s.file_size,
    s.mime_type,
    s.storage_path,
    s.expires_at,
    s.download_limit,
    s.download_count,
    s.is_revoked,
    s.created_at
  FROM public.file_shares s
  WHERE s.share_token = p_token
    AND s.is_revoked = false
    AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)
    AND (s.download_limit IS NULL OR s.download_count < s.download_limit)
  LIMIT 1;
END;
$$;


-- 6. Atomic Download Counter Function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_share_download_count(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_share public.file_shares%ROWTYPE;
BEGIN
  UPDATE public.file_shares s
  SET download_count = s.download_count + 1
  WHERE s.share_token = p_token
    AND s.is_revoked = false
    AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)
    AND (s.download_limit IS NULL OR s.download_count < s.download_limit)
  RETURNING * INTO v_share;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Share is invalid, expired, revoked, or limit reached.'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'download_count', v_share.download_count,
    'download_limit', v_share.download_limit,
    'limit_reached', (v_share.download_limit IS NOT NULL AND v_share.download_count >= v_share.download_limit)
  );
END;
$$;


-- 7. Storage Security Helper Function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.can_access_shared_file(object_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.file_shares s
    WHERE s.storage_path = object_path
      AND s.is_revoked = false
      AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)
      AND (s.download_limit IS NULL OR s.download_count <= s.download_limit)
  );
END;
$$;


-- 8. Grant & Revoke Execution Permissions
REVOKE ALL ON FUNCTION public.get_share_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_share_by_token(text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.increment_share_download_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_share_download_count(text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.can_access_shared_file(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_shared_file(text) TO anon, authenticated, service_role;


-- 9. Storage Bucket Setup (shared-files, Private, 50MB Limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('shared-files', 'shared-files', false, 52428800, null)
ON CONFLICT (id) DO UPDATE 
SET 
  public = false,
  file_size_limit = 52428800;


-- 10. Storage Object Policies on storage.objects
DROP POLICY IF EXISTS "Authenticated users can upload shared files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own shared files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own shared files" ON storage.objects;
DROP POLICY IF EXISTS "Allow download of valid shared files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public download of active shared files" ON storage.objects;

-- Storage Policy 1: Authenticated users can upload only into shared-files/<user_id>/*
CREATE POLICY "Authenticated users can upload shared files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shared-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy 2: Authenticated users can update only their own files
CREATE POLICY "Users can update their own shared files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shared-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy 3: Authenticated users can delete only their own files
CREATE POLICY "Users can delete their own shared files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'shared-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy 4: Allow download/signed-URL access only for file owners OR active valid shares
CREATE POLICY "Allow download of valid shared files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'shared-files'
  AND (
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
    OR
    public.can_access_shared_file(name)
  )
);
