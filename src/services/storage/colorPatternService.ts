import { supabase } from '@/integrations/supabase/client-simple';
import { ConstructionColorPattern, ColorPatternUploadData } from '@/types/construction';

export class ColorPatternService {
  private static readonly BUCKET_NAME = 'color-patterns';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload a color pattern image
   */
  static async uploadPatternImage(
    file: File, 
    customizationOptionId: string, 
    colorName?: string
  ): Promise<{ url: string; storagePath: string }> {
    // Validate file
    this.validateFile(file);

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storagePath = `${customizationOptionId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600', // 1 hour cache
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      url: publicUrl,
      storagePath: data.path
    };
  }

  /**
   * Delete a color pattern image from storage
   */
  static async deletePatternImage(storagePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Create a new color pattern
   */
  static async createColorPattern(data: ColorPatternUploadData): Promise<ConstructionColorPattern> {
    let imageUrl: string | undefined;
    let storagePath: string | undefined;

    // Upload image if provided
    if (data.pattern_image) {
      const uploadResult = await this.uploadPatternImage(
        data.pattern_image, 
        data.customization_option_id, 
        data.color_name
      );
      imageUrl = uploadResult.url;
      storagePath = uploadResult.storagePath;
    }

    // Create database record
    const { data: pattern, error } = await supabase
      .from('construction_color_patterns')
      .insert({
        customization_option_id: data.customization_option_id,
        color_name: data.color_name || null,
        pattern_image_url: imageUrl || null,
        pattern_image_storage_path: storagePath || null,
        is_pattern_based: data.is_pattern_based,
        sort_order: data.sort_order || 0
      })
      .select()
      .single();

    if (error) {
      // If database insert fails, clean up uploaded image
      if (storagePath) {
        await this.deletePatternImage(storagePath).catch(console.error);
      }
      throw new Error(`Failed to create color pattern: ${error.message}`);
    }

    return pattern;
  }

  /**
   * Update an existing color pattern
   */
  static async updateColorPattern(
    id: string, 
    data: Partial<ColorPatternUploadData>
  ): Promise<ConstructionColorPattern> {
    const currentPattern = await this.getColorPattern(id);
    
    let imageUrl = currentPattern.pattern_image_url;
    let storagePath = currentPattern.pattern_image_storage_path;

    // Upload new image if provided
    if (data.pattern_image) {
      // Delete old image if exists
      if (storagePath) {
        await this.deletePatternImage(storagePath).catch(console.error);
      }

      const uploadResult = await this.uploadPatternImage(
        data.pattern_image, 
        data.customization_option_id || currentPattern.customization_option_id, 
        data.color_name
      );
      imageUrl = uploadResult.url;
      storagePath = uploadResult.storagePath;
    }

    // Update database record
    const { data: pattern, error } = await supabase
      .from('construction_color_patterns')
      .update({
        color_name: data.color_name !== undefined ? data.color_name : currentPattern.color_name,
        pattern_image_url: imageUrl,
        pattern_image_storage_path: storagePath,
        is_pattern_based: data.is_pattern_based !== undefined ? data.is_pattern_based : currentPattern.is_pattern_based,
        sort_order: data.sort_order !== undefined ? data.sort_order : currentPattern.sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update color pattern: ${error.message}`);
    }

    return pattern;
  }

  /**
   * Delete a color pattern
   */
  static async deleteColorPattern(id: string): Promise<void> {
    // Get pattern info to delete image
    const pattern = await this.getColorPattern(id);

    // Delete from database
    const { error } = await supabase
      .from('construction_color_patterns')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete color pattern: ${error.message}`);
    }

    // Delete image from storage if exists
    if (pattern.pattern_image_storage_path) {
      await this.deletePatternImage(pattern.pattern_image_storage_path).catch(console.error);
    }
  }

  /**
   * Get color patterns for a customization option
   */
  static async getColorPatterns(customizationOptionId: string): Promise<ConstructionColorPattern[]> {
    const { data, error } = await supabase
      .from('construction_color_patterns')
      .select('*')
      .eq('customization_option_id', customizationOptionId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch color patterns: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single color pattern
   */
  static async getColorPattern(id: string): Promise<ConstructionColorPattern> {
    const { data, error } = await supabase
      .from('construction_color_patterns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch color pattern: ${error.message}`);
    }

    return data;
  }

  /**
   * Update sort order of color patterns
   */
  static async updateSortOrder(patternIds: string[]): Promise<void> {
    const updates = patternIds.map((id, index) => 
      supabase
        .from('construction_color_patterns')
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      throw new Error(`Failed to update sort order: ${errors.map(e => e.error?.message).join(', ')}`);
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`File type must be one of: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
    }
  }

  /**
   * Compress image before upload (optional enhancement)
   */
  static async compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
