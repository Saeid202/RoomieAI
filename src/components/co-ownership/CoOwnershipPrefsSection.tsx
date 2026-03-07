// Co-Ownership Preferences Section Component
// Part of Co-Ownership Profile feature

import { Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  OWNERSHIP_SPLIT_LABELS,
  LIVING_ARRANGEMENT_LABELS,
  CO_OWNERSHIP_PURPOSE_LABELS
} from '@/types/coOwnershipProfile';
import type { 
  CoOwnershipProfileFormData, 
  OwnershipSplit,
  LivingArrangement,
  CoOwnershipPurpose
} from '@/types/coOwnershipProfile';

interface CoOwnershipPrefsSectionProps {
  formData: CoOwnershipProfileFormData;
  onChange: (field: keyof CoOwnershipProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export function CoOwnershipPrefsSection({
  formData,
  onChange,
  errors = {},
}: CoOwnershipPrefsSectionProps) {
  const handleLivingArrangementToggle = (arrangement: LivingArrangement) => {
    const current = formData.living_arrangements;
    const updated = current.includes(arrangement)
      ? current.filter(a => a !== arrangement)
      : [...current, arrangement];
    onChange('living_arrangements', updated);
  };

  const handlePurposeToggle = (purpose: CoOwnershipPurpose) => {
    const current = formData.co_ownership_purposes;
    const updated = current.includes(purpose)
      ? current.filter(p => p !== purpose)
      : [...current, purpose];
    onChange('co_ownership_purposes', updated);
  };

  return (
    <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-green-600" />
        Co-Ownership Preferences
      </h3>

      <div className="space-y-4">
        {/* Ownership Split */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              1
            </span>
            <Label htmlFor="ownership_split" className="text-sm font-semibold">
              Preferred Ownership Split
            </Label>
          </div>
          <Select
            value={formData.ownership_split}
            onValueChange={(value) => onChange('ownership_split', value as OwnershipSplit)}
          >
            <SelectTrigger id="ownership_split" className="h-9 border-2 border-slate-300">
              <SelectValue placeholder="Select ownership split" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OWNERSHIP_SPLIT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ownership_split && (
            <p className="text-xs text-red-600">{errors.ownership_split}</p>
          )}
        </div>

        {/* Living Arrangements */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              2
            </span>
            <Label className="text-sm font-semibold">
              Living Arrangements (select all that apply)
            </Label>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 bg-white p-3 rounded-lg border-2 border-slate-300">
            {Object.entries(LIVING_ARRANGEMENT_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`living-${value}`}
                  checked={formData.living_arrangements.includes(value as LivingArrangement)}
                  onCheckedChange={() => handleLivingArrangementToggle(value as LivingArrangement)}
                />
                <label
                  htmlFor={`living-${value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
          {errors.living_arrangements && (
            <p className="text-xs text-red-600">{errors.living_arrangements}</p>
          )}
        </div>

        {/* Co-Ownership Purposes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              3
            </span>
            <Label className="text-sm font-semibold">
              Co-Ownership Purpose (select all that apply)
            </Label>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 bg-white p-3 rounded-lg border-2 border-slate-300">
            {Object.entries(CO_OWNERSHIP_PURPOSE_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`purpose-${value}`}
                  checked={formData.co_ownership_purposes.includes(value as CoOwnershipPurpose)}
                  onCheckedChange={() => handlePurposeToggle(value as CoOwnershipPurpose)}
                />
                <label
                  htmlFor={`purpose-${value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
          {errors.co_ownership_purposes && (
            <p className="text-xs text-red-600">{errors.co_ownership_purposes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
