import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OntarioLeaseContract } from '@/types/ontarioLease';
import { Download, PenTool, CheckCircle, Calendar, MapPin, User, DollarSign } from 'lucide-react';

interface OntarioLeaseDisplayProps {
  contract: OntarioLeaseContract;
  onSign: () => void;
  onDownload: () => void;
  isSigned?: boolean;
}

export function OntarioLeaseDisplay({ contract, onSign, onDownload, isSigned = false }: OntarioLeaseDisplayProps) {
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">Residential Tenancy Agreement</h1>
        <p className="text-sm text-gray-600 mb-2">2229E (2020/12) © Queen's Printer for Ontario, 2020</p>
        <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
          <span>Contract ID: {contract.id}</span>
          <span>Created: {formatDate(contract.created_at)}</span>
          {contract.status === 'draft' && <Badge variant="secondary">DRAFT</Badge>}
        </div>
      </div>

      {/* Legal Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-900 mb-2">Important Legal Information:</p>
        <ul className="text-blue-800 space-y-1">
          <li>• This tenancy agreement is required for tenancies entered into on March 1, 2021 or later.</li>
          <li>• Residential tenancies in Ontario are governed by the Residential Tenancies Act, 2006.</li>
          <li>• This agreement cannot take away a right or responsibility under the Act.</li>
          <li>• All sections of this agreement are mandatory and cannot be changed.</li>
        </ul>
      </div>

      {/* Section 1: Parties to the Agreement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            <span>Parties to the Agreement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Landlord(s)</h3>
              <p className="text-sm"><strong>Landlord's Legal Name:</strong> {contract.landlord_name}</p>
            </div>
            <div className="border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Tenant(s)</h3>
              <p className="text-sm"><strong>Last Name:</strong> {contract.tenant_name.split(' ').slice(-1)[0]}</p>
              <p className="text-sm"><strong>First Name:</strong> {contract.tenant_name.split(' ').slice(0, -1).join(' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Rental Unit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
            <span>Rental Unit</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">The landlord will rent to the tenant the rental unit at:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm"><strong>Unit:</strong> {contract.unit_number || 'N/A'}</p>
              <p className="text-sm"><strong>Street Number:</strong> {contract.property_address.split(' ')[0]}</p>
              <p className="text-sm"><strong>Street Name:</strong> {contract.property_address.split(' ').slice(1).join(' ')}</p>
            </div>
            <div>
              <p className="text-sm"><strong>City/Town:</strong> {contract.property_city}</p>
              <p className="text-sm"><strong>Province:</strong> {contract.property_state}</p>
              <p className="text-sm"><strong>Postal Code:</strong> {contract.property_zip}</p>
            </div>
          </div>
          {contract.parking_spaces && (
            <p className="text-sm mt-2"><strong>Number of vehicle parking spaces:</strong> {contract.parking_spaces}</p>
          )}
          <p className="text-sm mt-2">
            <strong>The rental unit is a unit in a condominium:</strong> {contract.is_condominium ? 'Yes' : 'No'}
          </p>
        </CardContent>
      </Card>

      {/* Section 3: Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-2">Address for Giving Notices or Documents to the Landlord</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm"><strong>Unit:</strong> {contract.landlord_notice_unit || 'N/A'}</p>
              <p className="text-sm"><strong>Street Number:</strong> {contract.landlord_notice_street_number}</p>
              <p className="text-sm"><strong>Street Name:</strong> {contract.landlord_notice_street_name}</p>
              <p className="text-sm"><strong>PO Box:</strong> {contract.landlord_notice_po_box || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm"><strong>City/Town:</strong> {contract.landlord_notice_city_town}</p>
              <p className="text-sm"><strong>Province:</strong> {contract.landlord_notice_province}</p>
              <p className="text-sm"><strong>Postal Code:</strong> {contract.landlord_notice_postal_code}</p>
            </div>
          </div>
          
          <p className="text-sm mb-2">
            <strong>Both the landlord and tenant agree to receive notices and documents by email:</strong> {contract.email_consent ? 'Yes' : 'No'}
          </p>
          {contract.email_consent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-sm"><strong>Landlord Email:</strong> {contract.landlord_email}</p>
              <p className="text-sm"><strong>Tenant Email:</strong> {contract.tenant_email}</p>
            </div>
          )}
          
          <p className="text-sm mt-4 mb-2">
            <strong>The landlord is providing phone and/or email contact information for emergencies:</strong> {contract.emergency_contact_provided ? 'Yes' : 'No'}
          </p>
          {contract.emergency_contact_provided && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-sm"><strong>Phone:</strong> {contract.emergency_phone}</p>
              <p className="text-sm"><strong>Email:</strong> {contract.emergency_email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Term of Tenancy Agreement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
            <span>Term of Tenancy Agreement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4"><strong>This tenancy starts on:</strong> {formatDate(contract.lease_start_date)}</p>
          <p className="text-sm mb-2"><strong>This tenancy agreement is for:</strong></p>
          <div className="ml-4">
            {contract.tenancy_type === 'fixed' && (
              <p className="text-sm">☑ A fixed length of time ending on: {formatDate(contract.lease_end_date)}</p>
            )}
            {contract.tenancy_type === 'monthly' && (
              <p className="text-sm">☑ A monthly tenancy</p>
            )}
            {contract.tenancy_type === 'other' && (
              <p className="text-sm">☑ Other: {contract.other_tenancy_type}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Rent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
            <span>Rent</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm"><strong>a) Rent is to be paid on the</strong> {contract.rent_payment_day} day of each: {contract.rent_payment_period === 'monthly' ? 'Month' : contract.other_rent_payment_period}</p>
            
            <div>
              <p className="text-sm mb-2"><strong>b) The tenant will pay the following rent:</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                <div>
                  <p className="text-sm">Base rent for the rental unit: <strong>${contract.base_rent.toFixed(2)}</strong></p>
                  {contract.parking_rent > 0 && (
                    <p className="text-sm">Parking (if applicable): <strong>${contract.parking_rent.toFixed(2)}</strong></p>
                  )}
                  {contract.other_services_rent > 0 && (
                    <p className="text-sm">{contract.other_services_description}: <strong>${contract.other_services_rent.toFixed(2)}</strong></p>
                  )}
                  <p className="text-sm font-semibold border-t pt-2">Total Rent (Lawful Rent): <strong>${contract.total_rent.toFixed(2)}</strong></p>
                </div>
              </div>
            </div>
            
            <p className="text-sm"><strong>c) Rent is payable to:</strong> {contract.rent_payable_to}</p>
            <p className="text-sm"><strong>d) Rent will be paid using the following methods:</strong> {contract.rent_payment_methods}</p>
            
            {contract.partial_rent_amount > 0 && (
              <div>
                <p className="text-sm"><strong>e) If the first rental period is a partial period:</strong></p>
                <p className="text-sm ml-4">The tenant will pay a partial rent of <strong>${contract.partial_rent_amount.toFixed(2)}</strong> on {formatDate(contract.partial_rent_date)}</p>
                <p className="text-sm ml-4">This partial rent covers the rental of the unit from {formatDate(contract.partial_rent_start_date)} to {formatDate(contract.partial_rent_end_date)}</p>
              </div>
            )}
            
            <p className="text-sm"><strong>f) If the tenant's cheque is returned because of non-sufficient funds (NSF):</strong></p>
            <p className="text-sm ml-4">The tenant will have to pay the landlord's administration charge of <strong>${contract.nsf_charge.toFixed(2)}</strong> plus any NSF charges made by the landlord's bank.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!isSigned && (
          <Button onClick={onSign} className="flex items-center space-x-2">
            <PenTool className="h-4 w-4" />
            <span>Sign Contract</span>
          </Button>
        )}
        {isSigned && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Contract Signed</span>
          </div>
        )}
        <Button onClick={onDownload} variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p>Note: This is a digital representation of the official Ontario Residential Tenancy Agreement Form 2229E</p>
        <p>All sections of this agreement are mandatory and cannot be changed under the Residential Tenancies Act, 2006</p>
      </div>
    </div>
  );
}
