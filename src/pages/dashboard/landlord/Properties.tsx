
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings</p>
        </div>
        <Button className="flex items-center gap-2 bg-roomie-purple hover:bg-roomie-dark">
          <Plus size={18} />
          Add Property
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Properties</CardTitle>
          <CardDescription>All your current listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No properties listed</h3>
            <p className="text-muted-foreground mt-2">
              You haven't listed any properties yet. Add your first property to start finding tenants.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
