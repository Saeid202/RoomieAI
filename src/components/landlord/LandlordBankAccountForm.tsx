import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, AlertCircle, Info } from 'lucide-react';
import { LandlordBankAccountDetails, BankAccountType } from '@/types/payment';

interface LandlordBankAccountFormProps {
  onSubmit: (details: LandlordBankAccountDetails) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LandlordBankAccountForm({
  onSubmit,
  onCancel,
  isLoading = false
}: LandlordBankAccountFormProps) {
  const [formData, setFormData] = useState<LandlordBankAccountDetails>({
    accountHolderName: '',
    institutionNumber: '',
    transitNumber: '',
    accountNumber: '',
    accountType: 'checking' as BankAccountType,
    bankName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.institutionNumber || formData.institutionNumber.length !== 3) {
      newErrors.institutionNumber = 'Institution number must be 3 digits';
    }

    if (!formData.transitNumber || formData.transitNumber.length !== 5) {
      newErrors.transitNumber = 'Transit number must be 5 digits';
    }

    if (!formData.accountNumber || formData.accountNumber.length < 7) {
      newErrors.accountNumber = 'Account number must be at least 7 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof LandlordBankAccountDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                Enter your Canadian bank account information for payouts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your bank account will be verified with micro-deposits (1-2 days). 
              Payouts are free and take 2-7 business days.
            </AlertDescription>
          </Alert>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">
              Account Holder Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountHolderName"
              placeholder="John Doe"
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              disabled={isLoading}
            />
            {errors.accountHolderName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.accountHolderName}
              </p>
            )}
          </div>

          {/* Bank Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name (Optional)</Label>
            <Input
              id="bankName"
              placeholder="e.g., TD Canada Trust, RBC, Scotiabank"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Institution and Transit Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionNumber">
                Institution Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="institutionNumber"
                placeholder="000"
                maxLength={3}
                value={formData.institutionNumber}
                onChange={(e) => handleInputChange('institutionNumber', e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
              />
              {errors.institutionNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.institutionNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground">3 digits</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transitNumber">
                Transit Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="transitNumber"
                placeholder="00000"
                maxLength={5}
                value={formData.transitNumber}
                onChange={(e) => handleInputChange('transitNumber', e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
              />
              {errors.transitNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.transitNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground">5 digits</p>
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Account Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountNumber"
              type="password"
              placeholder="Enter your account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.accountNumber}
              </p>
            )}
            <p className="text-xs text-muted-foreground">7-12 digits (hidden for security)</p>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType">
              Account Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.accountType}
              onValueChange={(value) => handleInputChange('accountType', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="accountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Security Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your banking information is encrypted and securely stored. We never see your full account number.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Connecting...' : 'Connect Bank Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
