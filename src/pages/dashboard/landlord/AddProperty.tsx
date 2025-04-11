
import { useState } from "react";
import PropertyForm from "@/components/property/PropertyForm";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddPropertyPage() {
  const [showInfo, setShowInfo] = useState(true);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">List New Property</h1>
        <p className="text-muted-foreground mt-1">Add details about your property</p>
      </div>
      
      {showInfo && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pro Tip</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Complete all sections for better visibility in search results. Properties with detailed information and photos receive 5x more inquiries.</span>
            <Button variant="ghost" size="sm" onClick={() => setShowInfo(false)}>Dismiss</Button>
          </AlertDescription>
        </Alert>
      )}
      
      <PropertyForm />
    </div>
  );
}
