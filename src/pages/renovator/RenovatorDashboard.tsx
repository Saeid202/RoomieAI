import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Zap, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function RenovatorDashboard() {
    const [stats, setStats] = useState({
        invites: 0,
        activeJobs: 0,
        completed: 0
    });
    const [recentInvites, setRecentInvites] = useState<any[]>([]);

    const [status, setStatus] = useState("Offline");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get Renovator ID
        const { data: renovator } = await supabase
            .from('renovation_partners' as any)
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!renovator) return;

        // Fetch Availability Status
        const { data: avail } = await supabase
            .from('renovator_availability')
            .select('is_online')
            .eq('renovator_id', renovator.id)
            .single();

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
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Renovator Dashboard</h1>
                    <p className="text-muted-foreground">Manage your jobs and emergency requests</p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        <span className={`w-2 h-2 rounded-full ${status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                        {status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Emergency Invites</CardTitle>
                        <Zap className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.invites}</div>
                        <p className="text-xs text-muted-foreground">Active requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Hammer className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12m</div>
                        <p className="text-xs text-muted-foreground">Average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Active Jobs List placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 border-red-100 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Recent Emergency Invites</CardTitle>
                            <a href="/renovator/emergency" className="text-xs text-blue-600 hover:underline">View All</a>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentInvites.length > 0 ? (
                            recentInvites.map((invite) => (
                                <div key={invite.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${invite.job?.urgency === 'Immediate' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {invite.job?.urgency}
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">{invite.job?.category}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{invite.job?.description}</p>
                                        <div className="mt-1 text-xs text-slate-400">{invite.job?.unit_address}</div>
                                    </div>
                                    <a href="/renovator/emergency" className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-700">
                                        View
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                <Zap className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm">No pending invites.</p>
                                <p className="text-xs text-slate-400 mt-1">Ensure you are marked as "Online"</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Upcoming Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            No upcoming jobs scheduled.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
