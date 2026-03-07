-- Create lawyer_documents table
CREATE TABLE IF NOT EXISTS lawyer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES lawyer_client_relationships(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  is_shared_with_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lawyer_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Lawyers can view own documents"
  ON lawyer_documents FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can view shared documents"
  ON lawyer_documents FOR SELECT
  USING (auth.uid() = client_id AND is_shared_with_client = true);

CREATE POLICY "Lawyers can manage own documents"
  ON lawyer_documents FOR ALL
  USING (auth.uid() = lawyer_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lawyer_documents_lawyer_id ON lawyer_documents(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_documents_client_id ON lawyer_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_documents_relationship_id ON lawyer_documents(relationship_id);

-- Create storage bucket for lawyer documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('lawyer-documents', 'lawyer-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lawyer documents
CREATE POLICY "Lawyers can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lawyer-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Lawyers can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lawyer-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Lawyers can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lawyer-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Clients can view shared documents (requires checking lawyer_documents table)
CREATE POLICY "Clients can view shared documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lawyer-documents' AND
    EXISTS (
      SELECT 1 FROM lawyer_documents
      WHERE lawyer_documents.file_path = storage.objects.name
        AND lawyer_documents.client_id = auth.uid()
        AND lawyer_documents.is_shared_with_client = true
    )
  );
