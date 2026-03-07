// Personal Info Section Component
// Part of Co-Ownership Profile feature

import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AGE_RANGE_LABELS } from '@/types/coOwnershipProfile';
import type { CoOwnershipProfileFormData, AgeRange } from '@/types/coOwnershipProfile';

interface PersonalInfoSectionProps {
  formData: CoOwnershipProfileFormData;
  onChange: (field: keyof CoOwnershipProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export function PersonalInfoSection({
  formData,
  onChange,
  errors = {},
}: PersonalInfoSectionProps) {
  const charCount = formData.why_co_ownership?.length || 0;
  const maxChars = 500;
  const isNearLimit = charCount > 400;

  return (
    <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-indigo-600" />
        About You
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Age Range */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                1
              </span>
              <Label htmlFor="age_range" className="text-sm font-semibold">
                Age Range
              </Label>
            </div>
            <Select
              value={formData.age_range}
              onValueChange={(value) => onChange('age_range', value as AgeRange)}
            >
              <SelectTrigger id="age_range" className="h-9 border-2 border-slate-300">
                <SelectValue placeholder="Select your age range" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGE_RANGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.age_range && (
              <p className="text-xs text-red-600">{errors.age_range}</p>
            )}
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                2
              </span>
              <Label htmlFor="occupation" className="text-sm font-semibold">
                Occupation
              </Label>
            </div>
            <Input
              id="occupation"
              className="h-9 border-2 border-slate-300"
              placeholder="e.g., Software Engineer"
              value={formData.occupation}
              onChange={(e) => onChange('occupation', e.target.value)}
              maxLength={100}
            />
            {errors.occupation && (
              <p className="text-xs text-red-600">{errors.occupation}</p>
            )}
          </div>
        </div>

        {/* Why Co-Ownership */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              3
            </span>
            <Label htmlFor="why_co_ownership" className="text-sm font-semibold">
              Why are you interested in co-ownership? (Optional)
            </Label>
          </div>
          <Textarea
            id="why_co_ownership"
            className="min-h-[100px] border-2 border-slate-300 resize-none"
            placeholder="Share your motivations, goals, or what you're looking for in a co-buyer partner..."
            value={formData.why_co_ownership}
            onChange={(e) => onChange('why_co_ownership', e.target.value)}
            maxLength={maxChars}
          />
          <div className="flex justify-between items-center">
            <div>
              {errors.why_co_ownership && (
                <p className="text-xs text-red-600">{errors.why_co_ownership}</p>
              )}
            </div>
            <p className={`text-xs ${isNearLimit ? 'text-orange-600 font-semibold' : 'text-slate-500'}`}>
              {charCount} / {maxChars} characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
