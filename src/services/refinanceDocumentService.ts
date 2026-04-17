import { supabase } from '@/integrations/supabase/client';
import type {
  RefinanceDocument,
  RefinanceDocumentCategory,
  RefinanceDocumentStatus,
  DocumentCompletionStats
} from '@/types/refinanceDocument';
import { REFINANCE_DOCUMENT_TYPES } from '@/types/refinanceDocument';
import { validateFileWithMagicNumber } from '@/utils/fileMagicNumbers';

/**
 * Upload a refinance document to storage and create database record
 */
export async function uploadDocument(
  mortgageProfileId: string,
  category: RefinanceDocumentCategory,
  documentType: string,
  file: File
): Promise<{ data: RefinanceDocument | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${mortgageProfileId}/${category}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('refinance-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create database record
    const { data, error: dbError } = await supabase
      .from('refinance_documents')
      .insert({
        mortgage_profile_id: mortgageProfileId,
        user_id: user.id,
        document_category: category,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        upload_status: 'uploaded',
        is_required: isDocumentRequired(category, documentType)
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('refinance-documents')
        .remove([filePath]);
      throw dbError;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error uploading refinance document:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get all refinance documents for a mortgage profile
 */
export async function getDocumentsByProfile(
  mortgageProfileId: string
): Promise<{ data: RefinanceDocument[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('refinance_documents')
      .select('*')
      .eq('mortgage_profile_id', mortgageProfileId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching refinance documents:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get refinance documents by category
 */
export async function getDocumentsByCategory(
  mortgageProfileId: string,
  category: RefinanceDocumentCategory
): Promise<{ data: RefinanceDocument[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('refinance_documents')
      .select('*')
      .eq('mortgage_profile_id', mortgageProfileId)
      .eq('document_category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching refinance documents by category:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Delete a refinance document
 */
export async function deleteDocument(
  documentId: string
): Promise<{ error: Error | null }> {
  try {
    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .from('refinance_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;
    if (!document) throw new Error('Document not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('refinance-documents')
      .remove([document.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('refinance_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) throw dbError;

    return { error: null };
  } catch (error) {
    console.error('Error deleting refinance document:', error);
    return { error: error as Error };
  }
}

/**
 * Get signed URL for document download/view
 */
export async function getDocumentUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from('refinance-documents')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return { data: data.signedUrl, error: null };
  } catch (error) {
    console.error('Error getting refinance document URL:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update document status (for broker verification)
 */
export async function updateDocumentStatus(
  documentId: string,
  status: RefinanceDocumentStatus,
  notes?: string
): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {
      upload_status: status,
      notes
    };

    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_by = user.id;
    }

    const { error } = await supabase
      .from('refinance_documents')
      .update(updateData)
      .eq('id', documentId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error updating refinance document status:', error);
    return { error: error as Error };
  }
}

/**
 * Calculate document completion statistics
 */
export async function getDocumentCompletionStats(
  mortgageProfileId: string
): Promise<{ data: DocumentCompletionStats | null; error: Error | null }> {
  try {
    const { data: documents, error } = await getDocumentsByProfile(mortgageProfileId);
    
    if (error) throw error;
    if (!documents) throw new Error('No documents found');

    // Count required and optional documents
    let totalRequired = 0;
    let uploadedRequired = 0;
    let totalOptional = 0;
    let uploadedOptional = 0;

    // Get all document types from config
    Object.values(REFINANCE_DOCUMENT_TYPES).forEach(categoryTypes => {
      categoryTypes.forEach(docType => {
        if (docType.required) {
          totalRequired++;
          const uploaded = documents.find(
            d => d.document_type === docType.type && d.upload_status === 'uploaded'
          );
          if (uploaded) uploadedRequired++;
        } else {
          totalOptional++;
          const uploaded = documents.find(
            d => d.document_type === docType.type && d.upload_status === 'uploaded'
          );
          if (uploaded) uploadedOptional++;
        }
      });
    });

    const completionPercentage = totalRequired > 0
      ? Math.round((uploadedRequired / totalRequired) * 100)
      : 0;

    return {
      data: {
        totalRequired,
        uploadedRequired,
        totalOptional,
        uploadedOptional,
        completionPercentage
      },
      error: null
    };
  } catch (error) {
    console.error('Error calculating refinance completion stats:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Check if a document type is required
 */
function isDocumentRequired(
  category: RefinanceDocumentCategory,
  documentType: string
): boolean {
  const categoryTypes = REFINANCE_DOCUMENT_TYPES[category];
  const docConfig = categoryTypes.find(dt => dt.type === documentType);
  return docConfig?.required || false;
}

/**
 * Validate file before upload - size check + extension-based validation for robustness.
 */
export async function validateFile(
  file: File,
  category: RefinanceDocumentCategory,
  documentType: string
): Promise<{ valid: boolean; error?: string }> {
  console.log('REFINANCE VALIDATION DEBUG:');
  console.log('  File name:', file.name);
  console.log('  File type:', file.type);
  console.log('  File size:', file.size);
  console.log('  Category:', category);
  console.log('  Document type:', documentType);
  
  const categoryTypes = REFINANCE_DOCUMENT_TYPES[category];
  console.log('  Available types in category:', categoryTypes?.map(t => t.type));
  const docConfig = categoryTypes.find(dt => dt.type === documentType);

  console.log('  Found docConfig:', docConfig);
  console.log('  Accepted formats:', docConfig?.acceptedFormats);

  if (!docConfig) {
    console.log('  ERROR: Invalid document type');
    return { valid: false, error: 'Invalid document type' };
  }

  // Check file size
  if (file.size > docConfig.maxSize) {
    const maxSizeMB = docConfig.maxSize / (1024 * 1024);
    console.log(`  ERROR: File size ${file.size} exceeds ${maxSizeMB}MB limit`);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  console.log('  File size OK');

  // Extension-based validation for robust PDF support
  console.log('  Checking file extension...');
  const fileExtension = file.name.toLowerCase().split('.').pop();
  console.log('  File extension:', fileExtension);
  
  // Allow PDFs regardless of MIME type
  if (fileExtension === 'pdf') {
    console.log('  Checking if PDF is allowed for this document type...');
    console.log('  Accepted formats:', docConfig.acceptedFormats);
    
    const isPdfAllowed = docConfig.acceptedFormats.some(format => {
      console.log(`    Checking format: ${format.toLowerCase()} includes 'pdf': ${format.toLowerCase().includes('pdf')}`);
      return format.toLowerCase().includes('pdf');
    });
    
    if (isPdfAllowed) {
      console.log('  PDF file accepted based on extension');
      return { valid: true };
    } else {
      console.log('  ERROR: PDF not allowed for this document type');
      return { valid: false, error: 'PDF files are not accepted for this document type' };
    }
  }

  // For non-PDF files, use the original validation logic
  console.log('  Checking non-PDF file type against accepted formats...');
  const typeCheck = await validateFileWithMagicNumber(file, docConfig.acceptedFormats);
  console.log('  Type check result:', typeCheck);
  
  if (!typeCheck.valid) {
    console.log('  ERROR: File validation failed:', typeCheck.error);
    return { valid: false, error: typeCheck.error ?? 'Invalid file format' };
  }

  console.log('  File validation SUCCESS!');
  return { valid: true };
}
