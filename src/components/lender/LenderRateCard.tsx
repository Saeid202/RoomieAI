import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LenderRate, LOAN_TYPE_LABELS } from "@/types/lender";
import { Percent, DollarSign, Calendar, Edit2, Trash2 } from "lucide-react";

interface LenderRateCardProps {
  rate: LenderRate;
  onEdit?: (rate: LenderRate) => void;
  onDelete?: (rateId: string) => void;
  showActions?: boolean;
}

export function LenderRateCard({ rate, onEdit, onDelete, showActions = true }: LenderRateCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
        rate.is_active
          ? 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30'
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {LOAN_TYPE_LABELS[rate.loan_type as keyof typeof LOAN_TYPE_LABELS] || rate.loan_type}
            </span>
            <p className="text-sm text-gray-500">{rate.term_years} year term</p>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            rate.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {rate.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{rate.interest_rate}%</span>
            <span className="text-sm text-gray-500">interest rate</span>
          </div>

          {rate.apr && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              APR: {rate.apr}%
            </p>
          )}

          {rate.points > 0 && (
            <p className="text-sm text-gray-500">
              Points: {rate.points}%
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Min: ${rate.min_loan_amount?.toLocaleString() || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Max: ${rate.max_loan_amount?.toLocaleString() || 'N/A'}
            </span>
          </div>

          {rate.min_credit_score > 0 && (
            <p className="text-sm text-gray-500">
              Min Credit Score: {rate.min_credit_score}
            </p>
          )}

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-3 w-3" />
            Effective: {rate.effective_date ? new Date(rate.effective_date).toLocaleDateString() : 'N/A'}
          </div>

          {rate.expiration_date && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              Expires: {new Date(rate.expiration_date).toLocaleDateString()}
            </div>
          )}

          {rate.notes && (
            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {rate.notes}
            </p>
          )}
        </div>

        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(rate)}
                className="flex-1 border-emerald-300 hover:bg-emerald-50"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(rate.id)}
                className="flex-1 border-red-300 hover:bg-red-50 text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LenderRateCardCompactProps {
  rate: LenderRate;
  onClick?: () => void;
}

export function LenderRateCardCompact({ rate, onClick }: LenderRateCardCompactProps) {
  return (
    <Card
      className={`relative overflow-hidden border transition-all duration-300 hover:shadow-md cursor-pointer ${
        rate.is_active
          ? 'border-emerald-200 bg-white hover:border-emerald-400'
          : 'border-gray-200 bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {LOAN_TYPE_LABELS[rate.loan_type as keyof typeof LOAN_TYPE_LABELS]?.substring(0, 10) || rate.loan_type}
            </span>
            <p className="text-lg font-black text-gray-900">{rate.interest_rate}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{rate.term_years}yr</p>
            {rate.apr && (
              <p className="text-xs text-gray-600">APR {rate.apr}%</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}