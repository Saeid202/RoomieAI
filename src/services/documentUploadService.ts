// Service for handling tenant document uploads to Supabase Storage
import { supabase } from "@/integrations/supabase/client";

export type DocumentType = 
  | "reference_letters"
  | "employment_letter"
  | "credit_score_report"
  | "additional_documents";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a document to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID
 * @param documentType - Type of document being uploaded
 * @returns Upload result with URL or error
 */
export async function uploadTenantDocument(
  file: File,
  userId: string,
  documentType: DocumentType
): Promise<UploadResult> {
  try {
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 10MB limit"
      };
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload PDF, JPG, PNG, or DOC files."
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${timestamp}.${fileExt}`;
    const filePath = `${userId}/${documentType}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tenant-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL (even though bucket is private, we need the path)
    const { data: urlData } = supabase.storage
      .from('tenant-documents')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: filePath // Store the path, not the public URL
    };
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Delete a document from Supabase Storage
 * @param filePath - The path to the file in storage
 * @returns Success status
 */
export async function deleteTenantDocument(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('tenant-documents')
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected delete error:", error);
    return false;
  }
}

/**
 * Get a signed URL for viewing a document
 * @param filePath - The path to the file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null
 */
export async function getDocumentSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('tenant-documents')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Unexpected error creating signed URL:", error);
    return null;
  }
}

/**
 * Download a document
 * @param filePath - The path to the file in storage
 * @returns Blob or null
 */
export async function downloadTenantDocument(filePath: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from('tenant-documents')
      .download(filePath);

    if (error) {
      console.error("Download error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected download error:", error);
    return null;
  }
}

/**
 * Update tenant profile with document URL
 * @param userId - The user's ID
 * @param documentType - Type of document
 * @param filePath - Path to the file in storage
 * @returns Success status
 */
export async function updateTenantProfileDocument(
  userId: string,
  documentType: DocumentType,
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tenant_profiles')
      .update({
        [documentType]: filePath,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error("Error updating tenant profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating profile:", error);
    return false;
  }
}
