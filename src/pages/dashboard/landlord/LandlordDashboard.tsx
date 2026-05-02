import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MasterBox } from "@/components/dashboard/MasterBox";
import { SubFeatureButton } from "@/components/dashboard/SubFeatureButton";
import { User, Home, FileText, CreditCard, Bot, MessageSquare, Shield, Calculator, Hammer, Sparkles, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        const propertyIds = properties?.map(p => p.id) || [];
        const { count: applicationsCount, error: applicationsError } = await (supabase as any)
          .from('rental_applications')
          .select('*', { count: 'exact', head: true })
          .in('property_id', propertyIds)
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
  }, [user?.id]); // Changed from [user] to [user?.id] to prevent infinite loop

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-10 pb-10">
      {/* Welcome Banner — dark hero */}
      <div className="relative bg-violet-700 rounded-2xl p-8 overflow-hidden shadow-lg">
        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Soft glow */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-violet-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-2">Landlord Portal</p>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Homie AI</h1>
          <p className="text-violet-100 text-sm leading-relaxed max-w-2xl">
            Your all-in-one platform for property management, tenant matching, and building your rental empire. The sections below guide you through each stage of your landlord journey.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landlord Dashboard</h1>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Profile Master Box */}
        <MasterBox
          title="1. Profile"
          description="Manage your landlord profile and account settings."
          icon={User}
          onClick={() => navigate("/dashboard/landlord/profile")}
        />

        {/* My Properties Master Box */}
        <MasterBox
          title="2. My Properties"
          description="Manage your rental properties and listings."
          icon={Home}
          onClick={() => navigate("/dashboard/landlord/properties")}
        />

        {/* Sales Master Box */}
        <MasterBox
          title="3. Sales"
          description="Manage property sales and listings."
          icon={TrendingUp}
          onClick={() => navigate("/dashboard/landlord/sales")}
        />

        {/* Applications Master Box */}
        <MasterBox
          title="4. Applications"
          description="Review and process rental applications."
          icon={Users}
          onClick={() => navigate("/dashboard/landlord/applications")}
        />

        {/* Payments Master Box */}
        <MasterBox
          title="5. Payments"
          description="Track rent payments and financial transactions."
          icon={CreditCard}
          onClick={() => navigate("/dashboard/landlord/payments")}
        />

        {/* Legal AI Master Box */}
        <MasterBox
          title="6. Legal AI"
          description="AI-powered legal assistance for landlords."
          icon={Bot}
          onClick={() => navigate("/dashboard/landlord/legal-ai")}
        >
          <div className="space-y-1">
            <SubFeatureButton 
              emoji="⚖️" 
              label="Legal Chat"
              onClick={() => navigate("/dashboard/landlord/legal-chat")}
            />
            <SubFeatureButton 
              emoji="🏗️" 
              label="Compliance AI"
              onClick={() => navigate("/dashboard/landlord/compliance-ai")}
            />
            <SubFeatureButton 
              emoji="🚪" 
              label="Eviction Assistant"
              onClick={() => navigate("/dashboard/landlord/eviction-assistant")}
            />
            <SubFeatureButton 
              emoji="💰" 
              label="Tax Intelligence"
              onClick={() => navigate("/dashboard/landlord/tax-intelligence")}
            />
          </div>
        </MasterBox>

        {/* Service Companies Master Box */}
        <MasterBox
          title="7. Service Companies"
          description="Access trusted service providers and partners."
          icon={Building}
          onClick={() => navigate("/dashboard/landlord/service-companies")}
        >
          <div className="space-y-1">
            <SubFeatureButton 
              emoji="🔧" 
              label="Partnered Renovators"
              onClick={() => navigate("/dashboard/renovators")}
            />
            <SubFeatureButton 
              emoji="🧹" 
              label="Partnered Cleaners"
              onClick={() => navigate("/dashboard/cleaners")}
            />
          </div>
        </MasterBox>

        {/* Education Centre Master Box */}
        <MasterBox
          title="8. Education Centre"
          description="Learn about property management and best practices."
          icon={Sparkles}
          onClick={() => navigate("/dashboard/landlord/education-centre")}
        />
        
      </div>
    </div>
  );
}