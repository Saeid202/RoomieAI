
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlanRecommendation } from "./types";

interface RecommendationCardProps {
  recommendation: PlanRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-500">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-lg">{recommendation.title}</h4>
              <Badge
                className={recommendation.type === 'roommate' ? 'bg-purple-500' : 
                          recommendation.type === 'property' ? 'bg-green-500' : 'bg-orange-500'}
              >
                {recommendation.type}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{recommendation.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Match Confidence
            </div>
            <div className="text-xl font-bold text-blue-600">
              {Math.round(recommendation.confidence * 100)}%
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {recommendation.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="bg-blue-50">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm">Dismiss</Button>
          <Button variant="default" size="sm">
            {recommendation.type === 'roommate' ? 'View Profile' : 
             recommendation.type === 'property' ? 'View Property' : 'Explore Option'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
