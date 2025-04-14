
import { ResultsSection } from "./ResultsSection";
import { EmptyState } from "./EmptyState";

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
  const noResults = (!roommates || roommates.length === 0) && (!properties || properties.length === 0);
  
  // If no results and no specific match is selected, show nothing
  if (noResults && !selectedMatch) {
    return null;
  }

  return (
    <div data-results-section>
      <ResultsSection
        roommates={roommates || []}
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
