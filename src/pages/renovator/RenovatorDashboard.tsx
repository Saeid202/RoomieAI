import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Zap, CheckCircle, Clock, AlertTriangle, RefreshCw, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function RenovatorDashboard() {
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

            // Get Renovator ID
            const { data: renovator } = await supabase
                .from('renovation_partners' as any)
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

            if (avail) setStatus(avail.is_online ? "Online" : "Offline");

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
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Renovator Dashboard</h1>
                    <p className="text-gray-500 mt-1">Live overview of your current invites and jobs.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/renovator/availability">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all border ${status === 'Online' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {status}
                        </span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-blue-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">Pending Invites</CardTitle>
                        <Zap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{stats.invites}</div>
                        <p className="text-[10px] text-blue-500 mt-1">Awaiting your response</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-600">Active Jobs</CardTitle>
                        <Hammer className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-900">{stats.activeJobs}</div>
                        <p className="text-[10px] text-orange-500 mt-1">In progress right now</p>
                    </CardContent>
                </Card>

                <Card className="border-green-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-green-600">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
                        <p className="text-[10px] text-green-500 mt-1">Lifetime total</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">Avg Response</CardTitle>
                        <Clock className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">12m</div>
                        <p className="text-[10px] text-slate-500 mt-1">Excellent speed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Invites Section */}
                <Card className="shadow-lg border-red-50">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-red-600" />
                                Recent Emergency Invites
                            </CardTitle>
                            <Link to="/renovator/emergency" className="text-xs text-blue-600 hover:underline font-bold">VIEW ALL</Link>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {recentInvites.length > 0 ? (
                            recentInvites.map((invite) => (
                                <div key={invite.id} className="flex flex-col p-4 bg-slate-50 rounded-xl border hover:border-red-200 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2 items-center">
                                            <Badge variant={invite.job?.urgency === 'Immediate' ? "destructive" : "default"} className="text-[10px] uppercase font-bold">
                                                {invite.job?.urgency}
                                            </Badge>
                                            <span className="font-bold text-slate-900">{invite.job?.category}</span>
                                        </div>
                                        <Link to="/renovator/emergency" className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full group-hover:bg-red-600 transition-colors">
                                            VIEW DETAILS
                                        </Link>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{invite.job?.description}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-auto bg-white/50 p-2 rounded">
                                        <MapPin className="h-3 w-3" />
                                        {invite.job?.unit_address}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <Zap className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-500">No Pending Invites</p>
                                <p className="text-xs text-slate-400 mt-2 max-w-[220px] mx-auto">
                                    When a landlord broadcasts an emergency, it will appear here instantly.
                                </p>
                                <div className="mt-6">
                                    <Link to="/renovator/availability">
                                        <Button variant="outline" size="sm" className="bg-white text-xs gap-2">
                                            Check Availability Status
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats / Info */}
                <div className="space-y-6">
                    <Card className="bg-blue-900 text-white border-none shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Hammer className="h-5 w-5 text-blue-300" />
                                Quick Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/renovator/jobs" className="w-full">
                                    <Button className="w-full bg-blue-700 hover:bg-blue-600 border-none h-12">
                                        Active Jobs
                                    </Button>
                                </Link>
                                <Link to="/renovator/availability" className="w-full">
                                    <Button className="w-full bg-blue-700 hover:bg-blue-600 border-none h-12">
                                        Availability
                                    </Button>
                                </Link>
                            </div>
                            <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-700/50">
                                <h4 className="text-sm font-bold flex items-center gap-2 mb-1">
                                    <Zap className="h-3 w-3 text-yellow-400" />
                                    Tip: Real-time Feed
                                </h4>
                                <p className="text-[11px] text-blue-200">
                                    You don't need to refresh this page. New invites will pop up automatically as soon as they are sent.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">Service Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">1</div>
                                <p className="text-xs text-slate-600">Be clear about arrival times when accepting a job.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">2</div>
                                <p className="text-xs text-slate-600">Take before-and-after photos for documentation.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold">3</div>
                                <p className="text-xs text-slate-600">Ensure the landlord is notified once work is complete.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
