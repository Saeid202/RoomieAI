import React, { useState, useRef } from 'react';
import { GripVertical, X, Star, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageReorderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onDeleteImage?: (index: number) => Promise<boolean>;
}

export const ImageReorder: React.FC<ImageReorderProps> = ({
  images,
  onImagesChange,
  onDeleteImage,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dragImageRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredIndex(index);
  };

  const handleDragLeave = () => {
    setHoveredIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(null);
    toast.success('Image moved successfully');
  };

  const handleSetAsMain = (index: number) => {
    if (index === 0) return;
    
    const newImages = [...images];
    const mainImage = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = mainImage;
    
    onImagesChange(newImages);
    setSelectedIndex(0);
    toast.success('Main image updated');
  };

  const handleDuplicateImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index + 1, 0, images[index]);
    onImagesChange(newImages);
    toast.success('Image duplicated');
  };

  const handleDeleteImage = async (index: number) => {
    if (onDeleteImage) {
      const success = await onDeleteImage(index);
      if (success) {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        setSelectedIndex(null);
        toast.success('Image deleted');
      }
    } else {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      setSelectedIndex(null);
      toast.success('Image removed');
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          Drag images to reorder • Click to select • Right-click for options
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            ref={draggedIndex === index ? dragImageRef : null}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
            className={cn(
              'relative group aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-move',
              'hover:shadow-lg hover:border-blue-400',
              draggedIndex === index && 'opacity-50 scale-95',
              hoveredIndex === index && draggedIndex !== null && 'border-blue-500 bg-blue-50 scale-105',
              selectedIndex === index && 'border-blue-600 ring-2 ring-blue-300',
              index === 0 && 'ring-2 ring-yellow-400',
              'bg-slate-100'
            )}
          >
            {/* Image */}
            <img
              src={imageUrl}
              alt={`Property image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Drag Handle */}
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-white" />
            </div>

            {/* Main Badge */}
            {index === 0 && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 fill-current" />
                Main
              </div>
            )}

            {/* Position Number */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
              #{index + 1}
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {/* Set as Main */}
              {index !== 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetAsMain(index);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors shadow-lg"
                  title="Set as main image"
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              )}

              {/* Duplicate */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateImage(index);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors shadow-lg"
                title="Duplicate image"
              >
                <Copy className="h-4 w-4" />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(index);
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                title="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Selection Indicator */}
            {selectedIndex === index && (
              <div className="absolute inset-0 border-4 border-blue-600 rounded-lg pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
        <p className="text-sm font-semibold text-gray-700">💡 Tips:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Drag any image to move it to a new position</li>
          <li>✓ Click an image to select it (shows blue border)</li>
          <li>✓ Hover over an image to see action buttons</li>
          <li>✓ The first image (with ⭐) is shown as the main image</li>
          <li>✓ You can duplicate, delete, or set any image as main</li>
        </ul>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
        <span>Total images: <strong>{images.length}</strong></span>
        {selectedIndex !== null && (
          <span>Selected: <strong>Image #{selectedIndex + 1}</strong></span>
        )}
      </div>
    </div>
  );
};

export default ImageReorder;
