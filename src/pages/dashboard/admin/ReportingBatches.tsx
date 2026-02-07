
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    PlayCircle,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Database
} from "lucide-react";
import {
    EnhancedPageLayout,
    EnhancedHeader,
    StatCard
} from "@/components/ui/design-system";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ReportingBatches() {
    const { toast } = useToast();
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
    const [entries, setEntries] = useState<any[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [isRunningJob, setIsRunningJob] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('credit_reporting_batches' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBatches(data || []);
        } catch (err: any) {
            console.error("Error fetching batches:", err);
            toast({
                variant: "destructive",
                title: "Error fetching batches",
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEntries = async (batchId: string) => {
        setLoadingEntries(true);
        try {
            const { data, error } = await supabase
                .from('credit_reporting_entries' as any)
                .select('*, tenant:profiles!tenant_id(full_name)')
                .eq('batch_id', batchId);

            if (error) throw error;
            setEntries(data || []);
        } catch (err: any) {
            console.error("Error fetching entries:", err);
            toast({
                variant: "destructive",
                title: "Error fetching entries",
                description: err.message
            });
        } finally {
            setLoadingEntries(false);
        }
    };

    const toggleExpand = (batchId: string) => {
        if (expandedBatch === batchId) {
            setExpandedBatch(null);
            setEntries([]);
        } else {
            setExpandedBatch(batchId);
            fetchEntries(batchId);
        }
    };

    const runDryRunJob = async () => {
        if (!confirm("Start a manual Dry-Run Job for the current period?")) return;

        setIsRunningJob(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-credit-report-batch', {});
            if (error) throw error;

            toast({
                title: "Job Started",
                description: data?.message || "Batch processing initiated."
            });

            // Refresh list after brief delay
            setTimeout(fetchBatches, 2000);
        } catch (err: any) {
            console.error("Job failed:", err);
            toast({
                variant: "destructive",
                title: "Job Failed",
                description: err.message
            });
        } finally {
            setIsRunningJob(false);
        }
    };
    const handleValidate = async (batchId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            toast({ title: "Validating Batch...", description: "Running compliance checks." });

            const { data, error } = await supabase.functions.invoke('validate-credit-report-batch', {
                body: { batchId, adminUserId: session?.user.id }
            });

            if (error) throw error;

            if (data.status === 'blocked') {
                toast({ variant: "destructive", title: "Validation Failed", description: `Batch blocked with ${data.issuesCount} issues.` });
            } else {
                toast({ title: "Validation Passed", description: "Batch is ready for review." });
            }
            fetchBatches();

        } catch (err: any) {
            console.error("Validation error:", err);
            toast({ variant: "destructive", title: "Validation Error", description: err.message });
        }
    };

    const handleManage = async (batchId: string, action: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            let loadingMsg = "Processing...";
            if (action === 'approve') loadingMsg = "Approving Batch...";
            if (action === 'block') loadingMsg = "Blocking Batch...";
            if (action.startsWith('export')) loadingMsg = "Generating Export...";

            toast({ title: loadingMsg });

            const { data, error } = await supabase.functions.invoke('manage-credit-report-batch', {
                body: { batchId, action, adminUserId: session?.user.id }
            });

            if (error) throw error;

            if (action.startsWith('export')) {
                // Trigger Download
                if (data.csv || data.data) {
                    const blob = new Blob([data.csv || JSON.stringify(data.data, null, 2)], {
                        type: action === 'export_csv' ? 'text/csv' : 'application/json'
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = data.filename || 'export.txt';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast({ title: "Export Complete", description: "File downloaded." });
                }
            } else {
                toast({ title: "Success", description: "Batch status updated." });
                fetchBatches();
            }

        } catch (err: any) {
            console.error("Action error:", err);
            toast({ variant: "destructive", title: "Action Failed", description: err.message });
        }
    };

    return (
        <EnhancedPageLayout>
            <EnhancedHeader
                title="Credit Reporting Batches"
                subtitle="Internal log of monthly reporting jobs (Dry Run Mode)"
                actionButton={
                    <Button onClick={runDryRunJob} disabled={isRunningJob} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        {isRunningJob ? <Clock className="animate-spin h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                        Run Manual Job
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Batch History</CardTitle>
                        <CardDescription>
                            List of scheduled generation tasks. All data is internally stored and NOT sent to bureaus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Disclaimer Banner */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Export Only Mode:</strong> No credit bureau submission is currently enabled. All "exports" generate downloadable files for internal review only.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Reporting Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead>Records</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                                ) : batches.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No reporting batches found.</TableCell></TableRow>
                                ) : (
                                    batches.map(batch => (
                                        <React.Fragment key={batch.id}>
                                            <TableRow className={expandedBatch === batch.id ? "bg-slate-50 border-b-0" : ""}>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(batch.id)}>
                                                        {expandedBatch === batch.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-mono font-medium">{batch.reporting_period}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`
                                        ${batch.status === 'completed' || batch.status === 'dry_run_completed' ? 'bg-slate-100 text-slate-700' : ''}
                                        ${batch.status === 'ready_for_review' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                                        ${batch.status === 'approved_for_export' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                        ${batch.status === 'exported' ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}
                                        ${batch.status === 'blocked' || batch.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                    `}>
                                                        {batch.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                        {batch.dry_run ? "DRY RUN" : "LIVE"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{batch.record_count}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {format(new Date(batch.created_at), "MMM d, yyyy HH:mm")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(batch.status === 'completed' || batch.status === 'dry_run_completed') && (
                                                            <Button size="sm" variant="outline" onClick={() => handleValidate(batch.id)}>
                                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Validate
                                                            </Button>
                                                        )}
                                                        {batch.status === 'ready_for_review' && (
                                                            <>
                                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleManage(batch.id, 'block')}>
                                                                    Block
                                                                </Button>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleManage(batch.id, 'approve')}>
                                                                    Approve
                                                                </Button>
                                                            </>
                                                        )}
                                                        {(batch.status === 'approved_for_export' || batch.status === 'exported') && (
                                                            <>
                                                                <Button size="sm" variant="outline" onClick={() => handleManage(batch.id, 'export_csv')}>
                                                                    <FileText className="h-3 w-3 mr-1" /> CSV
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => handleManage(batch.id, 'export_json')}>
                                                                    <Database className="h-3 w-3 mr-1" /> JSON
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedBatch === batch.id && (
                                                <TableRow className="bg-slate-50">
                                                    <TableCell colSpan={7} className="p-4 pt-0">
                                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                                            {/* Entries Panel */}
                                                            <div className="rounded-md border bg-white p-4">
                                                                <h4 className="flex items-center gap-2 font-semibold mb-4 text-sm text-slate-700">
                                                                    <Database className="h-4 w-4" />
                                                                    Generated Payloads ({entries.length})
                                                                </h4>

                                                                {loadingEntries ? (
                                                                    <div className="text-center py-4 text-sm">Loading entries...</div>
                                                                ) : entries.length === 0 ? (
                                                                    <div className="text-center py-4 text-sm text-muted-foreground">No records in this batch.</div>
                                                                ) : (
                                                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                                        {entries.map(entry => (
                                                                            <div key={entry.id} className="text-xs font-mono bg-slate-100 p-2 rounded border border-slate-200">
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="font-bold text-slate-700">{entry.tenant?.full_name || "Unknown Tenant"}</span>
                                                                                    <span className="text-slate-500">{entry.status}</span>
                                                                                </div>
                                                                                <pre className="whitespace-pre-wrap text-[10px] text-slate-600 overflow-x-auto">
                                                                                    {JSON.stringify(entry.payload, null, 2)}
                                                                                </pre>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Issues & Audit Panel */}
                                                            <div className="space-y-4">
                                                                {/* Issues (if blocked or validation warnings) */}
                                                                <div className="rounded-md border bg-white p-4">
                                                                    <h4 className="flex items-center gap-2 font-semibold mb-2 text-sm text-slate-700">
                                                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                                        Compliance Issues
                                                                    </h4>
                                                                    <div className="text-sm text-muted-foreground italic mb-2">Feature coming soon: Validation issues list</div>
                                                                </div>

                                                                {/* Audit Logs */}
                                                                <div className="rounded-md border bg-white p-4">
                                                                    <h4 className="flex items-center gap-2 font-semibold mb-2 text-sm text-slate-700">
                                                                        <FileText className="h-4 w-4" />
                                                                        Audit Log
                                                                    </h4>
                                                                    <div className="text-sm text-muted-foreground italic">Feature coming soon: Audit trail</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </EnhancedPageLayout>
    );
}
