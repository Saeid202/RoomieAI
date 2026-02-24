import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchMortgageBrokerProfile, 
  fetchAllMortgageProfiles 
} from "@/services/mortgageBrokerService";
import { MortgageBrokerProfile } from "@/types/mortgageBroker";
import { MortgageProfile } from "@/types/mortgage";
import { Building2, Users, FileText, TrendingUp, Eye, Download, User, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MortgageBrokerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MortgageBrokerProfile | null>(null);
  const [clientCount, setClientCount] = useState(0);
  const [recentClients, setRecentClients] = useState<MortgageProfile[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      const brokerProfile = await fetchMortgageBrokerProfile(user.id);
      if (brokerProfile) {
        setProfile(brokerProfile);
      }

      const clients = await fetchAllMortgageProfiles();
      setClientCount(clients.length);
      setRecentClients(clients.slice(0, 3)); // Get first 3 clients
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-10 pb-10">
      {/* Welcome Banner with Animations - Matching Main Dashboard Style */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-2 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 opacity-50 rotate-45 animate-spin-slow"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-300/50 to-orange-300/50 rounded-full blur-xl animate-bounce delay-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-pink-300/50 to-purple-300/50 rounded-full blur-lg animate-ping delay-700"></div>
        </div>

        {/* Content */}
        <div className="text-center mb-1 relative z-10">
          <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              Welcome back, {profile?.full_name || 'Mortgage Broker'}!
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto shadow-lg"></div>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto font-bold leading-relaxed">
              Your all-in-one platform for managing clients, tracking applications, and growing your mortgage brokerage business.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout - Matching Main Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Update Profile Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/mortgage-broker/profile')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Users className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Update Profile</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">Manage your professional information and credentials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Clients Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/mortgage-broker/clients')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FileText className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">View Clients</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">Review and manage client mortgage applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Clients Stats Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Building2 className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Total Clients</h3>
                <p className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{clientCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Applications Stats Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FileText className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Active Applications</h3>
                <p className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{clientCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Stats Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">This Month</h3>
                <p className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">+{clientCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Clients Section */}
      {recentClients.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Recent Clients
            </h2>
            <Button
              onClick={() => navigate('/dashboard/mortgage-broker/clients')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
            >
              View All Clients
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {recentClients.map((client) => (
              <Card 
                key={client.id}
                className="relative overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 group"
              >
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-indigo-400/0 group-hover:from-purple-400/5 group-hover:via-pink-400/5 group-hover:to-indigo-400/5 transition-all duration-500"></div>
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: Client Info */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                      </div>

                      {/* Client Details */}
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-black text-gray-900">{client.full_name || "Not provided"}</h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-gray-600">
                              Joined {client.created_at ? new Date(client.created_at).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">📧</span>
                            <span className="text-gray-700 font-medium">{client.email || "Not provided"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">📞</span>
                            <span className="text-gray-700 font-medium">{client.phone_number || "Not provided"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">Target:</span>
                          <span className="text-sm font-bold text-purple-600">
                            {client.purchase_price_range?.replace(/_/g, " ") || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-3 items-end">
                      <Button
                        onClick={() => navigate('/dashboard/mortgage-broker/clients')}
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-semibold"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Quick Download
                      </Button>

                      <div className="mt-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                        <div className="mt-1 px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-sm font-bold rounded-full border border-green-300 inline-block">
                          Active Application
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
