import { useState, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Bell,
  Mail,
  Phone,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Target,
  Loader2,
  AlertCircle,
  Info,
  Zap,
  FileText,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";

interface LateFee {
  id: string;
  rentPaymentId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  originalAmount: number;
  lateFeeAmount: number;
  totalAmount: number;
  dueDate: string;
  lateDate: string;
  daysLate: number;
  status: 'pending' | 'paid' | 'waived' | 'disputed';
  createdAt: string;
  paidDate?: string;
  metadata: {
    propertyName: string;
    tenantName: string;
    landlordName: string;
    lateFeeRate: number;
    gracePeriodDays: number;
    maxLateFeeDays: number;
    paymentMethodId?: string;
    transactionId?: string;
  };
}

interface LateFeePolicy {
  id: string;
  landlordId: string;
  propertyId: string;
  gracePeriodDays: number;
  lateFeeRate: number;
  maxLateFeeDays: number;
  maxLateFeeAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LateFeeAnalytics {
  totalLateFees: number;
  totalCollected: number;
  totalWaived: number;
  totalDisputed: number;
  averageLateFee: number;
  averageDaysLate: number;
  successRate: number;
  monthlyTrend: Array<{
    month: string;
    lateFees: number;
    collected: number;
    waived: number;
  }>;
  topProperties: Array<{
    propertyId: string;
    propertyName: string;
    lateFeeCount: number;
    totalAmount: number;
  }>;
}

export default function LateFeeManagementPage() {
  const [lateFees, setLateFees] = useState<LateFee[]>([]);
  const [policies, setPolicies] = useState<LateFeePolicy[]>([]);
  const [analytics, setAnalytics] = useState<LateFeeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showWaiveFee, setShowWaiveFee] = useState(false);
  const [selectedLateFee, setSelectedLateFee] = useState<LateFee | null>(null);
  const [waiveReason, setWaiveReason] = useState("");

  // Form state for policy creation
  const [policyForm, setPolicyForm] = useState({
    propertyId: "",
    gracePeriodDays: 5,
    lateFeeRate: 5,
    maxLateFeeDays: 30,
    maxLateFeeAmount: "",
    isActive: true
  });

  useEffect(() => {
    loadLateFeeData();
  }, []);

  const loadLateFeeData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockLateFees: LateFee[] = [
        {
          id: "lf1",
          rentPaymentId: "rp1",
          tenantId: "tenant1",
          landlordId: "landlord1",
          propertyId: "prop1",
          originalAmount: 1500.00,
          lateFeeAmount: 75.00,
          totalAmount: 1575.00,
          dueDate: "2024-11-01",
          lateDate: "2024-11-06",
          daysLate: 5,
          status: "pending",
          createdAt: "2024-11-06T00:00:00Z",
          metadata: {
            propertyName: "Downtown Apartment",
            tenantName: "John Smith",
            landlordName: "Jane Landlord",
            lateFeeRate: 5,
            gracePeriodDays: 5,
            maxLateFeeDays: 30
          }
        },
        {
          id: "lf2",
          rentPaymentId: "rp2",
          tenantId: "tenant2",
          landlordId: "landlord1",
          propertyId: "prop2",
          originalAmount: 1200.00,
          lateFeeAmount: 60.00,
          totalAmount: 1260.00,
          dueDate: "2024-10-01",
          lateDate: "2024-10-08",
          daysLate: 7,
          status: "paid",
          createdAt: "2024-10-08T00:00:00Z",
          paidDate: "2024-10-10T14:30:00Z",
          metadata: {
            propertyName: "Suburban House",
            tenantName: "Sarah Johnson",
            landlordName: "Jane Landlord",
            lateFeeRate: 5,
            gracePeriodDays: 5,
            maxLateFeeDays: 30,
            paymentMethodId: "pm1",
            transactionId: "tx1"
          }
        },
        {
          id: "lf3",
          rentPaymentId: "rp3",
          tenantId: "tenant3",
          landlordId: "landlord2",
          propertyId: "prop3",
          originalAmount: 1800.00,
          lateFeeAmount: 90.00,
          totalAmount: 1890.00,
          dueDate: "2024-09-01",
          lateDate: "2024-09-15",
          daysLate: 14,
          status: "waived",
          createdAt: "2024-09-15T00:00:00Z",
          metadata: {
            propertyName: "Luxury Condo",
            tenantName: "Mike Chen",
            landlordName: "Bob Landlord",
            lateFeeRate: 5,
            gracePeriodDays: 5,
            maxLateFeeDays: 30
          }
        }
      ];

      const mockPolicies: LateFeePolicy[] = [
        {
          id: "policy1",
          landlordId: "landlord1",
          propertyId: "prop1",
          gracePeriodDays: 5,
          lateFeeRate: 5,
          maxLateFeeDays: 30,
          maxLateFeeAmount: 200,
          isActive: true,
          createdAt: "2024-10-01T00:00:00Z",
          updatedAt: "2024-10-01T00:00:00Z"
        },
        {
          id: "policy2",
          landlordId: "landlord1",
          propertyId: "prop2",
          gracePeriodDays: 3,
          lateFeeRate: 7,
          maxLateFeeDays: 20,
          maxLateFeeAmount: 150,
          isActive: true,
          createdAt: "2024-10-01T00:00:00Z",
          updatedAt: "2024-10-01T00:00:00Z"
        }
      ];

      const mockAnalytics: LateFeeAnalytics = {
        totalLateFees: 3,
        totalCollected: 60.00,
        totalWaived: 90.00,
        totalDisputed: 0,
        averageLateFee: 75.00,
        averageDaysLate: 8.7,
        successRate: 66.7,
        monthlyTrend: [
          { month: "2024-09", lateFees: 1, collected: 0, waived: 90 },
          { month: "2024-10", lateFees: 1, collected: 60, waived: 0 },
          { month: "2024-11", lateFees: 1, collected: 0, waived: 0 }
        ],
        topProperties: [
          { propertyId: "prop1", propertyName: "Downtown Apartment", lateFeeCount: 1, totalAmount: 75 },
          { propertyId: "prop2", propertyName: "Suburban House", lateFeeCount: 1, totalAmount: 60 },
          { propertyId: "prop3", propertyName: "Luxury Condo", lateFeeCount: 1, totalAmount: 90 }
        ]
      };

      setLateFees(mockLateFees);
      setPolicies(mockPolicies);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load late fee data:', error);
      toast.error('Failed to load late fee data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      // Mock implementation - replace with actual API call
      const newPolicy: LateFeePolicy = {
        id: `policy${Date.now()}`,
        landlordId: "landlord1",
        propertyId: policyForm.propertyId,
        gracePeriodDays: policyForm.gracePeriodDays,
        lateFeeRate: policyForm.lateFeeRate,
        maxLateFeeDays: policyForm.maxLateFeeDays,
        maxLateFeeAmount: policyForm.maxLateFeeAmount ? parseFloat(policyForm.maxLateFeeAmount) : undefined,
        isActive: policyForm.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPolicies(prev => [...prev, newPolicy]);
      toast.success('Late fee policy created successfully!');
      setShowCreatePolicy(false);
      resetPolicyForm();
    } catch (error) {
      toast.error('Failed to create late fee policy');
    }
  };

  const handleWaiveLateFee = async (lateFeeId: string) => {
    try {
      setLateFees(prev => prev.map(fee =>
        fee.id === lateFeeId
          ? { ...fee, status: 'waived' as const }
          : fee
      ));

      toast.success('Late fee waived successfully!');
      setShowWaiveFee(false);
      setWaiveReason("");
    } catch (error) {
      toast.error('Failed to waive late fee');
    }
  };

  const handleCollectLateFee = async (lateFeeId: string) => {
    try {
      // Mock implementation - replace with actual payment processing
      setLateFees(prev => prev.map(fee =>
        fee.id === lateFeeId
          ? {
            ...fee,
            status: 'paid' as const,
            paidDate: new Date().toISOString(),
            metadata: {
              ...fee.metadata,
              transactionId: `tx${Date.now()}`
            }
          }
          : fee
      ));

      toast.success('Late fee collected successfully!');
    } catch (error) {
      toast.error('Failed to collect late fee');
    }
  };

  const handleSendReminder = async (lateFeeId: string) => {
    try {
      // Mock implementation - replace with actual reminder sending
      toast.success('Late fee reminder sent!');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const resetPolicyForm = () => {
    setPolicyForm({
      propertyId: "",
      gracePeriodDays: 5,
      lateFeeRate: 5,
      maxLateFeeDays: 30,
      maxLateFeeAmount: "",
      isActive: true
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'waived':
        return <XCircle className="h-4 w-4 text-blue-500" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'waived':
        return 'bg-blue-100 text-blue-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (daysLate: number) => {
    if (daysLate <= 5) return 'text-green-600';
    if (daysLate <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const { role } = useRole();

  if (role === 'landlord') {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Late Fee Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and enforce late fee policies for your rental units.
          </p>
        </div>

        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-2xl">Enforcement Tools Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are developing an automated system for you to generate late fee notices, track outstanding penalties, and integrate collection workflows directly into your income stream.
            </p>
          </div>
          <div className="pt-4 flex gap-3">
            <Button disabled className="opacity-50">Configure Policies</Button>
            <Button variant="outline" disabled className="opacity-50">View Aging Report</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          Late Fee Management
        </h1>
        <p className="text-muted-foreground">
          Manage late fees, set policies, and track collection rates.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Late Fees</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics?.totalLateFees || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics?.totalCollected || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Waived</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analytics?.totalWaived || 0)}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics?.successRate || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="latefees">Late Fees</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Late Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Late Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lateFees.filter(fee => fee.status === 'pending').map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(fee.status)}
                        <div>
                          <p className="font-medium">{fee.metadata.propertyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {fee.metadata.tenantName} • {fee.daysLate} days late
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getSeverityColor(fee.daysLate)}`}>
                          {formatCurrency(fee.lateFeeAmount)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCollectLateFee(fee.id)}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(fee.id)}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lateFees.slice(0, 5).map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(fee.status)}
                        <div>
                          <p className="font-medium">{fee.metadata.propertyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(fee.createdAt)} • {fee.daysLate} days late
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(fee.lateFeeAmount)}</span>
                        <Badge className={getStatusColor(fee.status)}>
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Late Fees Tab */}
        <TabsContent value="latefees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Late Fees</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lateFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(fee.status)}
                      <div>
                        <p className="font-medium">{fee.metadata.propertyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {fee.metadata.tenantName} • Due: {formatDate(fee.dueDate)} •
                          Late: {formatDate(fee.lateDate)} ({fee.daysLate} days)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Original: {formatCurrency(fee.originalAmount)} •
                          Late Fee: {formatCurrency(fee.lateFeeAmount)} •
                          Total: {formatCurrency(fee.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(fee.status)}>
                        {fee.status}
                      </Badge>
                      <div className="flex gap-1">
                        {fee.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCollectLateFee(fee.id)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLateFee(fee);
                                setShowWaiveFee(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Late Fee Policies</CardTitle>
                <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Late Fee Policy</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Property</label>
                        <select
                          className="w-full mt-1 p-2 border rounded-md"
                          value={policyForm.propertyId}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, propertyId: e.target.value }))}
                        >
                          <option value="">Select property</option>
                          <option value="prop1">Downtown Apartment</option>
                          <option value="prop2">Suburban House</option>
                          <option value="prop3">Luxury Condo</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Grace Period (days)</label>
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          value={policyForm.gracePeriodDays}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, gracePeriodDays: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Late Fee Rate (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={policyForm.lateFeeRate}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, lateFeeRate: parseFloat(e.target.value) }))}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Max Late Fee Days</label>
                        <Input
                          type="number"
                          min="1"
                          max="90"
                          value={policyForm.maxLateFeeDays}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, maxLateFeeDays: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Max Late Fee Amount (optional)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={policyForm.maxLateFeeAmount}
                          onChange={(e) => setPolicyForm(prev => ({ ...prev, maxLateFeeAmount: e.target.value }))}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowCreatePolicy(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePolicy} className="flex-1">
                          Create Policy
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Property Policy</p>
                      <p className="text-sm text-muted-foreground">
                        Grace Period: {policy.gracePeriodDays} days •
                        Late Fee Rate: {policy.lateFeeRate}% •
                        Max Days: {policy.maxLateFeeDays}
                      </p>
                      {policy.maxLateFeeAmount && (
                        <p className="text-sm text-muted-foreground">
                          Max Amount: {formatCurrency(policy.maxLateFeeAmount)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.monthlyTrend.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Late Fees: {trend.lateFees}
                        </span>
                        <span className="text-sm text-green-600">
                          Collected: {formatCurrency(trend.collected)}
                        </span>
                        <span className="text-sm text-blue-600">
                          Waived: {formatCurrency(trend.waived)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProperties.map((property) => (
                    <div key={property.propertyId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{property.propertyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.lateFeeCount} late fees
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(property.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(property.totalAmount / property.lateFeeCount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Waive Fee Dialog */}
      <Dialog open={showWaiveFee} onOpenChange={setShowWaiveFee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Late Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLateFee && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedLateFee.metadata.propertyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLateFee.metadata.tenantName} • {selectedLateFee.daysLate} days late
                  </p>
                  <p className="font-medium text-red-600">
                    Late Fee: {formatCurrency(selectedLateFee.lateFeeAmount)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Reason for waiving</label>
                  <Input
                    placeholder="Enter reason for waiving the late fee"
                    value={waiveReason}
                    onChange={(e) => setWaiveReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowWaiveFee(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleWaiveLateFee(selectedLateFee.id)}
                    className="flex-1"
                    disabled={!waiveReason.trim()}
                  >
                    Waive Fee
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
