import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hammer, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, Zap, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function JobManager() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [renovatorId, setRenovatorId] = useState<string | null>(null);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);

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
            if (jobs) setActiveJobs(jobs);

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
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (inviteError) throw inviteError;
            if (invites) setPendingInvites(invites);

        } catch (error: any) {
            console.error("Error fetching jobs:", error);
            setError(error.message || "Failed to load jobs.");
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <div>Loading jobs...</div>;

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
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
                    <TabsTrigger value="requests" className="relative">
                        New Requests
                        {pendingInvites.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                                {pendingInvites.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6 space-y-4">
                    {activeJobs.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <Hammer className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                <h3 className="text-lg font-medium text-slate-900">No Active Jobs</h3>
                                <p>Accepted jobs will appear here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        activeJobs.map(job => (
                            <Card key={job.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                                                    {job.status.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs text-slate-400 font-mono">#{job.id.slice(0, 8)}</span>
                                            </div>
                                            <h3 className="text-xl font-bold">{job.category}</h3>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/renovator/jobs/${job.id}`)}>
                                            View Details
                                        </Button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            {job.unit_address}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-slate-50 p-3 rounded text-sm border">
                                        <span className="font-semibold text-slate-700">Description: </span>
                                        {job.description}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="requests" className="mt-6 space-y-4">
                    {pendingInvites.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                <h3 className="text-lg font-medium text-slate-900">All Caught Up</h3>
                                <p>No new job requests at the moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingInvites.map(invite => {
                            const job = invite.job;
                            const minutesLeft = differenceInMinutes(new Date(invite.expires_at), new Date());
                            return (
                                <Card key={invite.id} className="border-red-100 shadow-md relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                                {job.urgency}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-red-600 font-bold font-mono text-sm">
                                                <Clock className="h-4 w-4" />
                                                {minutesLeft > 0 ? `${minutesLeft}m left` : 'Expiring...'}
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg pt-2">{job.category}</CardTitle>
                                        <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-3">
                                        <div className="flex items-start gap-2 text-slate-600">
                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>{job.unit_address}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-0">
                                        <Button variant="ghost" onClick={() => setSelectedJob({ invite, job })} className="lg:col-span-2 w-full border">
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </Button>
                                        <Button variant="outline" onClick={() => handleDecline(invite.id)} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Decline
                                        </Button>
                                        <Button onClick={() => handleAccept(invite.id)} className="w-full bg-red-600 hover:bg-red-700 text-white">
                                            Accept
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>
            </Tabs>

            {/* DETAILS DIALOG */}
            <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedJob?.job.category} Request</DialogTitle>
                        <DialogDescription>
                            Review the details before accepting.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedJob && (
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-2">
                                <Badge variant={selectedJob.job.urgency === 'HIGH' ? "destructive" : "default"}>
                                    {selectedJob.job.urgency} Urgency
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Expires in {differenceInMinutes(new Date(selectedJob.invite.expires_at), new Date())} minutes
                                </span>
                            </div>

                            <Card className="bg-slate-50 border-none">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex gap-2">
                                        <MapPin className="h-5 w-5 text-slate-500" />
                                        <span className="font-medium">{selectedJob.job.unit_address}</span>
                                    </div>
                                    {selectedJob.job.access_instructions && (
                                        <div className="text-sm text-slate-600 ml-7">
                                            <span className="font-semibold">Access:</span> {selectedJob.job.access_instructions}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedJob.job.description}
                                </p>
                            </div>

                            {selectedJob.job.images && selectedJob.job.images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Attached Images</h4>
                                    <ScrollArea className="h-48 w-full rounded-md border p-2">
                                        <div className="flex gap-2">
                                            {selectedJob.job.images.map((url: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={url}
                                                    alt={`Job image ${idx + 1}`}
                                                    className="h-40 w-auto object-cover rounded shadow-sm hover:scale-105 transition-transform"
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => handleDecline(selectedJob!.invite.id)}>
                            Decline Request
                        </Button>
                        <Button onClick={() => handleAccept(selectedJob!.invite.id)} className="bg-red-600 hover:bg-red-700">
                            Accept Job
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
