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
  }, [user]);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-10 pb-10">
      {/* Dashboard Orientation & Welcome Section */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-2 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 opacity-50 rotate-45 animate-spin-slow"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-300/50 to-orange-300/50 rounded-full blur-xl animate-bounce delay-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-pink-300/50 to-purple-300/50 rounded-full blur-lg animate-ping delay-700"></div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-1 relative z-10">
          <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              Welcome to Roomie AI
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto shadow-lg"></div>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto font-bold leading-relaxed">
              Your all-in-one platform for property management, tenant matching, and building your rental empire.
            </p>
          </div>
        </div>

        {/* Short Explanation */}
        <div className="text-center relative z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 border-2 border-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-gray-800 text-lg leading-relaxed relative z-10 font-medium">
              Roomie AI brings every step of property management into one secure platform — from listing properties and screening tenants, to collecting rent and handling legal compliance. The sections below guide you through each stage of your landlord journey.
            </p>
          </div>
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

        {/* Rentals Master Box */}
        <MasterBox
          title="3. Rentals"
          description="Track rental agreements and tenant information."
          icon={FileText}
          onClick={() => navigate("/dashboard/landlord/rentals")}
        />

        {/* Sales Master Box */}
        <MasterBox
          title="4. Sales"
          description="Manage property sales and listings."
          icon={TrendingUp}
          onClick={() => navigate("/dashboard/landlord/sales")}
        />

        {/* Applications Master Box */}
        <MasterBox
          title="5. Applications"
          description="Review and process rental applications."
          icon={Users}
          onClick={() => navigate("/dashboard/landlord/applications")}
        />

        {/* Payments Master Box */}
        <MasterBox
          title="6. Payments"
          description="Track rent payments and financial transactions."
          icon={CreditCard}
          onClick={() => navigate("/dashboard/landlord/payments")}
        />

        {/* Legal AI Master Box */}
        <MasterBox
          title="7. Legal AI"
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
          title="8. Service Companies"
          description="Access trusted service providers and partners."
          icon={Building}
          onClick={() => navigate("/dashboard/landlord/service-companies")}
        >
          <div className="space-y-1">
            <SubFeatureButton 
              emoji="🔧" 
              label="Partnered Renovators"
              onClick={() => navigate("/dashboard/landlord/partnered-renovators")}
            />
            <SubFeatureButton 
              emoji="🧹" 
              label="Partnered Cleaners"
              onClick={() => navigate("/dashboard/landlord/partnered-cleaners")}
            />
          </div>
        </MasterBox>

        {/* Education Centre Master Box */}
        <MasterBox
          title="9. Education Centre"
          description="Learn about property management and best practices."
          icon={Sparkles}
          onClick={() => navigate("/dashboard/landlord/education-centre")}
        />
        
      </div>
    </div>
  );
}