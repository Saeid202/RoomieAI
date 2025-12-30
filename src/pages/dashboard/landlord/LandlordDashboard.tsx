import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalSales: 0,
    activeApplications: 0,
    monthlyRevenue: 0,
    portfolioValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!user) return;

      try {
        // Fetch total rental properties
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('id, monthly_rent', { count: 'exact' })
          .eq('user_id', user.id);

        if (propertiesError) throw propertiesError;

        // Fetch total sales listings
        const { data: sales, error: salesError } = await (supabase as any)
          .from('sales_listings')
          .select('id, sales_price', { count: 'exact' })
          .eq('user_id', user.id);

        if (salesError && salesError.code !== '42P01') throw salesError;

        // Fetch active applications
        const { count: applicationsCount, error: applicationsError } = await (supabase as any)
          .from('rental_applications')
          .select('*', { count: 'exact', head: true })
          .eq('property_id', properties?.map(p => p.id) || [])
          .eq('status', 'pending');

        if (applicationsError) throw applicationsError;

        // Calculations
        const totalRevenue = properties?.reduce((sum, p) => sum + (p.monthly_rent || 0), 0) || 0;
        const totalPortfolioValue = (sales as any[])?.reduce((sum, s) => sum + (s.sales_price || 0), 0) || 0;

        setStats({
          totalRentals: properties?.length || 0,
          totalSales: sales?.length || 0,
          activeApplications: applicationsCount || 0,
          monthlyRevenue: totalRevenue,
          portfolioValue: totalPortfolioValue
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
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalRentals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRentals === 0 ? 'No rentals listed' : 'Active rental units'}
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
              {stats.activeApplications === 0 ? 'No applications' : 'Pending review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent Roll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyRevenue === 0 ? '$0.00' : 'Total monthly rent'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">Sales Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{isLoading ? '...' : `$${(stats.portfolioValue / 1000000).toFixed(2)}M`}</div>
            <p className="text-xs text-indigo-600/80">
              {stats.totalSales} active sales listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Removed placeholder sections: Property Management, Pricing Tools, Maintenance, etc. */}
    </div>
  );
}