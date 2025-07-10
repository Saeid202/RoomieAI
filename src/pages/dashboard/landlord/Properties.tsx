import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PropertiesPage() {
  const navigate = useNavigate();
  
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
    </div>
  );
}