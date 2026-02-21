-- =====================================================
-- Document Access Logs Table
-- =====================================================
-- Purpose: Track every document view for security audit
-- =====================================================

-- Create document access logs table
CREATE TABLE IF NOT EXISTS public.document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.property_documents(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_email TEXT NOT NULL,
  viewer_name TEXT,
  access_type TEXT NOT NULL DEFAULT 'view', -- 'view', 'download', 'print_attempt'
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_id ON public.document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_property_id ON public.document_access_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_viewer_id ON public.document_access_logs(viewer_id);
CREATE INDEX IF NOT EXISTS idx_document_access_logs_accessed_at ON public.document_access_logs(accessed_at DESC);

-- Enable RLS
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own access logs
CREATE POLICY "Users can view their own document access logs"
  ON public.document_access_logs
  FOR SELECT
  USING (auth.uid() = viewer_id);

-- Policy: Property owners can view all access logs for their properties
CREATE POLICY "Property owners can view access logs for their properties"
  ON public.document_access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = document_access_logs.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Policy: Users can insert their own access logs
CREATE POLICY "Users can insert their own document access logs"
  ON public.document_access_logs
  FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Add comment
COMMENT ON TABLE public.document_access_logs IS 'Audit trail for document access in secure viewer';
