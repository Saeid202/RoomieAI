
import { motion } from "framer-motion";
import { Home, Users } from "lucide-react";
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <PreferenceCard
          title="Roommate"
          description="I'm looking for someone to share a rental with me"
          icon={Users}
          selected={preference === "roommate"}
          onSelect={() => handlePreferenceSelect("roommate")}
        />
        <PreferenceCard
          title="Co-owner"
          description="I'm looking for someone to purchase property with me"
          icon={Home}
          selected={preference === "co-owner"}
          onSelect={() => handlePreferenceSelect("co-owner")}
        />
        <PreferenceCard
          title="Both Options"
          description="I'm open to either roommates or co-ownership"
          icon={() => (
            <div className="relative">
              <Users size={24} className="absolute -left-1" />
              <Home size={24} className="absolute left-3" />
            </div>
          )}
          selected={preference === "both"}
          onSelect={() => handlePreferenceSelect("both")}
        />
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
