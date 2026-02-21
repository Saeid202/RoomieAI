import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export class ImageUploadService {
  /**
   * Upload an image file to Supabase storage
   */
  static async uploadImage(
    file: File, 
    bucketName: string = 'cleaner-images',
    folder: string = 'cleaners'
  ): Promise<ImageUploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete an image from Supabase storage
   */
  static async deleteImage(
    filePath: string,
    bucketName: string = 'cleaner-images'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Image delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { valid: true };
  }

  /**
   * Get image URL from storage path
   */
  static getImageUrl(filePath: string, bucketName: string = 'cleaner-images'): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Upload multiple property images
   */
  static async uploadMultiplePropertyImages(
    files: File[],
    propertyId: string,
    userId: string
  ): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadPropertyImage(file, propertyId, userId)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Upload a single property image
   */
  static async uploadPropertyImage(
    file: File,
    propertyId: string,
    userId: string
  ): Promise<ImageUploadResult> {
    try {
      console.log('🔍 Upload attempt:', { 
        fileName: file.name, 
        fileSize: file.size, 
        propertyId, 
        userId: userId ? 'present' : 'MISSING' 
      });

      // Validate the image first
      const validation = this.validateImage(file);
      if (!validation.valid) {
        console.error('❌ Validation failed:', validation.error);
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/property-${propertyId}/${fileName}`;

      console.log('📤 Uploading property image:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Upload file to property-images bucket
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Property image upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      console.log('✅ Property image uploaded successfully:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('❌ Property image upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete a property image
   */
  static async deletePropertyImage(
    imageUrl: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Extract file path from URL
      // URL format: https://.../storage/v1/object/public/property-images/{userId}/property-{id}/{filename}
      const urlParts = imageUrl.split('/property-images/');
      if (urlParts.length < 2) {
        console.error('Invalid image URL format:', imageUrl);
        return false;
      }
      
      // Get the path after 'property-images/'
      const filePath = urlParts[1];

      console.log('🗑️ Deleting property image:', filePath);

      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (error) {
        console.error('Property image delete error:', error);
        return false;
      }

      console.log('✅ Property image deleted successfully');
      return true;
    } catch (error) {
      console.error('Property image delete error:', error);
      return false;
    }
  }
}