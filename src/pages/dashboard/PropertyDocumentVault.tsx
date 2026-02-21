import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentVault } from '@/components/property/DocumentVault';
import { fetchPropertyById } from '@/services/propertyService';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyCategory } from '@/types/propertyCategories';

const PropertyDocumentVault: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');

  console.log('🏠 PropertyDocumentVault rendering, id:', id);
  console.log('🏠 Current state - loading:', loading, 'error:', error, 'category:', propertyCategory, 'isOwner:', isOwner);

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
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          // Get user profile for name
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name);
          }
        }
        
        const property = await fetchPropertyById(id);
        console.log('✅ Property loaded:', property);
        
        if (property) {
          setPropertyCategory(property.property_category as PropertyCategory);
          console.log('📋 Property category set:', property.property_category);
          
          // Check if current user is the property owner
          const ownerId = property.user_id || property.landlord_id;
          const userIsOwner = user?.id === ownerId;
          setIsOwner(userIsOwner);
          console.log('👤 Ownership check - userId:', user?.id, 'ownerId:', ownerId, 'isOwner:', userIsOwner);
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

  console.log('✅ Rendering: Document Vault - propertyId:', id, 'category:', propertyCategory, 'isOwner:', isOwner);
  
  // Buyer View (Read-Only Secure Vault)
  if (!isOwner) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property Listing
          </Button>
          
          {/* Secure Document Room Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Secure Document Room</h1>
              <p className="text-slate-600 mt-1">
                Confidential property documentation
              </p>
            </div>
          </div>

          {/* Trust & Verification Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-green-900 mb-1">
                  ✓ Verified Secure Access
                </p>
                <p className="text-xs text-green-800">
                  Your identity has been verified. All document access is encrypted and logged for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Access Warning */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">
                  Confidential Access Authorized for {userName}
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your access to these legal documents is logged and monitored. Unauthorized sharing, 
                  screenshotting, or distribution of these confidential materials is strictly prohibited 
                  and may result in legal action. These documents are provided for your personal review only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Document Vault */}
        <DocumentVault 
          propertyId={id} 
          propertyCategory={propertyCategory}
          readOnly={true}
          isBuyerView={true}
        />
      </div>
    );
  }

  // Owner View (Full Management Controls)
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
          Manage and organize all property documents
        </p>
      </div>

      <DocumentVault 
        propertyId={id} 
        propertyCategory={propertyCategory}
        readOnly={false}
        isBuyerView={false}
      />
    </div>
  );
};

export default PropertyDocumentVault;
