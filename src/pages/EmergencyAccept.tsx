import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, MapPin, AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EmergencyAccept() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [job, setJob] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            checkInvite();
        } else {
            setError("Invalid invitation link.");
            setLoading(false);
        }
    }, [token]);

    const checkInvite = async () => {
        try {
            const { data, error } = await supabase.rpc('get_job_by_invite_token' as any, { invite_token: token });

            if (error) throw error;
            if (!(data as any).success) throw new Error((data as any).message);

            setJob((data as any).job);
        } catch (err: any) {
            setError(err.message || "Failed to load invitation.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            const { data, error } = await supabase.rpc('accept_emergency_job' as any, { invite_token: token });

            if (error) throw error;
            if (!(data as any).success) throw new Error((data as any).message);

            setSuccess(true);
            // In a real app, maybe redirect to renovator dashboard or a "Job Active" view
        } catch (err: any) {
            setError(err.message || "Failed to accept job.");
            // Re-check invite to see if it expired/taken
            checkInvite();
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-roomie-purple" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
                <Card className="w-full max-w-md border-green-200 shadow-lg">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-green-800">Job Accepted!</CardTitle>
                        <CardDescription className="text-green-700">
                            You have won this emergency job. The landlord has been notified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-slate-600">Please contact the landlord immediately to confirm your ETA.</p>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/dashboard/renovators')}>
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                <Card className="w-full max-w-md border-red-200 shadow-lg">
                    <CardHeader className="text-center">
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-red-800">Invitation Invalid</CardTitle>
                        <CardDescription className="text-red-700">{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Return Home</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl border-t-8 border-t-roomie-purple">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="mb-2 bg-red-100 text-red-700 hover:bg-red-100 border-red-200">{job.urgency} Urgency</Badge>
                            <CardTitle className="text-2xl font-bold">Emergency Request</CardTitle>
                            <CardDescription>New job opportunity available</CardDescription>
                        </div>
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 p-3 rounded">
                            <span className="text-slate-500 block text-xs uppercase mb-1">Category</span>
                            <span className="font-semibold">{job.category}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded">
                            <span className="text-slate-500 block text-xs uppercase mb-1">Posted</span>
                            <span className="font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Issue Description</h3>
                        <p className="bg-slate-50 p-4 rounded text-slate-800 border-l-4 border-roomie-purple">
                            {job.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        <span>{job.unit_address}</span>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">First to Accept Wins</AlertTitle>
                        <AlertDescription className="text-blue-700 text-xs">
                            This job is broadcast to verified pros. Acceptance is instant.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button
                        size="lg"
                        className="w-full text-lg font-bold bg-roomie-purple hover:bg-roomie-purple/90 h-14"
                        onClick={handleAccept}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <Loader2 className="animate-spin mr-2" /> : "ACCEPT JOB NOW"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

// Simple Badge Component inline if not available or import
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
}
