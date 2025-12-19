import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  FileText,
  CheckCircle,
  X,
  User,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  Pen
} from 'lucide-react';
import { toast } from 'sonner';
import { signOntarioLeaseAsLandlord } from '@/services/ontarioLeaseService';

interface Contract {
  id: string;
  application_id: string;
  property_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  property_address: string;
  property_city: string;
  property_state: string;
  monthly_rent: number;
  security_deposit: number;
  lease_start_date: string;
  lease_end_date: string;
  status: string;
  created_at: string;
  tenant_signature?: {
    signature_data: string;
    signed_at: string;
    ip_address: string;
  };
}

interface ContractSigningFormProps {
  contract: Contract;
  onSign: (contractId: string) => void;
  onCancel: () => void;
}

export function ContractSigningForm({ contract, onSign, onCancel }: ContractSigningFormProps) {
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!agreementChecked) {
      toast.error('Please check the agreement box to proceed');
      return;
    }

    try {
      setSigning(true);

      // Create signature data (using checkbox agreement as signature)
      const signatureData = {
        signature_data: `Landlord Agreement: ${new Date().toISOString()}`,
        ip_address: '127.0.0.1', // TODO: Get actual IP
        user_agent: navigator.userAgent
      };

      await signOntarioLeaseAsLandlord(contract.id, signatureData);
      toast.success('Contract signed successfully!');
      await onSign(contract.id);
    } catch (error) {
      console.error('Failed to sign contract:', error);
      toast.error('Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Review & Sign Lease Contract</h2>
                <p className="text-sm text-muted-foreground">
                  Tenant: {contract.tenant_name}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Property Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{contract.property_address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">City, State</Label>
                  <p className="text-sm">{contract.property_city}, {contract.property_state}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Financial Terms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Monthly Rent</Label>
                  <p className="text-sm font-semibold">{formatCurrency(contract.monthly_rent)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Security Deposit</Label>
                  <p className="text-sm font-semibold">{formatCurrency(contract.security_deposit)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Lease Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Lease Period</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-sm">{formatDate(contract.lease_start_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-sm">{formatDate(contract.lease_end_date)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Tenant Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{contract.tenant_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{contract.tenant_email}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenant Signature Status */}
          {contract.tenant_signature && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Tenant Signature Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Tenant has signed this contract</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Signed on {formatDate(contract.tenant_signature.signed_at)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    IP Address: {contract.tenant_signature.ip_address}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Landlord Agreement */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Pen className="h-5 w-5" />
                <span>Landlord Signature</span>
              </CardTitle>
              <CardDescription>
                By checking the box below and clicking "Sign Contract", you agree to the terms of this lease agreement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                <Checkbox
                  id="landlordAgreement"
                  checked={agreementChecked}
                  onCheckedChange={(checked) => setAgreementChecked(checked as boolean)}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor="landlordAgreement"
                  className="text-sm font-medium cursor-pointer"
                >
                  I agree to sign this lease contract and accept all terms and conditions
                </Label>
              </div>

              {!agreementChecked && (
                <div className="flex items-center space-x-2 mt-3 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">You must agree to the terms before signing</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!agreementChecked || signing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {signing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing...
                </>
              ) : (
                <>
                  <Pen className="h-4 w-4 mr-2" />
                  Sign Contract
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
