import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileCheck, DollarSign, Home, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DocumentVerificationModal } from './DocumentVerificationModal';
import { PaymentEscrowSetupModal } from './PaymentEscrowSetupModal';
import { FinalWalkthroughModal } from './FinalWalkthroughModal';
import { ClosingDateModal } from './ClosingDateModal';
import APSContractDocument from './APSContractDocument';
import { buildContractData } from '@/services/apsContractService';
import { saveContractSignature, notifySellerToSign } from '@/services/signatureService';
import { formatCurrency, formatDate } from '@/services/apsContractService';

interface ClosingProcessViewProps {
  propertyId: string;
}

export function ClosingProcessView({ propertyId }: ClosingProcessViewProps) {
  const [showDocVerification, setShowDocVerification] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [showFinalWalkthrough, setShowFinalWalkthrough] = useState(false);
  const [showClosingDate, setShowClosingDate] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1])); // Step 1 is completed
  
  // State for real data
  const [property, setProperty] = useState<any>(null);
  const [buyer, setBuyer] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [lawyer, setLawyer] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch closing data on mount
  useEffect(() => {
    fetchClosingData();
  }, [propertyId]);

  // Determine step statuses based on completion
  const getStepStatus = (stepId: number): 'completed' | 'in_progress' | 'pending' => {
    if (completedSteps.has(stepId)) return 'completed';
    
    // Check if previous step is completed
    const previousStepCompleted = stepId === 1 || completedSteps.has(stepId - 1);
    if (previousStepCompleted) return 'in_progress';
    
    return 'pending';
  };

  // Fetch all closing data
  const fetchClosingData = async () => {
    try {
      setLoading(true);
      console.log('Fetching for propertyId:', propertyId);
      
      // Fetch property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      console.log('Property data:', propertyData);
      console.log('Property error:', propertyError);
      
      if (propertyError) {
        console.error('Error fetching property:', propertyError);
      } else {
        setProperty(propertyData);
      }
      
      // Fetch buyer (current logged in user)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      let buyerData = null;
      if (userError || !user) {
        console.error('Error fetching user:', userError);
      } else {
        const { data: buyerProfile, error: buyerError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Buyer data:', buyerProfile);
        console.log('Buyer error:', buyerError);
        
        if (buyerError) {
          console.error('Error fetching buyer profile:', buyerError);
        } else {
          buyerData = buyerProfile;
          setBuyer(buyerProfile);
        }
      }
      
      // Fetch seller using property.user_id
      let sellerData = null;
      if (propertyData?.user_id) {
        const { data: sellerProfile, error: sellerError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', propertyData.user_id)
          .single();
        
        console.log('Seller data:', sellerProfile);
        console.log('Seller error:', sellerError);
        
        if (sellerError) {
          console.error('Error fetching seller profile:', sellerError);
        } else {
          sellerData = sellerProfile;
          setSeller(sellerProfile);
        }
      }
      
      // Build contract data using buildContractData function
      const builtContract = buildContractData(
        propertyData,
        buyerData,
        sellerData,
        lawyer,
        propertyId
      );
      console.log('Built contract data:', builtContract);
      setContractData(builtContract);
    } catch (error) {
      console.error('Error in fetchClosingData:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle contract signing
  async function handleSignContract() {
    if (!contractData || !buyer) return

    setIsSigning(true)

    try {
      const result = await saveContractSignature(
        propertyId,
        contractData,
        'buyer',
        typedName,
        buyer.id
      )

      if (result.success) {
        // Update contractData with signature info
        setContractData(prev => prev ? {
          ...prev,
          buyerSignature: typedName,
          buyerSignDatetime: new Date().toLocaleString('en-CA'),
          buyerBiometricVerified: true,
          documentHash: result.documentHash
        } : null)

        setSignatureComplete(true)
        setShowSignModal(false)
        setShowContract(false)
        setTypedName('')
        setAgreedToTerms(false)

        // Notify seller to countersign
        if (seller) {
          await notifySellerToSign(
            propertyId,
            contractData,
            buyer,
            seller,
            lawyer
          )
        }

        // Show success notification
        toast.success(
          'Agreement signed successfully! Seller will be notified to countersign.',
          { duration: 5000 }
        )
      } else {
        toast.error('Signing failed. Please try again.')
      }
    } catch (error) {
      console.error('Signing error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSigning(false)
    }
  }

  const closingSteps = [
    {
      id: 1,
      title: 'Offer Acceptance',
      description: 'Your offer has been accepted by the seller',
      status: getStepStatus(1),
      icon: CheckCircle,
      date: completedSteps.has(1) ? 'Completed on Feb 28, 2026' : 'Not Started'
    },
    {
      id: 2,
      title: 'Document Verification',
      description: 'Review and verify all property documents',
      status: getStepStatus(2),
      icon: FileCheck,
      date: completedSteps.has(2) ? 'Completed' : 'In Progress'
    },
    {
      id: 3,
      title: 'Payment & Escrow Setup',
      description: 'Set up payment method and escrow account',
      status: getStepStatus(3),
      icon: DollarSign,
      date: completedSteps.has(3) ? 'Completed' : 'Not Started'
    },
    {
      id: 4,
      title: 'Final Walkthrough',
      description: 'Schedule final property inspection',
      status: getStepStatus(4),
      icon: Home,
      date: completedSteps.has(4) ? 'Completed' : 'Not Started'
    },
    {
      id: 5,
      title: 'Closing Date',
      description: 'Complete the transaction and receive keys',
      status: getStepStatus(5),
      icon: Calendar,
      date: completedSteps.has(5) ? 'Completed' : 'Not Started'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-emerald-600';
      case 'in_progress':
        return 'from-purple-500 to-indigo-600';
      case 'pending':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'in_progress':
        return 'from-purple-50 to-indigo-50 border-purple-200';
      case 'pending':
        return 'from-gray-50 to-gray-100 border-gray-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  // Calculate progress percentage
  const progressPercentage = (completedSteps.size / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Closing Progress</h2>
            <p className="text-sm text-purple-700 mt-1">Track your journey to property ownership</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-purple-600">{progressPercentage}%</div>
            <div className="text-xs text-purple-700 font-medium">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 shadow-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 mb-1">
              Closing Process Assistant
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              This feature helps you track and manage all steps required to close the deal. 
              Complete each step in order to ensure a smooth transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Closing Steps */}
      <div className="space-y-4">
        {closingSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`bg-gradient-to-r ${getStatusBg(step.status)} border-2 rounded-xl p-5 shadow-md transition-all hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                {/* Step Number & Icon */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatusColor(step.status)} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {index < closingSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-purple-300 to-transparent" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        step.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : step.status === 'in_progress'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {step.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {step.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                        {step.status === 'completed' ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">{step.date}</p>

                  {/* Action Button */}
                  {step.status === 'in_progress' && (
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md"
                      size="sm"
                      onClick={() => {
                        if (step.id === 2) {
                          setShowDocVerification(true);
                        } else if (step.id === 3) {
                          setShowPaymentSetup(true);
                        } else if (step.id === 4) {
                          setShowFinalWalkthrough(true);
                        } else if (step.id === 5) {
                          setShowClosingDate(true);
                        }
                      }}
                    >
                      Continue
                    </Button>
                  )}
                  {step.status === 'pending' && (
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      size="sm"
                      disabled
                    >
                      Not Available Yet
                    </Button>
                  )}
                  {step.status === 'completed' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        size="sm"
                        onClick={() => setShowContract(true)}
                      >
                        View Details
                      </Button>
                      {signatureComplete && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                          <span>✅</span>
                          <span>Agreement signed — awaiting seller countersignature</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-4">
          Our team is here to assist you throughout the closing process. Contact us if you have any questions.
        </p>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          Contact Support
        </Button>
      </div>

      {/* Document Verification Modal */}
      <DocumentVerificationModal
        isOpen={showDocVerification}
        onClose={() => setShowDocVerification(false)}
        propertyId={propertyId}
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 2]));
          toast.success('Document verification completed! Payment & Escrow Setup is now available.');
        }}
      />

      {/* Payment & Escrow Setup Modal */}
      <PaymentEscrowSetupModal
        isOpen={showPaymentSetup}
        onClose={() => setShowPaymentSetup(false)}
        propertyId={propertyId}
        purchasePrice={500000} // This should come from property data
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 3]));
          toast.success('Payment & Escrow setup completed! Final Walkthrough is now available.');
        }}
      />

      {/* Final Walkthrough Modal */}
      <FinalWalkthroughModal
        isOpen={showFinalWalkthrough}
        onClose={() => setShowFinalWalkthrough(false)}
        propertyId={propertyId}
        closingDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)} // 14 days from now
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 4]));
          toast.success('Final Walkthrough completed! Ready for closing date.');
        }}
      />

      {/* Closing Date Modal */}
      <ClosingDateModal
        isOpen={showClosingDate}
        onClose={() => setShowClosingDate(false)}
        propertyId={propertyId}
        propertyAddress="123 Example Street, City, State" // This should come from property data
        closingDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)} // 14 days from now
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 5]));
          toast.success('🎉 Congratulations! The property is now yours!');
        }}
      />

      {/* Offer Acceptance Contract Modal */}
      {showContract && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-4">
          <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-7xl mx-4 relative min-h-screen">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Agreement of Purchase and Sale
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Please read the entire agreement before signing
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="text-sm text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => setShowContract(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contract Document */}
            <div className="overflow-y-auto max-h-[70vh] bg-gray-100 px-4 py-4">
              {contractData ? (
                <APSContractDocument
                  data={contractData}
                  onSign={() => setShowSignModal(true)}
                  isSigned={false}
                  signerRole="buyer"
                  isEditable={!signatureComplete}
                  onDataChange={(updated) => setContractData(updated)}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading contract...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex items-center justify-between">
              <p className="text-xs text-gray-400">
                This agreement is legally binding when signed by all parties.
                HomieAI Inc. — FINTRAC Licensed
              </p>
              <div className="flex gap-3">
                {!signatureComplete && (
                  <button
                    onClick={() => {
                      toast.success('Changes saved')
                    }}
                    className="px-4 py-2 text-sm border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50"
                  >
                    💾 Save Changes
                  </button>
                )}
                <button
                  onClick={() => setShowContract(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowSignModal(true)}
                  className="px-6 py-2 text-sm bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✍️ Sign Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Agreement Modal */}
      {showSignModal && contractData && (
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
                <p>📍 {contractData.propertyAddress}, {contractData.propertyCity}</p>
                <p>💰 {formatCurrency(contractData.purchasePrice)}</p>
                <p>📅 Closing: {formatDate(contractData.closingDate)}</p>
              </div>

              {/* Name confirmation field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type your full legal name to confirm:
                </label>
                <input
                  type="text"
                  placeholder={`Enter: ${contractData.buyerName}`}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {typedName && typedName.toLowerCase().trim() !== contractData.buyerName.toLowerCase().trim() && (
                  <p className="text-red-500 text-xs mt-1">
                    Name must match exactly: {contractData.buyerName}
                  </p>
                )}
                {typedName && typedName.toLowerCase().trim() === contractData.buyerName.toLowerCase().trim() && (
                  <p className="text-green-500 text-xs mt-1">
                    ✅ Name verified
                  </p>
                )}
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeCheckbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-purple-600"
                />
                <label htmlFor="agreeCheckbox" className="text-sm text-gray-600">
                  I have read the entire Agreement of Purchase and Sale
                  and I agree to be legally bound by its terms and conditions.
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowSignModal(false)
                  setTypedName('')
                  setAgreedToTerms(false)
                }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSignContract}
                disabled={
                  !agreedToTerms ||
                  typedName.toLowerCase().trim() !== contractData.buyerName.toLowerCase().trim() ||
                  isSigning
                }
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSigning ? (
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
}
