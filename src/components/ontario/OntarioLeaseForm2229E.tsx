import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  User, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Send, 
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Home,
  Calendar,
  CreditCard,
  Wrench,
  Shield,
  Users,
  Key,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  Car,
  Wifi,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  Trash2,
  AlertTriangle,
  Info,
  PenTool,
  FileCheck
} from 'lucide-react';
import { OntarioLeaseFormData } from '@/types/ontarioLease';

interface OntarioLeaseForm2229EProps {
  initialData: Partial<OntarioLeaseFormData>;
  onSubmit: (data: OntarioLeaseFormData) => void;
  onCancel: () => void;
}

// CollapsibleSection Component
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ComponentType<any>;
  color: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  icon: Icon,
  color,
  children
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100',
    teal: 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100',
    amber: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
    rose: 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100',
    lime: 'bg-lime-50 border-lime-200 text-lime-800 hover:bg-lime-100',
    violet: 'bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100',
    slate: 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100',
    red: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
    pink: 'bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100',
    green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 text-left border-b border-gray-200 transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const OntarioLeaseForm2229E: React.FC<OntarioLeaseForm2229EProps> = ({
  initialData,
  onSubmit,
  onCancel,
}): JSX.Element => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<OntarioLeaseFormData>({
    tenancyType: 'fixed',
    ...initialData
  } as OntarioLeaseFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Collapsible section states
  const [isSection1Expanded, setIsSection1Expanded] = useState(false);
  const [isSection2Expanded, setIsSection2Expanded] = useState(false);
  const [isSection3Expanded, setIsSection3Expanded] = useState(false);
  const [isSection4Expanded, setIsSection4Expanded] = useState(false);
  const [isSection5Expanded, setIsSection5Expanded] = useState(false);
  const [isSection6Expanded, setIsSection6Expanded] = useState(false);
  const [isSection7Expanded, setIsSection7Expanded] = useState(false);
  const [isSection8Expanded, setIsSection8Expanded] = useState(false);
  const [isSection9Expanded, setIsSection9Expanded] = useState(false);
  const [isSection10Expanded, setIsSection10Expanded] = useState(false);
  const [isSection11Expanded, setIsSection11Expanded] = useState(false);
  const [isSection12Expanded, setIsSection12Expanded] = useState(false);
  const [isSection13Expanded, setIsSection13Expanded] = useState(false);
  const [isSection14Expanded, setIsSection14Expanded] = useState(false);
  const [isSection15Expanded, setIsSection15Expanded] = useState(false);
  const [isSection16Expanded, setIsSection16Expanded] = useState(false);
  const [isSection17Expanded, setIsSection17Expanded] = useState(false);

  const sections = [
    { id: 0, title: 'Complete Lease Agreement', icon: FileText, description: 'Fill out all sections of the Ontario lease agreement' }
  ];

  const handleInputChange = (field: keyof OntarioLeaseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateSection = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation for required fields
    if (!formData.landlordLegalName) {
      newErrors.landlordLegalName = 'Landlord name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateSection()) {
      onSubmit(formData);
      toast.success('Lease agreement completed successfully!');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // Complete Lease Agreement - All Sections 1-17
        return (
          <div className="space-y-8">
            {/* Legal Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">Note:</p>
              <p className="mb-2">This tenancy agreement is required for tenancies entered into on March 1, 2021 or later. It does not apply to care homes, sites in mobile home parks and land lease communities, most social housing, certain other special tenancies or co-operative housing (see Part A of General Information).</p>
              <p className="mb-2">Residential tenancies in Ontario are governed by the Residential Tenancies Act, 2006. This agreement cannot take away a right or responsibility under the Act.</p>
              <p className="mb-2">Under the Ontario Human Rights Code, everyone has the right to equal treatment in housing without discrimination or harassment.</p>
              <p className="font-semibold">All sections of this agreement are mandatory and cannot be changed.</p>
            </div>

            {/* Section 1: Parties to the Agreement - Collapsible */}
            <CollapsibleSection
              title="1. Parties to the Agreement"
              isExpanded={isSection1Expanded}
              onToggle={() => setIsSection1Expanded(!isSection1Expanded)}
              icon={User}
              color="blue"
            >
              <div className="space-y-6">
                <p className="text-lg text-gray-700">Residential Tenancy Agreement between:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Landlord Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-600">Landlord(s):</h4>
                    <div>
                      <Label htmlFor="landlordLegalName">Legal Name *</Label>
                      <Input
                        id="landlordLegalName"
                        value={formData.landlordLegalName || ''}
                        onChange={(e) => handleInputChange('landlordLegalName', e.target.value)}
                        placeholder="Enter landlord legal name"
                      />
                      {errors.landlordLegalName && <p className="text-red-500 text-sm">{errors.landlordLegalName}</p>}
                    </div>
                  </div>

                  {/* Tenant Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-600">Tenant(s):</h4>
                        <div>
                      <Label htmlFor="tenantFirstName">First Name *</Label>
                          <Input
                        id="tenantFirstName"
                        value={formData.tenantFirstName || ''}
                        onChange={(e) => handleInputChange('tenantFirstName', e.target.value)}
                        placeholder="Enter tenant first name"
                      />
                      {errors.tenantFirstName && <p className="text-red-500 text-sm">{errors.tenantFirstName}</p>}
                        </div>
                        <div>
                      <Label htmlFor="tenantLastName">Last Name *</Label>
                          <Input
                        id="tenantLastName"
                        value={formData.tenantLastName || ''}
                        onChange={(e) => handleInputChange('tenantLastName', e.target.value)}
                        placeholder="Enter tenant last name"
                      />
                      {errors.tenantLastName && <p className="text-red-500 text-sm">{errors.tenantLastName}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
            </CollapsibleSection>

            {/* Section 2: Rental Unit - Collapsible */}
            <CollapsibleSection
              title="2. Rental Unit"
              isExpanded={isSection2Expanded}
              onToggle={() => setIsSection2Expanded(!isSection2Expanded)}
              icon={Home}
              color="purple"
            >
              <div className="space-y-6">
                <p className="text-gray-700">The rental unit is located at:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="unitNumber">Unit Number (if applicable)</Label>
                      <Input
                        id="unitNumber"
                      value={formData.unitNumber || ''}
                        onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                      placeholder="e.g., Apt 101"
                      />
                    </div>
                  <div>
                    <Label htmlFor="streetNumber">Street Number *</Label>
                        <Input
                          id="streetNumber"
                      value={formData.streetNumber || ''}
                          onChange={(e) => handleInputChange('streetNumber', e.target.value)}
                      placeholder="e.g., 123"
                        />
                    {errors.streetNumber && <p className="text-red-500 text-sm">{errors.streetNumber}</p>}
                      </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="streetName">Street Name *</Label>
                        <Input
                          id="streetName"
                      value={formData.streetName || ''}
                          onChange={(e) => handleInputChange('streetName', e.target.value)}
                      placeholder="e.g., Main Street"
                        />
                    {errors.streetName && <p className="text-red-500 text-sm">{errors.streetName}</p>}
                      </div>
                  <div>
                    <Label htmlFor="cityTown">City/Town *</Label>
                        <Input
                          id="cityTown"
                      value={formData.cityTown || ''}
                          onChange={(e) => handleInputChange('cityTown', e.target.value)}
                      placeholder="e.g., Toronto"
                        />
                    {errors.cityTown && <p className="text-red-500 text-sm">{errors.cityTown}</p>}
                      </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="province">Province *</Label>
                          <Input
                            id="province"
                      value="Ontario"
                      disabled
                      className="bg-gray-100"
                    />
                        </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                      value={formData.postalCode || ''}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="e.g., M5V 3A8"
                      />
                    {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
                    </div>
                  </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isCondominium"
                      checked={formData.isCondominium || false}
                      onCheckedChange={(checked) => handleInputChange('isCondominium', checked)}
                    />
                    <Label htmlFor="isCondominium">This rental unit is in a condominium</Label>
                </div>
              </div>
              </div>
            </CollapsibleSection>

            {/* Section 3: Contact Information - Collapsible */}
            <CollapsibleSection
              title="3. Contact Information"
              isExpanded={isSection3Expanded}
              onToggle={() => setIsSection3Expanded(!isSection3Expanded)}
              icon={Phone}
              color="orange"
            >
              <div className="space-y-6">
                <p className="text-gray-700">Contact information for giving notices and other documents:</p>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-orange-600">Landlord Contact Information</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="landlordNoticeUnit">Unit (if applicable)</Label>
                        <Input
                          id="landlordNoticeUnit"
                        value={formData.landlordNoticeUnit || ''}
                          onChange={(e) => handleInputChange('landlordNoticeUnit', e.target.value)}
                        placeholder="e.g., Suite 200"
                        />
                      </div>
                    <div>
                      <Label htmlFor="landlordNoticeStreetNumber">Street Number *</Label>
                        <Input
                          id="landlordNoticeStreetNumber"
                        value={formData.landlordNoticeStreetNumber || ''}
                          onChange={(e) => handleInputChange('landlordNoticeStreetNumber', e.target.value)}
                        placeholder="e.g., 456"
                        />
                      {errors.landlordNoticeStreetNumber && <p className="text-red-500 text-sm">{errors.landlordNoticeStreetNumber}</p>}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="landlordNoticeStreetName">Street Name *</Label>
                      <Input
                        id="landlordNoticeStreetName"
                        value={formData.landlordNoticeStreetName || ''}
                        onChange={(e) => handleInputChange('landlordNoticeStreetName', e.target.value)}
                        placeholder="e.g., Business Ave"
                      />
                      {errors.landlordNoticeStreetName && <p className="text-red-500 text-sm">{errors.landlordNoticeStreetName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="landlordNoticePOBox">PO Box (if applicable)</Label>
                        <Input
                          id="landlordNoticePOBox"
                        value={formData.landlordNoticePOBox || ''}
                          onChange={(e) => handleInputChange('landlordNoticePOBox', e.target.value)}
                        placeholder="e.g., PO Box 123"
                        />
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="landlordNoticeCityTown">City/Town *</Label>
                        <Input
                          id="landlordNoticeCityTown"
                        value={formData.landlordNoticeCityTown || ''}
                          onChange={(e) => handleInputChange('landlordNoticeCityTown', e.target.value)}
                        placeholder="e.g., Toronto"
                        />
                      {errors.landlordNoticeCityTown && <p className="text-red-500 text-sm">{errors.landlordNoticeCityTown}</p>}
                      </div>
                    <div>
                      <Label htmlFor="landlordNoticeProvince">Province *</Label>
                        <Input
                          id="landlordNoticeProvince"
                        value={formData.landlordNoticeProvince || ''}
                          onChange={(e) => handleInputChange('landlordNoticeProvince', e.target.value)}
                        placeholder="e.g., Ontario"
                        />
                      {errors.landlordNoticeProvince && <p className="text-red-500 text-sm">{errors.landlordNoticeProvince}</p>}
                      </div>
                    <div>
                      <Label htmlFor="landlordNoticePostalCode">Postal Code *</Label>
                        <Input
                          id="landlordNoticePostalCode"
                        value={formData.landlordNoticePostalCode || ''}
                          onChange={(e) => handleInputChange('landlordNoticePostalCode', e.target.value)}
                        placeholder="e.g., M5V 3A8"
                        />
                      {errors.landlordNoticePostalCode && <p className="text-red-500 text-sm">{errors.landlordNoticePostalCode}</p>}
                      </div>
                    </div>
                  </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-orange-600">Email Consent</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailConsent"
                      checked={formData.emailConsent || false}
                      onCheckedChange={(checked) => handleInputChange('emailConsent', checked)}
                    />
                    <Label htmlFor="emailConsent">The landlord and tenant agree to communicate by email</Label>
                </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="landlordEmail">Landlord Email</Label>
                      <Input
                        id="landlordEmail"
                        type="email"
                        value={formData.landlordEmail || ''}
                        onChange={(e) => handleInputChange('landlordEmail', e.target.value)}
                        placeholder="landlord@example.com"
                      />
              </div>
                    <div>
                      <Label htmlFor="tenantEmail">Tenant Email</Label>
                      <Input
                        id="tenantEmail"
                        type="email"
                        value={formData.tenantEmail || ''}
                        onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                        placeholder="tenant@example.com"
                      />
            </div>
          </div>
            </div>
              </div>
            </CollapsibleSection>

            {/* Section 4: Term of Tenancy - Collapsible */}
            <CollapsibleSection
              title="4. Term of Tenancy"
              isExpanded={isSection4Expanded}
              onToggle={() => setIsSection4Expanded(!isSection4Expanded)}
              icon={Calendar}
              color="indigo"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tenancyStartDate">Start Date *</Label>
                    <Input
                      id="tenancyStartDate"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tenancyType">Type of Tenancy *</Label>
                    <Select value={formData.tenancyType} onValueChange={(value) => handleInputChange('tenancyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenancy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Term</SelectItem>
                        <SelectItem value="periodic">Periodic</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>
                </div>
                
                      {formData.tenancyType === 'fixed' && (
                  <div>
                    <Label htmlFor="tenancyEndDate">End Date *</Label>
                          <Input
                      id="tenancyEndDate"
                            type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
                  </div>
                )}
                
                {formData.tenancyType === 'periodic' && (
                  <div>
                    <Label htmlFor="periodicType">Periodic Type *</Label>
                    <Select value={formData.periodicType || ''} onValueChange={(value) => handleInputChange('periodicType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select periodic type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                        </div>
                      )}
                
                {formData.tenancyType === 'other' && (
                  <div>
                    <Label htmlFor="otherTenancyType">Other Tenancy Type *</Label>
                    <Input
                      id="otherTenancyType"
                      value={formData.otherTenancyType || ''}
                      onChange={(e) => handleInputChange('otherTenancyType', e.target.value)}
                      placeholder="Describe the tenancy type"
                    />
                    {errors.otherTenancyType && <p className="text-red-500 text-sm">{errors.otherTenancyType}</p>}
                      </div>
                )}
                    </div>
            </CollapsibleSection>

            {/* Section 5: Rent - Collapsible */}
            <CollapsibleSection
              title="5. Rent"
              isExpanded={isSection5Expanded}
              onToggle={() => setIsSection5Expanded(!isSection5Expanded)}
              icon={DollarSign}
              color="emerald"
            >
              <div className="space-y-6">
                {/* a) Rent Payment Schedule */}
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>a)</strong> Rent is to be paid on the 
                    <Input
                      type="text"
                      value={formData.rentPaymentDay || ''}
                      onChange={(e) => handleInputChange('rentPaymentDay', e.target.value)}
                      placeholder="e.g., first, second, last"
                      className="inline-block w-48 mx-2"
                    />
                    day of each (select one):
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="rentPaymentPeriod" value="monthly" className="text-emerald-600" />
                      <Label>Month</Label>
                  </div>
                    
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="rentPaymentPeriod" value="other" className="text-emerald-600" />
                      <Label>Other (e.g., weekly)</Label>
                      {formData.rentPaymentPeriod === 'other' && (
                        <Input
                          type="text"
                          value={formData.otherRentPaymentPeriod || ''}
                          onChange={(e) => handleInputChange('otherRentPaymentPeriod', e.target.value)}
                          placeholder="e.g., weekly"
                          className="w-32"
                        />
                      )}
                </div>
              </div>
            </div>

                {/* b) Rent Amounts */}
                <div className="space-y-4">
                  <p className="text-gray-700"><strong>b)</strong> The tenant will pay the following rent:</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="baseRent">Base rent for the rental unit</Label>
                    <Input
                      id="baseRent"
                      type="number"
                      step="0.01"
                        value={formData.baseRent || ''}
                      onChange={(e) => handleInputChange('baseRent', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                    
                    <div>
                      <Label htmlFor="parkingRent">Parking (if applicable)</Label>
                      <Input
                        id="parkingRent"
                        type="number"
                        step="0.01"
                        value={formData.parkingRent || ''}
                        onChange={(e) => handleInputChange('parkingRent', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otherServicesRent">Other services and utilities (specify if applicable):</Label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.otherServicesRent || ''}
                          onChange={(e) => handleInputChange('otherServicesRent', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                        <Input
                          type="text"
                          value={formData.otherServicesDescription || ''}
                          onChange={(e) => handleInputChange('otherServicesDescription', e.target.value)}
                          placeholder="Description of other services"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="totalRent">Total Rent (Lawful Rent)</Label>
                    <Input
                      id="totalRent"
                      type="number"
                      step="0.01"
                        value={formData.totalRent || ''}
                      onChange={(e) => handleInputChange('totalRent', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      This is the lawful rent for the unit, subject to any rent increases allowed under the Residential Tenancies Act, 2006. For example, the landlord and tenant may agree to a seasonal rent increase for additional services of air conditioning or a block heater plug-in. This amount does not include any rent discounts (see Section 7 and Part G in General Information).
                    </p>
                  </div>
                </div>

                {/* c) Rent Payable To */}
                <div className="space-y-4">
                  <p className="text-gray-700"><strong>c)</strong> Rent is payable to:</p>
                    <Input
                    type="text"
                    value={formData.rentPayableTo || ''}
                      onChange={(e) => handleInputChange('rentPayableTo', e.target.value)}
                    placeholder="Enter name or entity rent is payable to"
                    />
                  </div>

                {/* d) Payment Methods */}
                <div className="space-y-4">
                  <p className="text-gray-700"><strong>d)</strong> Rent will be paid using the following methods:</p>
                    <Input
                    type="text"
                    value={formData.paymentMethod || ''}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    placeholder="e.g., Cash, Cheque, E-transfer, etc."
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> The tenant cannot be required to pay rent by post-dated cheques or automatic payments, but can choose to do so.
                    </p>
                  </div>
                </div>

                {/* e) Partial Period Rent */}
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>e)</strong> If the first rental period (e.g., month) is a partial period, the tenant will pay a partial rent of $
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.partialRentAmount || ''}
                      onChange={(e) => handleInputChange('partialRentAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="inline-block w-24 mx-2"
                    />
                    on
                    <Input
                      type="text"
                      value={String(formData.partialRentDate || '')}
                      onChange={(e) => handleInputChange('partialRentDate', e.target.value)}
                      placeholder="date"
                      className="inline-block w-32 mx-2"
                    />
                    . This partial rent covers the rental of the unit from
                    <Input
                      type="text"
                      value={String(formData.partialRentStartDate || '')}
                      onChange={(e) => handleInputChange('partialRentStartDate', e.target.value)}
                      placeholder="start date"
                      className="inline-block w-32 mx-2"
                    />
                    to
                    <Input
                      type="text"
                      value={String(formData.partialRentEndDate || '')}
                      onChange={(e) => handleInputChange('partialRentEndDate', e.target.value)}
                      placeholder="end date"
                      className="inline-block w-32 mx-2"
                    />
                    .
                  </p>
              </div>

                {/* f) NSF Charges */}
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>f)</strong> If the tenant's cheque is returned because of non-sufficient funds (NSF), the tenant will have to pay the landlord's administration charge of $
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.nsfAdministrationCharge || ''}
                      onChange={(e) => handleInputChange('nsfAdministrationCharge', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="inline-block w-24 mx-2"
                    />
                    plus any NSF charges made by the landlord's bank.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> The landlord's administration charge for an NSF cheque cannot be more than $20.00
                    </p>
            </div>
          </div>
              </div>
            </CollapsibleSection>

            {/* Section 6: Services and Utilities - Collapsible */}
            <CollapsibleSection
              title="6. Services and Utilities"
              isExpanded={isSection6Expanded}
              onToggle={() => setIsSection6Expanded(!isSection6Expanded)}
              icon={Wifi}
              color="teal"
            >
              <div className="space-y-6">
                <p className="text-gray-700">The following services are included in the lawful rent for the rental unit, as specified:</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Gas</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="gas" value="yes" className="text-teal-600" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="gas" value="no" className="text-teal-600" />
                          <span>No</span>
                        </label>
            </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Air conditioning</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="airConditioning" value="yes" className="text-teal-600" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="airConditioning" value="no" className="text-teal-600" />
                          <span>No</span>
                        </label>
                        </div>
                        </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Additional storage space</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="additionalStorage" value="yes" className="text-teal-600" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="additionalStorage" value="no" className="text-teal-600" />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">On-Site Laundry</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="laundry" value="no-charge" className="text-teal-600" />
                          <span>No Charge</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="laundry" value="pay-per-use" className="text-teal-600" />
                          <span>Pay Per use</span>
                        </label>
                  </div>
                </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Guest Parking</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="guestParking" value="no-charge" className="text-teal-600" />
                          <span>No Charge</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="guestParking" value="pay-per-use" className="text-teal-600" />
                          <span>Pay Per use</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Other</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="other1" value="yes" className="text-teal-600" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="other1" value="no" className="text-teal-600" />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Other</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="other2" value="yes" className="text-teal-600" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="other2" value="no" className="text-teal-600" />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label className="flex-1">Other</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="other3" value="yes" className="text-teal-600" />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="other3" value="no" className="text-teal-600" />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-700">The following utilities are the responsibility of:</p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Label className="flex-1">Electricity</Label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="electricity" value="landlord" className="text-teal-600" />
                            <span>Landlord</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="electricity" value="tenant" className="text-teal-600" />
                            <span>Tenant</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Label className="flex-1">Heat</Label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="heat" value="landlord" className="text-teal-600" />
                            <span>Landlord</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="heat" value="tenant" className="text-teal-600" />
                            <span>Tenant</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Label className="flex-1">Water</Label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="water" value="landlord" className="text-teal-600" />
                            <span>Landlord</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="radio" name="water" value="tenant" className="text-teal-600" />
                            <span>Tenant</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="servicesDetails">Provide details about services or list any additional services if needed (if necessary add additional pages):</Label>
                  <Textarea
                    id="servicesDetails"
                    value={formData.servicesDetails || ''}
                    onChange={(e) => handleInputChange('servicesDetails', e.target.value)}
                    placeholder="Enter service details..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="utilitiesDetails">If the tenant is responsible for any utilities, provide details of the arrangement, e.g. tenant sets up account with and pays the utility provider, tenant pays a portion of the utility costs (if necessary add additional pages):</Label>
                  <Textarea
                    id="utilitiesDetails"
                    value={formData.utilitiesDetails || ''}
                    onChange={(e) => handleInputChange('utilitiesDetails', e.target.value)}
                    placeholder="Enter utility arrangement details..."
                    rows={3}
                  />
              </div>
            </div>
            </CollapsibleSection>

            {/* Section 7: Rent Discounts - Collapsible */}
            <CollapsibleSection
              title="7. Rent Discounts"
              isExpanded={isSection7Expanded}
              onToggle={() => setIsSection7Expanded(!isSection7Expanded)}
              icon={DollarSign}
              color="amber"
            >
              <div className="space-y-6">
                <p className="text-gray-700">Select one:</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="rentDiscount" value="none" className="text-amber-600" />
                    <Label>There is no rent discount.</Label>
            </div>
                  
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="rentDiscount" value="discounted" className="text-amber-600" />
                    <Label>The lawful rent will be discounted as follows:</Label>
                  </div>
                </div>
                
                  <div className="space-y-4">
                  <Label htmlFor="rentDiscountDetails">Discount Details:</Label>
                  <Textarea
                    id="rentDiscountDetails"
                    value={formData.rentDiscountDetails || ''}
                    onChange={(e) => handleInputChange('rentDiscountDetails', e.target.value)}
                    placeholder="Describe the rent discount..."
                    rows={3}
                  />
                    </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> See Part G in General Information for what types of discounts are allowed.
                  </p>
                    </div>
              </div>
            </CollapsibleSection>

            {/* Section 8: Rent Deposit - Collapsible */}
            <CollapsibleSection
              title="8. Rent Deposit"
              isExpanded={isSection8Expanded}
              onToggle={() => setIsSection8Expanded(!isSection8Expanded)}
              icon={CreditCard}
              color="rose"
            >
              <div className="space-y-6">
                <p className="text-gray-700">Select one:</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="rentDeposit" value="not-required" className="text-rose-600" />
                    <Label>A rent deposit is not required.</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="rentDeposit" value="required" className="text-rose-600" />
                      <Label>The tenant will pay a rent deposit of $</Label>
                    </div>
                    <div className="ml-8">
                        <Input
                          type="number"
                          step="0.01"
                        value={formData.rentDepositAmount || ''}
                          onChange={(e) => handleInputChange('rentDepositAmount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        className="w-32"
                        />
                      <p className="text-sm text-gray-600 mt-1">This can only be applied to the rent for the last rental period of the tenancy.</p>
                      </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This amount cannot be more than one month's rent or the rent for one rental period (e.g., one week in a weekly tenancy), whichever is less. This cannot be used as a damage deposit. The landlord must pay the tenant interest on the rent deposit every year. See Part H in General Information.
                  </p>
              </div>
            </div>
            </CollapsibleSection>

            {/* Section 9: Key Deposit - Collapsible */}
            <CollapsibleSection
              title="9. Key Deposit"
              isExpanded={isSection9Expanded}
              onToggle={() => setIsSection9Expanded(!isSection9Expanded)}
              icon={Key}
              color="cyan"
            >
              <div className="space-y-6">
                <p className="text-gray-700">Select one:</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="keyDeposit" value="not-required" className="text-cyan-600" />
                    <Label>A key deposit is not required.</Label>
          </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="keyDeposit" value="required" className="text-cyan-600" />
                      <Label>The tenant will pay a refundable key deposit of $</Label>
            </div>
                    <div className="ml-8">
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.keyDepositAmount || ''}
                        onChange={(e) => handleInputChange('keyDepositAmount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-32"
                      />
                      <p className="text-sm text-gray-600 mt-1">to cover the cost of replacing the keys, remote entry devices or cards if they are not returned to the landlord at the end of the tenancy.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="keyDepositDescription">If a refundable key deposit is required, provide description and number of keys, access cards and remote entry devices:</Label>
                  <Textarea
                    id="keyDepositDescription"
                    value={formData.keyDepositDescription || ''}
                    onChange={(e) => handleInputChange('keyDepositDescription', e.target.value)}
                    placeholder="e.g., 2 keys, 1 access card, 1 remote entry device"
                    rows={3}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The key deposit cannot be more than the expected replacement cost. See Part H in General Information.
                </p>
              </div>
            </div>
            </CollapsibleSection>

            {/* Section 10: Smoking - Collapsible */}
            <CollapsibleSection
              title="10. Smoking"
              isExpanded={isSection10Expanded}
              onToggle={() => setIsSection10Expanded(!isSection10Expanded)}
              icon={Trash2}
              color="lime"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  Under provincial law, smoking is not allowed in any indoor common areas of the building. The tenant agrees to these additional rules on smoking:
                </p>
                
                <p className="text-gray-700">Select one:</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="smokingRules" value="none" className="text-lime-600" />
                    <Label>None</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="smokingRules" value="rules" className="text-lime-600" />
                      <Label>Smoking rules</Label>
                    </div>
                    <div className="ml-8">
                      <Textarea
                        id="smokingRulesDetails"
                        value={formData.smokingRulesDetails || ''}
                        onChange={(e) => handleInputChange('smokingRulesDetails', e.target.value)}
                        placeholder="Describe the smoking rules..."
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> In making and enforcing smoking rules, the landlord must follow the Ontario Human Rights Code. See Parts M and S in General Information.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 11: Tenant's Insurance - Collapsible */}
            <CollapsibleSection
              title="11. Tenant's Insurance"
              isExpanded={isSection11Expanded}
              onToggle={() => setIsSection11Expanded(!isSection11Expanded)}
              icon={Shield}
              color="violet"
            >
              <div className="space-y-6">
                <p className="text-gray-700">Select one:</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="insuranceRequirements" value="none" className="text-violet-600" />
                    <Label>There are no tenant insurance requirements.</Label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <input type="radio" name="insuranceRequirements" value="required" className="text-violet-600" />
                    <Label>The tenant must have liability insurance at all times. If the landlord asks for proof of coverage, the tenant must provide it. It is up to the tenant to get contents insurance if they want it.</Label>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 12: Changes to the Rental Unit - Collapsible */}
            <CollapsibleSection
              title="12. Changes to the Rental Unit"
              isExpanded={isSection12Expanded}
              onToggle={() => setIsSection12Expanded(!isSection12Expanded)}
              icon={Wrench}
              color="slate"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  The tenant may install decorative items, such as pictures or window coverings. This is subject to any reasonable restrictions set out in the additional terms under Section 15.
                </p>
                <p className="text-gray-700">
                  The tenant cannot make other changes to the rental unit without the landlord's permission.
                </p>
              </div>
            </CollapsibleSection>

            {/* Section 13: Maintenance and Repairs - Collapsible */}
            <CollapsibleSection
              title="13. Maintenance and Repairs"
              isExpanded={isSection13Expanded}
              onToggle={() => setIsSection13Expanded(!isSection13Expanded)}
              icon={Wrench}
              color="slate"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  The landlord must keep the rental unit and property in good repair and comply with all health, safety and maintenance standards.
                </p>
                <p className="text-gray-700">
                  The tenant must repair or pay for any undue damage to the rental unit or property caused by the wilful or negligent conduct of the tenant, the tenant's guest or another person who lives in the rental unit.
                </p>
                <p className="text-gray-700">
                  The tenant is responsible for ordinary cleanliness of the rental unit, except for any cleaning the landlord agreed to do.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> See Part J in General Information.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 14: Assignment and Subletting - Collapsible */}
            <CollapsibleSection
              title="14. Assignment and Subletting"
              isExpanded={isSection14Expanded}
              onToggle={() => setIsSection14Expanded(!isSection14Expanded)}
              icon={Users}
              color="red"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  The tenant may assign or sublet the rental unit to another person only with the consent of the landlord. The landlord cannot arbitrarily or unreasonably withhold consent to a sublet or potential assignee.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> There are additional rules if the tenant wants to assign or sublet the rental unit. See Part P in General Information.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 15: Additional Terms - Collapsible */}
            <CollapsibleSection
              title="15. Additional Terms"
              isExpanded={isSection15Expanded}
              onToggle={() => setIsSection15Expanded(!isSection15Expanded)}
              icon={FileText}
              color="yellow"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  Landlords and tenants can agree to additional terms. Examples may include terms that:
                </p>
                
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Require the landlord to make changes to the unit before the tenant moves in, and</li>
                  <li>Provide rules for use of common spaces and/or amenities.</li>
                </ul>
                
                <p className="text-gray-700">
                  These additional terms should be written in plain language and clearly set out what the landlord or tenant must or must not do to comply with the term. If typed, the additional terms should be in a font size that is at least 10 points.
                </p>
                
                <p className="text-gray-700">
                  An additional term cannot take away a right or responsibility under the Residential Tenancies Act, 2006.
                </p>
                
                <p className="text-gray-700">
                  If a term conflicts with the Residential Tenancies Act, 2006 or any other terms set out in this form, the term is void (not valid or legally binding) and it cannot be enforced. Some examples of void and unenforceable terms include those that:
                </p>
                
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Do not allow pets (however, the landlord can require the tenant to comply with condominium rules, which may prohibit certain pets),</li>
                  <li>Do not allow guests, roommates, any additional occupants,</li>
                  <li>Require the tenant to pay deposits, fees or penalties that are not permitted under the Residential Tenancies Act 2006 (e.g., damage or pet deposits, interest on rent arrears), and</li>
                  <li>Require the tenant to pay for all or part of the repairs that are the responsibility of the landlord.</li>
                </ul>
                
                <p className="text-gray-700">
                  See General Information for more details.
                </p>
                
                <p className="text-gray-700">
                  The landlord and tenant may want to get legal advice before agreeing to any additional terms.
                </p>
                
                <div className="space-y-4">
                  <p className="text-gray-700">Select one:</p>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="additionalTerms" value="none" className="text-yellow-600" />
                      <Label>There are no additional terms.</Label>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <input type="radio" name="additionalTerms" value="attachment" className="text-yellow-600" />
                      <Label>This tenancy agreement includes an attachment with additional terms that the landlord and tenant agreed to.</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 16: Changes to this Agreement - Collapsible */}
            <CollapsibleSection
              title="16. Changes to this Agreement"
              isExpanded={isSection16Expanded}
              onToggle={() => setIsSection16Expanded(!isSection16Expanded)}
              icon={PenTool}
              color="pink"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  After this agreement is signed, it can be changed only if the landlord and tenant agree to the changes in writing.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The Residential Tenancies Act, 2006 allows some rent increases and requires some rent reductions without agreement between the landlord and tenant. See Part I in General Information.
                  </p>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-8">
                  <p>2229E (2020/12) Page 7 of 14</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Section 17: Signatures - Collapsible */}
            <CollapsibleSection
              title="17. Signatures"
              isExpanded={isSection17Expanded}
              onToggle={() => setIsSection17Expanded(!isSection17Expanded)}
              icon={PenTool}
              color="green"
            >
              <div className="space-y-6">
                <p className="text-gray-700">
                  By signing this agreement, the landlord(s) and the tenant(s) agree to follow its terms.
                </p>
                <p className="text-gray-700">
                  The landlord(s) or tenant(s) can sign this lease electronically if they both agree. Unless otherwise agreed in the additional terms under Section 15, if there is more than one tenant, each tenant is responsible for all tenant obligations under this agreement, including the full amount of rent.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Landlord Signature */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">Landlord:</h4>
                    
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div>
                        <Label htmlFor="landlord1Name">Name:</Label>
                        <Input
                          id="landlord1Name"
                          value={(formData.landlord1Name as string) || ''}
                          onChange={(e) => handleInputChange('landlord1Name', e.target.value)}
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="landlord1Signature">Signature:</Label>
                        <Input
                          id="landlord1Signature"
                          value={(formData.landlord1Signature as string) || ''}
                          onChange={(e) => handleInputChange('landlord1Signature', e.target.value)}
                          placeholder="Enter signature"
                        />
                      </div>
                      <div>
                        <Label htmlFor="landlord1Date">Date:</Label>
                        <Input
                          id="landlord1Date"
                          type="date"
                          value={(formData.landlord1Date as string) || ''}
                          onChange={(e) => handleInputChange('landlord1Date', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                        <input
                          type="checkbox"
                          id="landlordAgreement"
                          checked={(formData.landlordAgreement as boolean) || false}
                          onChange={(e) => handleInputChange('landlordAgreement', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="landlordAgreement" className="text-sm font-medium text-gray-700">
                          I agree to sign this lease contract
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tenant Signature */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">Tenant:</h4>
                    
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div>
                        <Label htmlFor="tenant1Name">Name:</Label>
                        <Input
                          id="tenant1Name"
                          value={(formData.tenant1Name as string) || ''}
                          onChange={(e) => handleInputChange('tenant1Name', e.target.value)}
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenant1Signature">Signature:</Label>
                        <Input
                          id="tenant1Signature"
                          value={(formData.tenant1Signature as string) || ''}
                          onChange={(e) => handleInputChange('tenant1Signature', e.target.value)}
                          placeholder="Enter signature"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenant1Date">Date:</Label>
                        <Input
                          id="tenant1Date"
                          type="date"
                          value={(formData.tenant1Date as string) || ''}
                          onChange={(e) => handleInputChange('tenant1Date', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                        <input
                          type="checkbox"
                          id="tenantAgreement"
                          checked={(formData.tenantAgreement as boolean) || false}
                          onChange={(e) => handleInputChange('tenantAgreement', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Label htmlFor="tenantAgreement" className="text-sm font-medium text-gray-700">
                          I agree to sign this lease contract
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> All of the landlords and tenants listed on the first page in Section 1 (Parties to the Agreement) must sign here. The landlord must give a copy of this agreement to the tenant within 21 days after the tenant signs it.
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-500">ERROR: Section {currentSection + 1} not found!</p>
            <p className="text-gray-500">Total sections available: {sections.length}</p>
            <p className="text-gray-500">Current section index: {currentSection}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      {/* Progress Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = index === currentSection;
              const isCompleted = index < currentSection;
              
              return (
                <div key={section.id} className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {section.title}
                    </p>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
          {renderSectionContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center flex-col-reverse gap-2 sm:flex-row bg-white border border-gray-200 rounded-lg p-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Button>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleSubmit}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm md:text-base !gap-1 sm:!gap-2 md:!gap-4 !p-1 sm:!p-2 md:!p-4"
          >
            <Send className="w-4 h-4" />
            <span>Complete Lease Agreementt</span>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default OntarioLeaseForm2229E;