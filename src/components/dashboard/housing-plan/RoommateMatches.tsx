
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type RoommateMatch = {
  id: string;
  name: string;
  occupation: string;
  compatibilityScore: number;
  movingDate: string;
  budget: [number, number];
  location: string;
};

type RoommateMatchesProps = {
  matches: RoommateMatch[];
};

export function RoommateMatches({ matches }: RoommateMatchesProps) {
  const navigate = useNavigate();

  if (matches.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Potential Roommates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.slice(0, 3).map((match) => (
            <Card key={match.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{match.name}</h3>
                  <p className="text-sm text-muted-foreground">{match.occupation}</p>
                </div>
                <span className="bg-roomie-purple text-white px-2 py-1 rounded-full text-xs">
                  {Math.round(match.compatibilityScore)}% Match
                </span>
              </div>
              <div className="mt-2 text-sm">
                <p>Moving: {new Date(match.movingDate).toLocaleDateString()}</p>
                <p>Budget: ${match.budget[0]} - ${match.budget[1]}</p>
                <p>{match.location}</p>
              </div>
            </Card>
          ))}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/dashboard/roommate-recommendations')}
          >
            View All Matches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
