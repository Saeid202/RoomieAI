
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PropertyForm from "@/components/property/PropertyForm";

export default function AddRentalListingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/dashboard/rent-opportunities" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Rent Opportunities</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create New Rental Listing</h1>
          <p className="text-muted-foreground mt-1">Create a new listing for a rental replacement opportunity</p>
        </div>
      </div>
      
      <PropertyForm propertyType="rental" />
    </div>
  );
}
