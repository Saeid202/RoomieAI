
import React from "react";
import { Zap } from "lucide-react";
import { RecommendationCard } from "./RecommendationCard";
import { PlanRecommendation } from "./types";

interface RecommendationsTabProps {
  recommendations: PlanRecommendation[];
}

export function RecommendationsTab({ recommendations }: RecommendationsTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-start space-x-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">AI-Powered Recommendations</h4>
            <p className="text-sm text-blue-700">
              Based on your housing plans and preferences, we've generated personalized recommendations
              to help you find the perfect match.
            </p>
          </div>
        </div>
      </div>
      
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}
