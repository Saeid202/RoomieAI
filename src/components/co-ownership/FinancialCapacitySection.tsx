// Financial Capacity Section Component
// Part of Co-Ownership Profile feature

import { DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CREDIT_SCORE_LABELS } from '@/types/coOwnershipProfile';
import type { CoOwnershipProfileFormData, CreditScoreRange } from '@/types/coOwnershipProfile';

interface FinancialCapacitySectionProps {
  formData: CoOwnershipProfileFormData;
  onChange: (field: keyof CoOwnershipProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export function FinancialCapacitySection({
  formData,
  onChange,
  errors = {},
}: FinancialCapacitySectionProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-orange-600" />
        Financial Capacity
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Min */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              1
            </span>
            <Label htmlFor="budget_min" className="text-sm font-semibold">
              Minimum Budget
            </Label>
          </div>
          <Input
            id="budget_min"
            type="number"
            className="h-9 border-2 border-slate-300"
            placeholder="e.g., 300000"
            value={formData.budget_min}
            onChange={(e) => onChange('budget_min', e.target.value)}
          />
          {errors.budget_min && (
            <p className="text-xs text-red-600">{errors.budget_min}</p>
          )}
        </div>

        {/* Budget Max */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              2
            </span>
            <Label htmlFor="budget_max" className="text-sm font-semibold">
              Maximum Budget
            </Label>
          </div>
          <Input
            id="budget_max"
            type="number"
            className="h-9 border-2 border-slate-300"
            placeholder="e.g., 500000"
            value={formData.budget_max}
            onChange={(e) => onChange('budget_max', e.target.value)}
          />
          {errors.budget_max && (
            <p className="text-xs text-red-600">{errors.budget_max}</p>
          )}
        </div>

        {/* Down Payment */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              3
            </span>
            <Label htmlFor="down_payment" className="text-sm font-semibold">
              Down Payment Available
            </Label>
          </div>
          <Input
            id="down_payment"
            type="number"
            className="h-9 border-2 border-slate-300"
            placeholder="e.g., 50000"
            value={formData.down_payment}
            onChange={(e) => onChange('down_payment', e.target.value)}
          />
          {errors.down_payment && (
            <p className="text-xs text-red-600">{errors.down_payment}</p>
          )}
        </div>

        {/* Annual Income */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              4
            </span>
            <Label htmlFor="annual_income" className="text-sm font-semibold">
              Annual Income
            </Label>
          </div>
          <Input
            id="annual_income"
            type="number"
            className="h-9 border-2 border-slate-300"
            placeholder="e.g., 70000"
            value={formData.annual_income}
            onChange={(e) => onChange('annual_income', e.target.value)}
          />
          {errors.annual_income && (
            <p className="text-xs text-red-600">{errors.annual_income}</p>
          )}
        </div>

        {/* Credit Score Range */}
        <div className="space-y-1.5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              5
            </span>
            <Label htmlFor="credit_score_range" className="text-sm font-semibold">
              Credit Score Range
            </Label>
          </div>
          <Select
            value={formData.credit_score_range}
            onValueChange={(value) => onChange('credit_score_range', value as CreditScoreRange)}
          >
            <SelectTrigger id="credit_score_range" className="h-9 border-2 border-slate-300">
              <SelectValue placeholder="Select your credit score range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CREDIT_SCORE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.credit_score_range && (
            <p className="text-xs text-red-600">{errors.credit_score_range}</p>
          )}
        </div>
      </div>
    </div>
  );
}
