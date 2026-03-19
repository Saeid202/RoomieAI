import { supabase } from '@/integrations/supabase/client-simple'

export interface ProductDocument {
  id: string
  product_id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number | null
  uploaded_at: string
}

/**
 * Ensure the storage bucket exists
 */
async function ensureBucketExists(): Promise<void> {
  try {
    // Try to create bucket - if it already exists, this will fail silently
    await supabase.storage.createBucket(
      'construction-product-documents',
      { public: true }
    )
  } catch (err) {
    // Bucket likely already exists, which is fine
    // We'll let the actual upload call handle any real errors
  }
}

/**
 * Upload a document for a product
 */
export async function uploadProductDocument(
  productId: string,
  file: File,
  userId: string
): Promise<ProductDocument> {
  // Ensure bucket exists
  await ensureBucketExists()

  // Upload file to storage
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `products/${productId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('construction-product-documents')
    .upload(filePath, file)

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`)
  }

  // Create database record
  const { data, error: dbError } = await supabase
    .from('construction_product_documents')
    .insert({
      product_id: productId,
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
    })
    .select()
    .single()

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage
      .from('construction-product-documents')
      .remove([filePath])
    throw new Error(`Failed to save document record: ${dbError.message}`)
  }

  return data
}

/**
 * Get all documents for a product
 */
export async function getProductDocuments(productId: string): Promise<ProductDocument[]> {
  const { data, error } = await supabase
    .from('construction_product_documents')
    .select('*')
    .eq('product_id', productId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  return data || []
}

/**
 * Delete a document
 */
export async function deleteProductDocument(documentId: string, filePath: string): Promise<void> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('construction-product-documents')
    .remove([filePath])

  if (storageError) {
    throw new Error(`Failed to delete file: ${storageError.message}`)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('construction_product_documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    throw new Error(`Failed to delete document record: ${dbError.message}`)
  }
}

/**
 * Get download URL for a document
 */
export async function getDocumentDownloadUrl(filePath: string): Promise<string> {
  await ensureBucketExists()
  
  const { data } = supabase.storage
    .from('construction-product-documents')
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Download documents for a product
 * If only 1 document: download it directly
 * If multiple documents: create and download as ZIP
 */
export async function downloadProductDocuments(
  productId: string,
  productName: string
): Promise<void> {
  try {
    // Fetch all documents
    const documents = await getProductDocuments(productId)

    if (documents.length === 0) {
      throw new Error('No documents available for download')
    }

    // If only one document, download it directly
    if (documents.length === 1) {
      const doc = documents[0]
      const url = await getDocumentDownloadUrl(doc.file_path)
      
      // Fetch the file as blob to force download
      const response = await fetch(url)
      const blob = await response.blob()
      
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = doc.file_name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      return
    }

    // Multiple documents: create ZIP
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // Download each file and add to ZIP
    for (const doc of documents) {
      const url = await getDocumentDownloadUrl(doc.file_path)
      const response = await fetch(url)
      const blob = await response.blob()
      zip.file(doc.file_name, blob)
    }

    // Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipUrl = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = zipUrl
    link.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-details.zip`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(zipUrl)
  } catch (error) {
    throw new Error(`Failed to download documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download all documents for a product as ZIP (legacy function)
 * @deprecated Use downloadProductDocuments instead
 */
export async function downloadProductDocumentsAsZip(
  productId: string,
  productName: string
): Promise<void> {
  return downloadProductDocuments(productId, productName)
}
