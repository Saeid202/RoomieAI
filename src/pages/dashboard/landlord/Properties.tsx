import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPropertiesByOwnerId, Property } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProperties([]);
          return;
        }
        const list = await getPropertiesByOwnerId(user.id);
        if (mounted) setProperties(list);
      } catch (e) {
        console.error("Failed to load landlord properties", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your rental properties</p>
        </div>
        <Button onClick={() => navigate("/dashboard/landlord/add-property")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent>
            <div className="animate-pulse py-10 space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 bg-muted rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : properties.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Property Listings
            </CardTitle>
            <CardDescription>View and manage all your rental properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first rental property to attract potential tenants.
              </p>
              <Button onClick={() => navigate("/dashboard/landlord/add-property")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Your Property Listings
              </CardTitle>
              <CardDescription>Manage and review the properties you've added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <Card key={p.id} className="border">
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">{p.listing_title}</CardTitle>
                      <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{p.city}, {p.state}</span></div>
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>{p.monthly_rent}/mo</span></div>
                      </div>
                      <Button className="mt-4 w-full" variant="outline" onClick={() => navigate("/dashboard/landlord/add-property")}>Edit</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Management
                </CardTitle>
                <CardDescription>Tools to manage your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <h4 className="font-medium mb-2">Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced property management features will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Tools
                </CardTitle>
                <CardDescription>Optimize your rental pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <h4 className="font-medium mb-2">Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    Market analysis and pricing recommendations will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Maintenance
                </CardTitle>
                <CardDescription>Track property maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <h4 className="font-medium mb-2">Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    Maintenance tracking and scheduling tools will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}