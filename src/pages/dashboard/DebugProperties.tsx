import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTestProperties, deleteAllProperties, checkPropertiesInDatabase } from "@/services/testDataService";
import { useState } from "react";
import { toast } from "sonner";

export default function DebugPropertiesPage() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  const handleCreateTestProperties = async () => {
    setLoading(true);
    try {
      const result = await createTestProperties();
      if (result) {
        toast.success(`Created ${result.length} test properties!`);
        await handleCheckProperties();
      }
    } catch (error) {
      toast.error("Failed to create test properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllProperties = async () => {
    if (!window.confirm("Are you sure? This will delete ALL properties!")) return;
    
    setLoading(true);
    try {
      await deleteAllProperties();
      toast.success("All properties deleted");
      setProperties([]);
    } catch (error) {
      toast.error("Failed to delete properties");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckProperties = async () => {
    setLoading(true);
    try {
      const result = await checkPropertiesInDatabase();
      if (result) {
        setProperties(result);
        toast.success(`Found ${result.length} properties`);
      }
    } catch (error) {
      toast.error("Failed to check properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Properties</h1>
        <p className="text-muted-foreground mt-1">Create and manage test properties</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleCreateTestProperties} 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Creating..." : "Create Test Properties"}
          </Button>
          
          <Button 
            onClick={handleCheckProperties} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Checking..." : "Check Properties in Database"}
          </Button>
          
          <Button 
            onClick={handleDeleteAllProperties} 
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? "Deleting..." : "Delete All Properties"}
          </Button>
        </CardContent>
      </Card>

      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Properties in Database ({properties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {properties.map((prop) => (
                <div key={prop.id} className="p-3 border rounded-lg bg-slate-50">
                  <p className="font-semibold">{prop.listing_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {prop.city}, {prop.state} • ${prop.monthly_rent}/mo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {prop.status} • User: {prop.user_id.substring(0, 8)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
