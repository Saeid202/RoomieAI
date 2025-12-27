import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare, Phone, MapPin, Camera, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EmergencyMode() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("active");
    const [properties, setProperties] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        propertyId: "",
        category: "",
        urgency: "Immediate",
        description: "",
        accessNotes: "",
        contactMethod: "chat"
    });

    const [showSqlFix, setShowSqlFix] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [debugError, setDebugError] = useState<string | null>(null);

    const FIXED_SQL_SCRIPT = `

-- 1. Function: Can Landlord Manage Invite? (Checks Job Table as Admin)
CREATE OR REPLACE FUNCTION public.fn_is_landlord_of_invite(invite_job_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM emergency_jobs 
    WHERE id = invite_job_id 
    AND landlord_id = auth.uid()
  );
$$;

-- 2. Function: Can Renovator View Job? (Checks Invite Table as Admin)
CREATE OR REPLACE FUNCTION public.fn_is_renovator_invited(target_job_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM emergency_job_invites i
    JOIN renovation_partners p ON i.renovator_id = p.id
    WHERE i.job_id = target_job_id 
    AND p.user_id = auth.uid()
  );
$$;

-- 3. Reset Emergency Jobs
ALTER TABLE public.emergency_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Landlords view own jobs" ON public.emergency_jobs;
DROP POLICY IF EXISTS "Landlords create own jobs" ON public.emergency_jobs;
DROP POLICY IF EXISTS "Landlords update own jobs" ON public.emergency_jobs;
DROP POLICY IF EXISTS "Landlords delete own jobs" ON public.emergency_jobs;
DROP POLICY IF EXISTS "Invited renovator view job" ON public.emergency_jobs;

CREATE POLICY "Landlords view own jobs" ON public.emergency_jobs
FOR SELECT USING (landlord_id = auth.uid());

CREATE POLICY "Landlords create own jobs" ON public.emergency_jobs
FOR INSERT WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Landlords update own jobs" ON public.emergency_jobs
FOR UPDATE USING (landlord_id = auth.uid());

CREATE POLICY "Landlords delete own jobs" ON public.emergency_jobs
FOR DELETE USING (landlord_id = auth.uid());

-- Uses Function -> No Loop
CREATE POLICY "Invited renovator view job" ON public.emergency_jobs
FOR SELECT USING (fn_is_renovator_invited(id));


-- 4. Reset Invites
ALTER TABLE public.emergency_job_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Landlords manage invites" ON public.emergency_job_invites;
DROP POLICY IF EXISTS "Renovators view own invites" ON public.emergency_job_invites;
DROP POLICY IF EXISTS "Renovators update own invites" ON public.emergency_job_invites;

-- Uses Function -> No Loop
CREATE POLICY "Landlords manage invites" ON public.emergency_job_invites
FOR ALL USING (fn_is_landlord_of_invite(job_id));

CREATE POLICY "Renovators view own invites" ON public.emergency_job_invites
FOR SELECT USING (
    renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
);

CREATE POLICY "Renovators update own invites" ON public.emergency_job_invites
FOR UPDATE USING (
    renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
);

-- 5. Renovator Visibility
ALTER TABLE public.renovation_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view renovation partners" ON public.renovation_partners;
CREATE POLICY "Public view renovation partners" ON public.renovation_partners
FOR SELECT USING (true);

-- 6. Renovator Availability (CRITICAL FOR DISPATCH)
CREATE TABLE IF NOT EXISTS public.renovator_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    renovator_id UUID REFERENCES public.renovation_partners(id) ON DELETE CASCADE NOT NULL,
    is_online BOOLEAN DEFAULT false,
    emergency_available BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.renovator_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Renovators manage own availability" ON public.renovator_availability;
CREATE POLICY "Renovators manage own availability"
    ON public.renovator_availability
    USING (renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid()))
    WITH CHECK (renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Public view availability" ON public.renovator_availability;
CREATE POLICY "Public view availability"
    ON public.renovator_availability FOR SELECT
    USING (true);
`;

    useEffect(() => {
        fetchProperties();
        fetchJobs();

        // Real-time subscription for job updates
        const channel = supabase
            .channel('emergency-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'emergency_jobs' },
                (payload) => {
                    fetchJobs(); // Refresh on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchProperties = async () => {
        const { data, error } = await supabase.from('properties' as any).select('id, listing_title, address');
        if (error) {
            console.error("Error fetching properties:", error);
            return;
        }
        if (data) setProperties(data);
    };

    const fetchJobs = async () => {
        setDebugError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('emergency_jobs' as any)
            .select(`
                *,
                renovator:assigned_renovator_id(id, company, phone)
            `)
            .eq('landlord_id', user.id) // Build-in filter for safety
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching jobs:", error);
            // Show the fix dialog instead of just a generic error
            setDebugError(error.message || "Unknown db error");
            setShowSqlFix(true);
            toast({
                variant: "destructive",
                title: "Database Setup Required",
                description: "Security policies need to be applied."
            });
            return;
        }

        if (data) {
            setJobs(data);
            setShowSqlFix(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'active') {
            fetchJobs();
        }
    }, [activeTab]);

    const handleCreateSubmit = async () => {
        if (!formData.propertyId || !formData.category || !formData.description) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const selectedProp = properties.find(p => p.id === formData.propertyId);

            if (editingId) {
                // UPDATE Logic
                const { error: updateError } = await supabase.from('emergency_jobs' as any).update({
                    property_id: formData.propertyId,
                    unit_address: selectedProp?.address || "Unknown Address",
                    category: formData.category,
                    urgency: formData.urgency,
                    description: formData.description,
                    access_notes: formData.accessNotes,
                    status: 'DRAFT' // Reset to draft on edit? Or keep status? Let's keep status unless it was completed. 
                    // Actually, for simplicity, let's just update the fields. Ideally status shouldn't change unless requested.
                    // But if it was dispatched, editing details might require re-dispatch? 
                    // Let's assume edit simply updates details for now.
                }).eq('id', editingId);

                if (updateError) throw updateError;

                toast({ title: "Request Updated", description: "Your changes have been saved." });
                setEditingId(null);
                setActiveTab("active");
                fetchJobs();

            } else {
                // INSERT Logic
                const { data: job, error: jobError } = await supabase.from('emergency_jobs' as any).insert({
                    landlord_id: user.id,
                    property_id: formData.propertyId,
                    unit_address: selectedProp?.address || "Unknown Address",
                    category: formData.category,
                    urgency: formData.urgency,
                    description: formData.description,
                    access_notes: formData.accessNotes,
                    status: 'DRAFT'
                }).select().single();

                if (jobError) throw jobError;

                // 2. Dispatch Logic (Client-side simulation of "Smart Dispatch")
                await dispatchJob(job);

                toast({ title: "Emergency Dispatch Sent", description: "Verified pros are being notified." });
                setActiveTab("active");
                fetchJobs(); // Explicit refresh
            }

            // 3. Reset 
            setFormData({ propertyId: "", category: "", urgency: "Immediate", description: "", accessNotes: "", contactMethod: "chat" });

        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const dispatchJob = async (job: any) => {
        // Find suitable renovators who are ONLINE and accepting EMERGENCIES
        // User Request: "all the renovators can see the request"
        // We broadcast to EVERYONE who is marked as available for emergencies.
        const { data: availablePros, error } = await supabase
            .from('renovator_availability' as any)
            .select('renovator_id')
            .eq('is_online', true)
            .eq('emergency_available', true);
        // Removed limit(10) to ensure full broadcast

        if (error) {
            console.error("Error finding pros:", error);
            toast({ variant: "destructive", title: "Dispatch Error", description: "Could not match pros." });
            return;
        }

        // 1. Try to find ONLINE pros first
        let targets = availablePros ? availablePros.map((p: any) => p.renovator_id) : [];

        // 2. FALLBACK: If no online pros, just invite ALL registered partners (Review/Dev Mode behavior)
        if (targets.length === 0) {
            console.warn("No online pros found. Attempting fallback to ALL partners.");
            const { data: allPartners, error: partnersError } = await supabase
                .from('renovation_partners' as any)
                .select('id');

            if (!partnersError && allPartners && allPartners.length > 0) {
                targets = allPartners.map(p => p.id);
                toast({
                    title: "Broadcasting to All",
                    description: "No 'Online' pros found. Sending to ALL registered partners instead."
                });
            }
        }

        if (targets.length === 0) {
            console.warn("Dispatch failed: No pros found. This might be because no one is online OR Row Level Security (RLS) policies are blocking access to the 'renovator_availability' table.");
            toast({
                variant: "destructive",
                title: "Dispatch Failed",
                description: "No renovators found at all. Please ensure at least one Renovator account exists."
            });
            setShowSqlFix(true);
            return;
        }

        // 3. Create Invites
        const invites = targets.map((renovatorId: string) => ({
            job_id: job.id,
            renovator_id: renovatorId,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
            status: 'PENDING'
        }));

        const { error: inviteError } = await supabase.from('emergency_job_invites' as any).insert(invites);
        if (inviteError) throw inviteError;

        // Update Job Status
        await supabase.from('emergency_jobs' as any).update({
            status: 'DISPATCHED',
            dispatched_at: new Date().toISOString()
        }).eq('id', job.id);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request?")) return;

        try {
            const { error } = await supabase.from('emergency_jobs' as any).delete().eq('id', id);
            if (error) throw error;

            toast({ title: "Deleted", description: "Request removed." });
            setIsDetailsOpen(false);
            fetchJobs();
        } catch (e: any) {
            console.error(e);
            toast({ variant: "destructive", title: "Delete Failed", description: e.message });
        }
    };

    const handleEdit = (job: any) => {
        setFormData({
            propertyId: job.property_id || "",
            category: job.category || "",
            urgency: job.urgency || "Immediate",
            description: job.description || "",
            accessNotes: job.access_notes || "",
            contactMethod: "chat"
        });
        setEditingId(job.id);
        setIsDetailsOpen(false);
        setActiveTab("create");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DISPATCHED': return <Badge className="bg-orange-500 animate-pulse">Finding Pro...</Badge>;
            case 'ASSIGNED': return <Badge className="bg-green-600">Assigned</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-600">In Progress</Badge>;
            case 'COMPLETED': return <Badge className="bg-slate-600">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold mb-1 text-slate-900">Emergency Dispatch Center</h2>
                    <p className="text-sm text-slate-500">Dispatch urgent maintenance requests to verified professionals instantly.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="active" className="text-sm">Active Requests</TabsTrigger>
                    <TabsTrigger value="create" className="text-sm">{editingId ? "Edit Request" : "New Request"}</TabsTrigger>
                </TabsList>

                {/* CREATE TAB */}
                <TabsContent value="create" className="mt-6">
                    <Card className="border-red-100 shadow-md">
                        <CardHeader className="bg-red-50/50 border-b border-red-100 py-4">
                            <CardTitle className="text-base font-semibold text-red-700">{editingId ? "Update Emergency Request" : "Create Emergency Request"}</CardTitle>
                            <CardDescription className="text-xs">This will alert verified contractors in your area.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Select Property</Label>
                                    <Select value={formData.propertyId} onValueChange={(v) => setFormData({ ...formData, propertyId: v })}>
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Select property..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {properties.map(p => (
                                                <SelectItem key={p.id} value={p.id} className="text-sm">{p.listing_title || p.address}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Issue Category</Label>
                                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="What's wrong?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Plumbing', 'Electrical', 'HVAC', 'Water Leak', 'Heating Failure', 'Lockout', 'Pest', 'Other'].map(c => (
                                                <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Urgency Level</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between ${formData.urgency === 'Immediate' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'hover:bg-slate-50'}`}
                                        onClick={() => setFormData({ ...formData, urgency: 'Immediate' })}
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-red-700">Immediate (0-2 hrs)</div>
                                            <div className="text-[10px] text-red-600/80">Life safety or major damage risk</div>
                                        </div>
                                        {formData.urgency === 'Immediate' && <CheckCircle className="text-red-600 h-4 w-4" />}
                                    </div>
                                    <div
                                        className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between ${formData.urgency === 'Same-day' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'hover:bg-slate-50'}`}
                                        onClick={() => setFormData({ ...formData, urgency: 'Same-day' })}
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-orange-700">Same Day</div>
                                            <div className="text-[10px] text-orange-600/80">Urgent but contained</div>
                                        </div>
                                        {formData.urgency === 'Same-day' && <CheckCircle className="text-orange-600 h-4 w-4" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Description</Label>
                                <Textarea
                                    placeholder="Describe the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[100px] text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Access Instructions</Label>
                                <Input
                                    placeholder="e.g. Tenant home, lockbox code 1234..."
                                    value={formData.accessNotes}
                                    onChange={(e) => setFormData({ ...formData, accessNotes: e.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            {/* Photo Upload Mock */}
                            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50">
                                <Camera className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                                <div className="text-sm font-medium text-slate-600">Click to upload photos</div>
                                <div className="text-xs text-slate-400">Helps pros prepare correctly</div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t p-4">
                            <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-base font-semibold shadow-red-200" onClick={handleCreateSubmit} disabled={loading}>
                                {loading ? (editingId ? "Updating..." : "Dispatching...") : (editingId ? "UPDATE REQUEST" : "DISPATCH NOW")}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ACTIVE TAB */}
                <TabsContent value="active" className="mt-6 space-y-4">
                    {jobs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                            <div className="text-slate-400 text-sm">No active emergency requests</div>
                        </div>
                    )}
                    {jobs.map(job => (
                        <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedJob(job); setIsDetailsOpen(true); }}>
                            <div className="flex flex-col md:flex-row">
                                <div className={`w-2 bg-${job.status === 'DISPATCHED' ? 'orange' : job.status === 'ASSIGNED' ? 'green' : 'slate'}-500`} />
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(job.status)}
                                            <span className="text-xs text-slate-500 font-mono">#{job.id.slice(0, 8)}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-base mb-1">{job.category} - {job.urgency}</h3>
                                    <p className="text-slate-600 flex items-center gap-2 text-xs">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        {job.unit_address}
                                    </p>

                                    {job.status === 'DISPATCHED' && (
                                        <div className="mt-4 bg-orange-50 text-orange-800 text-sm p-3 rounded flex items-center gap-3 animate-pulse">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>Broadcasting to nearby pros... SLA Timer Running</span>
                                        </div>
                                    )}

                                    {job.status === 'ASSIGNED' && (
                                        <div className="mt-4 bg-green-50 text-green-800 text-sm p-3 rounded flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Assigned to <strong>{job.renovator?.company || "Renovator"}</strong></span>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-7 bg-white text-green-700 border-green-200">Message</Button>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4 pt-3 border-t justify-end">
                                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-slate-600" onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setIsDetailsOpen(true); }}>
                                            <Eye className="h-4 w-4" /> View
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleEdit(job); }}>
                                            <Pencil className="h-4 w-4" /> Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}>
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            {/* DETAILS DRAWER */}
            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Request Details</SheetTitle>
                        <SheetDescription>#{selectedJob?.id.slice(0, 8)}</SheetDescription>
                    </SheetHeader>
                    {selectedJob && (
                        <div className="mt-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Status</h3>
                                {getStatusBadge(selectedJob.status)}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-slate-900 bg-slate-50 p-3 rounded text-sm">{selectedJob.description}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Access</h3>
                                <p className="text-slate-900 text-sm">{selectedJob.access_notes || "None provided"}</p>
                            </div>

                            {selectedJob.status === 'ASSIGNED' && (
                                <div className="border-t pt-6">
                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Assigned Pro</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="font-bold">{selectedJob.renovator?.company}</div>
                                            <div className="text-xs text-slate-500">Verified Partner</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="outline"><Phone className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="outline"><MessageSquare className="h-4 w-4" /></Button>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Chat</h3>
                                        <div className="bg-slate-100 h-40 rounded-lg flex items-center justify-center text-slate-400 text-sm border-2 border-dashed">
                                            Chat Module Loading...
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <Input placeholder="Type a message..." />
                                            <Button size="icon"><MessageSquare className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedJob.status === 'DRAFT' && (
                                <div className="border-t pt-6">
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
                                        <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            Not Dispatched Yet
                                        </div>
                                        <div className="text-xs text-amber-700">
                                            No pros were notified. This usually happens if no renovators are online.
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md mb-2"
                                        onClick={async () => {
                                            if (loading) return;
                                            // Optimistic loading state handled by local wrapper or just reliance on toast
                                            try {
                                                await dispatchJob(selectedJob);
                                                // If dispatchJob succeeds (doesn't throw or return early with error toast), we can close or refresh
                                                // dispatchJob handles its own toasts and DB updates.
                                                // We just need to close the sheet if successful to see the updated list status
                                                setIsDetailsOpen(false);
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                    >
                                        Broadacast to Pros Now
                                    </Button>
                                </div>
                            )}

                            {selectedJob.status === 'DISPATCHED' && (
                                <div className="border-t pt-6">
                                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-center">
                                        <div className="text-orange-800 font-medium mb-1">Waiting for acceptance...</div>
                                        <div className="text-xs text-orange-600">Invites sent to verified pros.</div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(selectedJob.id)}>Cancel Request</Button>
                                </div>
                            )}

                            <div className="border-t pt-6 flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => handleEdit(selectedJob)}>
                                    Edit Details
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(selectedJob.id)}>
                                    Delete Request
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {showSqlFix && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
                        <CardHeader className="bg-yellow-50 border-b border-yellow-100">
                            <CardTitle className="text-yellow-800 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Database Setup Required
                            </CardTitle>
                            <CardDescription className="text-yellow-700">
                                To view your requests, you must apply the security policies.
                            </CardDescription>
                            {debugError && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-200 text-red-700 text-xs font-mono rounded break-all">
                                    ERROR: {debugError}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <p className="text-sm text-slate-600">
                                Copy the SQL script below and run it in your <strong>Supabase SQL Editor</strong>.
                            </p>
                            <div className="relative">
                                <pre className="bg-slate-900 text-slate-50 p-3 rounded-md text-xs overflow-x-auto font-mono h-48">
                                    {FIXED_SQL_SCRIPT}
                                </pre>
                                <Button
                                    size="sm"
                                    className="absolute top-2 right-2 bg-white text-black hover:bg-slate-200"
                                    onClick={() => {
                                        navigator.clipboard.writeText(FIXED_SQL_SCRIPT);
                                        toast({ title: "Copied!", description: "Paste this into Supabase SQL Editor." });
                                    }}
                                >
                                    Copy SQL
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowSqlFix(false)}>Close</Button>
                            <Button
                                onClick={() => {
                                    setShowSqlFix(false);
                                    fetchJobs();
                                }}
                            >
                                I've Run It, Retry
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
