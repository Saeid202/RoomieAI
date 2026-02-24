// =====================================================
// Co-Buyer Signal Card Component
// =====================================================
// Purpose: Professional card for verified co-buyers
//          Fintech/legal-tech aesthetic with trust signals
// =====================================================

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface CoBuyerSignalCardProps {
  profile: {
    buyerType: string;
    userType: string;
    capitalMin: number;
    capitalMax: number;
    intent: string;
    location: string;
    timeline: string;
    notes: string;
  };
  onViewDetails?: () => void;
  onProposePartnership?: () => void;
}

export function CoBuyerSignalCard({
  profile,
  onViewDetails,
  onProposePartnership,
}: CoBuyerSignalCardProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Co-Buyer Signal
          </h3>
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-5">
        {/* Profile */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
            Profile
          </label>
          <p className="text-sm text-slate-700 font-medium">
            {profile.buyerType} · {profile.userType}
          </p>
        </div>

        {/* Capital Contribution */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
            Capital Contribution
          </label>
          <p className="text-lg font-semibold text-slate-900 tracking-tight">
            ${profile.capitalMin.toLocaleString()} – ${profile.capitalMax.toLocaleString()}
          </p>
        </div>

        {/* Intent */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
            Intent
          </label>
          <p className="text-sm text-slate-700 font-medium">
            {profile.intent}
          </p>
        </div>

        {/* Preferences */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
            Preferences
          </label>
          <p className="text-sm text-slate-700 font-medium">
            {profile.location} · {profile.timeline}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">
            Notes
          </label>
          <p className="text-sm text-slate-600 leading-relaxed">
            {profile.notes}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onViewDetails}
          className="flex-1 border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-medium"
        >
          View Details
        </Button>
        <Button
          onClick={onProposePartnership}
          className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white font-semibold shadow-sm"
        >
          Propose Partnership
        </Button>
      </div>
    </div>
  );
}
