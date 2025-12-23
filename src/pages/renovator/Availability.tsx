import { useEffect, useState } from "react";
import { Clock, Zap, RefreshCw, AlertTriangle, CloudOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function Availability() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [lastError, setLastError] = useState<string | null>(null);
    const [availabilityId, setAvailabilityId] = useState<string | null>(null);
    const [renovatorId, setRenovatorId] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(true);
    const [status, setStatus] = useState({
        is_online: false,
        emergency_available: false
    });

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        setLoading(true);
        setLastError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 1. Get Renovator ID
            const { data: renovator, error: renError } = await supabase
                .from('renovation_partners' as any)
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (renError || !renovator) {
                console.warn("Renovator profile not found for user:", user.id);
                setIsRegistered(false);
                setLoading(false);
                return;
            }
            setIsRegistered(true);
            setRenovatorId(renovator.id);

            // 2. Get/Create Availability Record
            await ensureAvailabilityRecord(renovator.id);

        } catch (error: any) {
            console.error("Fetch error:", error);
            setLastError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const ensureAvailabilityRecord = async (renId: string) => {
        try {
            const { data: avail, error } = await supabase
                .from('renovator_availability' as any)
                .select('*')
                .eq('renovator_id', renId)
                .maybeSingle();

            if (avail) {
                setAvailabilityId(avail.id);
                setStatus({
                    is_online: avail.is_online,
                    emergency_available: avail.emergency_available
                });
                return avail.id;
            } else {
                // Create if not exists
                console.log("Creating default availability record...");
                const { data: newAvail, error: createError } = await supabase
                    .from('renovator_availability' as any)
                    .insert({ renovator_id: renId, is_online: true, emergency_available: true })
                    .select()
                    .single();

                if (createError) throw createError;

                if (newAvail) {
                    setAvailabilityId(newAvail.id);
                    setStatus({
                        is_online: newAvail.is_online,
                        emergency_available: newAvail.emergency_available
                    });
                    return newAvail.id;
                }
            }
        } catch (e: any) {
            console.error("Error ensuring availability record:", e);
            throw e;
        }
        return null;
    };

    const toggleStatus = async (key: 'is_online' | 'emergency_available', value: boolean) => {
        // Optimistic UI
        setStatus(prev => ({ ...prev, [key]: value }));
        setLastError(null);

        try {
            // Auto-recovery: If ID is missing, try to find/create it again 
            let targetId = availabilityId;
            if (!targetId && renovatorId) {
                targetId = await ensureAvailabilityRecord(renovatorId);
            }

            if (!targetId) {
                throw new Error("Could not establish connection to availability record.");
            }

            const { error } = await supabase
                .from('renovator_availability' as any)
                .update({ [key]: value })
                .eq('id', targetId);

            if (error) throw error;

            toast({
                title: "Status Updated",
                description: `${key === 'is_online' ? 'Online Status' : 'Emergency Mode'} is now ${value ? 'ON' : 'OFF'}`
            });
        } catch (e: any) {
            console.error("Update failed:", e);
            setLastError(e.message || "Unknown update error");
            toast({ variant: "destructive", title: "Update Failed", description: e.message });
            // Revert UI
            setStatus(prev => ({ ...prev, [key]: !value }));
        }
    };

    const createProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('self_register_renovator' as any);
            if (error) throw error;

            const result = data as any;

            if (result && result.success) {
                toast({ title: "Profile Created", description: "You are now registered as a renovator." });
                fetchAvailability(); // Refresh
            } else {
                throw new Error(result?.message || "Failed to create profile");
            }
        } catch (e: any) {
            console.error("Profile creation failed:", e);
            toast({ variant: "destructive", title: "Error", description: e.message });
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <p>Loading availability settings...</p>
            </div>
        </div>
    );

    if (!isRegistered) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-md flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-lg">Renovator Profile Not Found</h3>
                        <p className="mt-2">Your user account is not currently linked to a registered Renovator profile.</p>
                        <p className="mt-1">Please ensure you have run the migration scripts, or create a default profile now.</p>

                        <div className="flex gap-3 mt-4">
                            <Button
                                onClick={createProfile}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                                <Zap className="mr-2 h-4 w-4" /> Create Profile Now
                            </Button>
                            <Button variant="outline" className="bg-white" onClick={fetchAvailability}>Check Again</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {lastError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <CloudOff className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold">Error Saving Status:</p>
                            <p className="font-mono text-xs mt-1 bg-white p-2 border rounded">{lastError}</p>
                            <div className="mt-2 text-sm">
                                <p>Possible Fixes:</p>
                                <ul className="list-disc pl-4 mt-1">
                                    <li>Run the database migration script (`fix_availability_rls.sql`).</li>
                                    <li>Check your internet connection.</li>
                                </ul>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 bg-white hover:bg-red-50"
                                onClick={fetchAvailability}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-slate-600" />
                <h1 className="text-3xl font-bold">Availability & Schedule</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${status.is_online ? 'bg-green-500' : 'bg-slate-300'}`} />
                            General Status
                        </CardTitle>
                        <CardDescription>Are you available to accept jobs right now?</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Label htmlFor="online-mode" className="font-medium">Online Status</Label>
                        <Switch
                            id="online-mode"
                            checked={status.is_online}
                            onCheckedChange={(checked) => toggleStatus('is_online', checked)}
                        />
                    </CardContent>
                </Card>

                <Card className={`border ${status.emergency_available ? 'border-red-200 bg-red-50/10' : ''}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className={`h-5 w-5 ${status.emergency_available ? 'text-red-600' : 'text-slate-400'}`} />
                            Emergency Availability
                        </CardTitle>
                        <CardDescription>Receive instant push notifications for urgent jobs.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <Label htmlFor="emergency-mode" className="font-medium">Accept Emergencies</Label>
                        <Switch
                            id="emergency-mode"
                            checked={status.emergency_available}
                            onCheckedChange={(checked) => toggleStatus('emergency_available', checked)}
                            className="data-[state=checked]:bg-red-600"
                        />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Set your standard operating hours.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-slate-500 italic">Weekly schedule editor coming soon...</div>
                </CardContent>
            </Card>
        </div>
    );
}
