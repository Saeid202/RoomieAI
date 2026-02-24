-- Check details of the second document that's stuck in pending

SELECT 
  pd.id,
  pd.document_type,
  pd.file_url,
  pd.document_label,
  pd.uploaded_at,
  ps.status,
  ps.error_message,
  ps.created_at as status_created_at
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.id = '4ea873ff-aa83-48f3-9748-1d0bec5eaba4';
