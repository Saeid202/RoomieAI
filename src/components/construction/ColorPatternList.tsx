import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Edit, 
  Trash2,
  Image,
  Palette,
  GripVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConstructionColorPattern } from '@/types/construction';
import { ColorPatternUpload } from './ColorPatternUpload';
import { ColorPatternService } from '@/services/storage/colorPatternService';

interface ColorPatternListProps {
  customizationOptionId: string;
  patterns: ConstructionColorPattern[];
  onPatternsChange: (patterns: ConstructionColorPattern[]) => void;
  readonly?: boolean;
}

export const ColorPatternList: React.FC<ColorPatternListProps> = ({
  customizationOptionId,
  patterns,
  onPatternsChange,
  readonly = false
}) => {
  const [editingPattern, setEditingPattern] = useState<ConstructionColorPattern | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSavePattern = async (formData: any) => {
    setIsLoading(true);
    try {
      if (editingPattern) {
        // Update existing pattern
        const updated = await ColorPatternService.updateColorPattern(
          editingPattern.id,
          {
            ...formData,
            customization_option_id: customizationOptionId
          }
        );
        
        const updatedPatterns = patterns.map(p => 
          p.id === editingPattern.id ? updated : p
        );
        onPatternsChange(updatedPatterns);
        setEditingPattern(null);
      } else {
        // Create new pattern
        const newPattern = await ColorPatternService.createColorPattern({
          ...formData,
          customization_option_id
        });
        
        onPatternsChange([...patterns, newPattern]);
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error('Failed to save pattern:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePattern = async (patternId: string) => {
    if (!confirm('Are you sure you want to delete this color/pattern?')) {
      return;
    }

    setIsLoading(true);
    try {
      await ColorPatternService.deleteColorPattern(patternId);
      onPatternsChange(patterns.filter(p => p.id !== patternId));
    } catch (error) {
      console.error('Failed to delete pattern:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPattern = (pattern: ConstructionColorPattern) => {
    setEditingPattern(pattern);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingPattern(null);
    setIsAddingNew(false);
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reorderedPatterns = [...patterns];
    const [movedPattern] = reorderedPatterns.splice(fromIndex, 1);
    reorderedPatterns.splice(toIndex, 0, movedPattern);

    // Update sort orders
    const patternIds = reorderedPatterns.map(p => p.id);
    try {
      await ColorPatternService.updateSortOrder(patternIds);
      onPatternsChange(reorderedPatterns);
    } catch (error) {
      console.error('Failed to reorder patterns:', error);
    }
  };

  if (isAddingNew || editingPattern) {
    return (
      <ColorPatternUpload
        customizationOptionId={customizationOptionId}
        onSave={handleSavePattern}
        onCancel={handleCancelEdit}
        initialData={editingPattern ? {
          color_name: editingPattern.color_name || '',
          is_pattern_based: editingPattern.is_pattern_based,
          preview_url: editingPattern.pattern_image_url || undefined
        } : undefined}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Colors & Patterns</h3>
          <p className="text-sm text-muted-foreground">
            Add color names or upload pattern images
          </p>
        </div>
        {!readonly && (
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
          >
            Add Color/Pattern
          </Button>
        )}
      </div>

      {/* Patterns List */}
      {patterns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Palette className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No colors or patterns added</p>
                <p className="text-xs text-gray-500">
                  Add your first color or pattern to get started
                </p>
              </div>
              {!readonly && (
                <Button
                  onClick={() => setIsAddingNew(true)}
                  variant="outline"
                  size="sm"
                >
                  Add First Color/Pattern
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              index={index}
              onEdit={() => handleEditPattern(pattern)}
              onDelete={() => handleDeletePattern(pattern.id)}
              onReorder={handleReorder}
              readonly={readonly}
              isLast={index === patterns.length - 1}
              isFirst={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PatternCardProps {
  pattern: ConstructionColorPattern;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  readonly?: boolean;
  isLast?: boolean;
  isFirst?: boolean;
}

const PatternCard: React.FC<PatternCardProps> = ({
  pattern,
  index,
  onEdit,
  onDelete,
  onReorder,
  readonly,
  isLast,
  isFirst
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          {!readonly && (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
                disabled={isFirst}
                onClick={() => onReorder(index, index - 1)}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
                disabled={isLast}
                onClick={() => onReorder(index, index + 1)}
              >
                <GripVertical className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}

          {/* Pattern Preview */}
          <div className="flex-shrink-0">
            {pattern.is_pattern_based && pattern.pattern_image_url ? (
              <img
                src={pattern.pattern_image_url}
                alt={pattern.color_name || 'Pattern'}
                className="w-16 h-16 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                {pattern.is_pattern_based ? (
                  <Image className="h-6 w-6 text-gray-400" />
                ) : (
                  <div 
                    className="w-10 h-10 rounded"
                    style={{ backgroundColor: '#e5e7eb' }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Pattern Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">
                {pattern.color_name || 'Unnamed Pattern'}
              </h4>
              <Badge variant={pattern.is_pattern_based ? 'secondary' : 'outline'}>
                {pattern.is_pattern_based ? 'Pattern' : 'Color'}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          {!readonly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
