
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { PreferenceCard } from "./PreferenceCard";
import { UserPreference } from "../types";

interface PreferenceSelectionSectionProps {
  preference: UserPreference;
  handlePreferenceSelect: (pref: UserPreference) => void;
  handleContinue: () => void;
}

export function PreferenceSelectionSection({ 
  preference, 
  handlePreferenceSelect, 
  handleContinue 
}: PreferenceSelectionSectionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-lg text-gray-700">
          Let us know what you're interested in so we can help find your perfect match
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-4 mx-auto max-w-3xl">
        <div className="text-center text-gray-500 py-8">
          <p>Co-owner functionality has been removed.</p>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
            preference ? "bg-roomie-purple" : "bg-gray-400"
          }`}
          onClick={handleContinue}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
