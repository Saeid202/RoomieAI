
import { Building, Home, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Property, getPropertiesByOwnerId } from "@/services/propertyService";

export function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await getPropertiesByOwnerId();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);
  
  const propertyCount = properties.length;
  const rentalProperties = properties.filter(p => p.propertyType === 'rent');
  const applicationCount = 0; // This would come from a backend call in a real app

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Landlord Dashboard</h1>
      <p className="text-muted-foreground">Manage your property listings and tenant applications.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-roomie-purple" />
              <span>Properties</span>
            </CardTitle>
            <CardDescription>Manage your listings</CardDescription>
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
                    <Link to="/dashboard/landlord/properties">View Properties</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4">No properties listed yet</p>
                  <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                    <Link to="/dashboard/landlord/add-property">Add Property</Link>
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
              <span>Applications</span>
            </CardTitle>
            <CardDescription>Review tenant applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              {isLoading ? (
                <p>Loading applications...</p>
              ) : rentalProperties.length > 0 ? (
                <>
                  <p className="text-3xl font-bold mb-2">{applicationCount}</p>
                  <p className="mb-4">Pending applications</p>
                  <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                    <Link to="/dashboard/landlord/applications">View Applications</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p>No rental properties listed</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a property for rent to receive applications</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-roomie-purple" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>Communicate with potential tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-3xl font-bold mb-2">0</p>
              <p className="mb-4">Unread messages</p>
              <Button className="bg-roomie-purple hover:bg-roomie-dark" asChild>
                <Link to="/dashboard/chats">View Messages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
