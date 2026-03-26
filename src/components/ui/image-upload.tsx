import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { ImageUploadService } from '@/services/imageUploadService';
import { ImageReorder } from '@/components/ui/image-reorder';
import { toast } from 'sonner';

interface ImageUploadProps {
  propertyId?: string;
  userId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  propertyId = 'temp',
  userId,
  images,
  onImagesChange,
  maxImages = 10
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setUploading(true);

    try {
      const uploadResults = await ImageUploadService.uploadMultiplePropertyImages(
        acceptedFiles,
        propertyId,
        userId
      );

      const successfulUploads = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!);

      const failedUploads = uploadResults.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        onImagesChange([...images, ...successfulUploads]);
        toast.success(`Successfully uploaded ${successfulUploads.length} image(s).`);
      }

      if (failedUploads.length > 0) {
        toast.error(failedUploads[0].error || "Some uploads failed");
      }
    } catch (error) {
      toast.error("An error occurred while uploading images.");
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, propertyId, userId, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: maxImages - images.length,
    disabled: uploading
  });

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    console.log('🗑️ ImageUpload: Attempting to delete image at index', index);
    console.log('🗑️ ImageUpload: Image URL:', imageUrl);
    console.log('🗑️ ImageUpload: User ID:', userId);
    
    const success = await ImageUploadService.deletePropertyImage(imageUrl, userId);

    if (success) {
      const newImages = images.filter((_, i) => i !== index);
      console.log('✅ ImageUpload: Image deleted, updating state');
      console.log('✅ ImageUpload: New images array:', newImages);
      onImagesChange(newImages);
      toast.success("Image has been successfully deleted.");
    } else {
      console.error('❌ ImageUpload: Delete failed');
      toast.error("Failed to delete image. Check console for details.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-sm font-medium mb-1">
                {uploading ? 'Uploading...' : 'Drag & drop images here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Supports JPEGs, PNG, WebP (max 10MB)
              </p>
              <p className="text-xs text-gray-400">
                {images.length} of {maxImages} uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Reorder Section */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Arrange Your Images</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {images.length} image{images.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ImageReorder
            images={images}
            onImagesChange={onImagesChange}
            onDeleteImage={async (index) => {
              const imageUrl = images[index];
              const success = await ImageUploadService.deletePropertyImage(imageUrl, userId);
              return success;
            }}
          />
        </div>
      )}
    </div>
  );
};