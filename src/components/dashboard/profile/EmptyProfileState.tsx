
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export function EmptyProfileState() {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8 px-4 max-w-full">
      <p className="text-base md:text-lg text-gray-600 mb-6">
        Please select your preference (roommate, co-owner, or both) before filling out your profile.
      </p>
      <Button 
        onClick={() => navigate('/dashboard')}
        className="px-4 md:px-6 py-2 bg-roomie-purple text-white rounded-md hover:bg-roomie-purple/90 transition-colors flex items-center gap-2 mx-auto"
      >
        <LayoutDashboard size={18} />
        Go to Dashboard
      </Button>
    </div>
  );
}
