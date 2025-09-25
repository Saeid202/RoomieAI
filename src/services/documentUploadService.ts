import { supabase } from "@/integrations/supabase/client";

export interface DocumentUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Upload a document file to Supabase Storage
 */
export async function uploadApplicationDocument(
  file: File, 
  userId: string, 
  applicationId: string,
  documentType: 'reference' | 'employment' | 'credit' | 'additional'
): Promise<DocumentUploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${applicationId}/${documentType}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('rental-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('rental-documents')
      .getPublicUrl(filePath);

    console.log('Document uploaded successfully:', publicUrl);
    
    return {
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  } catch (error) {
    console.error('Error in uploadApplicationDocument:', error);
    throw error;
  }
}

/**
 * Delete a document from Supabase Storage
 */
export async function deleteApplicationDocument(documentUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(documentUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'rental-documents');
    
    if (bucketIndex === -1) {
      throw new Error('Invalid document URL');
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('rental-documents')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error in deleteApplicationDocument:', error);
    throw error;
  }
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF, JPG, PNG, DOC, or DOCX files.'
    };
  }

  return { isValid: true };
}

/**
 * Upload multiple documents for a rental application
 */
export async function uploadApplicationDocuments(
  files: File[],
  userId: string,
  applicationId: string,
  documentType: 'reference' | 'employment' | 'credit' | 'additional'
): Promise<DocumentUploadResult[]> {
  const uploadPromises = files.map(file => 
    uploadApplicationDocument(file, userId, applicationId, documentType)
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple documents:', error);
    throw error;
  }
}
