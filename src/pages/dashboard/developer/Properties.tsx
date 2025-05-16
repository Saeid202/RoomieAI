
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building, Bed, Bath, DollarSign, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Property, getPropertiesByOwnerId } from "@/services/propertyService";
import { Badge } from "@/components/ui/badge";

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
  // Get property status label
  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "For Sale";
    
    switch(status) {
      case "new_construction": return "New Construction";
      case "pre_construction": return "Pre-Construction";
      case "under_construction": return "Under Construction";
      case "recently_completed": return "Recently Completed";
      case "resale": return "Resale";
      default: return "For Sale";
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
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
        <div className="absolute top-2 right-2">
          <Badge className="bg-roomie-purple text-white">
            {getStatusLabel(property.propertyStatus)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg truncate">{property.title}</h3>
        <div className="flex items-center text-muted-foreground text-sm mt-1 mb-2">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{property.address}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center text-sm">
            <Bed size={14} className="mr-1 text-muted-foreground" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center text-sm">
            <Bath size={14} className="mr-1 text-muted-foreground" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center text-sm">
            <Building size={14} className="mr-1 text-muted-foreground" />
            <span>{property.squareFeet} sq ft</span>
          </div>
          <div className="flex items-center text-sm">
            <Home size={14} className="mr-1 text-muted-foreground" />
            <span>{property.yearBuilt || "N/A"}</span>
          </div>
        </div>
        
        {property.developmentName && (
          <div className="mt-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {property.developmentName}
            </Badge>
          </div>
        )}
        
        <div className="mt-auto pt-3 border-t flex items-center justify-between">
          <span className="font-bold text-lg flex items-center">
            <DollarSign size={16} className="text-roomie-purple" />
            {property.price.toLocaleString()}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/developer/properties/${property.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
