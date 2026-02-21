import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentVault } from '@/components/property/DocumentVault';
import { fetchPropertyById } from '@/services/propertyService';
import type { PropertyCategory } from '@/types/propertyCategories';

const PropertyDocumentVault: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🏠 PropertyDocumentVault rendering, id:', id);
  console.log('🏠 Current state - loading:', loading, 'error:', error, 'category:', propertyCategory);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        console.log('❌ No property ID provided');
        return;
      }
      
      console.log('📥 Loading property:', id);
      setLoading(true);
      setError(null);
      
      try {
        const property = await fetchPropertyById(id);
        console.log('✅ Property loaded:', property);
        
        if (property) {
          setPropertyCategory(property.property_category as PropertyCategory);
          console.log('📋 Property category set:', property.property_category);
        } else {
          console.log('⚠️ Property is null or undefined');
          setError('Property not found');
        }
      } catch (error) {
        console.error('❌ Error loading property:', error);
        setError(error instanceof Error ? error.message : 'Failed to load property');
      } finally {
        setLoading(false);
        console.log('✅ Loading complete - loading:', false, 'error:', error);
      }
    };

    loadProperty();
  }, [id]);

  if (!id) {
    console.log('❌ Rendering: No ID - returning error message');
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">Property ID is required</p>
      </div>
    );
  }

  if (loading) {
    console.log('⏳ Rendering: Loading state - showing spinner');
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    console.log('❌ Rendering: Error state -', error);
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Error Loading Property</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering: Document Vault - propertyId:', id, 'category:', propertyCategory);
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Property
        </Button>
        <h1 className="text-3xl font-bold">Property Documents</h1>
        <p className="text-gray-600 mt-2">
          View and download all property documents
        </p>
      </div>

      <DocumentVault propertyId={id} propertyCategory={propertyCategory} />
    </div>
  );
};

export default PropertyDocumentVault;
