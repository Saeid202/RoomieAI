import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchLawyerProfile, fetchLawyerClients } from "@/services/lawyerService";
import { LawyerProfile } from "@/types/lawyer";
import { Users, FileText, TrendingUp, Scale, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LawyerDocumentReviewCard } from "@/components/lawyer/LawyerDocumentReviewCard";

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [clientCount, setClientCount] = useState(0);
  const [activeCases, setActiveCases] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

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

      const lawyerProfile = await fetchLawyerProfile(user.id);
      if (lawyerProfile) {
        setProfile(lawyerProfile);
      }

      const clients = await fetchLawyerClients(user.id);
      setClientCount(clients.length);
      setActiveCases(clients.filter(c => c.status === 'active').length);
      
      // Count clients added this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = clients.filter(c => new Date(c.created_at) >= firstDayOfMonth).length;
      setNewThisMonth(thisMonth);

      // Count unread messages from main messenger
      const { data: conversations } = await supabase
        .from('conversations' as any)
        .select('id')
        .eq('lawyer_profile_id', lawyerProfile.id);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map((c: any) => c.id);
        const { data: unreadData } = await supabase
          .from('messages' as any)
          .select('id', { count: 'exact' })
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id);
        
        setUnreadMessages(unreadData?.length || 0);
      }
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
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-2 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 opacity-50 rotate-45 animate-spin-slow"></div>
        </div>

        <div className="text-center mb-1 relative z-10">
          <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              Welcome back, {profile?.full_name || 'Lawyer'}!
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto shadow-lg"></div>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto font-bold leading-relaxed">
              Your all-in-one platform for managing clients, cases, and growing your legal practice.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Messenger Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/chats')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <MessageCircle className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">Messenger</h3>
                  {unreadMessages > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      {unreadMessages}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">
                  {unreadMessages > 0 ? `${unreadMessages} new message${unreadMessages > 1 ? 's' : ''}` : 'View all conversations'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Profile Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
          onClick={() => navigate('/dashboard/lawyer/profile')}
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

        {/* Practice Areas Card */}
        <Card 
          className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-3 relative z-10 h-full flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <Scale className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Practice Areas</h3>
                <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">
                  {profile?.practice_areas && profile.practice_areas.length > 0 
                    ? profile.practice_areas.join(", ") 
                    : "Not set"}
                </p>
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
                <FileText className="h-5 w-5 text-white group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Total Clients</h3>
                <p className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{clientCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Cases Stats Card */}
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
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">Active Cases</h3>
                <p className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">{activeCases}</p>
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
                <p className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">+{newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Review Card */}
        <LawyerDocumentReviewCard />

      </div>
    </div>
  );
}
