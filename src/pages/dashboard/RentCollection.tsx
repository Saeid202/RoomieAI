import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Send,
  Bell,
  FileText,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  User,
  Mail,
  Phone,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { 
  RentCollectionDashboardData, 
  RentCollection 
} from "@/types/payment";

export default function RentCollectionPage() {
  const [dashboardData, setDashboardData] = useState<RentCollectionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: RentCollectionDashboardData = {
        totalCollected: 4500,
        pendingAmount: 1500,
        overdueAmount: 0,
        recentCollections: [
          {
            id: "1",
            landlordId: "landlord1",
            propertyId: "prop1",
            tenantId: "tenant1",
            amount: 1500,
            dueDate: "2024-11-01",
            paidDate: "2024-11-01T10:30:00Z",
            status: "paid",
            lateFee: 0,
            platformFee: 37.50,
            netAmount: 1462.50
          },
          {
            id: "2",
            landlordId: "landlord1",
            propertyId: "prop2",
            tenantId: "tenant2",
            amount: 1200,
            dueDate: "2024-11-01",
            paidDate: "2024-11-02T14:20:00Z",
            status: "paid",
            lateFee: 0,
            platformFee: 30.00,
            netAmount: 1170.00
          },
          {
            id: "3",
            landlordId: "landlord1",
            propertyId: "prop3",
            tenantId: "tenant3",
            amount: 1800,
            dueDate: "2024-11-01",
            paidDate: "2024-11-01T09:15:00Z",
            status: "paid",
            lateFee: 0,
            platformFee: 45.00,
            netAmount: 1755.00
          }
        ],
        tenantPayments: [
          {
            tenantId: "tenant1",
            tenantName: "John Smith",
            propertyId: "prop1",
            propertyName: "Downtown Apartment",
            lastPayment: {
              id: "1",
              propertyId: "prop1",
              tenantId: "tenant1",
              landlordId: "landlord1",
              amount: 1500,
              currency: "CAD",
              dueDate: "2024-11-01",
              paidDate: "2024-11-01T10:30:00Z",
              status: "paid",
              platformFee: 37.50,
              lateFee: 0,
              createdAt: "2024-10-01T00:00:00Z"
            },
            nextDueDate: "2024-12-01",
            status: "current"
          },
          {
            tenantId: "tenant2",
            tenantName: "Sarah Johnson",
            propertyId: "prop2",
            propertyName: "Suburban House",
            lastPayment: {
              id: "2",
              propertyId: "prop2",
              tenantId: "tenant2",
              landlordId: "landlord1",
              amount: 1200,
              currency: "CAD",
              dueDate: "2024-11-01",
              paidDate: "2024-11-02T14:20:00Z",
              status: "paid",
              platformFee: 30.00,
              lateFee: 0,
              createdAt: "2024-10-01T00:00:00Z"
            },
            nextDueDate: "2024-12-01",
            status: "current"
          },
          {
            tenantId: "tenant3",
            tenantName: "Mike Chen",
            propertyId: "prop3",
            propertyName: "Luxury Condo",
            lastPayment: {
              id: "3",
              propertyId: "prop3",
              tenantId: "tenant3",
              landlordId: "landlord1",
              amount: 1800,
              currency: "CAD",
              dueDate: "2024-11-01",
              paidDate: "2024-11-01T09:15:00Z",
              status: "paid",
              platformFee: 45.00,
              lateFee: 0,
              createdAt: "2024-10-01T00:00:00Z"
            },
            nextDueDate: "2024-12-01",
            status: "current"
          }
        ],
        analytics: {
          totalPayments: 9,
          totalAmount: 13500,
          averageAmount: 1500,
          successRate: 100,
          latePayments: 0,
          failedPayments: 0,
          monthlyTrend: [
            { month: "2024-09", amount: 4500, count: 3 },
            { month: "2024-10", amount: 4500, count: 3 },
            { month: "2024-11", amount: 4500, count: 3 }
          ]
        }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load rent collection data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (tenantId: string) => {
    try {
      // Mock implementation - replace with actual reminder sending
      toast.success('Payment reminder sent!');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const handleDownloadReport = async (period: string) => {
    try {
      // Mock implementation - replace with actual report generation
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
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
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTenantStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              Rent Collection
            </h1>
            <p className="text-muted-foreground">
              Track rent payments, manage tenants, and view financial reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button onClick={() => handleDownloadReport(selectedPeriod)}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData?.totalCollected || 0)}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12% from last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(dashboardData?.pendingAmount || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Due this month</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboardData?.overdueAmount || 0)}
                </p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" />
                  -5% from last month
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tenants</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.tenantPayments.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">All current</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Collections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentCollections.length ? (
                  <div className="space-y-4">
                    {dashboardData.recentCollections.map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(collection.status)}
                          <div>
                            <p className="font-medium">{formatCurrency(collection.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {collection.paidDate ? `Paid ${formatDate(collection.paidDate)}` : `Due ${formatDate(collection.dueDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(collection.status)}>
                            {collection.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent collections</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Payment Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-medium">{dashboardData?.analytics.successRate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Payment</span>
                    <span className="font-medium">{formatCurrency(dashboardData?.analytics.averageAmount || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Payments</span>
                    <span className="font-medium">{dashboardData?.analytics.totalPayments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Late Payments</span>
                    <span className="font-medium text-red-600">{dashboardData?.analytics.latePayments || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tenants Tab */}
        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.tenantPayments.map((tenant) => (
                  <div key={tenant.tenantId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tenant.tenantName}</p>
                        <p className="text-sm text-muted-foreground">{tenant.propertyName}</p>
                        <p className="text-sm text-muted-foreground">
                          Last payment: {formatDate(tenant.lastPayment.paidDate || tenant.lastPayment.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTenantStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(tenant.tenantId)}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(collection.status)}
                      <div>
                        <p className="font-medium">{formatCurrency(collection.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {collection.paidDate ? `Paid on ${formatDate(collection.paidDate)}` : `Due on ${formatDate(collection.dueDate)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Platform fee: {formatCurrency(collection.platformFee)} • Net: {formatCurrency(collection.netAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(collection.status)}>
                        {collection.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Income</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(dashboardData?.totalCollected || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Platform Fees</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency((dashboardData?.totalCollected || 0) * 0.025)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Net Income</span>
                    <span className="font-medium">
                      {formatCurrency((dashboardData?.totalCollected || 0) * 0.975)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Amount</span>
                    <span className="font-medium text-yellow-600">
                      {formatCurrency(dashboardData?.pendingAmount || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.analytics.monthlyTrend.map((trend) => (
                    <div key={trend.month} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{trend.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(trend.amount)}</span>
                        <span className="text-xs text-muted-foreground">({trend.count} payments)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
