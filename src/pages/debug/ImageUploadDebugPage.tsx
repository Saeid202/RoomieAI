import React from 'react';
import ImageUploadDebug from '@/components/debug/ImageUploadDebug';

export default function ImageUploadDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Image Upload Debug</h1>
      <ImageUploadDebug />
    </div>
  );
}
