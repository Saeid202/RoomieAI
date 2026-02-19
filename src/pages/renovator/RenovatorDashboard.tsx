import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Zap, CheckCircle, Clock, AlertTriangle, RefreshCw, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MasterBox } from "@/components/dashboard/MasterBox";
import { SubFeatureButton } from "@/components/dashboard/SubFeatureButton";
import { User, Bell, Briefcase, Calendar, Calculator, Bot, MessageSquare, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RenovatorDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        invites: 0,
        activeJobs: 0,
        completed: 0
    });
    const [recentInvites, setRecentInvites] = useState<any[]>([]);
    const [status, setStatus] = useState("Offline");
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(true);

    useEffect(() => {
        fetchStats();

        // Real-time subscription for new invites
        const channel = supabase
            .channel('dashboard-invites-v2')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'emergency_job_invites' },
                () => {
                    console.log("Real-time update: Refreshing dashboard stats...");
                    fetchStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Check User Profile Role
            const { data: profile } = await (supabase as any)
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            const userRole = (profile as any)?.role || user.user_metadata?.role;
            const isAdmin = userRole === 'admin';

            // Temporarily disabled - allow access for testing
            // if (userRole !== 'renovator' && !isAdmin) {
            //     console.warn("Unauthorized access to renovator dashboard. Redirecting...");
            //     window.location.href = userRole === 'landlord' ? '/dashboard/landlord' : '/dashboard/roommate-recommendations';
            //     return;
            // }

            console.log("RenovatorDashboard - User role:", userRole, "Is Admin:", isAdmin);

            // 2. Get Renovator ID record
            const { data: renovator } = await (supabase as any)
                .from('renovation_partners')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!renovator) {
                setIsRegistered(false);
                setLoading(false);
                return;
            }

            setIsRegistered(true);

            // Fetch Availability Status
            const { data: avail } = await supabase
                .from('renovator_availability' as any)
                .select('is_online')
                .eq('renovator_id', renovator.id)
                .maybeSingle();

            if (avail) setStatus((avail as any).is_online ? "Online" : "Offline");

            // Fetch Invites Count & Data
            const { data: invitesData, count: invitesCount } = await supabase
                .from('emergency_job_invites' as any)
                .select(`
                    *,
                    job:emergency_jobs (
                        category, urgency, unit_address, description
                    )
                `, { count: 'exact' })
                .eq('renovator_id', renovator.id)
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false })
                .limit(3);

            if (invitesData) setRecentInvites(invitesData);

            // Fetch Active Jobs Count
            const { count: jobsCount } = await supabase
                .from('emergency_jobs' as any)
                .select('*', { count: 'exact', head: true })
                .eq('assigned_renovator_id', renovator.id)
                .in('status', ['ASSIGNED', 'IN_PROGRESS']);

            // Fetch Completed Jobs Count
            const { count: completedCount } = await supabase
                .from('emergency_jobs' as any)
                .select('*', { count: 'exact', head: true })
                .eq('assigned_renovator_id', renovator.id)
                .eq('status', 'COMPLETED');

            setStats({
                invites: invitesCount || 0,
                activeJobs: jobsCount || 0,
                completed: completedCount || 0
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-slate-500 font-medium">Updating Dashboard Data...</span>
        </div>
    );

    if (!isRegistered) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-dashed border-2 border-yellow-200 bg-yellow-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-6 w-6" />
                            Renovator Profile Missing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-yellow-900">
                            We couldn't find a renovator profile linked to your account. You need a profile to receive emergency repair invites.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <Link to="/renovator/availability">
                                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    Set Up Profile
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={fetchStats}>I already have one (Retry)</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
              Your all-in-one platform for emergency repairs, job management, and building your renovation business.
            </p>
          </div>
        </div>

        {/* Short Explanation */}
        <div className="text-center relative z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 border-2 border-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-gray-800 text-lg leading-relaxed relative z-10 font-medium">
              Roomie AI brings every step of renovation work into one secure platform — from receiving emergency jobs to managing your schedule and handling tax compliance. The sections below guide you through each stage of your renovator journey.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Renovator Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/renovator/availability">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all border ${status === 'Online' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200' : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200 hover:from-slate-200 hover:to-gray-200'}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${status === 'Online' ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-slate-400 to-gray-400'}`}></span>
              {status}
            </span>
          </Link>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Profile Master Box */}
        <MasterBox
          title="1. Profile"
          description="Manage your renovator profile and credentials."
          icon={User}
          onClick={() => navigate("/renovator/profile")}
        />

        {/* Emergency Inbox Master Box */}
        <MasterBox
          title="2. Emergency Inbox"
          description="View and respond to emergency repair requests."
          icon={Bell}
          onClick={() => navigate("/renovator/emergency")}
        />

        {/* Jobs Master Box */}
        <MasterBox
          title="3. Jobs"
          description="Track your active and completed renovation jobs."
          icon={Briefcase}
          onClick={() => navigate("/renovator/jobs")}
        />

        {/* Tax Intelligence Master Box */}
        <MasterBox
          title="4. Availability"
          description="Set your availability and working schedule."
          icon={Calendar}
          onClick={() => navigate("/renovator/availability")}
        />

        {/* Service Area Master Box */}
        <MasterBox
          title="5. Tax Intelligence"
          description="AI-powered tax assistance and financial insights."
          icon={Calculator}
          onClick={() => navigate("/renovator/tax-intelligence")}
        />
        
      </div>
    </div>
  );
}
