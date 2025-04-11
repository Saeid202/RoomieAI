
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Property, getPropertiesByOwnerId } from "@/services/propertyService";

export default function PropertiesPage() {
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

  const rentProperties = properties.filter(p => p.propertyType === 'rent');
  const saleProperties = properties.filter(p => p.propertyType === 'sale');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings</p>
        </div>
        <Button 
          className="flex items-center gap-2 bg-roomie-purple hover:bg-roomie-dark" 
          asChild
        >
          <Link to="/dashboard/properties/add">
            <Plus size={18} />
            List New Property
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="rent">For Rent</TabsTrigger>
          <TabsTrigger value="sale">For Sale</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <PropertyListCard 
            title="All Properties" 
            description="View all your property listings"
            properties={properties}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="rent">
          <PropertyListCard 
            title="Rental Properties" 
            description="Properties available for rent"
            properties={rentProperties}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="sale">
          <PropertyListCard 
            title="Properties For Sale" 
            description="Properties listed for sale (no tenant applications)"
            properties={saleProperties}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PropertyListCardProps {
  title: string;
  description: string;
  properties: Property[];
  isLoading: boolean;
}

function PropertyListCard({ title, description, properties, isLoading }: PropertyListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No properties listed</h3>
            <p className="text-muted-foreground mt-2">
              You haven't listed any properties in this category yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
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
          For {property.propertyType === 'rent' ? 'Rent' : 'Sale'}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{property.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{property.address}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold">${property.price.toLocaleString()}{property.propertyType === 'rent' ? '/month' : ''}</span>
          <span className="text-sm">{property.bedrooms} bd | {property.bathrooms} ba</span>
        </div>
      </CardContent>
    </Card>
  );
}
