
import { Building, ChartBar, Home, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Property, getPropertiesByOwnerId } from "@/services/propertyService";

export function DeveloperDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await getPropertiesByOwnerId();
        setProperties(data.filter(p => p.propertyType === 'sale'));
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);
  
  const propertyCount = properties.length;
  const inquiryCount = 0; // This would come from a backend call in a real app

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Builder/Realtor Dashboard</h1>
      <p className="text-muted-foreground">Manage your property listings and buyer applications.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-roomie-purple" />
              <span>Properties for Sale</span>
            </CardTitle>
            <CardDescription>Manage your property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              {isLoading ? (
                <p>Loading properties...</p>
              ) : propertyCount > 0 ? (
                <>
                  <p className="text-3xl font-bold mb-2">{propertyCount}</p>
                  <p className="mb-4">Properties listed</p>
                  <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                    <Link to="/dashboard/developer/properties">View Properties</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4">No properties listed yet</p>
                  <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                    <Link to="/dashboard/developer/add-property">Add Property</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-roomie-purple" />
              <span>Interested Buyers</span>
            </CardTitle>
            <CardDescription>View potential buyers and co-owners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              {isLoading ? (
                <p>Loading inquiries...</p>
              ) : (
                <>
                  <p className="text-3xl font-bold mb-2">{inquiryCount}</p>
                  <p className="mb-4">Buyer inquiries</p>
                  <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                    <Link to="/dashboard/developer/inquiries">View Inquiries</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-roomie-purple" />
              <span>Market Analysis</span>
            </CardTitle>
            <CardDescription>View real estate market trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                <Link to="/dashboard/developer/market">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
