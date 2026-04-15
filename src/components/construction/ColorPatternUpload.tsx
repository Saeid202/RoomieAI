import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Image as ImageIcon, Palette } from 'lucide-react';
import { ColorPatternFormData } from '@/types/construction';
import { ColorPatternService } from '@/services/storage/colorPatternService';

interface ColorPatternUploadProps {
  customizationOptionId: string;
  onSave?: (pattern: ColorPatternFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ColorPatternFormData>;
  isLoading?: boolean;
}

export const ColorPatternUpload: React.FC<ColorPatternUploadProps> = ({
  customizationOptionId,
  onSave,
  onCancel,
  initialData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ColorPatternFormData>({
    color_name: initialData?.color_name || '',
    pattern_image: null,
    is_pattern_based: initialData?.is_pattern_based || false,
    preview_url: initialData?.preview_url
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      // Validate and compress image
      const compressedFile = await ColorPatternService.compressImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      
      setFormData(prev => ({
        ...prev,
        pattern_image: compressedFile,
        preview_url: previewUrl
      }));
      
      // Automatically switch to pattern mode when image is uploaded
      setFormData(prev => ({ ...prev, is_pattern_based: true }));
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setUploadError('Please upload an image file');
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Remove uploaded image
  const removeImage = useCallback(() => {
    if (formData.preview_url) {
      URL.revokeObjectURL(formData.preview_url);
    }
    setFormData(prev => ({
      ...prev,
      pattern_image: null,
      preview_url: undefined
    }));
  }, [formData.preview_url]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Validation
    if (formData.is_pattern_based && !formData.pattern_image && !formData.preview_url) {
      setUploadError('Please upload a pattern image or switch to color name mode');
      return;
    }

    if (!formData.is_pattern_based && !formData.color_name.trim()) {
      setUploadError('Please enter a color name');
      return;
    }

    onSave?.(formData);
  }, [formData, onSave]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formData.is_pattern_based ? (
            <ImageIcon className="h-5 w-5" />
          ) : (
            <Palette className="h-5 w-5" />
          )}
          Add Color or Pattern
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Input Mode</Label>
            <p className="text-xs text-muted-foreground">
              {formData.is_pattern_based 
                ? 'Upload a pattern image (e.g., flooring texture)' 
                : 'Enter a color name (e.g., Oak Brown)'
              }
            </p>
          </div>
          <Switch
            checked={formData.is_pattern_based}
            onCheckedChange={(checked) => {
              setFormData(prev => ({ ...prev, is_pattern_based: checked }));
              // Clear incompatible data when switching modes
              if (checked && formData.color_name) {
                setFormData(prev => ({ ...prev, color_name: '' }));
              }
              if (!checked && formData.pattern_image) {
                removeImage();
              }
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Color Name Input */}
          {!formData.is_pattern_based && (
            <div className="space-y-2">
              <Label htmlFor="color_name">Color Name</Label>
              <Input
                id="color_name"
                type="text"
                placeholder="e.g., Oak Brown, Gray Marble"
                value={formData.color_name}
                onChange={(e) => setFormData(prev => ({ ...prev, color_name: e.target.value }))}
                className="w-full"
              />
            </div>
          )}

          {/* Pattern Image Upload */}
          {formData.is_pattern_based && (
            <div className="space-y-4">
              <Label>Pattern Image</Label>
              
              {/* Upload Area */}
              {!formData.preview_url ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isUploading ? 'Processing image...' : 'Drop pattern image here or click to browse'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Select Image
                    </Button>
                  </div>
                </div>
              ) : (
                /* Image Preview */
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={formData.preview_url}
                      alt="Pattern preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Optional color name for pattern */}
                  <div className="space-y-2">
                    <Label htmlFor="pattern_color_name" className="text-sm">
                      Color Name (Optional)
                      <span className="text-xs text-muted-foreground ml-2">
                        e.g., "Oak Wood Pattern"
                      </span>
                    </Label>
                    <Input
                      id="pattern_color_name"
                      type="text"
                      placeholder="Optional color name for this pattern"
                      value={formData.color_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, color_name: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Color/Pattern'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
