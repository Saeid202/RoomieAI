
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Users, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { useToast } from "@/components/ui/use-toast";

type UserPreference = "roommate" | "co-owner" | "both" | null;

const PreferenceCard = ({ 
  title, 
  description, 
  icon: Icon, 
  selected, 
  onSelect 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  selected: boolean; 
  onSelect: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="flex-1"
    >
      <Card 
        className={`cursor-pointer h-full transition-all ${
          selected ? "border-2 border-roomie-purple bg-purple-50" : "border border-gray-200 hover:border-roomie-purple"
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-full ${selected ? "bg-roomie-purple text-white" : "bg-gray-100 text-gray-600"}`}>
              <Icon size={24} />
            </div>
            {selected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-500 rounded-full p-1 text-white"
              >
                <Check size={16} />
              </motion.div>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function PreferenceSelector() {
  const [preference, setPreference] = useState<UserPreference>(null);
  const [showForms, setShowForms] = useState(false);
  const { toast } = useToast();
  
  const handlePreferenceSelect = (pref: UserPreference) => {
    setPreference(pref);
  };
  
  const handleContinue = () => {
    if (!preference) {
      toast({
        title: "Please select an option",
        description: "You need to select what you're looking for to continue",
        variant: "destructive",
      });
      return;
    }
    
    setShowForms(true);
  };
  
  const handleReset = () => {
    setShowForms(false);
    setPreference(null);
  };
  
  if (showForms) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {preference === "roommate" && "Find Your Perfect Roommate"}
            {preference === "co-owner" && "Find Your Co-ownership Partner"}
            {preference === "both" && "Find Your Housing Partners"}
          </h1>
          <button 
            onClick={handleReset}
            className="text-sm text-roomie-purple hover:underline"
          >
            Change my selection
          </button>
        </div>
        
        {(preference === "roommate" || preference === "both") && (
          <div className="mb-12">
            {preference === "both" && (
              <h2 className="text-xl font-semibold mb-4 text-roomie-purple">Roommate Matching Profile</h2>
            )}
            <ProfileForm />
          </div>
        )}
        
        {(preference === "co-owner" || preference === "both") && (
          <div>
            {preference === "both" && (
              <h2 className="text-xl font-semibold mb-4 text-roomie-purple">Co-owner Matching Profile</h2>
            )}
            <Card>
              <CardContent className="p-6">
                <p className="text-center py-8 text-gray-500">Co-owner form will be implemented in the future update.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">What are you looking for?</h1>
        <p className="text-muted-foreground text-lg">
          Let us know what you're interested in so we can help find your perfect match
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
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
      
      <div className="flex justify-center mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-10 py-3 rounded-lg font-medium text-white transition-colors ${
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
