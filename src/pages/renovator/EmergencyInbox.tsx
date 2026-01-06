
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, MapPin, AlertTriangle, Eye, MessageSquare } from "lucide-react";
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
import { EmergencyChat } from "@/components/renovator/EmergencyChat";

export default function EmergencyInbox() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [renovatorId, setRenovatorId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [activeChatJobId, setActiveChatJobId] = useState<string | null>(null);

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
            const { data, error } = await supabase.rpc('renovator_accept_job' as any, {
                p_invite_id: inviteId
            }) as any;

            if (error) throw error;

            if (data && data.success) {
                toast({ title: "Job Accepted!", description: "You have been assigned to this emergency." });
                navigate(`/renovator/jobs`);
                setSelectedJob(null);
            } else {
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

    if (loading) return <div className="p-10 text-center flex flex-col items-center gap-3">
        <Zap className="h-8 w-8 text-red-600 animate-pulse" />
        <span className="text-slate-500 font-medium">Loading emergency feed...</span>
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
                    <Zap className="h-6 w-6 text-red-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Emergency Inbox</h1>
                        <p className="text-muted-foreground">Live feed of urgent repair requests.</p>
                    </div>
                </div>
                <Badge variant={invites.length > 0 ? "destructive" : "secondary"} className="text-sm px-4 py-1.5 rounded-full font-bold">
                    {invites.length} Pending
                </Badge>
            </div>

            {invites.length === 0 ? (
                <Card className="border-dashed border-2 py-12">
                    <CardContent className="text-center text-muted-foreground">
                        <Zap className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Emergencies</h3>
                        <p className="max-w-md mx-auto">
                            You're all caught up! New emergency repair requests will appear here as soon as they are broadcasted.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {invites.map((invite) => {
                        const job = invite.job;
                        const minutesLeft = differenceInMinutes(new Date(invite.expires_at), new Date());

                        return (
                            <Card key={invite.id} className="border-red-100 shadow-lg relative overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="destructive" className="uppercase text-[10px] font-bold">
                                            {job.urgency}
                                        </Badge>
                                        <div className={`flex items-center gap-1 font-bold text-xs ${minutesLeft < 15 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                                            <Clock className="h-3.5 w-3.5" />
                                            {minutesLeft > 0 ? `${minutesLeft}m left` : 'Expired'}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg pt-2 font-bold">{job.category || "General Repair"}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-slate-600">{job.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4 pb-4">
                                    <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                                        <span>{job.unit_address}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                        Received {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 pt-0 border-t bg-slate-50/50 p-4">
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedJob({ invite, job })} className="w-full bg-white font-semibold">
                                            <Eye className="mr-2 h-4 w-4" /> Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveChatJobId(job.id)}
                                            className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
                                        >
                                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <Button variant="ghost" size="sm" onClick={() => handleDecline(invite.id)} className="w-full text-slate-500 hover:text-red-700 hover:bg-red-50">
                                            Decline
                                        </Button>
                                        <Button onClick={() => handleAccept(invite.id)} size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 font-bold">
                                            ACCEPT JOB
                                        </Button>
                                    </div>
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
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-red-600" />
                            {selectedJob?.job.category} Request Details
                        </DialogTitle>
                        <DialogDescription>
                            Review the request and message the landlord for clarifications before accepting.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedJob && (
                        <div className="grid gap-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant={selectedJob.job.urgency === 'Immediate' ? "destructive" : "default"}>
                                        {selectedJob.job.urgency} Urgency
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-slate-100 px-2 py-1 rounded">
                                        <Clock className="h-3 w-3" />
                                        Expires in {differenceInMinutes(new Date(selectedJob.invite.expires_at), new Date())} min
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setActiveChatJobId(selectedJob.job.id);
                                        setSelectedJob(null);
                                    }}
                                    className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    <MessageSquare className="h-4 w-4" /> Message Landlord
                                </Button>
                            </div>

                            <Card className="bg-slate-50 border-none shadow-inner">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex gap-2">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                        <span className="font-bold text-slate-900">{selectedJob.job.unit_address}</span>
                                    </div>
                                    {selectedJob.job.access_instructions && (
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 text-sm">
                                            <span className="font-bold text-slate-800 block mb-1 uppercase text-[10px] tracking-wider">Access Instructions:</span>
                                            <span className="text-slate-700">{selectedJob.job.access_instructions}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div>
                                <h4 className="font-bold mb-2 text-slate-800 uppercase text-[10px] tracking-wider">Work Description</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border">
                                    {selectedJob.job.description}
                                </p>
                            </div>

                            {selectedJob.job.images && selectedJob.job.images.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-2 text-slate-800 uppercase text-[10px] tracking-wider">Photos</h4>
                                    <ScrollArea className="h-48 w-full rounded-md border p-2 bg-slate-50">
                                        <div className="flex gap-2">
                                            {selectedJob.job.images.map((url: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={url}
                                                    alt={`Job image ${idx + 1}`}
                                                    className="h-40 w-auto object-cover rounded-lg shadow-sm hover:scale-105 transition-transform"
                                                />
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-0 border-t pt-4">
                        <Button variant="ghost" onClick={() => handleDecline(selectedJob!.invite.id)} className="text-slate-500">
                            Decline This Request
                        </Button>
                        <Button onClick={() => handleAccept(selectedJob!.invite.id)} className="bg-red-600 hover:bg-red-700 font-bold px-8">
                            ACCEPT AND START JOB
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
