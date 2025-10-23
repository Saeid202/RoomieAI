import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'property-images';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static async uploadPropertyImage(
    file: File,
    propertyId: string,
    userId: string
  ): Promise<ImageUploadResult> {
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
        };
      }

      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size too large. Please upload images smaller than 10MB.'
        };
      }

      // Create file path: userId/propertyId/filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${propertyId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl
      };

    } catch (error) {
      console.error('Image upload service error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload.'
      };
    }
  }

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

  static async deletePropertyImage(
    imageUrl: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === this.BUCKET_NAME);
      
      if (bucketIndex === -1) {
        console.error('Invalid image URL format');
        return false;
      }

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  private static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
  }

  static getImageUrl(imagePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(imagePath);
    
    return publicUrl;
  }
}