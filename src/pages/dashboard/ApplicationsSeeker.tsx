import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserApplications, updateApplicationStatus } from "@/services/rentalApplicationService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, XCircle, Search, RefreshCw, MapPin, DollarSign, Eye, MessageSquare } from "lucide-react";
import { messagingService } from "@/services/messagingService";

export default function ApplicationsSeekerPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getUserApplications();
      setApplications(data);
    } catch (e) {
      console.error("Failed to load applications", e);
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      const bySearch = !q ||
        a.property?.listing_title?.toLowerCase().includes(q) ||
        a.property?.city?.toLowerCase().includes(q) ||
        a.property?.state?.toLowerCase().includes(q);
      const byStatus = status === "all" || a.status === status;
      return bySearch && byStatus;
    });
  }, [applications, search, status]);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }), [applications]);

  const continueFlow = (app: any) => {
    // Determine which step to go to based on application status and progress
    let targetStep = 1;
    
    if (app.status === 'approved') {
      // If approved, go to contract signing (Step 3)
      targetStep = 3;
    } else if (app.status === 'under_review' || app.status === 'pending') {
      // If under review or pending, go to Step 2 to view/edit documents
      targetStep = 2;
    }
    
    // Navigate with step and applicationId parameters
    navigate(`/dashboard/rental-application/${app.property_id}?step=${targetStep}&applicationId=${app.id}`);
  };

  const withdraw = async (appId: string) => {
    try {
      await updateApplicationStatus(appId, 'withdrawn');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'withdrawn' } : a));
      toast.success("Application withdrawn");
    } catch (e) {
      console.error("Withdraw failed", e);
      toast.error("Failed to withdraw application");
    }
  };

  const messageLandlord = async (app: any) => {
    try {
      const convId = await messagingService.getOrCreateApplicationConversation(app.id);
      navigate(`/dashboard/messenger/${convId}`);
    } catch (e) {
      console.error('Failed to open conversation', e);
      toast.error('Could not open conversation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track your rental applications and continue the process</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total" value={stats.total} icon={FileText} />
        <StatCard title="Pending" value={stats.pending} className="text-yellow-600" />
        <StatCard title="Under Review" value={stats.under_review} className="text-blue-600" />
        <StatCard title="Approved" value={stats.approved} className="text-green-600" />
        <StatCard title="Rejected" value={stats.rejected} className="text-red-600" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search property, city, state" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">No applications found</CardContent>
          </Card>
        ) : (
          filtered.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{a.property?.listing_title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {a.property?.city}, {a.property?.state}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">${a.property?.monthly_rent?.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Applied on {new Date(a.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => messageLandlord(a)}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Message Landlord
                  </Button>
                  {a.status !== 'withdrawn' && (
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => withdraw(a.id)}>
                      <XCircle className="h-4 w-4 mr-2" /> Withdraw
                    </Button>
                  )}
                  <Button onClick={() => continueFlow(a)}>
                    <Eye className="h-4 w-4 mr-2" /> Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className = "" }: { title: string; value: number; icon?: any; className?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
    under_review: { label: 'Under Review', cls: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
    withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100 text-gray-800' },
  };
  const v = map[status] || map.pending;
  return <Badge className={`${v.cls}`}>{v.label}</Badge>;
}


