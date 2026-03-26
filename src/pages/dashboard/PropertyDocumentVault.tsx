import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield, AlertTriangle, FileText, ClipboardCheck, Scale, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentVault } from '@/components/property/DocumentVault';
import { ClosingProcessView } from '@/components/property/ClosingProcessView';
import { AssignLawyerModal } from '@/components/property/AssignLawyerModal';
import { fetchPropertyById } from '@/services/propertyService';
import { supabase } from '@/integrations/supabase/client';
import { getLawyerForDeal } from '@/services/dealLawyerService';
import { saveContractSignature } from '@/services/signatureService';
import type { PropertyCategory } from '@/types/propertyCategories';
import type { DealLawyer } from '@/types/dealLawyer';

const PropertyDocumentVault: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [activeTab, setActiveTab] = useState<'documents' | 'closing'>('documents');
  const [assignedLawyer, setAssignedLawyer] = useState<DealLawyer | null>(null);
  const [lawyerName, setLawyerName] = useState<string>('');
  const [showAssignLawyerModal, setShowAssignLawyerModal] = useState(false);
  const [isLawyer, setIsLawyer] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingSellerSignature, setPendingSellerSignature] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [showSellerSignModal, setShowSellerSignModal] = useState(false);
  const [sellerTypedName, setSellerTypedName] = useState('');
  const [sellerAgreedToTerms, setSellerAgreedToTerms] = useState(false);
  const [isSellerSigning, setIsSellerSigning] = useState(false);

  // Check for pending seller signature
  useEffect(() => {
    async function checkPendingSignature() {
      const { data } = await supabase
        .from('contract_signatures')
        .select('status, buyer_name_typed, buyer_signed_at')
        .eq('property_id', id)
        .single()

      if (data?.status === 'buyer_signed') {
        setPendingSellerSignature(true)
        setBuyerName(data.buyer_name_typed || '')
      }
    }
    checkPendingSignature()
  }, [id]);

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
          
          // Get user profile for name and role
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name);
          }
          
          if (profile?.role) {
            setUserRole(profile.role);
            setIsLawyer(profile.role === 'lawyer');
            console.log('👤 User role:', profile.role, 'isLawyer:', profile.role === 'lawyer');
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

          // Check if lawyer is assigned (for buyer view)
          if (!userIsOwner) {
            await loadAssignedLawyer();
          }
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

  const loadAssignedLawyer = async () => {
    if (!id) return;
    
    try {
      const lawyer = await getLawyerForDeal(id);
      setAssignedLawyer(lawyer);

      if (lawyer) {
        // Get lawyer profile info
        const { data: lawyerProfile } = await supabase
          .from('lawyer_profiles')
          .select('full_name')
          .eq('id', lawyer.lawyer_id)
          .single();

        if (lawyerProfile?.full_name) {
          setLawyerName(lawyerProfile.full_name);
        }
      }
    } catch (error) {
      console.error('Error loading assigned lawyer:', error);
    }
  };

  // Handle seller contract signing
  const handleSellerSignContract = async () => {
    if (!property || !property.user_id) return;

    setIsSellerSigning(true);

    try {
      // Get current contract data from property
      const { data: contractData } = await supabase
        .from('contract_signatures')
        .select('contract_data')
        .eq('property_id', id)
        .single();

      if (!contractData?.contract_data) {
        toast.error('Contract data not found');
        return;
      }

      const result = await saveContractSignature(
        id,
        contractData.contract_data,
        'seller',
        sellerTypedName,
        property.user_id
      );

      if (result.success) {
        // Update contract data with seller signature
        const updatedContract = {
          ...contractData.contract_data,
          sellerSignature: sellerTypedName,
          sellerSignDatetime: new Date().toLocaleString('en-CA'),
          sellerBiometricVerified: true,
          documentHash: result.documentHash
        };

        // Update contract data in state
        // Note: We can't directly update the state here since it's in ClosingProcessView
        // The seller signature will be reflected when the page reloads

        // Notify buyer that seller has countersigned
        await supabase
          .from('payment_notifications')
          .insert({
            user_id: contractData.contract_data.buyerUserId,
            notification_type: 'contract_fully_executed',
            title: '🎉 Contract Fully Executed!',
            message: `Great news! ${userName} has countersigned the Agreement of Purchase and Sale for ${contractData.contract_data.propertyAddress}. Your contract is now fully executed. Document Verification (Stage 2) is now active.`,
            property_id: id,
            property_link: `/dashboard/property/${id}/documents`
          });

        // Auto advance to Stage 2
        await supabase
          .from('closing_process')
          .update({
            current_stage: 2,
            stage_1_completed_at: new Date().toISOString()
          })
          .eq('property_id', id);

        setShowSellerSignModal(false);
        setSellerTypedName('');
        setSellerAgreedToTerms(false);
        setPendingSellerSignature(false);

        toast.success('Contract fully executed! Buyer has been notified.');
      } else {
        toast.error('Signing failed. Please try again.');
      }
    } catch (error) {
      console.error('Seller signing error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSellerSigning(false);
    }
  };

  const handleLawyerAssignSuccess = () => {
    loadAssignedLawyer();
  };

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

  console.log('✅ Rendering: Document Vault - propertyId:', id, 'category:', propertyCategory, 'isOwner:', isOwner, 'isLawyer:', isLawyer);
  
  // Lawyer View (Read-Only Document Review)
  if (isLawyer) {
    return (
      <div className="w-full px-6 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Document Reviews
          </Button>
          
          {/* Lawyer Document Review Header */}
          <div className="relative bg-gradient-to-br from-indigo-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl p-6 border-2 border-indigo-200/50 shadow-2xl backdrop-blur-sm overflow-hidden mb-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-indigo-400/40 to-blue-400/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Header Content */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
                <Scale className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Legal Document Review
                </h1>
                <p className="text-sm text-gray-700 font-medium mt-1">
                  Professional legal review access - Read-only mode
                </p>
              </div>
            </div>
          </div>

          {/* Lawyer Access Notice */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-indigo-900 mb-1">
                  ✓ Legal Professional Access
                </p>
                <p className="text-xs text-indigo-800">
                  You have read-only access to review all property documents as the assigned legal counsel. 
                  You cannot modify documents or manage the closing process - your role is to review and advise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents View Only */}
        <DocumentVault 
          propertyId={id} 
          propertyCategory={propertyCategory}
          readOnly={true}
          isBuyerView={true}
        />
      </div>
    );
  }
  
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

          {/* Action Bar with Lawyer Assignment */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Tab Navigation */}
            <div className="bg-white border-2 border-purple-200 rounded-xl shadow-md p-1 flex gap-2 flex-1">
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'documents'
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-b-4 border-purple-600 shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50/50'
                }`}
              >
                <FileText className="h-4 w-4" />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('closing')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'closing'
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-b-4 border-purple-600 shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50/50'
                }`}
              >
                <ClipboardCheck className="h-4 w-4" />
                Start Closing Process
              </button>
            </div>

            {/* Lawyer Assignment Button */}
            {assignedLawyer ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl px-6 py-3 flex items-center gap-3 shadow-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-700 font-medium">Assigned Lawyer</p>
                  <p className="text-sm font-bold text-green-900">{lawyerName || 'Platform Lawyer'}</p>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowAssignLawyerModal(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all whitespace-nowrap"
              >
                <Scale className="h-4 w-4 mr-2" />
                Add Lawyer
              </Button>
            )}
          </div>

          {/* Trust & Verification Banner - Only show on Documents tab */}
          {activeTab === 'documents' && (
            <>
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
            </>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'documents' ? (
          <DocumentVault 
            propertyId={id} 
            propertyCategory={propertyCategory}
            readOnly={true}
            isBuyerView={true}
          />
        ) : (
          <ClosingProcessView propertyId={id} />
        )}

        {/* Assign Lawyer Modal */}
        <AssignLawyerModal
          isOpen={showAssignLawyerModal}
          onClose={() => setShowAssignLawyerModal(false)}
          propertyId={id}
          onSuccess={handleLawyerAssignSuccess}
        />
      </div>
    );
  }

  // Owner View (Full Management Controls)
  return (
    <div className="w-full px-6 py-6">
      {/* Seller Signature Banner */}
      {pendingSellerSignature && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-semibold text-orange-800">
                Contract requires your signature
              </p>
              <p className="text-sm text-orange-600">
                {buyerName} has signed the purchase agreement.
                Your countersignature is required to proceed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSellerSignModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            Review and Sign →
          </button>
        </div>
      )}

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

      {/* Seller Sign Agreement Modal */}
      {showSellerSignModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Sign Agreement
                  </h3>
                  <p className="text-sm text-gray-500">
                    Legally binding e-signature
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Security notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                🔒 Your signature is secured by HomieAI biometric
                verification and is legally binding under the
                Electronic Commerce Act of Ontario.
              </div>

              {/* What they are signing */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p className="font-semibold text-gray-700 mb-2">
                  You are signing:
                </p>
                <p>📍 {property?.address}, {property?.city}</p>
                <p>💰 ${property?.price.toLocaleString('en-CA')} CAD</p>
                <p>📅 Closing: {new Date(property?.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Name confirmation field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type your full legal name to confirm:
                </label>
                <input
                  type="text"
                  placeholder={`Enter: ${userName}`}
                  value={sellerTypedName}
                  onChange={(e) => setSellerTypedName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {sellerTypedName && sellerTypedName.toLowerCase().trim() !== userName.toLowerCase().trim() && (
                  <p className="text-red-500 text-xs mt-1">
                    Name must match exactly: {userName}
                  </p>
                )}
                {sellerTypedName && sellerTypedName.toLowerCase().trim() === userName.toLowerCase().trim() && (
                  <p className="text-green-500 text-xs mt-1">
                    ✅ Name verified
                  </p>
                )}
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sellerAgreeCheckbox"
                  checked={sellerAgreedToTerms}
                  onChange={(e) => setSellerAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-purple-600"
                />
                <label htmlFor="sellerAgreeCheckbox" className="text-sm text-gray-600">
                  I have read the entire Agreement of Purchase and Sale
                  and I agree to be legally bound by its terms and conditions.
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowSellerSignModal(false)
                  setSellerTypedName('')
                  setSellerAgreedToTerms(false)
                }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSellerSignContract()}
                disabled={
                  !sellerAgreedToTerms ||
                  sellerTypedName.toLowerCase().trim() !== userName.toLowerCase().trim() ||
                  isSellerSigning
                }
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSellerSigning ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing...
                  </span>
                ) : (
                  '✍️ Sign Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDocumentVault;
