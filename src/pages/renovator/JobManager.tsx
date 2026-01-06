import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hammer, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, Zap, Eye, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmergencyChat } from "@/components/renovator/EmergencyChat";

export default function JobManager() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { jobId } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [renovatorId, setRenovatorId] = useState<string | null>(null);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [activeChatJobId, setActiveChatJobId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('job-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_jobs' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_job_invites' }, () => fetchData())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchData = async () => {
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Renovator ID
            const { data: renovatorData, error: renError } = await supabase
                .from('renovation_partners' as any)
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (renError) {
                console.error("Renovator fetch error:", renError);
            }

            const renovator = renovatorData as any;

            if (!renovator) {
                setError("No renovator profile found. Please complete your registration.");
                setLoading(false);
                return;
            }
            setRenovatorId(renovator.id);

            // 1. Fetch Active Jobs (Assigned to me)
            const { data: jobs, error: jobsError } = await supabase
                .from('emergency_jobs' as any)
                .select('*')
                .eq('assigned_renovator_id', renovator.id)
                .in('status', ['ASSIGNED', 'IN_PROGRESS'])
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            let currentActiveJobs = [];
            if (jobs) {
                setActiveJobs(jobs);
                currentActiveJobs = jobs;
            }

            // 2. Fetch Pending Invites (New Requests)
            const { data: invites, error: inviteError } = await supabase
                .from('emergency_job_invites' as any)
                .select(`
                    *,
                    job:emergency_jobs (
                        *
                    )
                `)
                .eq('renovator_id', renovator.id)
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false });

            if (inviteError) throw inviteError;

            if (invites) {
                setPendingInvites(invites);

                // Smart Tab Switching:
                if (currentActiveJobs.length === 0 && invites.length > 0) {
                    setActiveTab("requests");
                }
            }

        } catch (error: any) {
            console.error("Error fetching jobs:", error);
            setError(error.message || "Failed to load jobs.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-open job details if jobId is in URL
    useEffect(() => {
        if (jobId && !loading) {
            // Check in active jobs
            const activeJob = activeJobs.find(j => j.id === jobId);
            if (activeJob) {
                setSelectedJob({ job: activeJob, invite: null });
                return;
            }

            // Check in pending invites
            const invite = pendingInvites.find(i => i.job_id === jobId);
            if (invite) {
                setSelectedJob({ invite, job: invite.job });
                return;
            }

            // Fallback: If not found in memory, we might need a separate fetch for just this job
            // For now, assume it's one of the ones we fetched if the renovator is allowed to see it.
        }
    }, [jobId, loading, activeJobs, pendingInvites]);

    const handleAccept = async (inviteId: string) => {
        try {
            const { data, error } = await supabase.rpc('renovator_accept_job' as any, { p_invite_id: inviteId }) as any;
            if (error) throw error;

            if (data && data.success) {
                toast({ title: "Job Accepted!", description: "You have been assigned to this job." });
                setActiveTab("active");
                fetchData();
                setSelectedJob(null);
            } else {
                toast({ variant: "destructive", title: "Accept Failed", description: data?.message || "Could not accept job." });
                fetchData();
            }
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleDecline = async (inviteId: string) => {
        try {
            await supabase.from('emergency_job_invites' as any).update({ status: 'DECLINED' }).eq('id', inviteId);
            toast({ title: "Declined", description: "Request removed." });
            fetchData();
            setSelectedJob(null);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-10 text-center flex flex-col items-center gap-3">
        <Hammer className="h-8 w-8 text-blue-600 animate-bounce" />
        <span className="text-slate-500 font-medium">Loading your jobs...</span>
    </div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Hammer className="h-6 w-6 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">My Jobs</h1>
                        <p className="text-muted-foreground">Manage your active and pending work.</p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
                    <TabsTrigger value="active" className="font-bold">Active Jobs ({activeJobs.length})</TabsTrigger>
                    <TabsTrigger value="requests" className="relative font-bold">
                        New Requests
                        {pendingInvites.length > 0 && (
                            <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {pendingInvites.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-0 space-y-4">
                    {activeJobs.length === 0 ? (
                        <Card className="border-dashed border-2 py-16">
                            <CardContent className="text-center text-muted-foreground">
                                <Hammer className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">No Active Jobs</h3>
                                <p>When you accept a request, it will appear here for management.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        activeJobs.map(job => (
                            <Card key={job.id} className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all group overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 font-bold uppercase text-[10px]">
                                                    {job.status.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {job.id.slice(0, 8)}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.category}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveChatJobId(job.id)}
                                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                            >
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Messages
                                            </Button>
                                            <Button variant="default" size="sm" onClick={() => navigate(`/renovator/jobs/${job.id}`)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            {job.unit_address}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium px-3">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                                        <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-1">Mission Description:</span>
                                        <p className="text-slate-600 line-clamp-3 leading-relaxed">{job.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="requests" className="mt-0 space-y-4">
                    {pendingInvites.length === 0 ? (
                        <Card className="border-dashed border-2 py-16">
                            <CardContent className="text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">Queue Empty</h3>
                                <p>You have no pending emergency requests at the moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingInvites.map(invite => {
                            const job = invite.job;
                            const minutesLeft = differenceInMinutes(new Date(invite.expires_at), new Date());
                            return (
                                <Card key={invite.id} className="border-red-100 shadow-xl relative overflow-hidden transition-all hover:translate-y-[-2px]">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
                                    <CardHeader className="pb-3 px-6 pt-6">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="destructive" className="uppercase font-bold text-[10px] tracking-widest px-2">
                                                {job.urgency}
                                            </Badge>
                                            <div className={`flex items-center gap-1.5 font-bold text-sm ${minutesLeft < 15 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                                                <Clock className="h-4 w-4" />
                                                {minutesLeft > 0 ? `${minutesLeft}m left` : 'Expiring Soon'}
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl pt-3 font-bold text-slate-900">{job.category}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-slate-500 text-sm mt-1">{job.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6">
                                        <div className="flex items-start gap-2 text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium italic mb-2">
                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                                            <span>{job.unit_address}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/50 border-t p-4 flex flex-col sm:flex-row gap-3">
                                        <div className="flex gap-2 w-full sm:flex-1">
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/renovator/jobs/${job.id}`)} className="flex-1 bg-white font-bold">
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setActiveChatJobId(job.id)}
                                                className="flex-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-bold"
                                            >
                                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                                            </Button>
                                        </div>
                                        <div className="flex gap-2 w-full sm:flex-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleDecline(invite.id)} className="flex-1 text-slate-500 hover:text-red-700 hover:bg-red-50 font-bold">
                                                Decline
                                            </Button>
                                            <Button onClick={() => handleAccept(invite.id)} size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-100">
                                                Accept
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>
            </Tabs>

            {/* DETAILS DIALOG */}
            <Dialog
                open={!!selectedJob}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedJob(null);
                        // Clear jobId from URL if it was there
                        if (jobId) navigate('/renovator/jobs');
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-red-600" />
                            {selectedJob?.job.category} Professional Assessment
                        </DialogTitle>
                        <DialogDescription>
                            Complete technical details for the emergency request.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedJob && (
                        <div className="grid gap-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant={selectedJob.job.urgency === 'Immediate' ? "destructive" : "default"} className="font-bold">
                                        {selectedJob.job.urgency} Urgency
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground bg-slate-100 px-2 py-1 rounded font-bold flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        EXPIRES IN {differenceInMinutes(new Date(selectedJob.invite.expires_at), new Date())} MINUTES
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setActiveChatJobId(selectedJob.job.id);
                                        setSelectedJob(null);
                                    }}
                                    className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold shadow-sm"
                                >
                                    <MessageSquare className="h-4 w-4" /> Talk with Landlord
                                </Button>
                            </div>

                            <Card className="bg-slate-50 border-none shadow-inner p-1">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex gap-2">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                        <span className="font-bold text-slate-900">{selectedJob.job.unit_address}</span>
                                    </div>
                                    {selectedJob.job.access_instructions && (
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                            <span className="font-bold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">Access Protocol:</span>
                                            <span className="text-slate-600 italic">"{selectedJob.job.access_instructions}"</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div>
                                <h4 className="font-bold mb-2 text-slate-800 uppercase text-[10px] tracking-wider font-mono">Scope of Issue</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white border p-4 rounded-lg">
                                    {selectedJob.job.description}
                                </p>
                            </div>

                            {selectedJob.job.images && selectedJob.job.images.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-2 text-slate-800 uppercase text-[10px] tracking-wider font-mono">Visual Evidence</h4>
                                    <ScrollArea className="h-48 w-full rounded-md border p-2 bg-slate-50">
                                        <div className="flex gap-2">
                                            {selectedJob.job.images.map((url: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={url}
                                                    alt={`Job image ${idx + 1}`}
                                                    className="h-40 w-auto object-cover rounded-md shadow hover:scale-105 transition-transform"
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                        <Button variant="ghost" onClick={() => handleDecline(selectedJob!.invite.id)} className="text-slate-400 font-bold">
                            Decline Request
                        </Button>
                        <Button onClick={() => handleAccept(selectedJob!.invite.id)} className="bg-red-600 hover:bg-red-700 font-bold px-8 shadow-lg shadow-red-100">
                            Accept and Dispatch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CHAT DIALOG */}
            <Dialog open={!!activeChatJobId} onOpenChange={(open) => !open && setActiveChatJobId(null)}>
                <DialogContent className="p-0 border-none max-w-lg bg-transparent shadow-none">
                    {activeChatJobId && (
                        <EmergencyChat
                            jobId={activeChatJobId}
                            onClose={() => setActiveChatJobId(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
