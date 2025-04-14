
import { ResultsSection } from "./ResultsSection";

interface ResultsProps {
  roommates: any[];
  properties: any[];
  selectedMatch: any;
  activeTab: string;
  setActiveTab: (value: string) => void;
  onViewDetails: (match: any) => void;
  onCloseDetails: () => void;
}

export function Results({
  roommates,
  properties,
  selectedMatch,
  activeTab,
  setActiveTab,
  onViewDetails,
  onCloseDetails
}: ResultsProps) {
  if (roommates.length === 0 && properties.length === 0) {
    return null;
  }

  return (
    <div data-results-section>
      <ResultsSection
        roommates={roommates}
        properties={properties || []}
        selectedMatch={selectedMatch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onViewDetails={onViewDetails}
        onCloseDetails={onCloseDetails}
      />
    </div>
  );
}
