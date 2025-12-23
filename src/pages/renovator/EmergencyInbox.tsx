
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, MapPin, AlertTriangle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

export default function EmergencyInbox() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [renovatorId, setRenovatorId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);

    useEffect(() => {
        fetchRenovatorAndInvites();

        const channel = supabase
            .channel('renovator-invites')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'emergency_job_invites' },
                () => fetchInvites(renovatorId)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [renovatorId]);

    const fetchRenovatorAndInvites = async () => {
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: renovator } = await supabase
                .from('renovation_partners' as any)
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (renovator) {
                setRenovatorId((renovator as any).id);
                fetchInvites((renovator as any).id);
            } else {
                setError("No renovator profile found. Please register.");
                setLoading(false);
            }
        } catch (error: any) {
            console.error("Error loading renovator profile:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchInvites = async (id: string | null) => {
        if (!id) return;

        try {
            const { data, error } = await supabase
                .from('emergency_job_invites' as any)
                .select(`
            *,
            job:emergency_jobs (
              *
            )
          `)
                .eq('renovator_id', id)
                .eq('status', 'PENDING')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvites(data || []);
        } catch (e: any) {
            console.error("Error fetching invites", e);
            setError(e.message || "Failed to load invites.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (inviteId: string) => {
        try {
            // Explicit cast to 'any' to bypass TS check for RPC params if needed
            const { data, error } = await supabase.rpc('renovator_accept_job' as any, {
                p_invite_id: inviteId
            }) as any;

            if (error) throw error;

            if (data && data.success) {
                toast({ title: "Job Accepted!", description: "You have been assigned to this emergency." });
                navigate(`/renovator/jobs`);
                setSelectedJob(null);
            } else {
                // Display specific error message from backend
                toast({
                    variant: "destructive",
                    title: "Accept Failed",
                    description: data?.message || "Could not accept job."
                });
                fetchInvites(renovatorId);
            }
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleDecline = async (inviteId: string) => {
        try {
            await supabase.from('emergency_job_invites' as any).update({ status: 'DECLINED' }).eq('id', inviteId);
            toast({ title: "Declined", description: "Invite removed from your inbox." });
            fetchInvites(renovatorId);
            setSelectedJob(null);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading emergency feed...</div>;

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
                    <Zap className="h-6 w-6 text-red-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Emergency Inbox</h1>
                        <p className="text-muted-foreground">Live feed of urgent repair requests.</p>
                    </div>
                </div>
                <Badge variant={invites.length > 0 ? "destructive" : "secondary"} className="text-md px-3 py-1">
                    {invites.length} Pending
                </Badge>
            </div>

            {invites.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Emergencies</h3>
                        <p>You're all caught up! Ensure your status is "Online" to receive new invites.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {invites.map((invite) => {
                        const job = invite.job;
                        const minutesLeft = differenceInMinutes(new Date(invite.expires_at), new Date());

                        return (
                            <Card key={invite.id} className="border-red-100 shadow-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
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
                                    <CardTitle className="text-lg pt-2">{job.category || "General Repair"}</CardTitle>
                                    <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-3 pb-3">
                                    <div className="flex items-start gap-2 text-slate-600">
                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{job.unit_address}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded text-xs text-slate-500">
                                        Received {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                                    </div>
                                </CardContent>
                                <CardFooter className="grid grid-cols-2 gap-3 pt-0">
                                    <Button variant="ghost" onClick={() => setSelectedJob({ invite, job })} className="lg:col-span-2 w-full border col-span-2">
                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDecline(invite.id)} className="w-full border-red-100 text-red-600 hover:bg-red-50">
                                        Decline
                                    </Button>
                                    <Button onClick={() => handleAccept(invite.id)} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-200">
                                        ACCEPT JOB
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

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
