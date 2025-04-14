
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { CoOwnerProfileLoading } from "./CoOwnerProfileLoading";
import { useCoOwnerProfile } from "@/hooks/useCoOwnerProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function PersonalDetailsForm() {
  const { profileData, loading, error, saveProfile } = useCoOwnerProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Handle authentication redirect
  const handleLogin = () => {
    navigate("/auth");
  };
  
  if (loading) {
    return <CoOwnerProfileLoading />;
  }
  
  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {!user && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleLogin}>Login to Continue</Button>
          </div>
        )}
        
        {user && !profileData && (
          <div className="mt-6">
            <CoOwnerProfileForm 
              initialData={null} 
              onSave={saveProfile} 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CoOwnerProfileForm 
        initialData={profileData} 
        onSave={saveProfile} 
      />
    </div>
  );
}
