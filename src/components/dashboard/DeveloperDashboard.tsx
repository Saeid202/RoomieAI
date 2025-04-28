
import { Building, Home, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DeveloperDashboard() {
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
              <p className="mb-4">No properties listed yet</p>
              <Button className="bg-roomie-purple hover:bg-roomie-dark">
                Add Property
              </Button>
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
              <p>No interested buyers yet</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-roomie-purple" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>Communicate with potential buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p>No messages yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
