
import React, { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Building2,
    ListFilter
} from "lucide-react";
import {
    EnhancedPageLayout,
    EnhancedHeader,
    StatCard
} from "@/components/ui/design-system";
import { format } from "date-fns";

export default function ReportingPreview() {
    const [ledgers, setLedgers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [leaseFilter, setLeaseFilter] = useState("all");

    useEffect(() => {
        fetchReportingData();
    }, []);

    const fetchReportingData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('rent_ledgers' as any)
                .select(`
          *,
          tenant:profiles!tenant_id(full_name, email),
          landlord:profiles!landlord_id(full_name),
          lease:lease_contracts(id, lease_start_date, lease_end_date, property:properties(listing_title))
        `)
                .order('due_date', { ascending: false });

            if (error) throw error;
            setLedgers(data || []);
        } catch (err) {
            console.error("Error fetching reporting data:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLedgers = useMemo(() => {
        return ledgers.filter(ledger => {
            const tenantName = ledger.tenant?.full_name?.toLowerCase() || "";
            const tenantEmail = ledger.tenant?.email?.toLowerCase() || "";
            const leaseId = ledger.lease_id || "";

            const matchesSearch = searchTerm === "" ||
                tenantName.includes(searchTerm.toLowerCase()) ||
                tenantEmail.includes(searchTerm.toLowerCase());

            const matchesLease = leaseFilter === "all" || leaseId === leaseFilter;

            return matchesSearch && matchesLease;
        });
    }, [ledgers, searchTerm, leaseFilter]);

    const stats = useMemo(() => {
        const paidRecords = filteredLedgers.filter(l => l.status === 'paid');
        const totalMonths = filteredLedgers.length;
        const onTimeCount = paidRecords.filter(l => l.on_time).length;
        const lateCount = paidRecords.filter(l => !l.on_time && l.status === 'paid').length;

        const totalDaysLate = paidRecords.reduce((sum, l) => sum + (l.days_late || 0), 0);
        const avgDaysLate = paidRecords.length > 0 ? (totalDaysLate / paidRecords.length).toFixed(1) : "0";

        return { totalMonths, onTimeCount, lateCount, avgDaysLate };
    }, [filteredLedgers]);

    const uniqueLeases = useMemo(() => {
        const leases: any[] = [];
        const seen = new Set();
        ledgers.forEach(l => {
            if (l.lease_id && !seen.has(l.lease_id)) {
                seen.add(l.lease_id);
                leases.push({
                    id: l.lease_id,
                    title: l.lease?.property?.listing_title || `Lease ${l.lease_id.slice(0, 8)}`
                });
            }
        });
        return leases;
    }, [ledgers]);

    return (
        <EnhancedPageLayout>
            <EnhancedHeader
                title="Internal Reporting Preview"
                subtitle="Review rent payment performance data intended for future credit bureau reporting."
            />

            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 mb-6">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="font-bold">Admin-Only Review Mode</AlertTitle>
                <AlertDescription className="text-sm">
                    This data is for internal review only and is **not** reported to Equifax or TransUnion.
                    The preview follows Phase 1 silent data collection rules.
                </AlertDescription>
            </Alert>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Reporting Months"
                    value={stats.totalMonths}
                    icon={Calendar}
                    gradient="from-blue-500 to-indigo-500"
                />
                <StatCard
                    title="On-Time Payments"
                    value={stats.onTimeCount}
                    icon={CheckCircle2}
                    gradient="from-emerald-500 to-teal-500"
                />
                <StatCard
                    title="Late Payments"
                    value={stats.lateCount}
                    icon={XCircle}
                    gradient="from-rose-500 to-red-500"
                />
                <StatCard
                    title="Avg. Days Late"
                    value={Number(stats.avgDaysLate)}
                    icon={Clock}
                    gradient="from-amber-500 to-orange-500"
                />
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                Monthly Rent Performance History
                            </CardTitle>
                            <CardDescription>
                                Detailed breakdown of recorded statuses per billing cycle
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by tenant name..."
                                    className="pl-9 w-[200px] md:w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={leaseFilter}
                                onChange={(e) => setLeaseFilter(e.target.value)}
                            >
                                <option value="all">All Leases</option>
                                {uniqueLeases.map(lease => (
                                    <option key={lease.id} value={lease.id}>{lease.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold">Tenant</TableHead>
                                    <TableHead className="font-bold">Cycle (Due Date)</TableHead>
                                    <TableHead className="font-bold">Amount Due</TableHead>
                                    <TableHead className="font-bold">Amount Paid</TableHead>
                                    <TableHead className="font-bold text-center">Status</TableHead>
                                    <TableHead className="font-bold">Method</TableHead>
                                    <TableHead className="font-bold">Paid At</TableHead>
                                    <TableHead className="font-bold text-center">On-Time</TableHead>
                                    <TableHead className="font-bold text-center">Days Late</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-32 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Clock className="h-5 w-5 animate-spin text-indigo-500" />
                                                <span>Loading reporting data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLedgers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                            No reporting history found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLedgers.map((ledger) => (
                                        <TableRow key={ledger.id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{ledger.tenant?.full_name || "Unknown"}</span>
                                                    <span className="text-[10px] text-muted-foreground">{ledger.tenant?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {ledger.due_date ? format(new Date(ledger.due_date), 'MMM yyyy (dd)') : '-'}
                                            </TableCell>
                                            <TableCell className="font-semibold">${ledger.rent_amount?.toFixed(2)}</TableCell>
                                            <TableCell className="text-slate-600 underline-offset-4 decoration-slate-300">
                                                {ledger.amount_paid ? `$${ledger.amount_paid.toFixed(2)}` : "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        ledger.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            ledger.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                ledger.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                    }
                                                >
                                                    {ledger.status?.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[11px] capitalize">
                                                {ledger.payment_method_type?.replace('_', ' ') || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-[11px] text-muted-foreground">
                                                {ledger.paid_at ? format(new Date(ledger.paid_at), 'MMM dd, HH:mm') : '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {ledger.status === 'paid' ? (
                                                    ledger.on_time ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-rose-500 mx-auto" />
                                                    )
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs">
                                                {ledger.status === 'paid' && !ledger.on_time ? (
                                                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                                                        +{ledger.days_late}d
                                                    </span>
                                                ) : (
                                                    ledger.status === 'paid' ? '0' : '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="text-[10px] text-muted-foreground text-center mt-8 pb-12 uppercase tracking-widest font-bold opacity-30">
                Internal Reporting Preview — Not Sent to Credit Bureaus
            </div>
        </EnhancedPageLayout>
    );
}
