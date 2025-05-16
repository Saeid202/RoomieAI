
import PropertyForm from "@/components/property/PropertyForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/dashboard/developer" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">List New Property</h1>
          <p className="text-muted-foreground mt-1">Create a new property listing for sale</p>
        </div>
      </div>
      
      <PropertyForm propertyType="sale" />
    </div>
  );
}
