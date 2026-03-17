import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client-simple";
import { getLenderProfile, getLenderRates } from "@/services/lenderService";
import { LenderProfile, LenderRate } from "@/types/lender";
import { Building2, Percent, FileText, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LenderDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LenderProfile | null>(null);
  const [rates, setRates] = useState<LenderRate[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in to continue"); return; }
      const lenderProfile = await getLenderProfile(user.id);
      if (lenderProfile) setProfile(lenderProfile);
      const lenderRates = await getLenderRates(lenderProfile?.id || "");
      setRates(lenderRates);
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

  const activeRates = rates.filter(r => r.is_active).length;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-10 pb-10">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-2 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="text-center mb-1 relative z-10">
          <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {profile?.company_name || 'Lender'}!
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto shadow-lg"></div>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto font-bold leading-relaxed">
              Manage your rates, view mortgage requests, and grow your lending business.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Update Profile Card */}
        <Card
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/lender/profile')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Update Profile</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">Manage your company information and credentials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manage Rates Card */}
        <Card
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/lender/rates')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Percent className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Manage Rates</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">Add, edit, and update your interest rates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Requests Card */}
        <Card
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/lender/requests')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">View Requests</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">Review mortgage profiles with consent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Rates Stats */}
        <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden h-full min-h-[160px]">
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                <Percent className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">Active Rates</h3>
                <p className="text-3xl font-black text-gray-900">{activeRates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Rates Stats */}
        <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden h-full min-h-[160px]">
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">Total Rates</h3>
                <p className="text-3xl font-black text-gray-900">{rates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Rate */}
        <Card
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/lender/rates?action=add')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Add New Rate</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">Set a new interest rate for borrowers</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Rates Section */}
      {rates.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Your Current Rates
            </h2>
            <Button
              onClick={() => navigate('/dashboard/lender/rates')}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold shadow-lg"
            >
              Manage All Rates
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.slice(0, 6).map((rate) => (
              <Card
                key={rate.id}
                className="relative overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 group"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {rate.loan_type.replace(/_/g, " ")}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      rate.is_active ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rate.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900">{rate.interest_rate}%</span>
                      <span className="text-sm text-gray-500">for {rate.term_years} years</span>
                    </div>
                    {rate.apr && <p className="text-sm text-gray-600">APR: {rate.apr}%</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <span>Min: ${rate.min_loan_amount?.toLocaleString() || 'N/A'}</span>
                      <span>Max: ${rate.max_loan_amount?.toLocaleString() || 'N/A'}</span>
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
