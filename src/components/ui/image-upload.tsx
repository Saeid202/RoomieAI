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
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the images here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    {uploading ? 'Uploading...' : 'Drag & drop images here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Supports JPEG, PNG, WebP, GIF (max 10MB each)
                  </p>
                  <p className="text-sm text-gray-500">
                    {images.length} of {maxImages} images uploaded
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                    loading="lazy"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">
                      Main Image
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No images uploaded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};