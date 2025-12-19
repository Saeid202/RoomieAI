import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { ImageUploadService } from '@/services/imageUploadService';
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
    const success = await ImageUploadService.deletePropertyImage(imageUrl, userId);

    if (success) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      toast.success("Image has been successfully deleted.");
    } else {
      toast.error("An error occurred while removing the image.");
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-slate-100">
              <img
                src={imageUrl}
                alt={`Property image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};