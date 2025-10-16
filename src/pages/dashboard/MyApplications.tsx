import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Mock data structures
interface Application {
  id: string;
  property_id: string;
  property_name: string;
  property_location: string;
  property_price: number;
  status: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  applied_date: string;
  property_image?: string;
}

// Mock fetch function
const fetchUserApplications = async (userId: string): Promise<Application[]> => {
  console.log(`Fetching applications for user ${userId}`);
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          id: "app_1",
          property_id: "prop_123",
          property_name: "Cozy Downtown Apartment",
          property_location: "Toronto, ON",
          property_price: 2200,
          status: "pending",
          applied_date: "2025-10-10",
          property_image: "/placeholder.svg",
        },
        {
          id: "app_2",
          property_id: "prop_456",
          property_name: "Spacious Suburban Home",
          property_location: "Mississauga, ON",
          property_price: 3500,
          status: "approved",
          applied_date: "2025-09-25",
          property_image: "/placeholder.svg",
        },
        {
          id: "app_3",
          property_id: "prop_789",
          property_name: "Modern Loft with a View",
          property_location: "Brampton, ON",
          property_price: 2800,
          status: "rejected",
          applied_date: "2025-09-18",
          property_image: "/placeholder.svg",
        },
      ]);
    }, 500)
  );
};

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  useEffect(() => {
    let filtered = applications;
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.property_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const loadApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserApplications(user.id);
      setApplications(data);
    } catch (error) {
      toast.error("Failed to load applications.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Application["status"]) => {
    const statusMap = {
      pending: { variant: "secondary", text: "Pending", className: "bg-yellow-100 text-yellow-800" },
      under_review: { variant: "secondary", text: "Under Review", className: "bg-blue-100 text-blue-800" },
      approved: { variant: "secondary", text: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { variant: "destructive", text: "Rejected", className: "bg-red-100 text-red-800" },
      withdrawn: { variant: "outline", text: "Withdrawn", className: "bg-gray-100 text-gray-800" },
    };
    return <Badge variant={statusMap[status].variant as any} className={statusMap[status].className}>{statusMap[status].text}</Badge>;
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track your rental applications.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadApplications} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by property or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p>Loading applications...</p>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={app.property_image}
                    alt={app.property_name}
                    className="h-16 w-16 object-cover rounded-md hidden sm:block"
                  />
                  <div>
                    <h3 className="font-semibold">{app.property_name}</h3>
                    <p className="text-sm text-muted-foreground">{app.property_location}</p>
                    <p className="text-sm font-bold text-primary">${app.property_price}/month</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center hidden md:block">
                    <p className="text-sm text-muted-foreground">Applied on</p>
                    <p className="font-medium">{new Date(app.applied_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">{getStatusBadge(app.status)}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Withdraw</Button>
                    <Button variant="default" size="sm" asChild>
                      <Link to={`/dashboard/application-overview/${app.property_id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Status
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold">No Applications Found</h3>
              <p className="text-muted-foreground mt-2">Your submitted applications will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
