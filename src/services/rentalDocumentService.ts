import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export interface RentalDocument {
  id: string;
  application_id: string;
  document_type: 'reference' | 'employment' | 'credit' | 'additional';
  original_filename: string;
  storage_url: string;
  file_size_bytes: number;
  mime_type: string;
  status: 'uploaded' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadInput {
  application_id: string;
  document_type: 'reference' | 'employment' | 'credit' | 'additional';
  file: File;
  description?: string;
}

/**
 * Upload a document file and create database record
 */
export async function uploadRentalDocument(input: DocumentUploadInput): Promise<RentalDocument> {
  console.log("🔄 Starting document upload:", {
    type: input.document_type,
    filename: input.file.name,
    size: input.file.size,
    mimeType: input.file.type,
    applicationId: input.application_id
  });
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    console.log("✅ User authenticated:", user.id);

    // Generate unique filename
    const fileExt = input.file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${input.application_id}/${input.document_type}/${fileName}`;
    console.log("📁 Generated file path:", filePath);

    // Upload to Supabase Storage
    console.log("☁️ Uploading to storage...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rental-documents')
      .upload(filePath, input.file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      throw new Error(`Failed to upload document: ${uploadError.message}`);
    }
    console.log("✅ Storage upload successful:", uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('rental-documents')
      .getPublicUrl(filePath);
    console.log("🔗 Generated public URL:", publicUrl);

    // Create database record
    const documentRecord = {
      application_id: input.application_id,
      document_type: input.document_type,
      original_filename: input.file.name,
      storage_url: publicUrl,
      file_size_bytes: input.file.size,
      mime_type: input.file.type,
      description: input.description || null,
      status: 'uploaded'
    };
    console.log("💾 Creating database record:", documentRecord);

    const { data, error } = await sb
      .from('rental_documents')
      .insert(documentRecord)
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      console.log("🧹 Attempting to cleanup uploaded file...");
      try {
        await supabase.storage.from('rental-documents').remove([filePath]);
        console.log("✅ File cleanup successful");
      } catch (cleanupError) {
        console.error("❌ File cleanup failed:", cleanupError);
      }
      throw new Error(`Failed to create document record: ${error.message}`);
    }

    console.log('🎉 Document uploaded and recorded successfully:', data.id);
    return data as RentalDocument;
  } catch (error) {
    console.error('💥 Error in uploadRentalDocument:', error);
    throw error;
  }
}

/**
 * Get documents for a specific application
 */
export async function getApplicationDocuments(applicationId: string): Promise<RentalDocument[]> {
  console.log("🔍 Fetching documents for application:", applicationId);
  
  try {
    console.log("📡 Making Supabase query...");
    const { data, error } = await sb
      .from('rental_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    console.log("📊 Query result:", { data, error });

    if (error) {
      console.error("❌ Error fetching application documents:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    console.log("✅ Application documents fetched successfully:", data?.length || 0);
    console.log("📄 Documents data:", data);
    return (data as RentalDocument[]) || [];
  } catch (error) {
    console.error("💥 Error in getApplicationDocuments:", error);
    return [];
  }
}

/**
 * Get documents by type for an application
 */
export async function getDocumentsByType(
  applicationId: string, 
  documentType: 'reference' | 'employment' | 'credit' | 'additional'
): Promise<RentalDocument[]> {
  console.log("Fetching documents by type:", applicationId, documentType);
  
  try {
    const { data, error } = await sb
      .from('rental_documents')
      .select('*')
      .eq('application_id', applicationId)
      .eq('document_type', documentType)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching documents by type:", error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    console.log(`${documentType} documents fetched successfully:`, data?.length || 0);
    return (data as RentalDocument[]) || [];
  } catch (error) {
    console.error("Error in getDocumentsByType:", error);
    return [];
  }
}

/**
 * Delete a document (removes from storage and database)
 */
export async function deleteRentalDocument(documentId: string): Promise<void> {
  console.log("Deleting rental document:", documentId);
  
  try {
    // Get document info first
    const { data: document, error: fetchError } = await sb
      .from('rental_documents')
      .select('storage_url')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Extract file path from URL for storage deletion
    const url = new URL(document.storage_url);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'rental-documents');
    
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('rental-documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await sb
      .from('rental_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      throw new Error(`Failed to delete document record: ${deleteError.message}`);
    }

    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error in deleteRentalDocument:', error);
    throw error;
  }
}

/**
 * Verify a document (landlord action)
 */
export async function verifyDocument(documentId: string): Promise<RentalDocument> {
  console.log("Verifying document:", documentId);
  
  try {
    const { data, error } = await sb
      .from('rental_documents')
      .update({ 
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error("Error verifying document:", error);
      throw new Error(`Failed to verify document: ${error.message}`);
    }

    console.log("Document verified successfully:", data);
    return data as RentalDocument;
  } catch (error) {
    console.error("Error in verifyDocument:", error);
    throw error;
  }
}

/**
 * Reject a document (landlord action)
 */
export async function rejectDocument(documentId: string, reason: string): Promise<RentalDocument> {
  console.log("Rejecting document:", documentId, reason);
  
  try {
    const { data, error } = await sb
      .from('rental_documents')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        verified_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting document:", error);
      throw new Error(`Failed to reject document: ${error.message}`);
    }

    console.log("Document rejected successfully:", data);
    return data as RentalDocument;
  } catch (error) {
    console.error("Error in rejectDocument:", error);
    throw error;
  }
}

/**
 * Get document summary for an application
 */
export async function getDocumentSummary(applicationId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  console.log("Getting document summary for application:", applicationId);
  
  try {
    const documents = await getApplicationDocuments(applicationId);
    
    const summary = {
      total: documents.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>
    };

    documents.forEach(doc => {
      // Count by type
      summary.byType[doc.document_type] = (summary.byType[doc.document_type] || 0) + 1;
      
      // Count by status
      summary.byStatus[doc.status] = (summary.byStatus[doc.status] || 0) + 1;
    });

    return summary;
  } catch (error) {
    console.error("Error in getDocumentSummary:", error);
    return { total: 0, byType: {}, byStatus: {} };
  }
}

/**
 * Check if all required documents are uploaded for an application
 */
export async function areRequiredDocumentsUploaded(applicationId: string): Promise<{
  isComplete: boolean;
  missing: string[];
  uploaded: string[];
}> {
  console.log("Checking required documents for application:", applicationId);
  
  const requiredTypes = ['reference', 'employment', 'credit'];
  
  try {
    const documents = await getApplicationDocuments(applicationId);
    const uploadedTypes = [...new Set(documents.map(doc => doc.document_type))];
    const missing = requiredTypes.filter(type => !uploadedTypes.includes(type as any));
    
    return {
      isComplete: missing.length === 0,
      missing,
      uploaded: uploadedTypes
    };
  } catch (error) {
    console.error("Error checking required documents:", error);
    return {
      isComplete: false,
      missing: requiredTypes,
      uploaded: []
    };
  }
}
