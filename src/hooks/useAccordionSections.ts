
import { useState } from "react";

export function useAccordionSections(initialSections: string[] = []) {
  const [expandedSections, setExpandedSections] = useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return { expandedSections, setExpandedSections, toggleSection };
}
