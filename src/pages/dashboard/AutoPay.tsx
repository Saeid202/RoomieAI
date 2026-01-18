import { useState, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Zap,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  Building,
  User,
  Bell,
  History,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  Target,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { AutoPayConfig, RentPayment } from "@/types/payment";

interface AutoPaySchedule {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  paymentMethodId: string;
  scheduleType: 'monthly' | 'biweekly' | 'weekly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  isActive: boolean;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  createdAt: string;
  metadata: {
    propertyName: string;
    landlordName: string;
    paymentMethodName: string;
    successRate: number;
    totalPayments: number;
    lastPaymentAmount?: number;
  };
}

interface AutoPayAnalytics {
  totalActiveSchedules: number;
  totalMonthlyAmount: number;
  successRate: number;
  averagePaymentAmount: number;
  upcomingPayments: number;
  failedPayments: number;
  monthlyTrend: Array<{
    month: string;
    successful: number;
    failed: number;
    total: number;
  }>;
}

export default function AutoPayPage() {
  const [schedules, setSchedules] = useState<AutoPaySchedule[]>([]);
  const [analytics, setAnalytics] = useState<AutoPayAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AutoPaySchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<AutoPaySchedule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    propertyId: "",
    amount: "",
    paymentMethodId: "",
    scheduleType: "monthly" as 'monthly' | 'biweekly' | 'weekly',
    dayOfMonth: 1,
    dayOfWeek: 1,
    isActive: true
  });

  useEffect(() => {
    loadAutoPayData();
  }, []);

  const loadAutoPayData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockSchedules: AutoPaySchedule[] = [
        {
          id: "schedule1",
          tenantId: "tenant1",
          propertyId: "prop1",
          amount: 1500.00,
          paymentMethodId: "pm1",
          scheduleType: "monthly",
          dayOfMonth: 1,
          isActive: true,
          nextPaymentDate: "2024-12-01",
          lastPaymentDate: "2024-11-01",
          createdAt: "2024-10-01T00:00:00Z",
          metadata: {
            propertyName: "Downtown Apartment",
            landlordName: "John Landlord",
            paymentMethodName: "Visa •••• 4242",
            successRate: 100,
            totalPayments: 3,
            lastPaymentAmount: 1500.00
          }
        },
        {
          id: "schedule2",
          tenantId: "tenant1",
          propertyId: "prop2",
          amount: 1200.00,
          paymentMethodId: "pm2",
          scheduleType: "biweekly",
          dayOfWeek: 5,
          isActive: true,
          nextPaymentDate: "2024-11-29",
          lastPaymentDate: "2024-11-15",
          createdAt: "2024-10-15T00:00:00Z",
          metadata: {
            propertyName: "Suburban House",
            landlordName: "Jane Landlord",
            paymentMethodName: "Mastercard •••• 5555",
            successRate: 95,
            totalPayments: 4,
            lastPaymentAmount: 1200.00
          }
        }
      ];

      const mockAnalytics: AutoPayAnalytics = {
        totalActiveSchedules: 2,
        totalMonthlyAmount: 2700.00,
        successRate: 97.5,
        averagePaymentAmount: 1350.00,
        upcomingPayments: 2,
        failedPayments: 1,
        monthlyTrend: [
          { month: "2024-09", successful: 2, failed: 0, total: 2 },
          { month: "2024-10", successful: 3, failed: 0, total: 3 },
          { month: "2024-11", successful: 4, failed: 1, total: 5 }
        ]
      };

      setSchedules(mockSchedules);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load auto-pay data:', error);
      toast.error('Failed to load auto-pay data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      // Mock implementation - replace with actual API call
      const newSchedule: AutoPaySchedule = {
        id: `schedule${Date.now()}`,
        tenantId: "tenant1",
        propertyId: formData.propertyId,
        amount: parseFloat(formData.amount),
        paymentMethodId: formData.paymentMethodId,
        scheduleType: formData.scheduleType,
        dayOfMonth: formData.dayOfMonth,
        dayOfWeek: formData.dayOfWeek,
        isActive: formData.isActive,
        nextPaymentDate: calculateNextPaymentDate(),
        createdAt: new Date().toISOString(),
        metadata: {
          propertyName: "New Property",
          landlordName: "New Landlord",
          paymentMethodName: "Card •••• 1234",
          successRate: 0,
          totalPayments: 0
        }
      };

      setSchedules(prev => [...prev, newSchedule]);
      toast.success('Auto-pay schedule created successfully!');
      setShowCreateSchedule(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create auto-pay schedule');
    }
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    try {
      setSchedules(prev => prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, isActive: !schedule.isActive }
          : schedule
      ));

      const schedule = schedules.find(s => s.id === scheduleId);
      toast.success(`Auto-pay ${schedule?.isActive ? 'paused' : 'activated'} successfully!`);
    } catch (error) {
      toast.error('Failed to toggle auto-pay schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      toast.success('Auto-pay schedule deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete auto-pay schedule');
    }
  };

  const calculateNextPaymentDate = (): string => {
    const now = new Date();
    const nextPayment = new Date(now);

    switch (formData.scheduleType) {
      case 'weekly':
        nextPayment.setDate(now.getDate() + 7);
        break;
      case 'biweekly':
        nextPayment.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        nextPayment.setMonth(now.getMonth() + 1);
        nextPayment.setDate(formData.dayOfMonth);
        break;
    }

    return nextPayment.toISOString().split('T')[0];
  };

  const resetForm = () => {
    setFormData({
      propertyId: "",
      amount: "",
      paymentMethodId: "",
      scheduleType: "monthly",
      dayOfMonth: 1,
      dayOfWeek: 1,
      isActive: true
    });
  };

  const getScheduleTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'biweekly':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'monthly':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScheduleTypeColor = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'biweekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
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

  const { role } = useRole();

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

  if (role === 'landlord') {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-600" />
            Auto-Pay Management
          </h1>
          <p className="text-muted-foreground">
            Manage automatic payment collections from your tenants.
          </p>
        </div>

        <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <Clock className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-2xl">Collection Dashboard Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are working on a comprehensive suite for you to automate rent collection, set up multi-unit auto-pay schedules, and track payment consistency across all your properties.
            </p>
          </div>
          <div className="pt-4 flex gap-3">
            <Button disabled className="opacity-50">Set Collection Rules</Button>
            <Button variant="outline" disabled className="opacity-50">View Forecast</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-600" />
          Auto-Pay Management
        </h1>
        <p className="text-muted-foreground">
          Set up automatic payments to never miss a rent payment.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.totalActiveSchedules || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analytics?.totalMonthlyAmount || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics?.upcomingPayments || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Schedules */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Active Schedules
                  </CardTitle>
                  <Dialog open={showCreateSchedule} onOpenChange={setShowCreateSchedule}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Auto-Pay Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Property</label>
                          <select
                            className="w-full mt-1 p-2 border rounded-md"
                            value={formData.propertyId}
                            onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                          >
                            <option value="">Select property</option>
                            <option value="prop1">Downtown Apartment</option>
                            <option value="prop2">Suburban House</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            min="1"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Payment Method</label>
                          <select
                            className="w-full mt-1 p-2 border rounded-md"
                            value={formData.paymentMethodId}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethodId: e.target.value }))}
                          >
                            <option value="">Select payment method</option>
                            <option value="pm1">Visa •••• 4242</option>
                            <option value="pm2">Mastercard •••• 5555</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Schedule Type</label>
                          <select
                            className="w-full mt-1 p-2 border rounded-md"
                            value={formData.scheduleType}
                            onChange={(e) => setFormData(prev => ({ ...prev, scheduleType: e.target.value as any }))}
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        {formData.scheduleType === 'monthly' && (
                          <div>
                            <label className="text-sm font-medium">Day of Month</label>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              value={formData.dayOfMonth}
                              onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowCreateSchedule(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handleCreateSchedule} className="flex-1">
                            Create Schedule
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules.filter(s => s.isActive).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getScheduleTypeIcon(schedule.scheduleType)}
                        <div>
                          <p className="font-medium">{schedule.metadata.propertyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(schedule.amount)} • Next: {formatDate(schedule.nextPaymentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getScheduleTypeColor(schedule.scheduleType)}>
                          {schedule.scheduleType}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSchedule(schedule.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules.filter(s => s.isActive).map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{schedule.metadata.propertyName}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDate(schedule.nextPaymentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(schedule.amount)}</p>
                        <p className="text-sm text-muted-foreground">{schedule.metadata.paymentMethodName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Schedules</CardTitle>
                <Button onClick={() => setShowCreateSchedule(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getScheduleTypeIcon(schedule.scheduleType)}
                      <div>
                        <p className="font-medium">{schedule.metadata.propertyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(schedule.amount)} • {schedule.scheduleType} •
                          Next: {formatDate(schedule.nextPaymentDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Success rate: {schedule.metadata.successRate}% •
                          Total payments: {schedule.metadata.totalPayments}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {schedule.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSchedule(schedule.id)}
                      >
                        {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Payment history will be displayed here</p>
                <p className="text-sm">Track all auto-pay transactions and their status</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Success rate trend chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Payment distribution chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
