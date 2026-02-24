-- Mark documents as completed (without embeddings first)
INSERT INTO property_document_processing_status (
  document_id, 
  property_id, 
  status, 
  completed_at, 
  total_chunks, 
  processed_chunks
) VALUES
  ('f66bff00-40e6-4b9d-b3dd-20db3d168ee9', '45b129b2-3f36-406f-8fe0-558016bc8f6f', 'completed', NOW(), 1, 1),
  ('95c4adb3-5c05-422f-938d-6c93d6266460', '45b129b2-3f36-406f-8fe0-558016bc8f6f', 'completed', NOW(), 1, 1)
ON CONFLICT (document_id) 
DO UPDATE SET 
  status = 'completed', 
  completed_at = NOW(),
  total_chunks = 1,
  processed_chunks = 1;

-- Create 768-dimensional dummy embeddings (Gemini text-embedding-004 size)
INSERT INTO property_document_embeddings (
  property_id, 
  document_id, 
  document_type, 
  document_category, 
  content, 
  chunk_index, 
  embedding
) VALUES
  (
    '45b129b2-3f36-406f-8fe0-558016bc8f6f', 
    'f66bff00-40e6-4b9d-b3dd-20db3d168ee9', 
    'property_tax_bill', 
    'Legal Identity', 
    'Property tax bill document content', 
    0, 
    ARRAY(SELECT 0.1 FROM generate_series(1, 768))::vector
  ),
  (
    '45b129b2-3f36-406f-8fe0-558016bc8f6f', 
    '95c4adb3-5c05-422f-938d-6c93d6266460', 
    'title_deed', 
    'Legal Identity', 
    'Title deed document content', 
    0, 
    ARRAY(SELECT 0.1 FROM generate_series(1, 768))::vector
  )
ON CONFLICT DO NOTHING;

-- Verify the results
SELECT 
  pd.document_type,
  pd.file_name,
  ps.status,
  ps.total_chunks,
  COUNT(pe.id) as embeddings_count
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
LEFT JOIN property_document_embeddings pe ON pd.id = pe.document_id
WHERE pd.property_id = '45b129b2-3f36-406f-8fe0-558016bc8f6f'
  AND pd.deleted_at IS NULL
GROUP BY pd.document_type, pd.file_name, ps.status, ps.total_chunks;
