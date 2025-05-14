
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Property, getPropertiesByOwnerId } from "@/services/propertyService";

export default function DeveloperPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await getPropertiesByOwnerId();
        // For developers, we're primarily interested in properties for sale
        const saleProperties = data.filter(p => p.propertyType === 'sale');
        setProperties(saleProperties);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties For Sale</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings for sale</p>
        </div>
        <Button 
          className="flex items-center gap-2 bg-roomie-purple hover:bg-roomie-dark" 
          asChild
        >
          <Link to="/dashboard/developer/add-property">
            <Plus size={18} />
            List New Property
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading properties...</p>
          </CardContent>
        </Card>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium">No properties listed yet</h3>
            <p className="text-muted-foreground mt-2">
              You haven't listed any properties for sale yet. Click the "List New Property" button to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 relative">
        {property.imageUrls && property.imageUrls.length > 0 ? (
          <img 
            src={property.imageUrls[0]} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs">
          For Sale
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{property.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{property.address}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold">${property.price.toLocaleString()}</span>
          <span className="text-sm">{property.bedrooms} bd | {property.bathrooms} ba</span>
        </div>
      </CardContent>
    </Card>
  );
}
