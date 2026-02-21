// =====================================================
// Listing Strength Meter Component
// =====================================================
// Purpose: Visual progress bar showing listing quality
//          based on uploaded documents
// =====================================================

import React from "react";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, CheckCircle } from "lucide-react";
import { getListingStrengthInfo } from "@/types/propertyCategories";

interface ListingStrengthMeterProps {
  score: number; // 0-100
  className?: string;
}

export function ListingStrengthMeter({ score, className = "" }: ListingStrengthMeterProps) {
  const info = getListingStrengthInfo(score);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">Listing Strength</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-black ${info.color}`}>{score}%</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${info.bgColor} ${info.color}`}>
            {info.label}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <Progress 
          value={score} 
          className="h-3 bg-slate-200"
          indicatorClassName={
            score >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
            score >= 60 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
            score >= 40 ? "bg-gradient-to-r from-yellow-500 to-amber-600" :
            score >= 20 ? "bg-gradient-to-r from-orange-500 to-red-500" :
            "bg-slate-400"
          }
        />
        {/* Milestone markers */}
        <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-1">
          {[20, 40, 60, 80].map((milestone) => (
            <div
              key={milestone}
              className="w-0.5 h-full bg-white/50"
              style={{ marginLeft: `${milestone}%` }}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="flex items-start gap-2 text-xs text-slate-600">
        {score >= 80 ? (
          <>
            <Award className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-green-700">Excellent!</span> Your listing has comprehensive documentation. 
              Buyers will have high confidence in this property.
            </p>
          </>
        ) : score >= 60 ? (
          <>
            <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-blue-700">Good progress!</span> Add a few more documents to reach excellent status 
              and maximize buyer trust.
            </p>
          </>
        ) : score >= 40 ? (
          <>
            <TrendingUp className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-yellow-700">Fair start.</span> Upload key documents like title deed and tax bill 
              to significantly boost your listing strength.
            </p>
          </>
        ) : score > 0 ? (
          <>
            <TrendingUp className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-orange-700">Basic listing.</span> Add essential documents to build buyer confidence 
              and stand out from other listings.
            </p>
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-slate-600">No documents yet.</span> Upload property documents to boost your listing 
              strength and attract serious buyers.
            </p>
          </>
        )}
      </div>

      {/* Strength Breakdown (Optional - shows what contributes) */}
      {score > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-[10px] text-slate-500 font-medium">
            💡 Tip: Each document type adds to your score. Essential docs like Title Deed (+20%) and Status Certificate (+20%) 
            have the highest impact.
          </p>
        </div>
      )}
    </div>
  );
}
