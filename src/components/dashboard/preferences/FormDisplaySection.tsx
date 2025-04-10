
import { Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { UserPreference } from "../types";

interface FormDisplaySectionProps {
  preference: UserPreference;
  handleEditPreference: () => void;
}

export function FormDisplaySection({ 
  preference, 
  handleEditPreference 
}: FormDisplaySectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {preference === "roommate" && "Find Your Perfect Roommate"}
          {preference === "co-owner" && "Find Your Co-ownership Partner"}
          {preference === "both" && "Find Your Housing Partners"}
        </h1>
        <button 
          onClick={handleEditPreference}
          className="flex items-center gap-1 text-sm text-roomie-purple hover:underline"
        >
          <Edit size={14} />
          Change my preference
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
