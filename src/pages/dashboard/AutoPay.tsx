import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  installments: {
    id: string;
    due_date: string;
    rent_amount: number;
    status: string;
  }[];
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

  // State for Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; scheduleId: string | null; newStatus: boolean }>({
    open: false,
    scheduleId: null,
    newStatus: false
  });
  const [userPaymentMethods, setUserPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    loadAutoPayData();
  }, []);

  const { user } = useAuth();

  const loadAutoPayData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Fetch Leases
      const { data: leases, error: leaseError } = await supabase
        .from('lease_contracts' as any)
        .select(`
          id,
          monthly_rent,
          lease_start_date,
          auto_pay_enabled,
          payment_day_of_month,
          property:properties(
             id,
             listing_title,
             address,
             owner:profiles!user_id(full_name)
          )
        `)
        .eq('tenant_id', user.id)
        .in('status', ['active', 'signed', 'fully_signed']);

      if (leaseError) throw leaseError;

      // 2. Fetch Payment Methods (to check eligibility)
      const { data: methods, error: methodError } = await supabase
        .from('payment_methods' as any)
        .select('id, card_type, last4, brand')
        .eq('user_id', user.id);

      if (methodError) console.error("Error fetching methods:", methodError);
      setUserPaymentMethods(methods || []);

      // 3. Fetch Installments for all leases
      const { data: installmentsData, error: installmentError } = await supabase
        .from('rent_ledgers' as any)
        .select('id, lease_id, due_date, rent_amount, status')
        .in('lease_id', (leases || []).map((l: any) => l.id))
        .eq('status', 'unpaid')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      const installments = installmentsData as any[];
      if (installmentError) console.error("Error fetching installments:", installmentError);

      // Transform to display format
      const realSchedules: AutoPaySchedule[] = (leases || []).map((lease: any) => {
        const leaseInstallments = (installments || [])
          .filter((i: any) => i.lease_id === lease.id)
          .map((i: any) => ({
            id: i.id,
            due_date: i.due_date,
            rent_amount: Number(i.rent_amount),
            status: i.status
          }));

        return {
          id: lease.id,
          tenantId: user.id,
          propertyId: lease.property.id,
          amount: lease.monthly_rent,
          paymentMethodId: 'default',
          scheduleType: 'monthly',
          dayOfMonth: lease.payment_day_of_month || 1,
          isActive: lease.auto_pay_enabled || false,
          nextPaymentDate: leaseInstallments[0]?.due_date || new Date().toISOString(),
          createdAt: lease.lease_start_date,
          metadata: {
            propertyName: lease.property.listing_title || lease.property.address,
            landlordName: lease.property.owner?.full_name || 'Landlord',
            paymentMethodName: 'Default Payment Method',
            successRate: 100,
            totalPayments: 0
          },
          installments: leaseInstallments
        };
      });

      setSchedules(realSchedules);
      setAnalytics(null);

    } catch (error) {
      console.error('Failed to load auto-pay data:', error);
      toast.error('Failed to load lease information');
    } finally {
      setLoading(false);
    }
  };

  const initiateToggle = (scheduleId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const schedule = schedules.find(s => s.id === scheduleId);

    // Eligibility Check: Must have payment method to turn ON
    if (newStatus === true) {
      if (userPaymentMethods.length === 0) {
        toast.error("You must save a credit or debit card in your Digital Wallet before enabling Auto-Pay.");
        return;
      }

      if (!schedule || schedule.installments.length === 0) {
        toast.error("No upcoming unpaid rent installments found. Auto-pay cannot be enabled for this lease.");
        return;
      }
    }

    setConfirmDialog({ open: true, scheduleId, newStatus });
  };

  const confirmToggle = async () => {
    const { scheduleId, newStatus } = confirmDialog;
    if (!scheduleId) return;

    try {
      setConfirmDialog({ ...confirmDialog, open: false }); // Close immediately

      // Optimistic update
      setSchedules(prev => prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, isActive: newStatus }
          : schedule
      ));

      // Update in database
      const { error } = await supabase
        .from('lease_contracts' as any)
        .update({ auto_pay_enabled: newStatus } as any)
        .eq('id', scheduleId);

      if (error) throw error;

      toast.success(`Auto-pay has been ${newStatus ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      // Revert on error
      setSchedules(prev => prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, isActive: !newStatus }
          : schedule
      ));
      toast.error('Failed to update auto-pay settings');
      console.error(error);
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
    <div className="container mx-auto py-6 px-4 max-w-7xl animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-500" />
          Auto-Pay Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage automatic rent payments for your active leases.
        </p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : schedules.length === 0 ? (
          <Card className="border-dashed border-2 p-12 text-center bg-slate-50/50">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Leases Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Auto-pay is available once you have an active lease agreement.
              Check your applications or contracts.
            </p>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className={`overflow-hidden transition-all duration-300 ${schedule.isActive ? 'border-indigo-200 shadow-md bg-indigo-50/10' : 'border-slate-200 bg-white'}`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center p-6 gap-6">

                  {/* Icon & Status */}
                  <div className={`p-4 rounded-full ${schedule.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Zap className="h-8 w-8" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-900">{schedule.metadata.propertyName}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" />
                        {schedule.metadata.landlordName || 'Landlord'}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="font-medium text-slate-700">
                        {formatCurrency(schedule.amount)} / month
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Due on day {schedule.dayOfMonth}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Action */}
                  <div className="flex flex-col items-center gap-3 min-w-[160px]">
                    <div className="flex items-center space-x-3 bg-white p-1.5 rounded-full border shadow-sm">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${!schedule.isActive ? 'bg-slate-100 text-slate-600' : 'text-slate-400'}`}>
                        Off
                      </span>
                      <Switch
                        checked={schedule.isActive}
                        onCheckedChange={() => initiateToggle(schedule.id, schedule.isActive)}
                        className="data-[state=checked]:bg-indigo-600"
                        disabled={!schedule.isActive && (userPaymentMethods.length === 0 || schedule.installments.length === 0)}
                      />
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${schedule.isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}>
                        On
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium text-center">
                      {!schedule.isActive && userPaymentMethods.length === 0
                        ? 'Add card to enable'
                        : !schedule.isActive && schedule.installments.length === 0
                          ? 'No upcoming charges'
                          : schedule.isActive ? 'Next payment automatic' : 'Manual payments only'}
                    </p>
                  </div>

                </div>

                {/* Upcoming Charges List */}
                {schedule.installments.length > 0 && (
                  <div className="px-6 pb-6 pt-0 border-t bg-slate-50/30">
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Upcoming Charges
                      </h4>
                      <div className="space-y-2">
                        {schedule.installments.slice(0, 3).map((installment) => (
                          <div key={installment.id} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{formatDate(installment.due_date)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider opacity-70">
                                {installment.status}
                              </Badge>
                              <span className="font-bold text-slate-700">
                                {formatCurrency(installment.rent_amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {schedule.installments.length > 3 && (
                          <p className="text-xs text-center text-muted-foreground pt-1">
                            + {schedule.installments.length - 3} more scheduled installments
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 items-start">
        <Shield className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">Secure & Automated</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            When enabled, Roomie AI will automatically attempt to charge your default payment method on the due date.
            You will always receive a notification 2 days before the charge.
            Failed payments will not be retried automatically to prevent overdrafts.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Auto-Pay {confirmDialog.newStatus ? 'Enable' : 'Disable'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-slate-600">
              {confirmDialog.newStatus
                ? "Are you sure you want to enable automatic monthly payments? We will charge your default card on the due date."
                : "Are you sure you want to disable auto-pay? You will need to manually pay your rent each month."}
            </p>
            {confirmDialog.newStatus && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-yellow-800 flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Ensure your default card has sufficient funds to avoid failed payment fees.</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button
              onClick={confirmToggle}
              className={confirmDialog.newStatus ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"}
            >
              {confirmDialog.newStatus ? "Enable Auto-Pay" : "Disable Auto-Pay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
