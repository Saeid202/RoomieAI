
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
    <div className="px-4 md:px-0">
      <div className="bg-background/95 backdrop-blur-sm rounded-3xl border border-border/20 shadow-sm">
        <div className="p-6 md:p-8">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">Your Matches</h2>
            <p className="text-lg text-muted-foreground">
              Based on your preferences, we found {roommates.length + properties.length} potential matches!
            </p>
          </div>
        
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
        </div>
      </div>
    </div>
  );
}
