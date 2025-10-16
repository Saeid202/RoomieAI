import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Settings,
  History,
  TrendingUp,
  Wallet,
  Smartphone,
  Banknote,
  Shield,
  Zap,
  Bell,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { StripePaymentForm, PaymentMethodForm, QuickPayment } from "@/components/payment/StripePaymentForm";
import { 
  PaymentDashboardData, 
  PaymentMethod, 
  RentPayment, 
  AutoPayConfig 
} from "@/types/payment";

export default function PaymentsPage() {
  const [dashboardData, setDashboardData] = useState<PaymentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showAutoPaySetup, setShowAutoPaySetup] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockData: PaymentDashboardData = {
        upcomingPayments: [
          {
            id: "1",
            propertyId: "prop1",
            tenantId: "tenant1",
            landlordId: "landlord1",
            amount: 1500,
            currency: "CAD",
            dueDate: "2024-12-01",
            status: "pending",
            platformFee: 37.50,
            lateFee: 0,
            createdAt: "2024-11-01T00:00:00Z"
          }
        ],
        recentPayments: [
          {
            id: "2",
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
          }
        ],
        paymentMethods: [
          {
            id: "pm1",
            userId: "tenant1",
            methodType: "card",
            provider: "stripe",
            providerId: "pm_card_visa",
            isDefault: true,
            metadata: { last4: "4242", brand: "visa" },
            createdAt: "2024-10-01T00:00:00Z"
          }
        ],
        autoPayConfigs: [],
        analytics: {
          totalPayments: 12,
          totalAmount: 18000,
          averageAmount: 1500,
          successRate: 100,
          latePayments: 0,
          failedPayments: 0,
          monthlyTrend: [
            { month: "2024-10", amount: 1500, count: 1 },
            { month: "2024-11", amount: 1500, count: 1 }
          ]
        }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (paymentMethod: any) => {
    try {
      // Payment method is automatically saved by Stripe Elements
      toast.success('Payment method added successfully!');
      setShowAddPaymentMethod(false);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to add payment method');
    }
  };

  const handlePaymentMethodError = (error: string) => {
    toast.error(error);
  };

  const handleSetupAutoPay = async () => {
    try {
      // Mock implementation - replace with actual auto-pay setup
      toast.success('Auto-pay setup successfully!');
      setShowAutoPaySetup(false);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to setup auto-pay');
    }
  };

  const handleMakePayment = async (paymentId: string) => {
    try {
      // Mock implementation - replace with actual payment processing
      toast.success('Payment processed successfully!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to process payment');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
          <CreditCard className="h-8 w-8 text-blue-600" />
          Payment Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your rent payments, payment methods, and auto-pay settings.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(dashboardData?.analytics.totalAmount || 0)}
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
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{dashboardData?.analytics.successRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Methods</p>
                <p className="text-2xl font-bold">{dashboardData?.paymentMethods.length || 0}</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-Pay Active</p>
                <p className="text-2xl font-bold">{dashboardData?.autoPayConfigs.length || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="autopay">Auto-Pay</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.upcomingPayments.length ? (
                  <div className="space-y-4">
                    {dashboardData.upcomingPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(payment.status)}
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                            <p className="text-sm text-muted-foreground">Due {formatDate(payment.dueDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <Button size="sm" onClick={() => handleMakePayment(payment.id)}>
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming payments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentPayments.length ? (
                  <div className="space-y-4">
                    {dashboardData.recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(payment.status)}
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.paidDate ? `Paid ${formatDate(payment.paidDate)}` : `Due ${formatDate(payment.dueDate)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
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
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent payments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.paidDate ? `Paid on ${formatDate(payment.paidDate)}` : `Due on ${formatDate(payment.dueDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
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

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Dialog open={showAddPaymentMethod} onOpenChange={setShowAddPaymentMethod}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                    </DialogHeader>
                    <PaymentMethodForm
                      onSuccess={handleAddPaymentMethod}
                      onError={handlePaymentMethodError}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {method.metadata.brand?.toUpperCase()} •••• {method.metadata.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.isDefault ? 'Default payment method' : 'Payment method'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Pay Tab */}
        <TabsContent value="autopay" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Auto-Pay Settings</CardTitle>
                <Dialog open={showAutoPaySetup} onOpenChange={setShowAutoPaySetup}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Setup Auto-Pay
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Setup Auto-Pay</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Payment Method</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option>Select payment method</option>
                          {dashboardData?.paymentMethods.map(method => (
                            <option key={method.id}>
                              {method.metadata.brand?.toUpperCase()} •••• {method.metadata.last4}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Payment Date</label>
                        <Input type="number" min="1" max="31" placeholder="Day of month" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowAutoPaySetup(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button onClick={handleSetupAutoPay} className="flex-1">
                          Setup Auto-Pay
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData?.autoPayConfigs.length ? (
                <div className="space-y-4">
                  {dashboardData.autoPayConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Zap className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(config.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {config.scheduleType} • Next payment: {formatDate(config.nextPaymentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No auto-pay configurations</p>
                  <p className="text-sm">Setup auto-pay to never miss a payment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
