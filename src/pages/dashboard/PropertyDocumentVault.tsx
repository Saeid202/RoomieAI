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
      <div className="w-full px-6 py-6">
        <p className="text-red-500">Property ID is required</p>
      </div>
    );
  }

  if (loading) {
    console.log('⏳ Rendering: Loading state - showing spinner');
    return (
      <div className="w-full px-6 py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    console.log('❌ Rendering: Error state -', error);
    return (
      <div className="w-full px-6 py-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4 shadow-md">
          <p className="text-red-800 font-semibold">Error Loading Property</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
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
      <div className="w-full px-6 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property Listing
          </Button>
          
          {/* Secure Document Room Header */}
          <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-6 border-2 border-purple-200/50 shadow-2xl backdrop-blur-sm overflow-hidden mb-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-pink-400/40 to-purple-400/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Header Content - Left Aligned */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Secure Document Room
                </h1>
                <p className="text-sm text-gray-700 font-medium mt-1">
                  Confidential property documentation
                </p>
              </div>
            </div>
          </div>

          {/* Trust & Verification Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4 mb-4 shadow-md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-purple-900 mb-1">
                  ✓ Verified Secure Access
                </p>
                <p className="text-xs text-purple-800">
                  Your identity has been verified. All document access is encrypted and logged for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Access Warning */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-pink-900 mb-1">
                  Confidential Access Authorized for {userName}
                </p>
                <p className="text-xs text-pink-800 leading-relaxed">
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
    <div className="w-full px-6 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Property
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Property Documents
        </h1>
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
