import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OntarioLeaseFormData } from '@/types/ontarioLease';
import { Calendar, Building, User, DollarSign, FileText, ArrowLeft, ArrowRight, Plus } from 'lucide-react';

interface OntarioLeaseFormProps {
  initialData: Partial<OntarioLeaseFormData>;
  onSubmit: (data: OntarioLeaseFormData) => void;
  onCancel: () => void;
}

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'basement', label: 'Basement Apartment' },
  { value: 'other', label: 'Other' }
];

const utilityOptions = [
  'Heat',
  'Water',
  'Electricity',
  'Internet',
  'Cable TV',
  'Parking',
  'Laundry',
  'Garbage Collection'
];

const petPolicyOptions = [
  { value: 'allowed', label: 'Pets Allowed' },
  { value: 'not_allowed', label: 'No Pets' },
  { value: 'conditional', label: 'Conditional (with restrictions)' }
];

const smokingPolicyOptions = [
  { value: 'not_allowed', label: 'No Smoking' },
  { value: 'allowed', label: 'Smoking Allowed' },
  { value: 'designated_areas', label: 'Designated Areas Only' }
];

export function OntarioLeaseForm({ initialData, onSubmit, onCancel }: OntarioLeaseFormProps) {
  const [formData, setFormData] = useState<OntarioLeaseFormData>({
    // Section 1: Parties to the Agreement
    landlordLegalName: initialData.landlordLegalName || '',
    tenantLastName: initialData.tenantLastName || '',
    tenantFirstName: initialData.tenantFirstName || '',
    
    // Section 2: Rental Unit
    unitNumber: initialData.unitNumber || '',
    streetNumber: initialData.streetNumber || '',
    streetName: initialData.streetName || '',
    cityTown: initialData.cityTown || '',
    province: initialData.province || 'Ontario',
    postalCode: initialData.postalCode || '',
    parkingSpaces: initialData.parkingSpaces || undefined,
    parkingDescription: initialData.parkingDescription || '',
    isCondominium: initialData.isCondominium || false,
    
    // Section 3: Contact Information
    landlordNoticeUnit: initialData.landlordNoticeUnit || '',
    landlordNoticeStreetNumber: initialData.landlordNoticeStreetNumber || '',
    landlordNoticeStreetName: initialData.landlordNoticeStreetName || '',
    landlordNoticePOBox: initialData.landlordNoticePOBox || '',
    landlordNoticeCityTown: initialData.landlordNoticeCityTown || '',
    landlordNoticeProvince: initialData.landlordNoticeProvince || 'Ontario',
    landlordNoticePostalCode: initialData.landlordNoticePostalCode || '',
    emailConsent: initialData.emailConsent || false,
    landlordEmail: initialData.landlordEmail || '',
    tenantEmail: initialData.tenantEmail || '',
    emergencyContactProvided: initialData.emergencyContactProvided || false,
    emergencyPhone: initialData.emergencyPhone || '',
    emergencyEmail: initialData.emergencyEmail || '',
    
    // Section 4: Term of Tenancy Agreement
    tenancyStartDate: initialData.tenancyStartDate || new Date(),
    tenancyType: initialData.tenancyType || 'fixed',
    tenancyEndDate: initialData.tenancyEndDate || undefined,
    otherTenancyType: initialData.otherTenancyType || '',
    
    // Section 5: Rent
    rentPaymentDay: initialData.rentPaymentDay || 'first',
    rentPaymentPeriod: initialData.rentPaymentPeriod || 'monthly',
    otherRentPaymentPeriod: initialData.otherRentPaymentPeriod || '',
    baseRent: initialData.baseRent || 0,
    parkingRent: initialData.parkingRent || 0,
    otherServicesRent: initialData.otherServicesRent || 0,
    otherServicesDescription: initialData.otherServicesDescription || '',
    totalRent: initialData.totalRent || 0,
    rentPayableTo: initialData.rentPayableTo || '',
    rentPaymentMethods: initialData.rentPaymentMethods || '',
    partialRentAmount: initialData.partialRentAmount || 0,
    partialRentDate: initialData.partialRentDate || undefined,
    partialRentStartDate: initialData.partialRentStartDate || undefined,
    partialRentEndDate: initialData.partialRentEndDate || undefined,
    nsfCharge: initialData.nsfCharge || 20,
    
    // Section 6: Services and Utilities
    gasIncluded: initialData.gasIncluded || false,
    airConditioningIncluded: initialData.airConditioningIncluded || false,
    additionalStorageIncluded: initialData.additionalStorageIncluded || false,
    onSiteLaundry: initialData.onSiteLaundry || 'not_included',
    guestParking: initialData.guestParking || 'not_included',
    otherServices1: initialData.otherServices1 || '',
    otherServices1Included: initialData.otherServices1Included || false,
    otherServices2: initialData.otherServices2 || '',
    otherServices2Included: initialData.otherServices2Included || false,
    otherServices3: initialData.otherServices3 || '',
    otherServices3Included: initialData.otherServices3Included || false,
    servicesDetails: initialData.servicesDetails || '',
    electricityResponsibility: initialData.electricityResponsibility || 'tenant',
    heatResponsibility: initialData.heatResponsibility || 'landlord',
    waterResponsibility: initialData.waterResponsibility || 'landlord',
    utilitiesDetails: initialData.utilitiesDetails || '',
    
    // Section 7: Rent Discounts
    rentDiscount: initialData.rentDiscount || false,
    rentDiscountDetails: initialData.rentDiscountDetails || '',
    
    // Section 8: Rent Deposit
    rentDepositRequired: initialData.rentDepositRequired || false,
    rentDepositAmount: initialData.rentDepositAmount || 0,
    
    // Section 9: Key Deposit
    keyDepositRequired: initialData.keyDepositRequired || false,
    keyDepositAmount: initialData.keyDepositAmount || 0,
    keyDepositDescription: initialData.keyDepositDescription || '',
    
    // Section 10: Smoking
    smokingRules: initialData.smokingRules || '',
    
    // Section 11: Tenant's Insurance
    tenantInsuranceRequired: initialData.tenantInsuranceRequired || false,
    
    // Section 15: Additional Terms
    additionalTerms: initialData.additionalTerms || false,
    additionalTermsDetails: initialData.additionalTermsDetails || '',
    
    // Legal
    electronicSignatureConsent: initialData.electronicSignatureConsent || false,
    termsAcceptance: initialData.termsAcceptance || false,
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sections = [
    { id: 0, title: 'Section 1: Parties to the Agreement', icon: User },
    { id: 1, title: 'Section 2: Rental Unit', icon: Building },
    { id: 2, title: 'Section 3: Contact Information', icon: FileText },
    { id: 3, title: 'Section 4: Term of Tenancy', icon: Calendar },
    { id: 4, title: 'Section 5: Rent', icon: DollarSign },
    { id: 5, title: 'Section 6: Services & Utilities', icon: FileText },
    { id: 6, title: 'Section 7-11: Deposits & Policies', icon: FileText },
    { id: 7, title: 'Section 15: Additional Terms', icon: FileText },
    { id: 8, title: 'Review & Submit', icon: Calendar },
  ];

  const handleInputChange = (field: keyof OntarioLeaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUtilityToggle = (utility: string, included: boolean) => {
    if (included) {
      setFormData(prev => ({
        ...prev,
        utilitiesIncluded: [...prev.utilitiesIncluded, utility],
        utilitiesNotIncluded: prev.utilitiesNotIncluded.filter(u => u !== utility)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        utilitiesIncluded: prev.utilitiesIncluded.filter(u => u !== utility),
        utilitiesNotIncluded: [...prev.utilitiesNotIncluded, utility]
      }));
    }
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Landlord Information
        if (!formData.landlordName.trim()) newErrors.landlordName = 'Landlord name is required';
        if (!formData.landlordEmail.trim()) newErrors.landlordEmail = 'Landlord email is required';
        if (!formData.landlordAddress.trim()) newErrors.landlordAddress = 'Landlord address is required';
        if (!formData.landlordCity.trim()) newErrors.landlordCity = 'Landlord city is required';
        if (!formData.landlordPostalCode.trim()) newErrors.landlordPostalCode = 'Postal code is required';
        break;
      case 1: // Tenant Information
        if (!formData.tenantName.trim()) newErrors.tenantName = 'Tenant name is required';
        if (!formData.tenantEmail.trim()) newErrors.tenantEmail = 'Tenant email is required';
        if (!formData.tenantPhone.trim()) newErrors.tenantPhone = 'Tenant phone is required';
        if (!formData.tenantAddress.trim()) newErrors.tenantAddress = 'Tenant address is required';
        if (!formData.tenantCity.trim()) newErrors.tenantCity = 'Tenant city is required';
        if (!formData.tenantPostalCode.trim()) newErrors.tenantPostalCode = 'Postal code is required';
        break;
      case 2: // Property Details
        if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
        if (!formData.propertyCity.trim()) newErrors.propertyCity = 'Property city is required';
        if (formData.numberOfBedrooms <= 0) newErrors.numberOfBedrooms = 'Number of bedrooms must be greater than 0';
        if (formData.numberOfBathrooms <= 0) newErrors.numberOfBathrooms = 'Number of bathrooms must be greater than 0';
        break;
      case 3: // Lease Terms
        if (formData.monthlyRent <= 0) newErrors.monthlyRent = 'Monthly rent must be greater than 0';
        if (formData.securityDeposit < 0) newErrors.securityDeposit = 'Security deposit cannot be negative';
        if (formData.lastMonthRentDeposit < 0) newErrors.lastMonthRentDeposit = 'Last month rent deposit cannot be negative';
        if (formData.keyDeposit < 0) newErrors.keyDeposit = 'Key deposit cannot be negative';
        if (formData.leaseEndDate <= formData.leaseStartDate) newErrors.leaseEndDate = 'Lease end date must be after start date';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    // Validate all sections
    let isValid = true;
    for (let i = 0; i < sections.length - 1; i++) {
      if (!validateSection(i)) {
        isValid = false;
      }
    }

    if (!formData.electronicSignatureConsent) {
      setErrors(prev => ({ ...prev, electronicSignatureConsent: 'Electronic signature consent is required' }));
      isValid = false;
    }

    if (!formData.termsAcceptance) {
      setErrors(prev => ({ ...prev, termsAcceptance: 'Terms acceptance is required' }));
      isValid = false;
    }

    if (isValid) {
      onSubmit(formData);
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // Landlord Information
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Landlord Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="landlordName">Landlord Name *</Label>
                <Input
                  id="landlordName"
                  value={formData.landlordName}
                  onChange={(e) => handleInputChange('landlordName', e.target.value)}
                  placeholder="Enter landlord name"
                />
                {errors.landlordName && <p className="text-sm text-red-500">{errors.landlordName}</p>}
              </div>
              <div>
                <Label htmlFor="landlordEmail">Email Address *</Label>
                <Input
                  id="landlordEmail"
                  type="email"
                  value={formData.landlordEmail}
                  onChange={(e) => handleInputChange('landlordEmail', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.landlordEmail && <p className="text-sm text-red-500">{errors.landlordEmail}</p>}
              </div>
              <div>
                <Label htmlFor="landlordAddress">Address *</Label>
                <Input
                  id="landlordAddress"
                  value={formData.landlordAddress}
                  onChange={(e) => handleInputChange('landlordAddress', e.target.value)}
                  placeholder="Enter address"
                />
                {errors.landlordAddress && <p className="text-sm text-red-500">{errors.landlordAddress}</p>}
              </div>
              <div>
                <Label htmlFor="landlordCity">City *</Label>
                <Input
                  id="landlordCity"
                  value={formData.landlordCity}
                  onChange={(e) => handleInputChange('landlordCity', e.target.value)}
                  placeholder="Enter city"
                />
                {errors.landlordCity && <p className="text-sm text-red-500">{errors.landlordCity}</p>}
              </div>
              <div>
                <Label htmlFor="landlordProvince">Province *</Label>
                <Select value={formData.landlordProvince} onValueChange={(value) => handleInputChange('landlordProvince', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON">Ontario</SelectItem>
                    <SelectItem value="BC">British Columbia</SelectItem>
                    <SelectItem value="AB">Alberta</SelectItem>
                    <SelectItem value="QC">Quebec</SelectItem>
                    <SelectItem value="MB">Manitoba</SelectItem>
                    <SelectItem value="SK">Saskatchewan</SelectItem>
                    <SelectItem value="NS">Nova Scotia</SelectItem>
                    <SelectItem value="NB">New Brunswick</SelectItem>
                    <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                    <SelectItem value="PE">Prince Edward Island</SelectItem>
                    <SelectItem value="NT">Northwest Territories</SelectItem>
                    <SelectItem value="YT">Yukon</SelectItem>
                    <SelectItem value="NU">Nunavut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="landlordPostalCode">Postal Code *</Label>
                <Input
                  id="landlordPostalCode"
                  value={formData.landlordPostalCode}
                  onChange={(e) => handleInputChange('landlordPostalCode', e.target.value)}
                  placeholder="Enter postal code"
                />
                {errors.landlordPostalCode && <p className="text-sm text-red-500">{errors.landlordPostalCode}</p>}
              </div>
            </div>
          </div>
        );

      case 1: // Tenant Information
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Tenant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tenantName">Tenant Name *</Label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  placeholder="Enter tenant name"
                />
                {errors.tenantName && <p className="text-sm text-red-500">{errors.tenantName}</p>}
              </div>
              <div>
                <Label htmlFor="tenantEmail">Email Address *</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.tenantEmail && <p className="text-sm text-red-500">{errors.tenantEmail}</p>}
              </div>
              <div>
                <Label htmlFor="tenantPhone">Phone Number *</Label>
                <Input
                  id="tenantPhone"
                  type="tel"
                  value={formData.tenantPhone}
                  onChange={(e) => handleInputChange('tenantPhone', e.target.value)}
                  placeholder="Enter phone number"
                />
                {errors.tenantPhone && <p className="text-sm text-red-500">{errors.tenantPhone}</p>}
              </div>
              <div>
                <Label htmlFor="tenantAddress">Current Address *</Label>
                <Input
                  id="tenantAddress"
                  value={formData.tenantAddress}
                  onChange={(e) => handleInputChange('tenantAddress', e.target.value)}
                  placeholder="Enter current address"
                />
                {errors.tenantAddress && <p className="text-sm text-red-500">{errors.tenantAddress}</p>}
              </div>
              <div>
                <Label htmlFor="tenantCity">City *</Label>
                <Input
                  id="tenantCity"
                  value={formData.tenantCity}
                  onChange={(e) => handleInputChange('tenantCity', e.target.value)}
                  placeholder="Enter city"
                />
                {errors.tenantCity && <p className="text-sm text-red-500">{errors.tenantCity}</p>}
              </div>
              <div>
                <Label htmlFor="tenantProvince">Province *</Label>
                <Select value={formData.tenantProvince} onValueChange={(value) => handleInputChange('tenantProvince', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON">Ontario</SelectItem>
                    <SelectItem value="BC">British Columbia</SelectItem>
                    <SelectItem value="AB">Alberta</SelectItem>
                    <SelectItem value="QC">Quebec</SelectItem>
                    <SelectItem value="MB">Manitoba</SelectItem>
                    <SelectItem value="SK">Saskatchewan</SelectItem>
                    <SelectItem value="NS">Nova Scotia</SelectItem>
                    <SelectItem value="NB">New Brunswick</SelectItem>
                    <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                    <SelectItem value="PE">Prince Edward Island</SelectItem>
                    <SelectItem value="NT">Northwest Territories</SelectItem>
                    <SelectItem value="YT">Yukon</SelectItem>
                    <SelectItem value="NU">Nunavut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tenantPostalCode">Postal Code *</Label>
                <Input
                  id="tenantPostalCode"
                  value={formData.tenantPostalCode}
                  onChange={(e) => handleInputChange('tenantPostalCode', e.target.value)}
                  placeholder="Enter postal code"
                />
                {errors.tenantPostalCode && <p className="text-sm text-red-500">{errors.tenantPostalCode}</p>}
              </div>
            </div>
          </div>
        );

      case 2: // Property Details
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="propertyAddress">Property Address *</Label>
                <Input
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                  placeholder="Enter property address"
                />
                {errors.propertyAddress && <p className="text-sm text-red-500">{errors.propertyAddress}</p>}
              </div>
              <div>
                <Label htmlFor="propertyCity">City *</Label>
                <Input
                  id="propertyCity"
                  value={formData.propertyCity}
                  onChange={(e) => handleInputChange('propertyCity', e.target.value)}
                  placeholder="Enter city"
                />
                {errors.propertyCity && <p className="text-sm text-red-500">{errors.propertyCity}</p>}
              </div>
              <div>
                <Label htmlFor="propertyProvince">Province *</Label>
                <Select value={formData.propertyProvince} onValueChange={(value) => handleInputChange('propertyProvince', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON">Ontario</SelectItem>
                    <SelectItem value="BC">British Columbia</SelectItem>
                    <SelectItem value="AB">Alberta</SelectItem>
                    <SelectItem value="QC">Quebec</SelectItem>
                    <SelectItem value="MB">Manitoba</SelectItem>
                    <SelectItem value="SK">Saskatchewan</SelectItem>
                    <SelectItem value="NS">Nova Scotia</SelectItem>
                    <SelectItem value="NB">New Brunswick</SelectItem>
                    <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                    <SelectItem value="PE">Prince Edward Island</SelectItem>
                    <SelectItem value="NT">Northwest Territories</SelectItem>
                    <SelectItem value="YT">Yukon</SelectItem>
                    <SelectItem value="NU">Nunavut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="propertyPostalCode">Postal Code *</Label>
                <Input
                  id="propertyPostalCode"
                  value={formData.propertyPostalCode}
                  onChange={(e) => handleInputChange('propertyPostalCode', e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
              <div>
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.propertyType === 'other' && (
                <div>
                  <Label htmlFor="propertyTypeOther">Property Type Details</Label>
                  <Input
                    id="propertyTypeOther"
                    value={formData.propertyTypeOther}
                    onChange={(e) => handleInputChange('propertyTypeOther', e.target.value)}
                    placeholder="Describe property type"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="numberOfBedrooms">Number of Bedrooms *</Label>
                <Input
                  id="numberOfBedrooms"
                  type="number"
                  min="0"
                  value={formData.numberOfBedrooms}
                  onChange={(e) => handleInputChange('numberOfBedrooms', parseInt(e.target.value) || 0)}
                />
                {errors.numberOfBedrooms && <p className="text-sm text-red-500">{errors.numberOfBedrooms}</p>}
              </div>
              <div>
                <Label htmlFor="numberOfBathrooms">Number of Bathrooms *</Label>
                <Input
                  id="numberOfBathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.numberOfBathrooms}
                  onChange={(e) => handleInputChange('numberOfBathrooms', parseFloat(e.target.value) || 0)}
                />
                {errors.numberOfBathrooms && <p className="text-sm text-red-500">{errors.numberOfBathrooms}</p>}
              </div>
              <div>
                <Label htmlFor="squareFootage">Square Footage</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  min="0"
                  value={formData.squareFootage || ''}
                  onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value) || undefined)}
                  placeholder="Enter square footage"
                />
              </div>
              <div>
                <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                <Input
                  id="parkingSpaces"
                  type="number"
                  min="0"
                  value={formData.parkingSpaces || ''}
                  onChange={(e) => handleInputChange('parkingSpaces', parseInt(e.target.value) || undefined)}
                  placeholder="Number of parking spaces"
                />
              </div>
            </div>
          </div>
        );

      case 3: // Lease Terms
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Lease Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent *</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value) || 0)}
                  placeholder="Enter monthly rent"
                />
                {errors.monthlyRent && <p className="text-sm text-red-500">{errors.monthlyRent}</p>}
              </div>
              <div>
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange('securityDeposit', parseFloat(e.target.value) || 0)}
                  placeholder="Enter security deposit"
                />
                {errors.securityDeposit && <p className="text-sm text-red-500">{errors.securityDeposit}</p>}
              </div>
              <div>
                <Label htmlFor="lastMonthRentDeposit">Last Month Rent Deposit</Label>
                <Input
                  id="lastMonthRentDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.lastMonthRentDeposit}
                  onChange={(e) => handleInputChange('lastMonthRentDeposit', parseFloat(e.target.value) || 0)}
                  placeholder="Enter last month rent deposit"
                />
                {errors.lastMonthRentDeposit && <p className="text-sm text-red-500">{errors.lastMonthRentDeposit}</p>}
              </div>
              <div>
                <Label htmlFor="keyDeposit">Key Deposit</Label>
                <Input
                  id="keyDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.keyDeposit}
                  onChange={(e) => handleInputChange('keyDeposit', parseFloat(e.target.value) || 0)}
                  placeholder="Enter key deposit"
                />
                {errors.keyDeposit && <p className="text-sm text-red-500">{errors.keyDeposit}</p>}
              </div>
              <div>
                <Label htmlFor="leaseStartDate">Lease Start Date *</Label>
                <Input
                  id="leaseStartDate"
                  type="date"
                  value={formData.leaseStartDate.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('leaseStartDate', new Date(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="leaseEndDate">Lease End Date *</Label>
                <Input
                  id="leaseEndDate"
                  type="date"
                  value={formData.leaseEndDate.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('leaseEndDate', new Date(e.target.value))}
                />
                {errors.leaseEndDate && <p className="text-sm text-red-500">{errors.leaseEndDate}</p>}
              </div>
            </div>
          </div>
        );

      case 4: // Policies & Conditions
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policies & Conditions
            </h3>
            
            {/* Utilities */}
            <div>
              <Label className="text-base font-medium">Utilities & Services</Label>
              <p className="text-sm text-muted-foreground mb-3">Select which utilities are included in the rent:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {utilityOptions.map((utility) => (
                  <div key={utility} className="flex items-center space-x-2">
                    <Checkbox
                      id={`utility-${utility}`}
                      checked={formData.utilitiesIncluded.includes(utility)}
                      onCheckedChange={(checked) => handleUtilityToggle(utility, checked as boolean)}
                    />
                    <Label htmlFor={`utility-${utility}`} className="text-sm">{utility}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pet Policy */}
            <div>
              <Label htmlFor="petPolicy">Pet Policy</Label>
              <Select value={formData.petPolicy} onValueChange={(value) => handleInputChange('petPolicy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {petPolicyOptions.map((policy) => (
                    <SelectItem key={policy.value} value={policy.value}>
                      {policy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.petPolicy === 'conditional' && (
                <div className="mt-2">
                  <Label htmlFor="petPolicyDetails">Pet Policy Details</Label>
                  <Textarea
                    id="petPolicyDetails"
                    value={formData.petPolicyDetails}
                    onChange={(e) => handleInputChange('petPolicyDetails', e.target.value)}
                    placeholder="Describe pet restrictions and conditions"
                  />
                </div>
              )}
            </div>

            {/* Smoking Policy */}
            <div>
              <Label htmlFor="smokingPolicy">Smoking Policy</Label>
              <Select value={formData.smokingPolicy} onValueChange={(value) => handleInputChange('smokingPolicy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {smokingPolicyOptions.map((policy) => (
                    <SelectItem key={policy.value} value={policy.value}>
                      {policy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.smokingPolicy !== 'not_allowed' && (
                <div className="mt-2">
                  <Label htmlFor="smokingPolicyDetails">Smoking Policy Details</Label>
                  <Textarea
                    id="smokingPolicyDetails"
                    value={formData.smokingPolicyDetails}
                    onChange={(e) => handleInputChange('smokingPolicyDetails', e.target.value)}
                    placeholder="Describe smoking policy details"
                  />
                </div>
              )}
            </div>

            {/* Additional Fields */}
            <div>
              <Label htmlFor="specialConditions">Special Conditions</Label>
              <Textarea
                id="specialConditions"
                value={formData.specialConditions}
                onChange={(e) => handleInputChange('specialConditions', e.target.value)}
                placeholder="Any special conditions or additional terms"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="maintenanceContact">Maintenance Contact</Label>
              <Input
                id="maintenanceContact"
                value={formData.maintenanceContact}
                onChange={(e) => handleInputChange('maintenanceContact', e.target.value)}
                placeholder="Contact information for maintenance requests"
              />
            </div>

            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Emergency contact information"
              />
            </div>
          </div>
        );

      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Review & Submit
            </h3>
            
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">Lease Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Property:</strong> {formData.propertyAddress}, {formData.propertyCity}</p>
                  <p><strong>Type:</strong> {formData.propertyType} - {formData.numberOfBedrooms} bed, {formData.numberOfBathrooms} bath</p>
                  <p><strong>Monthly Rent:</strong> ${formData.monthlyRent.toLocaleString()}</p>
                </div>
                <div>
                  <p><strong>Security Deposit:</strong> ${formData.securityDeposit.toLocaleString()}</p>
                  <p><strong>Lease Period:</strong> {formData.leaseStartDate.toLocaleDateString()} - {formData.leaseEndDate.toLocaleDateString()}</p>
                  <p><strong>Utilities Included:</strong> {formData.utilitiesIncluded.join(', ') || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Legal Consents */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="electronicSignatureConsent"
                  checked={formData.electronicSignatureConsent}
                  onCheckedChange={(checked) => handleInputChange('electronicSignatureConsent', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="electronicSignatureConsent" className="text-sm font-medium">
                    Electronic Signature Consent *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I consent to the use of electronic signatures for this lease agreement. Electronic signatures have the same legal effect as handwritten signatures.
                  </p>
                  {errors.electronicSignatureConsent && <p className="text-sm text-red-500">{errors.electronicSignatureConsent}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAcceptance"
                  checked={formData.termsAcceptance}
                  onCheckedChange={(checked) => handleInputChange('termsAcceptance', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="termsAcceptance" className="text-sm font-medium">
                    Terms Acceptance *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I have read and agree to all terms and conditions in this lease agreement, including compliance with the Ontario Residential Tenancies Act, 2006.
                  </p>
                  {errors.termsAcceptance && <p className="text-sm text-red-500">{errors.termsAcceptance}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentSection + 1} of {sections.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {(() => {
            const IconComponent = sections[currentSection].icon;
            return <IconComponent className="h-6 w-6" />;
          })()}
          {sections[currentSection].title}
        </h2>
        <p className="text-muted-foreground mt-1">
          {currentSection === 0 && "Enter the landlord's contact information"}
          {currentSection === 1 && "Enter the tenant's contact information"}
          {currentSection === 2 && "Provide details about the rental property"}
          {currentSection === 3 && "Set the financial terms and lease duration"}
          {currentSection === 4 && "Configure policies and special conditions"}
          {currentSection === 5 && "Review all information and provide consent"}
        </p>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {renderSectionContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevSection}
          disabled={currentSection === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentSection === sections.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Generate Lease Contract
            </Button>
          ) : (
            <Button onClick={nextSection}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
