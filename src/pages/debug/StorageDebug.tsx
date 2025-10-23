import React from 'react';
import StorageTest from '@/components/debug/StorageTest';

export default function StorageDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Storage Debug Test</h1>
      <StorageTest />
    </div>
  );
}
