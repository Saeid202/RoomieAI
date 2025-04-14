
import { useState } from "react";

export function useAccordionSections(defaultSections: string[] = []) {
  const [expandedSections, setExpandedSections] = useState<string[]>(defaultSections);

  return {
    expandedSections,
    setExpandedSections,
  };
}
