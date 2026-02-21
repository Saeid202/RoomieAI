// =====================================================
// Property Document Service
// =====================================================
// Purpose: Handle property document uploads, access
//          requests, and listing strength calculations
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import type { PropertyDocument, DocumentAccessRequest, PropertyDocumentType } from "@/types/propertyCategories";

const STORAGE_BUCKET = 'property-documents';

/**
 * Ensure the storage bucket exists and is public
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    console.log(`🔍 Checking bucket ${STORAGE_BUCKET}...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`❌ Failed to list buckets:`, listError);
      throw listError;
    }

    const bucket = buckets?.find(b => b.id === STORAGE_BUCKET);

    if (!bucket) {
      console.log(`⚠️ ${STORAGE_BUCKET} bucket missing, attempting to create...`);
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

      if (error) {
        console.error(`❌ Failed to create bucket ${STORAGE_BUCKET}:`, error);
        console.log(`💡 Please create the bucket manually in Supabase Dashboard`);
        throw error;
      } else {
        console.log(`✅ Bucket ${STORAGE_BUCKET} created successfully as PUBLIC`);
      }
    } else if (!bucket.public) {
      console.log(`⚠️ ${STORAGE_BUCKET} bucket exists but is PRIVATE (public: ${bucket.public})`);
      console.log(`🔄 Attempting to make bucket PUBLIC...`);
      
      const { data, error } = await supabase.storage.updateBucket(STORAGE_BUCKET, {
        public: true
      });

      if (error) {
        console.error(`❌ Failed to update bucket privacy for ${STORAGE_BUCKET}:`, error);
        console.log(`💡 MANUAL FIX REQUIRED:`);
        console.log(`   1. Go to Supabase Dashboard > Storage > Buckets`);
        console.log(`   2. Click ⋮ next to '${STORAGE_BUCKET}'`);
        console.log(`   3. Click 'Edit bucket'`);
        console.log(`   4. Toggle 'Public bucket' to ON`);
        console.log(`   5. Click 'Save'`);
        // Don't throw - allow upload to continue, user can fix bucket later
      } else {
        console.log(`✅ Bucket ${STORAGE_BUCKET} updated to PUBLIC successfully!`);
        
        // Verify the update worked
        const { data: updatedBuckets } = await supabase.storage.listBuckets();
        const updatedBucket = updatedBuckets?.find(b => b.id === STORAGE_BUCKET);
        console.log(`📊 Verification - Bucket is now public: ${updatedBucket?.public}`);
      }
    } else {
      console.log(`✅ Bucket ${STORAGE_BUCKET} exists and is PUBLIC`);
    }
  } catch (error) {
    console.error(`❌ Error checking/updating bucket ${STORAGE_BUCKET}:`, error);
    // Don't throw - allow the upload to attempt anyway
  }
}

/**
 * Upload a property document
 */
export async function uploadPropertyDocument(
  propertyId: string,
  file: File,
  documentType: PropertyDocumentType,
  documentLabel: string,
  isPublic: boolean = false
): Promise<PropertyDocument> {
  try {
    console.log("🔵 Starting document upload...", { propertyId, documentType, documentLabel, fileName: file.name, fileSize: file.size });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ User not authenticated");
      throw new Error("User not authenticated");
    }
    console.log("✅ User authenticated:", user.id);

    // Ensure bucket exists before uploading
    console.log("🔵 Checking if bucket exists...");
    await ensureBucketExists();
    console.log("✅ Bucket check complete");

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${documentType}_${Date.now()}.${fileExt}`;
    console.log("🔵 Generated file path:", fileName);

    // Upload file to storage
    console.log("🔵 Uploading to storage bucket:", STORAGE_BUCKET);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      throw uploadError;
    }
    console.log("✅ File uploaded to storage:", uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);
    console.log("✅ Public URL generated:", publicUrl);

    // Create document record
    console.log("🔵 Creating database record...");
    const documentData = {
      property_id: propertyId,
      document_type: documentType,
      document_label: documentLabel,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      is_public: isPublic,
      uploaded_by: user.id,
    };
    console.log("🔵 Document data:", documentData);

    const { data, error } = await supabase
      .from('property_documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      console.error("❌ Database insert error:", error);
      throw error;
    }
    console.log("✅ Document record created:", data);

    return data as PropertyDocument;
  } catch (error) {
    console.error('❌ Error uploading property document:', error);
    throw error;
  }
}

/**
 * Get all documents for a property
 */
export async function getPropertyDocuments(
  propertyId: string
): Promise<PropertyDocument[]> {
  try {
    console.log('🔍 getPropertyDocuments called with propertyId:', propertyId);

    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    console.log('📊 Query result:', { data, error, count: data?.length || 0 });

    if (error) throw error;

    return (data || []) as PropertyDocument[];
  } catch (error) {
    console.error('Error fetching property documents:', error);
    throw error;
  }
}

/**
 * Get public documents for a property (for buyers)
 */
export async function getPublicPropertyDocuments(
  propertyId: string
): Promise<PropertyDocument[]> {
  try {
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return (data || []) as PropertyDocument[];
  } catch (error) {
    console.error('Error fetching public documents:', error);
    throw error;
  }
}

/**
 * Update document privacy setting
 */
export async function updateDocumentPrivacy(
  documentId: string,
  isPublic: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('property_documents')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating document privacy:', error);
    throw error;
  }
}

/**
 * Delete a property document (soft delete)
 */
export async function deletePropertyDocument(
  documentId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('property_documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting property document:', error);
    throw error;
  }
}

/**
 * Request access to a private document
 */
export async function requestDocumentAccess(
  documentId: string,
  propertyId: string,
  message?: string
): Promise<DocumentAccessRequest> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get user profile for name/email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('document_access_requests')
      .insert({
        document_id: documentId,
        property_id: propertyId,
        requester_id: user.id,
        requester_email: profile?.email || user.email,
        requester_name: profile?.full_name || 'Unknown',
        request_message: message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return data as DocumentAccessRequest;
  } catch (error) {
    console.error('Error requesting document access:', error);
    throw error;
  }
}

/**
 * Get access requests for a property (landlord view)
 */
export async function getPropertyAccessRequests(
  propertyId: string
): Promise<DocumentAccessRequest[]> {
  try {
    const { data, error } = await supabase
      .from('document_access_requests')
      .select('*')
      .eq('property_id', propertyId)
      .order('requested_at', { ascending: false });

    if (error) throw error;

    return (data || []) as DocumentAccessRequest[];
  } catch (error) {
    console.error('Error fetching access requests:', error);
    throw error;
  }
}

/**
 * Respond to a document access request
 */
export async function respondToAccessRequest(
  requestId: string,
  status: 'approved' | 'denied',
  responseMessage?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('document_access_requests')
      .update({
        status,
        response_message: responseMessage,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error responding to access request:', error);
    throw error;
  }
}

/**
 * Get listing strength score for a property
 */
export async function getListingStrength(
  propertyId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('calculate_listing_strength', { p_property_id: propertyId });

    if (error) throw error;

    return data || 0;
  } catch (error) {
    console.error('Error calculating listing strength:', error);
    return 0;
  }
}

/**
 * Download a document (for approved access or public documents)
 */
export async function downloadDocument(
  documentId: string
): Promise<Blob> {
  try {
    // Get document info
    const { data: doc, error: docError } = await supabase
      .from('property_documents')
      .select('file_url, is_public')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Check if user has access
    if (!doc.is_public) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if user has approved access request
      const { data: request } = await supabase
        .from('document_access_requests')
        .select('status')
        .eq('document_id', documentId)
        .eq('requester_id', user.id)
        .eq('status', 'approved')
        .single();

      if (!request) {
        throw new Error("Access denied. Please request access first.");
      }
    }

    // Download file
    const response = await fetch(doc.file_url);
    if (!response.ok) throw new Error("Failed to download file");

    return await response.blob();
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}
