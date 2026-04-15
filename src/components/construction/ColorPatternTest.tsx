import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPatternUpload } from './ColorPatternUpload';
import { ConstructionColorPattern } from '@/types/construction';

export const ColorPatternTest: React.FC = () => {
  const handleSave = (formData: any) => {
    console.log('Saving color pattern:', formData);
    // Here you would normally save to the database
  };

  const handleCancel = () => {
    console.log('Cancelled');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
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
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
