
import { Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserPreference } from "../types";
import { useNavigate } from "react-router-dom";

interface FormDisplaySectionProps {
  preference: UserPreference;
  handleEditPreference: () => void;
}

export function FormDisplaySection({ 
  preference, 
  handleEditPreference 
}: FormDisplaySectionProps) {
  const navigate = useNavigate();
  
  const handleFillProfile = () => {
    navigate('/dashboard/profile/co-owner');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {preference === "co-owner" && "Find Your Co-ownership Partner"}
        </h1>
        <button 
          onClick={handleEditPreference}
          className="flex items-center gap-1 text-sm text-roomie-purple hover:underline"
        >
          <Edit size={14} />
          Change my preference
        </button>
      </div>
      
      {preference === "co-owner" && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <p className="text-gray-600 mb-4">Fill out your co-owner profile to find matches</p>
                <button 
                  onClick={handleFillProfile}
                  className="px-4 py-2 bg-roomie-purple text-white rounded-md hover:bg-roomie-purple/90 transition-colors"
                >
                  Fill Profile
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
