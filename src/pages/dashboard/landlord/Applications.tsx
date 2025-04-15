
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, getPropertiesByOwnerId } from "@/services/propertyService";
import { Badge } from "@/components/ui/badge";

export default function ApplicationsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await getPropertiesByOwnerId();
        // Only show rental properties for tenant applications
        const rentalProperties = data.filter(p => p.propertyType === 'rent');
        setProperties(rentalProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tenant Applications</h1>
        <p className="text-muted-foreground mt-1">Manage applications for your rental properties</p>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading properties...</p>
          </CardContent>
        </Card>
      ) : properties.length > 0 ? (
        <div className="space-y-6">
          {properties.map(property => (
            <PropertyApplicationsCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium">No rental properties found</h3>
            <p className="text-muted-foreground mt-2">
              You don't have any properties listed for rent. Only rental properties can receive tenant applications.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PropertyApplicationsCard({ property }: { property: Property }) {
  // In a real application, you would fetch the actual applications for this property
  const applications: any[] = []; // Placeholder for real data
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{property.title}</CardTitle>
          <CardDescription>{property.address}</CardDescription>
        </div>
        <Badge>{property.propertyType === 'rent' ? 'For Rent' : 'For Sale'}</Badge>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {/* Application list would go here */}
            <p>Applications will be shown here</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">No applications yet</h3>
            <p className="text-muted-foreground mt-2">
              You haven't received any tenant applications for this property yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
