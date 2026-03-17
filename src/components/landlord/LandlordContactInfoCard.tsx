/**
 * Landlord Contact Information Card Component
 * Displays and manages landlord contact information in the profile
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { LandlordContactInfo } from '@/types/landlord';

interface RequiredLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

/**
 * Custom RequiredLabel component for better visibility of required fields
 */
const RequiredLabel: React.FC<RequiredLabelProps> = ({ children, htmlFor, className = '' }) => {
  const text = typeof children === 'string' ? children : '';
  const hasAsterisk = text.includes('*');

  if (!hasAsterisk) {
    return (
      <Label htmlFor={htmlFor} className={className}>
        {children}
      </Label>
    );
  }

  const parts = text.split('*');
  return (
    <Label htmlFor={htmlFor} className={`font-medium ${className}`}>
      {parts[0]}
      <span className="text-red-600 font-bold text-lg">*</span>
      {parts[1]}
    </Label>
  );
};

interface LandlordContactInfoCardProps {
  data: Partial<LandlordContactInfo>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  isLoading?: boolean;
}

export const LandlordContactInfoCard: React.FC<LandlordContactInfoCardProps> = ({
  data,
  errors,
  onChange,
  isLoading = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          This is your official contact address for lease agreements and tenant communications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legal Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This contact information will be used in lease agreements and for official correspondence with tenants.
          </p>
        </div>

        {/* Contact Address Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Mailing Address</h3>

          {/* Unit Number */}
          <div>
            <Label htmlFor="contactUnit">Unit Number (if applicable)</Label>
            <Input
              id="contactUnit"
              value={data.contactUnit || ''}
              onChange={(e) => onChange('contactUnit', e.target.value)}
              placeholder="e.g., Suite 200, Apt 101"
              disabled={isLoading}
            />
          </div>

          {/* Street Number and Street Name - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <RequiredLabel htmlFor="contactStreetNumber">Street Number *</RequiredLabel>
              <Input
                id="contactStreetNumber"
                value={data.contactStreetNumber || ''}
                onChange={(e) => onChange('contactStreetNumber', e.target.value)}
                placeholder="e.g., 123"
                disabled={isLoading}
              />
              {errors.contactStreetNumber && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactStreetNumber}
                </p>
              )}
            </div>

            <div>
              <RequiredLabel htmlFor="contactStreetName">Street Name *</RequiredLabel>
              <Input
                id="contactStreetName"
                value={data.contactStreetName || ''}
                onChange={(e) => onChange('contactStreetName', e.target.value)}
                placeholder="e.g., Main Street"
                disabled={isLoading}
              />
              {errors.contactStreetName && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactStreetName}
                </p>
              )}
            </div>
          </div>

          {/* PO Box */}
          <div>
            <Label htmlFor="contactPoBox">PO Box (if applicable)</Label>
            <Input
              id="contactPoBox"
              value={data.contactPoBox || ''}
              onChange={(e) => onChange('contactPoBox', e.target.value)}
              placeholder="e.g., PO Box 123"
              disabled={isLoading}
            />
          </div>

          {/* City/Town, Province, Postal Code - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <RequiredLabel htmlFor="contactCityTown">City/Town *</RequiredLabel>
              <Input
                id="contactCityTown"
                value={data.contactCityTown || ''}
                onChange={(e) => onChange('contactCityTown', e.target.value)}
                placeholder="e.g., Toronto"
                disabled={isLoading}
              />
              {errors.contactCityTown && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactCityTown}
                </p>
              )}
            </div>

            <div>
              <RequiredLabel htmlFor="contactProvince">Province *</RequiredLabel>
              <Input
                id="contactProvince"
                value={data.contactProvince || ''}
                onChange={(e) => onChange('contactProvince', e.target.value)}
                placeholder="e.g., Ontario"
                disabled={isLoading}
              />
              {errors.contactProvince && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactProvince}
                </p>
              )}
            </div>

            <div>
              <RequiredLabel htmlFor="contactPostalCode">Postal Code *</RequiredLabel>
              <Input
                id="contactPostalCode"
                value={data.contactPostalCode || ''}
                onChange={(e) => onChange('contactPostalCode', e.target.value)}
                placeholder="e.g., M5V 3A8"
                disabled={isLoading}
              />
              {errors.contactPostalCode && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactPostalCode}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LandlordContactInfoCard;
