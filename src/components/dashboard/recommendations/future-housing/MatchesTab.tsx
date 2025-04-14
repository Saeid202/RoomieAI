
import React from "react";
import { AlertCircle } from "lucide-react";
import { MatchCard, MatchCardProps } from "./MatchCard";

export function MatchesTab() {
  // Mock match data that could later be passed as props
  const matches: Omit<MatchCardProps, 'onSkip' | 'onView'>[] = [
    {
      id: "match-1",
      type: "roommate",
      title: "Sarah, 22 - University Student",
      description: "Looking for a roommate in Toronto for Fall 2025 semester at University of Toronto. Budget range $900-$1600, clean and quiet.",
      matchScore: 92,
      tags: ["Early Bird", "University Student", "Similar Timeline", "Compatible Lifestyle"]
    },
    {
      id: "match-2",
      type: "property",
      title: "Campus View Apartment",
      description: "2-bedroom apartment available for September 2025, 10-minute walk to University of Toronto. $1,800/month, utilities included, pre-leasing available.",
      matchScore: 87,
      tags: ["Pre-leasing Available", "Close to University", "Within Budget", "Utilities Included"]
    }
  ];

  const handleSkip = (id: string) => {
    console.log(`Skipped match with ID: ${id}`);
    // Logic to skip match would go here
  };

  const handleView = (id: string, type: 'roommate' | 'property') => {
    console.log(`Viewing ${type} with ID: ${id}`);
    // Logic to view match details would go here
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">2 Matches Found</h4>
            <p className="text-sm text-green-700">
              We've found potential matches for your Toronto housing plan starting September 2025.
            </p>
          </div>
        </div>
      </div>
      
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          {...match}
          onSkip={() => handleSkip(match.id)}
          onView={() => handleView(match.id, match.type)}
        />
      ))}
    </div>
  );
}
