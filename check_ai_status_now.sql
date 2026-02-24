-- Check current AI Property Assistant status
-- Property ID: db8e5787-a221-4381-a148-9aa360b474a4

-- 1. Check all documents for this property
SELECT 
  'Documents' as type,
  id,
  document_type,
  document_label,
  uploaded_at,
  deleted_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN '🗑️ DELETED'
    ELSE '✅ ACTIVE'
  END as status
FROM property_documents
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY uploaded_at DESC;

-- 2. Check processing status
SELECT 
  'Processing Status' as type,
  document_id,
  status,
  total_chunks,
  processed_chunks,
  error_message,
  completed_at
FROM property_document_processing_status
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY created_at DESC;

-- 3. Check AI readiness (what the UI should show)
WITH active_docs AS (
  SELECT id
  FROM property_documents
  WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
    AND deleted_at IS NULL
),
statuses AS (
  SELECT document_id, status
  FROM property_document_processing_status
  WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
)
SELECT 
  'UI Should Show' as type,
  COUNT(DISTINCT ad.id) as total_documents,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.document_id END) as completed,
  COUNT(DISTINCT CASE WHEN s.status = 'processing' THEN s.document_id END) as processing,
  COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.document_id END) as pending,
  COUNT(DISTINCT CASE WHEN s.status = 'failed' THEN s.document_id END) as failed,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.document_id END) > 0 
    THEN '✅ AI READY - CHAT SHOULD BE AVAILABLE'
    WHEN COUNT(DISTINCT CASE WHEN s.status = 'processing' THEN s.document_id END) > 0
    THEN '⏳ PROCESSING - SHOW PROGRESS'
    ELSE '⏸️ NOT STARTED - SHOW PROCESS BUTTON'
  END as ui_state
FROM active_docs ad
LEFT JOIN statuses s ON ad.id = s.document_id;
