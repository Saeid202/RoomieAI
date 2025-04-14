
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface MatchCardProps {
  id: string;
  type: 'roommate' | 'property';
  title: string;
  description: string;
  matchScore: number;
  tags: string[];
  onSkip?: () => void;
  onView?: () => void;
}

export function MatchCard({ 
  type, 
  title, 
  description, 
  matchScore, 
  tags,
  onSkip,
  onView
}: MatchCardProps) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-green-500">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-lg">{title}</h4>
              <Badge className={type === 'roommate' ? 'bg-purple-500' : 'bg-green-500'}>
                {type === 'roommate' ? 'Roommate' : 'Property'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Match Score
            </div>
            <div className="text-xl font-bold text-green-600">
              {matchScore}%
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-green-50">{tag}</Badge>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={onSkip}>Skip</Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onView}
          >
            {type === 'roommate' ? 'View Profile' : 'View Property'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
