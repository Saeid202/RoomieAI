-- Verify AI Assistant is ready to use
-- This checks the exact same logic as the frontend code

-- 1. Check active documents (not deleted)
SELECT 
  'Active Documents' as check_type,
  COUNT(*) as count
FROM property_documents
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
  AND deleted_at IS NULL;

-- 2. Check processing statuses
SELECT 
  'Processing Status' as check_type,
  status,
  COUNT(*) as count
FROM property_document_processing_status
WHERE property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
GROUP BY status;

-- 3. Check AI readiness (same logic as frontend)
WITH active_docs AS (
  SELECT id, document_type
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
  'AI Readiness Summary' as check_type,
  COUNT(DISTINCT ad.id) as total_documents,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.document_id END) as processed_documents,
  COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.document_id END) as pending_documents,
  COUNT(DISTINCT CASE WHEN s.status = 'processing' THEN s.document_id END) as processing_documents,
  COUNT(DISTINCT CASE WHEN s.status = 'failed' THEN s.document_id END) as failed_documents,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.document_id END) > 0 
    THEN 'READY ✅' 
    ELSE 'NOT READY ❌' 
  END as ai_status
FROM active_docs ad
LEFT JOIN statuses s ON ad.id = s.document_id;

-- 4. Detailed view of all documents
SELECT 
  pd.id,
  pd.document_type,
  pd.document_label,
  pd.deleted_at,
  ps.status,
  ps.total_chunks,
  ps.completed_at,
  CASE 
    WHEN pd.deleted_at IS NOT NULL THEN '🗑️ DELETED (ignored by UI)'
    WHEN ps.status = 'completed' THEN '✅ READY FOR AI'
    WHEN ps.status = 'processing' THEN '⏳ PROCESSING'
    WHEN ps.status = 'pending' THEN '⏸️ PENDING'
    WHEN ps.status = 'failed' THEN '❌ FAILED'
    ELSE '❓ NO STATUS'
  END as ui_display
FROM property_documents pd
LEFT JOIN property_document_processing_status ps ON pd.id = ps.document_id
WHERE pd.property_id = 'db8e5787-a221-4381-a148-9aa360b474a4'
ORDER BY pd.uploaded_at DESC;
