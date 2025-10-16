import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, PenTool, RotateCcw, FileText, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { contractService } from '@/services/contractService';
import { RentalContract, SignatureData, ContractStatus } from '@/types/contract';
import { toast } from 'sonner';

interface ContractSigningProps {
  contract: RentalContract;
  onSigningComplete: (updatedContract: RentalContract) => void;
  onError?: (error: string) => void;
}

export function ContractSigning({ contract, onSigningComplete, onError }: ContractSigningProps) {
  const { user } = useAuth();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  
  // Determine user role
  const userRole = user ? contractService.getUserRole(contract, user.id) : null;
  const canSign = user ? contractService.canUserSign(contract, user.id) : false;
  
  useEffect(() => {
    // Auto-populate full name if available
    if (user?.email) {
      setFullName(user.email.split('@')[0].replace(/[._]/g, ' '));
    }
  }, [user]);

  const handleSign = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error('Please provide your signature');
      return;
    }

    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!userRole) {
      toast.error('Unable to determine your role in this contract');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const signatureData: SignatureData = {
        signature: sigCanvas.current.toDataURL(),
        timestamp: new Date().toISOString(),
        ipAddress: '', // Will be populated by service
        userAgent: navigator.userAgent,
        fullName: fullName.trim(),
        email: user?.email || ''
      };

      const response = await contractService.signContract({
        contractId: contract.id,
        signature: signatureData,
        userType: userRole,
        agreedToTerms: agreed
      });

      if (response.success && response.contract) {
        toast.success('Contract signed successfully!');
        onSigningComplete(response.contract);
      } else {
        const errorMessage = response.message || 'Failed to sign contract';
        toast.error(errorMessage);
        if (onError) onError(errorMessage);
      }
      
    } catch (error) {
      console.error('Signing error:', error);
      const errorMessage = 'An unexpected error occurred while signing';
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const getStatusBadge = () => {
    switch (contract.status) {
      case ContractStatus.PENDING_TENANT:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Waiting for Tenant</Badge>;
      case ContractStatus.PENDING_LANDLORD:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Waiting for Landlord</Badge>;
      case ContractStatus.FULLY_EXECUTED:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Fully Executed</Badge>;
      case ContractStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case ContractStatus.EXPIRED:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const isAlreadySigned = () => {
    if (userRole === 'tenant' && contract.tenantSignedAt) return true;
    if (userRole === 'landlord' && contract.landlordSignedAt) return true;
    return false;
  };

  const getWaitingMessage = () => {
    if (contract.status === ContractStatus.PENDING_TENANT && userRole === 'landlord') {
      return 'Waiting for tenant to sign the contract';
    }
    if (contract.status === ContractStatus.PENDING_LANDLORD && userRole === 'tenant') {
      return 'Waiting for landlord to sign the contract';
    }
    return null;
  };

  if (!userRole) {
    return (
      <Alert>
        <AlertDescription>
          You do not have permission to view or sign this contract.
        </AlertDescription>
      </Alert>
    );
  }

  if (contract.status === ContractStatus.FULLY_EXECUTED) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Contract Fully Executed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {getStatusBadge()}
          </div>
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              This contract has been signed by both parties and is now fully executed.
            </AlertDescription>
          </Alert>
          {contract.contractPdfUrl && (
            <Button variant="outline" className="mt-4" asChild>
              <a href={contract.contractPdfUrl} target="_blank" rel="noopener noreferrer">
                Download Signed Contract
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isAlreadySigned()) {
    const waitingMessage = getWaitingMessage();
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Signature Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {getStatusBadge()}
          </div>
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              You have successfully signed this contract.
              {waitingMessage && (
                <span className="block mt-2">{waitingMessage}</span>
              )}
            </AlertDescription>
          </Alert>
          
          {/* Show signature timestamp */}
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Signed on: {new Date(
                userRole === 'tenant' ? contract.tenantSignedAt! : contract.landlordSignedAt!
              ).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canSign) {
    return (
      <Alert>
        <AlertDescription>
          This contract is not available for signing at this time.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          {userRole === 'tenant' ? 'Tenant Signature Required' : 'Landlord Signature Required'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {/* Contract expiration warning */}
        {contract.expiresAt && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800">
              This contract expires on {new Date(contract.expiresAt).toLocaleDateString()}.
              Please sign before this date to avoid expiration.
            </AlertDescription>
          </Alert>
        )}

        {/* Full Name Input */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Legal Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full legal name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Signature Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Digital Signature *</label>
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={() => setShowSignature(!showSignature)}
            >
              {showSignature ? 'Hide' : 'Show'} Signature Pad
            </Button>
          </div>
          
          {showSignature && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="bg-white rounded border">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas w-full max-w-full'
                  }}
                  backgroundColor="white"
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Sign above using your mouse, touchpad, or touch screen
                </p>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={clearSignature}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreement"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <label htmlFor="agreement" className="text-sm leading-relaxed">
            I acknowledge that I have read, understood, and agree to all terms and conditions 
            of this rental agreement. I understand that my digital signature has the same 
            legal effect as a handwritten signature.
          </label>
        </div>

        {/* Sign Button */}
        <Button
          onClick={handleSign}
          disabled={!agreed || !fullName.trim() || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Signing Contract...' : 'Sign Contract'}
        </Button>

        {/* Legal Disclaimer */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">Legal Notice:</p>
          <p>
            By signing this document electronically, you agree that your electronic signature 
            is the legal equivalent of your manual signature and that you are legally bound 
            by the terms of this agreement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContractSigning;