import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LandlordPayoutMethodSelector } from './LandlordPayoutMethodSelector';
import { LandlordBankAccountForm } from './LandlordBankAccountForm';
import { LandlordDebitCardForm } from './LandlordDebitCardForm';
import {
  LandlordPayoutMethodType,
  LandlordBankAccountDetails,
  LandlordDebitCardDetails,
  PayoutSetupRequest
} from '@/types/payment';
import { setupLandlordPayoutMethod } from '@/services/landlordPayoutService';
import { toast } from 'sonner';

interface PayoutMethodSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type SetupStep = 'select-method' | 'enter-bank' | 'enter-card' | 'verifying' | 'complete';

export function PayoutMethodSetupModal({
  open,
  onOpenChange,
  onSuccess
}: PayoutMethodSetupModalProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('select-method');
  const [selectedMethod, setSelectedMethod] = useState<LandlordPayoutMethodType>('bank_account');
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodSelect = (method: LandlordPayoutMethodType) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod === 'bank_account') {
      setCurrentStep('enter-bank');
    } else {
      setCurrentStep('enter-card');
    }
  };

  const handleBankSubmit = async (details: LandlordBankAccountDetails) => {
    setIsLoading(true);
    try {
      const request: PayoutSetupRequest = {
        methodType: 'bank_account',
        bankAccount: details
      };

      const response = await setupLandlordPayoutMethod(request);

      if (response.success) {
        if (response.requiresVerification) {
          toast.success('Bank account connected! Verification pending.');
          setCurrentStep('verifying');
        } else {
          toast.success('Bank account connected successfully!');
          setCurrentStep('complete');
        }
        
        // Refresh parent component
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          resetModal();
        }, 2000);
      } else {
        toast.error(response.error || 'Failed to connect bank account');
      }
    } catch (error: any) {
      console.error('Error setting up bank account:', error);
      toast.error(error.message || 'Failed to connect bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSubmit = async (details: LandlordDebitCardDetails) => {
    setIsLoading(true);
    try {
      const request: PayoutSetupRequest = {
        methodType: 'debit_card',
        debitCard: details
      };

      const response = await setupLandlordPayoutMethod(request);

      if (response.success) {
        toast.success('Debit card connected successfully!');
        setCurrentStep('complete');
        
        // Refresh parent component
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          resetModal();
        }, 2000);
      } else {
        toast.error(response.error || 'Failed to connect debit card');
      }
    } catch (error: any) {
      console.error('Error setting up debit card:', error);
      toast.error(error.message || 'Failed to connect debit card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'enter-bank' || currentStep === 'enter-card') {
      setCurrentStep('select-method');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetModal();
  };

  const resetModal = () => {
    setTimeout(() => {
      setCurrentStep('select-method');
      setSelectedMethod('bank_account');
      setIsLoading(false);
    }, 300);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select-method':
        return (
          <div className="space-y-6">
            <LandlordPayoutMethodSelector
              selectedMethod={selectedMethod}
              onMethodChange={handleMethodSelect}
            />
            <div className="flex gap-3">
              <Button onClick={handleContinue} className="flex-1">
                Continue
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        );

      case 'enter-bank':
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Method Selection
            </Button>
            <LandlordBankAccountForm
              onSubmit={handleBankSubmit}
              onCancel={handleBack}
              isLoading={isLoading}
            />
          </div>
        );

      case 'enter-card':
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Method Selection
            </Button>
            <LandlordDebitCardForm
              onSubmit={handleCardSubmit}
              onCancel={handleBack}
              isLoading={isLoading}
            />
          </div>
        );

      case 'verifying':
        return (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Verification Pending</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We'll send two small deposits to your bank account within 1-2 business days. 
              Once received, enter the amounts to verify your account.
            </p>
            <Button onClick={() => { onOpenChange(false); resetModal(); }}>
              Got It
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-600">All Set!</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your payout method has been connected successfully. You'll receive rent payments automatically.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'select-method' && 'Connect Payout Method'}
            {currentStep === 'enter-bank' && 'Bank Account Details'}
            {currentStep === 'enter-card' && 'Debit Card Details'}
            {currentStep === 'verifying' && 'Verification Required'}
            {currentStep === 'complete' && 'Success!'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'select-method' && 'Choose how you want to receive rent payments'}
            {currentStep === 'enter-bank' && 'Enter your Canadian bank account information'}
            {currentStep === 'enter-card' && 'Enter your debit card information for instant payouts'}
            {currentStep === 'verifying' && 'Your bank account needs to be verified'}
            {currentStep === 'complete' && 'Your payout method is ready to use'}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
