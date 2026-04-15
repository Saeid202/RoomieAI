import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPatternUpload } from '@/components/construction/ColorPatternUpload';
import { ColorPatternList } from '@/components/construction/ColorPatternList';
import { ConstructionColorPattern } from '@/types/construction';

const ColorPatternTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = React.useState<ConstructionColorPattern[]>([]);

  const handleSavePattern = (formData: any) => {
    console.log('Saving color pattern:', formData);
    // Simulate saving
    const newPattern: ConstructionColorPattern = {
      id: Date.now().toString(),
      customization_option_id: 'test-option-id',
      color_name: formData.color_name || 'Test Pattern',
      pattern_image_url: formData.preview_url,
      pattern_image_storage_path: formData.preview_url,
      is_pattern_based: formData.is_pattern_based,
      sort_order: patterns.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setPatterns([...patterns, newPattern]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={() => navigate('/construction/dashboard/products')} variant="outline">
          Back to Products
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Color Pattern Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Test the color pattern upload functionality. You can switch between color names and pattern images.
            </p>
            
            <ColorPatternUpload
              customizationOptionId="test-option-id"
              onSave={handleSavePattern}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Patterns ({patterns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ColorPatternList
            customizationOptionId="test-option-id"
            patterns={patterns}
            onPatternsChange={setPatterns}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorPatternTestPage;
