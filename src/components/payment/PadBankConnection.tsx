import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { BankAccountDetails } from '@/types/payment';

interface PadBankConnectionProps {
  onBankConnected: (bankDetails: BankAccountDetails) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function PadBankConnection({
  onBankConnected,
  onCancel,
  isLoading = false
}: PadBankConnectionProps) {
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>({
    accountHolderName: '',
    institutionNumber: '',
    transitNumber: '',
    accountNumber: '',
    bankName: ''
  });
  
  const [mandateAccepted, setMandateAccepted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BankAccountDetails, string>>>({});

  const validateField = (field: keyof BankAccountDetails, value: string): string | null => {
    switch (field) {
      case 'institutionNumber':
        if (!/^\d{3}$/.test(value)) {
          return 'Institution number must be 3 digits';
        }
        break;
      case 'transitNumber':
        if (!/^\d{5}$/.test(value)) {
          return 'Transit number must be 5 digits';
        }
        break;
      case 'accountNumber':
        if (!/^\d{7,12}$/.test(value)) {
          return 'Account number must be 7-12 digits';
        }
        break;
      case 'accountHolderName':
        if (value.trim().length < 2) {
          return 'Please enter account holder name';
        }
        break;
    }
    return null;
  };

  const handleInputChange = (field: keyof BankAccountDetails, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Partial<Record<keyof BankAccountDetails, string>> = {};
    
    (Object.keys(bankDetails) as Array<keyof BankAccountDetails>).forEach(field => {
      if (field !== 'bankName') { // bankName is optional
        const error = validateField(field, bankDetails[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!mandateAccepted) {
      alert('Please accept the PAD mandate agreement to continue');
      return;
    }

    onBankConnected(bankDetails);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-green-600" />
          Connect Your Canadian Bank Account
        </CardTitle>
        <CardDescription>
          Enter your bank details to set up Pre-Authorized Debit (PAD) payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your banking information is encrypted and securely processed by Stripe. 
              We never store your full account details.
            </AlertDescription>
          </Alert>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">
              Account Holder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountHolderName"
              placeholder="John Doe"
              value={bankDetails.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              disabled={isLoading}
            />
            {errors.accountHolderName && (
              <p className="text-sm text-red-600">{errors.accountHolderName}</p>
            )}
          </div>

          {/* Bank Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="bankName">
              Bank Name <span className="text-gray-500 text-sm">(Optional)</span>
            </Label>
            <Input
              id="bankName"
              placeholder="e.g., RBC, TD, Scotiabank"
              value={bankDetails.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Institution Number */}
          <div className="space-y-2">
            <Label htmlFor="institutionNumber">
              Institution Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="institutionNumber"
              placeholder="001"
              maxLength={3}
              value={bankDetails.institutionNumber}
              onChange={(e) => handleInputChange('institutionNumber', e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">3-digit bank code (e.g., 001 for BMO, 004 for TD)</p>
            {errors.institutionNumber && (
              <p className="text-sm text-red-600">{errors.institutionNumber}</p>
            )}
          </div>

          {/* Transit Number */}
          <div className="space-y-2">
            <Label htmlFor="transitNumber">
              Transit Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transitNumber"
              placeholder="12345"
              maxLength={5}
              value={bankDetails.transitNumber}
              onChange={(e) => handleInputChange('transitNumber', e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">5-digit branch code</p>
            {errors.transitNumber && (
              <p className="text-sm text-red-600">{errors.transitNumber}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Account Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              placeholder="1234567"
              maxLength={12}
              value={bankDetails.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
              type="password"
            />
            <p className="text-xs text-gray-500">7-12 digits</p>
            {errors.accountNumber && (
              <p className="text-sm text-red-600">{errors.accountNumber}</p>
            )}
          </div>

          {/* PAD Mandate Agreement */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pre-Authorized Debit Agreement
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>By providing your bank account information, you authorize:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Roomie AI to debit your account for rent payments</li>
                <li>Payments to be processed on the agreed schedule</li>
                <li>Your bank to honor these payment requests</li>
              </ul>
              <p className="mt-2">You can cancel this authorization at any time by contacting us.</p>
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="mandate"
                checked={mandateAccepted}
                onCheckedChange={(checked) => setMandateAccepted(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="mandate"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I authorize Pre-Authorized Debit payments from my bank account
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !mandateAccepted}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Connect Bank Account
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
