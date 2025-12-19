import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeApplications: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!user) return;

      try {
        // Fetch total properties
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id, rent_amount', { count: 'exact' })
          .eq('landlord_id', user.id);

        if (propertiesError) throw propertiesError;

        // Fetch active applications
        const { count: applicationsCount, error: applicationsError } = await supabase
          .from('rental_applications')
          .select('*', { count: 'exact', head: true })
          .eq('property_id', properties?.map(p => p.id) || [])
          .eq('status', 'pending');

        if (applicationsError) throw applicationsError;

        // Calculate monthly revenue and occupancy
        const totalRevenue = properties?.reduce((sum, p) => sum + (p.rent_amount || 0), 0) || 0;
        const occupiedProperties = properties?.filter(p => p.rent_amount > 0).length || 0;
        const totalProperties = properties?.length || 0;
        const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

        setStats({
          totalProperties: totalProperties,
          activeApplications: applicationsCount || 0,
          monthlyRevenue: totalRevenue,
          occupancyRate: Math.round(occupancyRate)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landlord Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your properties and track performance</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProperties === 0 ? 'No properties listed yet' : 'Active properties'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.activeApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeApplications === 0 ? 'No applications received' : 'Pending applications'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyRevenue === 0 ? 'No revenue yet' : 'Estimated monthly'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : `${stats.occupancyRate}%`}</div>
            <p className="text-xs text-muted-foreground">
              {stats.occupancyRate === 0 ? 'No occupied units' : 'Current occupancy'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Removed placeholder sections: Property Management, Pricing Tools, Maintenance, etc. */}
    </div>
  );
}