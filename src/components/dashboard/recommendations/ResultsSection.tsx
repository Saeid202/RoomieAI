
import { Card, CardContent } from "@/components/ui/card";
import { MatchDetailView } from "./MatchDetailView";
import { MatchTabs } from "./MatchTabs";

interface ResultsSectionProps {
  roommates: any[];
  properties: any[];
  selectedMatch: any;
  activeTab: string;
  setActiveTab: (value: string) => void;
  onViewDetails: (match: any) => void;
  onCloseDetails: () => void;
}

export function ResultsSection({
  roommates,
  properties,
  selectedMatch,
  activeTab,
  setActiveTab,
  onViewDetails,
  onCloseDetails
}: ResultsSectionProps) {
  if (roommates.length === 0 && properties.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
        <p className="mb-6">
          Based on your preferences, we found {roommates.length + properties.length} potential matches!
        </p>
        
        {selectedMatch ? (
          <MatchDetailView match={selectedMatch} onClose={onCloseDetails} />
        ) : (
          <MatchTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            roommates={roommates}
            properties={properties}
            onViewDetails={onViewDetails}
          />
        )}
      </CardContent>
    </Card>
  );
}
