/**
 * Landlord Contact Information Card Component
 * Displays and manages landlord contact information in the profile
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { LandlordContactInfo } from '@/types/landlord';

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
  const inputClass = "h-11 text-gray-900 bg-white border-gray-200 focus:border-violet-500 focus:ring-violet-500";
  const labelClass = "text-sm font-semibold text-gray-900";

  return (
    <div className="space-y-4">

      {/* Row 1: Unit · Street Number · Street Name */}
      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="contactUnit" className={labelClass}>Unit</Label>
          <Input
            id="contactUnit"
            value={data.contactUnit || ''}
            onChange={(e) => onChange('contactUnit', e.target.value)}
            placeholder="Apt 101"
            disabled={isLoading}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactStreetNumber" className={labelClass}>
            Street No. <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactStreetNumber"
            value={data.contactStreetNumber || ''}
            onChange={(e) => onChange('contactStreetNumber', e.target.value)}
            placeholder="123"
            disabled={isLoading}
            className={inputClass}
          />
          {errors.contactStreetNumber && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.contactStreetNumber}
            </p>
          )}
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="contactStreetName" className={labelClass}>
            Street Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactStreetName"
            value={data.contactStreetName || ''}
            onChange={(e) => onChange('contactStreetName', e.target.value)}
            placeholder="e.g., Main Street"
            disabled={isLoading}
            className={inputClass}
          />
          {errors.contactStreetName && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.contactStreetName}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: City · Province · Postal Code · PO Box */}
      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="contactCityTown" className={labelClass}>
            City / Town <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactCityTown"
            value={data.contactCityTown || ''}
            onChange={(e) => onChange('contactCityTown', e.target.value)}
            placeholder="Toronto"
            disabled={isLoading}
            className={inputClass}
          />
          {errors.contactCityTown && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.contactCityTown}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactProvince" className={labelClass}>
            Province <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactProvince"
            value={data.contactProvince || ''}
            onChange={(e) => onChange('contactProvince', e.target.value)}
            placeholder="Ontario"
            disabled={isLoading}
            className={inputClass}
          />
          {errors.contactProvince && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.contactProvince}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactPostalCode" className={labelClass}>
            Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactPostalCode"
            value={data.contactPostalCode || ''}
            onChange={(e) => onChange('contactPostalCode', e.target.value)}
            placeholder="M5V 3A8"
            disabled={isLoading}
            className={inputClass}
          />
          {errors.contactPostalCode && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.contactPostalCode}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactPoBox" className={labelClass}>
            PO Box <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </Label>
          <Input
            id="contactPoBox"
            value={data.contactPoBox || ''}
            onChange={(e) => onChange('contactPoBox', e.target.value)}
            placeholder="PO Box 123"
            disabled={isLoading}
            className={inputClass}
          />
        </div>
      </div>

    </div>
  );
};

export default LandlordContactInfoCard;
