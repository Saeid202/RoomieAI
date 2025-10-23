import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ImageUploadService } from '@/services/imageUploadService';
import { toast } from 'sonner';

export default function StorageTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStorageBucket = async () => {
    addResult('🧪 Testing storage bucket...');
    
    try {
      // Test 1: Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        addResult(`❌ Error listing buckets: ${bucketsError.message}`);
        return;
      }
      
      addResult(`📦 Found ${buckets.length} buckets`);
      
      const propertyImagesBucket = buckets.find(bucket => bucket.id === 'property-images');
      
      if (!propertyImagesBucket) {
        addResult('❌ property-images bucket not found!');
        return;
      }
      
      addResult(`✅ property-images bucket found: ${JSON.stringify(propertyImagesBucket)}`);
      
      // Test 2: Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        addResult(`❌ User not authenticated: ${userError?.message || 'No user'}`);
        return;
      }
      
      addResult(`✅ User authenticated: ${user.id}`);
      
      // Test 3: Try to list files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 10 });
      
      if (filesError) {
        addResult(`❌ Error listing files: ${filesError.message}`);
        return;
      }
      
      addResult(`📁 Found ${files.length} files in bucket`);
      
      // Test 4: Try to upload a test file
      if (selectedFile) {
        addResult('🚀 Testing file upload...');
        const result = await ImageUploadService.uploadPropertyImage(
          selectedFile,
          'test-property',
          user.id
        );
        
        if (result.success) {
          addResult(`✅ Upload successful: ${result.url}`);
        } else {
          addResult(`❌ Upload failed: ${result.error}`);
        }
      } else {
        addResult('⚠️ No file selected for upload test');
      }
      
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    }
  };

  const testDatabaseConnection = async () => {
    addResult('🧪 Testing database connection...');
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, listing_title, images')
        .limit(5);
      
      if (error) {
        addResult(`❌ Database error: ${error.message}`);
        return;
      }
      
      addResult(`✅ Database connected. Found ${data.length} properties`);
      data.forEach((property, index) => {
        addResult(`Property ${index + 1}: ${property.listing_title} (${property.images?.length || 0} images)`);
      });
      
    } catch (error) {
      addResult(`❌ Database test failed: ${error}`);
    }
  };

  const testAuth = async () => {
    addResult('🧪 Testing authentication...');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        addResult(`❌ Auth error: ${error.message}`);
        return;
      }
      
      if (!user) {
        addResult('❌ No authenticated user');
        return;
      }
      
      addResult(`✅ User authenticated: ${user.email} (${user.id})`);
      
    } catch (error) {
      addResult(`❌ Auth test failed: ${error}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      addResult(`📁 File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Storage Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testAuth}>Test Auth</Button>
            <Button onClick={testDatabaseConnection}>Test Database</Button>
            <Button onClick={testStorageBucket}>Test Storage</Button>
            <Button onClick={clearResults} variant="outline">Clear Results</Button>
          </div>
          
          <div>
            <Label htmlFor="file-input">Select test image:</Label>
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
