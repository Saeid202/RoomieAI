
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PreferenceCardProps { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  selected: boolean; 
  onSelect: () => void;
}

export function PreferenceCard({ 
  title, 
  description, 
  icon: Icon, 
  selected, 
  onSelect 
}: PreferenceCardProps) {
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
}
