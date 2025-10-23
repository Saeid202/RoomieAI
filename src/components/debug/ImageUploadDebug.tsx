import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { ImageUploadService } from '@/services/imageUploadService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ImageUploadDebug: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const initializeUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        addLog(`❌ Authentication error: ${error?.message || 'No user'}`);
        return;
      }
      setUserId(user.id);
      addLog(`✅ User authenticated: ${user.email} (${user.id})`);
    } catch (error) {
      addLog(`❌ Auth initialization failed: ${error}`);
    }
  };

  const testStorageBucket = async () => {
    try {
      addLog('🧪 Testing storage bucket...');
      
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        addLog(`❌ Error listing buckets: ${bucketsError.message}`);
        return;
      }
      
      addLog(`📦 Found ${buckets.length} buckets`);
      
      const propertyImagesBucket = buckets.find(bucket => bucket.id === 'property-images');
      if (!propertyImagesBucket) {
        addLog('❌ property-images bucket not found!');
        addLog('💡 Create the bucket in Supabase Dashboard > Storage');
        return;
      }
      
      addLog(`✅ property-images bucket found: ${JSON.stringify(propertyImagesBucket)}`);
      
      // Test listing files
      const { data: files, error: filesError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 10 });
      
      if (filesError) {
        addLog(`❌ Error listing files: ${filesError.message}`);
        return;
      }
      
      addLog(`📁 Found ${files.length} files in bucket`);
      
    } catch (error) {
      addLog(`❌ Storage test failed: ${error}`);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!userId) {
      addLog('❌ No user ID available');
      return;
    }

    addLog(`🚀 Starting upload of ${acceptedFiles.length} files...`);
    
    if (images.length + acceptedFiles.length > 10) {
      addLog('❌ Too many images. Maximum 10 allowed.');
      toast.error(`You can only upload up to 10 images.`);
      return;
    }

    setUploading(true);

    try {
      // Log file details
      acceptedFiles.forEach((file, index) => {
        addLog(`📁 File ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, ${file.type})`);
      });

      const uploadResults = await ImageUploadService.uploadMultiplePropertyImages(
        acceptedFiles,
        'debug-property',
        userId
      );

      addLog(`📤 Upload results: ${uploadResults.length} files processed`);

      const successfulUploads = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!);

      const failedUploads = uploadResults.filter(result => !result.success);

      // Log detailed results
      uploadResults.forEach((result, index) => {
        if (result.success) {
          addLog(`✅ File ${index + 1} uploaded successfully: ${result.url}`);
        } else {
          addLog(`❌ File ${index + 1} failed: ${result.error}`);
        }
      });

      if (successfulUploads.length > 0) {
        setImages(prev => [...prev, ...successfulUploads]);
        addLog(`🎉 Successfully uploaded ${successfulUploads.length} image(s)`);
        toast.success(`Successfully uploaded ${successfulUploads.length} image(s).`);
      }

      if (failedUploads.length > 0) {
        addLog(`⚠️ ${failedUploads.length} upload(s) failed`);
        toast.error(failedUploads[0].error || "Some uploads failed");
      }
    } catch (error) {
      addLog(`❌ Upload error: ${error}`);
      toast.error("An error occurred while uploading images.");
    } finally {
      setUploading(false);
    }
  }, [images, userId, addLog]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 10 - images.length,
    disabled: uploading || !userId
  });

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    addLog(`🗑️ Removing image: ${imageUrl}`);
    
    const success = await ImageUploadService.deletePropertyImage(imageUrl, userId);
    
    if (success) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      addLog(`✅ Image removed successfully`);
      toast.success("Image has been successfully deleted.");
    } else {
      addLog(`❌ Failed to remove image`);
      toast.error("An error occurred while removing the image.");
    }
  };

  const clearLog = () => {
    setDebugLog([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={initializeUser}>Initialize User</Button>
            <Button onClick={testStorageBucket}>Test Storage</Button>
            <Button onClick={clearLog} variant="outline">Clear Log</Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            <h3 className="font-semibold mb-2">Debug Log:</h3>
            {debugLog.length === 0 ? (
              <p className="text-gray-500">No logs yet</p>
            ) : (
              <div className="space-y-1">
                {debugLog.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          {images.length < 10 && (
            <Card>
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                  } ${uploading || !userId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        {images.length} of 10 images uploaded
                      </p>
                      {!userId && (
                        <p className="text-sm text-red-500 mt-2">
                          Please initialize user first
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {images.map((imageUrl, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="relative aspect-square">
                      <img
                        src={imageUrl}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                        onError={() => addLog(`❌ Image failed to load: ${imageUrl}`)}
                        onLoad={() => addLog(`✅ Image loaded: ${imageUrl}`)}
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
        </CardContent>
      </Card>
    </div>
  );
};
