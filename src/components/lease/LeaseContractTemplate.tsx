import React from 'react';
import { LeaseContract } from '@/services/leaseContractService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, FileText, Users } from 'lucide-react';

interface LeaseContractTemplateProps {
  contract: LeaseContract;
  isPreview?: boolean;
  showSignatures?: boolean;
}

export function LeaseContractTemplate({ 
  contract, 
  isPreview = false, 
  showSignatures = true 
}: LeaseContractTemplateProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully_signed':
      case 'executed':
        return 'bg-green-100 text-green-800';
      case 'pending_landlord_signature':
      case 'pending_tenant_signature':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully_signed':
      case 'executed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending_landlord_signature':
      case 'pending_tenant_signature':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white print:shadow-none">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6 print:pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          RESIDENTIAL LEASE AGREEMENT
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Contract ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{contract.id}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Created:</span>
            <span>{formatDate(contract.created_at)}</span>
          </div>
          <Badge className={`${getStatusColor(contract.status)} flex items-center gap-1`}>
            {getStatusIcon(contract.status)}
            {contract.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Parties Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5" />
          PARTIES TO THE AGREEMENT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg text-blue-900">LANDLORD</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {contract.landlord_name}</p>
                <p><span className="font-medium">Email:</span> {contract.landlord_email}</p>
                {contract.landlord_phone && (
                  <p><span className="font-medium">Phone:</span> {contract.landlord_phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-lg text-green-900">TENANT</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {contract.tenant_name}</p>
                <p><span className="font-medium">Email:</span> {contract.tenant_email}</p>
                {contract.tenant_phone && (
                  <p><span className="font-medium">Phone:</span> {contract.tenant_phone}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">PROPERTY INFORMATION</h2>
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {contract.property_address}</p>
                <p><span className="font-medium">City, State:</span> {contract.property_city}, {contract.property_state} {contract.property_zip}</p>
                <p><span className="font-medium">Property Type:</span> {contract.property_type}</p>
              </div>
              <div className="space-y-2">
                {contract.property_bedrooms && (
                  <p><span className="font-medium">Bedrooms:</span> {contract.property_bedrooms}</p>
                )}
                {contract.property_bathrooms && (
                  <p><span className="font-medium">Bathrooms:</span> {contract.property_bathrooms}</p>
                )}
                {contract.property_square_footage && (
                  <p><span className="font-medium">Square Footage:</span> {contract.property_square_footage.toLocaleString()} sq ft</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lease Terms */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">LEASE TERMS</h2>
        <Card className="border-2 border-purple-200">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bg-purple-50 p-3 rounded">
                  <p className="font-medium text-purple-900">Lease Period</p>
                  <p className="text-lg">{formatDate(contract.lease_start_date)} to {formatDate(contract.lease_end_date)}</p>
                  <p className="text-sm text-purple-700">{contract.lease_duration_months} months</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-medium text-green-900">Financial Terms</p>
                  <p className="text-xl font-bold text-green-800">{formatCurrency(contract.monthly_rent)}/month</p>
                  <p className="text-sm text-green-700">Security Deposit: {formatCurrency(contract.security_deposit)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 p-3 rounded">
              <p className="font-medium text-gray-900">Total Due at Signing</p>
              <p className="text-lg font-bold">{formatCurrency(contract.monthly_rent + contract.security_deposit)}</p>
              <p className="text-sm text-gray-600">(First month rent + Security deposit)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">TERMS AND CONDITIONS</h2>
        <div className="space-y-6 text-sm">
          
          <div className="border-l-4 border-blue-500 pl-6 py-2">
            <h3 className="font-semibold mb-2 text-lg">1. RENT PAYMENT</h3>
            <p className="text-gray-700 leading-relaxed">
              Tenant agrees to pay rent of <strong>{formatCurrency(contract.monthly_rent)}</strong> per month, 
              due on the first day of each month. Rent payments shall be made to the Landlord at the address 
              specified above or through the designated payment method. Late payments may incur additional fees 
              as permitted by law.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-6 py-2">
            <h3 className="font-semibold mb-2 text-lg">2. SECURITY DEPOSIT</h3>
            <p className="text-gray-700 leading-relaxed">
              Tenant has paid a security deposit of <strong>{formatCurrency(contract.security_deposit)}</strong> to 
              secure performance of this lease. The deposit will be returned within 30 days of lease termination, 
              minus any deductions for damages beyond normal wear and tear, unpaid rent, or cleaning costs.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-6 py-2">
            <h3 className="font-semibold mb-2 text-lg">3. USE OF PREMISES</h3>
            <p className="text-gray-700 leading-relaxed">
              The premises shall be used solely as a private residential dwelling by the Tenant and immediate family. 
              No commercial activities, subletting, or assignment of this lease is permitted without prior written 
              consent from the Landlord.
            </p>
          </div>

          {contract.pet_policy && (
            <div className="border-l-4 border-orange-500 pl-6 py-2">
              <h3 className="font-semibold mb-2 text-lg">4. PET POLICY</h3>
              <p className="text-gray-700 leading-relaxed">{contract.pet_policy}</p>
            </div>
          )}

          {contract.smoking_policy && (
            <div className="border-l-4 border-red-500 pl-6 py-2">
              <h3 className="font-semibold mb-2 text-lg">5. SMOKING POLICY</h3>
              <p className="text-gray-700 leading-relaxed">{contract.smoking_policy}</p>
            </div>
          )}

          {contract.utilities_included && contract.utilities_included.length > 0 && (
            <div className="border-l-4 border-cyan-500 pl-6 py-2">
              <h3 className="font-semibold mb-2 text-lg">6. UTILITIES</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Utilities Included:</strong> {contract.utilities_included.join(', ')}
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Tenant is responsible for all other utilities not listed above, including setup and payment of accounts.
              </p>
            </div>
          )}

          <div className="border-l-4 border-indigo-500 pl-6 py-2">
            <h3 className="font-semibold mb-2 text-lg">7. MAINTENANCE AND REPAIRS</h3>
            <p className="text-gray-700 leading-relaxed">
              Landlord shall maintain the premises in habitable condition and make necessary structural repairs. 
              Tenant shall promptly notify Landlord of any needed repairs and shall not make alterations or improvements 
              without written consent. Tenant is responsible for routine maintenance and any damages caused by negligence.
            </p>
          </div>

          <div className="border-l-4 border-pink-500 pl-6 py-2">
            <h3 className="font-semibold mb-2 text-lg">8. TERMINATION</h3>
            <p className="text-gray-700 leading-relaxed">
              Either party may terminate this lease with 30 days written notice, subject to lease terms. 
              Early termination by Tenant may result in penalties as permitted by law. Upon termination, 
              Tenant shall vacate the premises in clean, undamaged condition.
            </p>
          </div>

          {contract.additional_terms && (
            <div className="border-l-4 border-gray-500 pl-6 py-2">
              <h3 className="font-semibold mb-2 text-lg">9. ADDITIONAL TERMS</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {contract.additional_terms}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legal Clauses */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">LEGAL PROVISIONS</h2>
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="text-sm space-y-3 text-gray-700">
              <p><strong>Governing Law:</strong> This lease shall be governed by the laws of the state where the property is located.</p>
              <p><strong>Entire Agreement:</strong> This lease constitutes the entire agreement between the parties and supersedes all prior negotiations.</p>
              <p><strong>Severability:</strong> If any provision is found unenforceable, the remainder of the lease shall remain in full effect.</p>
              <p><strong>Binding Effect:</strong> This lease is binding upon heirs, successors, and assigns of both parties.</p>
              <p><strong>Electronic Signatures:</strong> Both parties acknowledge that electronic signatures are legally binding and enforceable.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Section */}
      {showSignatures && (
        <div className="border-t-2 border-gray-300 pt-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">DIGITAL SIGNATURES</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Landlord Signature */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg text-blue-900">LANDLORD SIGNATURE</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {contract.landlord_signature ? (
                  <div>
                    <div className="border-2 border-green-500 bg-green-50 p-4 rounded-lg mb-3">
                      <img 
                        src={contract.landlord_signature.signature_data} 
                        alt="Landlord Signature" 
                        className="max-h-20 w-auto mx-auto"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-green-600 font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Signed on {formatDate(contract.landlord_signature.signed_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        IP: {contract.landlord_signature.ip_address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    {isPreview ? 'Signature will appear here' : 'Awaiting landlord signature'}
                  </div>
                )}
                <div className="mt-4 text-sm border-t pt-3">
                  <p><strong>Name:</strong> {contract.landlord_name}</p>
                  <p><strong>Title:</strong> Landlord/Property Owner</p>
                  <p><strong>Date:</strong> {contract.landlord_signature ? formatDate(contract.landlord_signature.signed_at) : '_____________'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Signature */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-lg text-green-900">TENANT SIGNATURE</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {contract.tenant_signature ? (
                  <div>
                    <div className="border-2 border-green-500 bg-green-50 p-4 rounded-lg mb-3">
                      <img 
                        src={contract.tenant_signature.signature_data} 
                        alt="Tenant Signature" 
                        className="max-h-20 w-auto mx-auto"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-green-600 font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Signed on {formatDate(contract.tenant_signature.signed_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        IP: {contract.tenant_signature.ip_address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    {isPreview ? 'Signature will appear here' : 'Awaiting tenant signature'}
                  </div>
                )}
                <div className="mt-4 text-sm border-t pt-3">
                  <p><strong>Name:</strong> {contract.tenant_name}</p>
                  <p><strong>Title:</strong> Tenant</p>
                  <p><strong>Date:</strong> {contract.tenant_signature ? formatDate(contract.tenant_signature.signed_at) : '_____________'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Status Summary */}
          <div className="mt-8 text-center">
            <Card className="inline-block">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(contract.status)} text-base px-4 py-2`}>
                    {getStatusIcon(contract.status)}
                    <span className="ml-2">{contract.status.replace(/_/g, ' ').toUpperCase()}</span>
                  </Badge>
                  {contract.status === 'fully_signed' && (
                    <div className="text-sm text-green-600">
                      <p className="font-medium">✓ Contract Fully Executed</p>
                      <p>Both parties have signed this agreement</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer */}
      <Separator className="my-8" />
      <div className="text-center text-xs text-gray-500 pb-4">
        <p className="mb-2">
          This lease agreement was generated and signed electronically through the RoomieAI Platform.
        </p>
        <p>
          Both parties acknowledge that electronic signatures are legally binding and enforceable under applicable law.
        </p>
        <p className="mt-2 font-mono text-gray-400">
          Contract Template Version: {contract.contract_template_version} | Generated: {formatDate(contract.created_at)}
        </p>
      </div>
    </div>
  );
}
