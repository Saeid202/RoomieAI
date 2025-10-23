import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPropertiesByOwnerId } from '@/services/propertyService';
import { supabase } from '@/integrations/supabase/client';

export default function ImageDebug() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const list = await getPropertiesByOwnerId(user.id);
        setProperties(list);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const testStorageBucket = async () => {
    try {
      console.log('🧪 Testing storage bucket...');
      
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Error listing buckets:', bucketsError);
        return;
      }
      
      console.log('📦 Available buckets:', buckets);
      
      const propertyImagesBucket = buckets.find(bucket => bucket.id === 'property-images');
      
      if (!propertyImagesBucket) {
        console.error('❌ property-images bucket not found!');
        return;
      }
      
      console.log('✅ property-images bucket found:', propertyImagesBucket);
      
      // Test listing files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 10 });
      
      if (filesError) {
        console.error('❌ Error listing files:', filesError);
        return;
      }
      
      console.log('📁 Files in property-images bucket:', files);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Image Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testStorageBucket} className="mb-4">
            Test Storage Bucket
          </Button>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Properties with Images:</h3>
            {properties.map((property, index) => (
              <div key={property.id} className="border p-4 rounded">
                <h4 className="font-medium">{property.listing_title}</h4>
                <div className="text-sm text-gray-600">
                  <p>Images: {JSON.stringify(property.images)}</p>
                  <p>Images Type: {typeof property.images}</p>
                  <p>Is Array: {Array.isArray(property.images) ? 'Yes' : 'No'}</p>
                  <p>Length: {property.images?.length || 0}</p>
                  {property.images && property.images.length > 0 && (
                    <div className="mt-2">
                      <p>First Image URL: {property.images[0]}</p>
                      <img 
                        src={property.images[0]} 
                        alt="Property image" 
                        className="w-32 h-32 object-cover border"
                        onError={(e) => console.log('Image failed to load:', property.images[0])}
                        onLoad={() => console.log('Image loaded successfully:', property.images[0])}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
