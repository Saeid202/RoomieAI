import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Info, Loader2, Building2, Plus, CreditCard, CheckCircle2,
  Trash2, Star, ArrowLeft, Calendar, Clock, DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserPaymentMethods, createRentPaymentIntent, recordRentPayment, deletePaymentMethod } from "@/services/padPaymentService";
import { PaymentMethod } from "@/types/payment";
import { formatCurrency } from "@/services/feeCalculationService";
import SecurityDepositSection from "@/components/lease/SecurityDepositSection";
import { BankStatementAnalysis } from "@/components/payment/BankStatementUpload";
import { BankManagementHub } from "@/components/payment/BankManagementHub";
import RentSmoothingWallet from "@/components/dashboard/RentSmoothingWallet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActiveLease {
  id: string;
  property_id: string;
  owner_id: string;
  monthly_rent: number;
  lease_start_date: string;
  payment_day?: number;
}

interface ScheduleRow {
  monthLabel: string;       // "April 2026"
  dueDate: Date;
  dueDateStr: string;       // "Apr 15, 2026"
  amount: number;
  status: 'paid' | 'due_now' | 'upcoming' | 'overdue';
  paymentRecord?: RentPaymentRecord;
}

interface RentPaymentRecord {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  stripe_payment_intent_id?: string;
  due_date?: string;
}

// ── Ordinal helper ────────────────────────────────────────────────────────────
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Generate 12-month rolling schedule ───────────────────────────────────────
function generateSchedule(leaseStartDate: string, paymentDay: number, payments: RentPaymentRecord[], monthlyRent: number): ScheduleRow[] {
  const start = new Date(leaseStartDate);
  const today = new Date();
  const rows: ScheduleRow[] = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, paymentDay);
    // Clamp to last day of month if paymentDay > days in month
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (paymentDay > lastDay) d.setDate(lastDay);

    const monthLabel = d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
    const dueDateStr = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });

    // Check if paid: look for a payment whose due_date falls in same month/year
    const paid = payments.find(p => {
      if (!p.due_date) return false;
      const pd = new Date(p.due_date);
      return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth() && p.status === 'paid';
    });

    let status: ScheduleRow['status'];
    if (paid) {
      status = 'paid';
    } else if (d < today && d.getMonth() !== today.getMonth()) {
      status = 'overdue';
    } else if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      status = 'due_now';
    } else {
      status = 'upcoming';
    }

    rows.push({ monthLabel, dueDate: d, dueDateStr, amount: monthlyRent, status, paymentRecord: paid });
  }
  return rows;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DigitalWallet() {
  const { user } = useAuth();
  const [activeLease, setActiveLease] = useState<ActiveLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  // Payment day selector
  const [paymentDay, setPaymentDay] = useState(1);
  const [savingDay, setSavingDay] = useState(false);

  // Schedule & history
  const [rentPayments, setRentPayments] = useState<RentPaymentRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);

  // Payment confirmation view
  const [view, setView] = useState<'schedule' | 'confirm'>('schedule');
  const [selectedRow, setSelectedRow] = useState<ScheduleRow | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Bank statement analysis
  const [bankStatementAnalysis, setBankStatementAnalysis] = useState<BankStatementAnalysis | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const sb = supabase as any;

  const fetchAll = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: leaseData } = await sb
        .from('active_leases')
        .select('id, property_id, owner_id, monthly_rent, lease_start_date, payment_day')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .single();

      if (leaseData) {
        setActiveLease(leaseData as ActiveLease);
        setPaymentDay((leaseData as any).payment_day || 1);
      }

      const methods = await getUserPaymentMethods(user.id);
      console.log('Fetched payment methods:', methods);
      console.log('Payment methods count:', methods?.length || 0);
      
      // Only update state if we have valid data
      if (methods && methods.length > 0) {
        setPaymentMethods(methods);
      } else {
        // Fallback: try direct query if service function fails
        console.log('Service function failed, trying direct query...');
        const { data: directData, error: directError } = await sb
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id);
        
        console.log('Direct query result:', { directData, directError });
        
        if (directData && directData.length > 0 && !directError) {
          console.log('Using direct query results:', directData);
          setPaymentMethods(directData as PaymentMethod[]);
        } else {
          console.log('Both queries failed, keeping existing state');
          // Don't reset to empty array - keep existing state
        }
      }

      const { data: paymentsData } = await sb
        .from('rent_payments')
        .select('id, amount, status, created_at, stripe_payment_intent_id, due_date')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      const payments = ((paymentsData as any[]) || []) as RentPaymentRecord[];
      setRentPayments(payments);

      if (leaseData) {
        const ld = leaseData as any;
        setSchedule(generateSchedule(ld.lease_start_date, ld.payment_day || 1, payments, ld.monthly_rent));
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user?.id]);

  // Regenerate schedule when paymentDay changes locally
  useEffect(() => {
    if (activeLease) {
      setSchedule(generateSchedule(activeLease.lease_start_date, paymentDay, rentPayments, activeLease.monthly_rent));
    }
  }, [paymentDay]);

  // ── Save payment day ───────────────────────────────────────────────────────
  const handleSavePaymentDay = async () => {
    if (!activeLease) return;
    setSavingDay(true);
    try {
      const { error } = await sb
        .from('lease_contracts')
        .update({ payment_day: paymentDay })
        .eq('id', activeLease.id);
      if (error) throw error;
      setActiveLease(prev => prev ? { ...prev, payment_day: paymentDay } : prev);
      toast.success(`Payment day set to the ${ordinal(paymentDay)} of each month`);
    } catch (e: any) {
      toast.error('Failed to save payment day');
    } finally {
      setSavingDay(false);
    }
  };

  // ── Delete payment method ──────────────────────────────────────────────────
  const handleDeletePaymentMethod = (method: PaymentMethod) => setMethodToDelete(method);
  const confirmDeletePaymentMethod = async () => {
    if (!methodToDelete) return;
    setDeletingMethodId(methodToDelete.id);
    try {
      await deletePaymentMethod(methodToDelete.id);
      toast.success('Payment method removed');
      fetchAll();
      setMethodToDelete(null);
    } catch {
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingMethodId(null);
    }
  };

  // ── Confirm payment ────────────────────────────────────────────────────────
  const handleConfirmPayment = async () => {
    if (!user?.id || !selectedRow || !activeLease) return;
    if (paymentMethods.length === 0) { toast.error('No payment method connected'); return; }

    setIsProcessingPayment(true);
    try {
      const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
      const dueDate = selectedRow.dueDate.toISOString().split('T')[0];

      const { paymentIntentId } = await createRentPaymentIntent(
        selectedRow.amount,
        defaultMethod.payment_type,
        defaultMethod.id,
        {
          tenantId: user.id,
          landlordId: activeLease.owner_id,
          propertyId: activeLease.property_id,
          dueDate,
        }
      );

      await recordRentPayment({
        amount: selectedRow.amount,
        paymentMethodType: defaultMethod.payment_type,
        paymentMethodId: defaultMethod.id,
        stripePaymentIntentId: paymentIntentId,
        stripeMandateId: defaultMethod.mandate_id,
        propertyId: activeLease.property_id,
        tenantId: user.id,
        landlordId: activeLease.owner_id,
        dueDate,
      });

      toast.success(`Payment of ${formatCurrency(selectedRow.amount)} initiated for ${selectedRow.monthLabel}`);
      setView('schedule');
      setSelectedRow(null);
      await fetchAll();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ── Loading / auth guards ──────────────────────────────────────────────────
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // ── Payment Confirmation View ──────────────────────────────────────────────
  if (view === 'confirm' && selectedRow) {
    const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Back button */}
          <button
            onClick={() => { setView('schedule'); setSelectedRow(null); }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
          >
            <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-purple-400 transition-colors shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Back to Schedule</span>
          </button>

          {/* Header */}
          <div className="relative rounded-xl overflow-hidden shadow-lg mb-6" style={{background: 'linear-gradient(to right, #8B5CF6, #A855F7, #FF6B35)'}}>
            <div className="relative px-6 py-5">
              <h1 className="text-xl font-black text-white">Confirm Payment</h1>
              <p className="text-purple-100 text-sm mt-0.5">Review details before proceeding</p>
            </div>
          </div>

          {/* Summary card */}
          <Card className="border-slate-200 shadow-sm mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Month</span>
                <span className="font-semibold text-slate-900">{selectedRow.monthLabel}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Due Date</span>
                <span className="font-semibold text-slate-900">{selectedRow.dueDateStr}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Building2 className="h-4 w-4" /> Property</span>
                <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{activeLease?.property_id ? 'Your Rental' : '—'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment Method</span>
                <span className="font-semibold text-slate-900">
                  {defaultMethod ? `${defaultMethod.bank_name || 'Bank'} ••••${defaultMethod.last4 || defaultMethod.stripe_payment_method_id?.slice(-4)}` : 'No method'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Amount</span>
                <span className="text-2xl font-black text-slate-900">{formatCurrency(selectedRow.amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Fee note */}
          <p className="text-xs text-slate-400 text-center mb-6">
            PAD fee: 1% + $0.25 · Processed securely via Stripe
          </p>

          {/* Confirm button */}
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessingPayment || paymentMethods.length === 0}
            className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}
          >
            {isProcessingPayment
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              : <><CheckCircle2 className="h-5 w-5" /> Confirm & Pay {formatCurrency(selectedRow.amount)}</>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Schedule View (main) ───────────────────────────────────────────────────
  const statusConfig = {
    paid:     { label: 'Paid',     cls: 'bg-green-100 text-green-700 border-green-200' },
    due_now:  { label: 'Due Now',  cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    overdue:  { label: 'Overdue',  cls: 'bg-red-100 text-red-700 border-red-200' },
    upcoming: { label: 'Upcoming', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-full px-6 py-8">

        {/* Header */}
        <div className="relative rounded-xl overflow-hidden shadow-lg mb-8" style={{background: 'linear-gradient(to right, #8B5CF6, #A855F7, #FF6B35)'}}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Digital Wallet</h1>
                <p className="text-purple-100 text-sm font-medium mt-0.5">Manage your rent payments with Canadian Pre-Authorized Debit (PAD)</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            >
              {paymentMethods.length === 0 ? (
                <><Plus className="h-4 w-4" /> Add Payment</>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  {(() => { const d = paymentMethods.find(m => m.is_default) || paymentMethods[0]; return `${d.bank_name || 'Bank'} ••••${d.last4 || d.stripe_payment_method_id?.slice(-4)}`; })()}
                  <span className="ml-1 opacity-70">▾</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment Methods Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="px-6 py-5 border-b">
              <SheetTitle className="text-lg font-bold">Payment Methods</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {showAddFlow ? (
                <div>
                  <button onClick={() => setShowAddFlow(false)} className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
                  <RentPaymentFlow
                    userId={user.id}
                    propertyId={activeLease?.property_id || ''}
                    landlordId={activeLease?.owner_id || ''}
                    rentAmount={0} dueDate=""
                    onBankConnected={() => { setShowAddFlow(false); fetchAll(); toast.success('Bank account connected!'); }}
                    onCancel={() => setShowAddFlow(false)}
                    connectOnly={true}
                  />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-10">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">No payment methods yet</p>
                  <div className="space-y-3">
                    <button onClick={() => setShowAddFlow(true)} className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}>
                      Connect Bank Account
                    </button>
                    <button onClick={() => setShowAddFlow(true)} className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
                      Add Credit/Debit Card
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {paymentMethods.map(method => (
                    <div key={method.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method.is_default ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{method.bank_name || 'Bank Account'} ••••{method.last4 || method.stripe_payment_method_id?.slice(-4)}</p>
                          <p className="text-xs text-gray-500">Pre-Authorized Debit</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_default
                          ? <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full"><Star className="h-3 w-3 fill-purple-600" /> Default</span>
                          : <span className="text-xs text-gray-400">Not default</span>}
                        <button onClick={() => handleDeletePaymentMethod(method)} disabled={deletingMethodId === method.id}
                          className="h-8 w-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          {deletingMethodId === method.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowAddFlow(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-purple-200 text-purple-500 text-sm font-medium hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <Plus className="h-4 w-4" /> Add Another Account
                  </button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* No lease alert */}
        {!activeLease && (
          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-blue-800">No active lease found. Set up your payment method to be ready when you have a lease.</AlertDescription>
          </Alert>
        )}

        {/* Two-column layout: Lease card left, Schedule right */}
        {activeLease && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

            {/* LEFT — Lease card */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm leading-tight truncate">Active Lease</p>
                      <p className="text-xs text-slate-500 mt-0.5">Since {new Date(activeLease.lease_start_date).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">ACTIVE</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-100">
                      <span className="text-slate-600 font-medium flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        Monthly Rent
                      </span>
                      <span className="font-bold text-lg text-slate-900">{formatCurrency(activeLease.monthly_rent)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                      <span className="text-slate-600 font-medium flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        Daily Breakdown
                      </span>
                      <span className="font-semibold text-slate-900">{formatCurrency(activeLease.monthly_rent / 30.4)}/day</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                      <span className="text-slate-600 font-medium flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Weekly Breakdown
                      </span>
                      <span className="font-semibold text-slate-900">{formatCurrency(activeLease.monthly_rent / 4.33)}/week</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600 font-medium flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                        Payment Day
                      </span>
                      <span className="font-semibold text-slate-900">{ordinal(activeLease.payment_day || 1)} of month</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-600 font-medium flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                        Payment Methods
                      </span>
                      <span className="font-semibold text-slate-900">{paymentMethods.length} connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Management Hub - Unified bank services */}
              <BankManagementHub
                userId={user!.id}
                paymentMethods={paymentMethods}
                bankStatementAnalysis={bankStatementAnalysis}
                onAddPaymentMethod={() => setDrawerOpen(true)}
                onDeletePaymentMethod={handleDeletePaymentMethod}
                onBankStatementAnalysisComplete={(analysis: BankStatementAnalysis) => {
                  setBankStatementAnalysis(analysis);
                  console.log('Bank statement analysis:', analysis);
                }}
              />

              {/* Rent Smoothing Wallet */}
              <RentSmoothingWallet />

              {/* Security Deposit Section */}
              <SecurityDepositSection 
                leaseId={activeLease.id}
                monthlyRent={activeLease.monthly_rent}
                paymentMethods={paymentMethods}
                onPaymentSuccess={() => {
                  toast.success('Security deposit payment completed!');
                  fetchAll(); // Refresh data
                }}
              />

              {/* Payment Day Selector */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700">Set Payment Day</CardTitle>
                  <CardDescription className="text-xs">Which day of the month is rent due?</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        onClick={() => setPaymentDay(day)}
                        className={`h-8 w-full rounded-lg text-xs font-semibold transition-all ${
                          paymentDay === day
                            ? 'text-white shadow-md scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        style={paymentDay === day ? {background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'} : {}}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mb-3 text-center">
                    Rent due on the <span className="font-bold text-purple-600">{ordinal(paymentDay)}</span> of each month
                  </p>
                  <button
                    onClick={handleSavePaymentDay}
                    disabled={savingDay || paymentDay === (activeLease.payment_day || 1)}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all"
                    style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}
                  >
                    {savingDay ? <><Loader2 className="h-4 w-4 animate-spin inline mr-1" />Saving...</> : 'Save Payment Day'}
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT — 12-month schedule */}
            <div className="lg:col-span-3">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-base font-semibold text-slate-900">12-Month Rent Schedule</CardTitle>
                  <CardDescription>Rolling schedule from your lease start date</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {schedule.map((row, idx) => {
                      const sc = statusConfig[row.status];
                      return (
                        <div key={idx} className={`flex items-center justify-between px-5 py-3.5 transition-colors ${row.status === 'paid' ? 'bg-green-50/40' : row.status === 'overdue' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{row.monthLabel}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Due {row.dueDateStr}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm font-bold text-slate-900">{formatCurrency(row.amount)}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                            {row.status === 'paid' ? (
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <button
                                onClick={() => { setSelectedRow(row); setView('confirm'); }}
                                disabled={paymentMethods.length === 0}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40 ${
                                  row.status === 'overdue' ? 'bg-red-500 hover:bg-red-600' : ''
                                }`}
                                style={row.status !== 'overdue' ? {background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'} : {}}
                              >
                                Verify & Pay
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        {rentPayments.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-base font-semibold text-slate-900">Payment History</CardTitle>
              <CardDescription>All completed rent payments with exact timestamps</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rentPayments.map(p => {
                      const dt = new Date(p.created_at);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-900">
                            {dt.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {dt.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              p.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                              p.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }`}>{p.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                            {p.stripe_payment_intent_id ? `${p.stripe_payment_intent_id.slice(0, 20)}...` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No payment method CTA */}
        {paymentMethods.length === 0 && (
          <Card className="border-dashed border-slate-300 shadow-sm mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-5 mb-4">
                <CreditCard className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Payment Method Yet</h3>
              <p className="text-slate-600 max-w-sm mb-5 text-sm">Connect your Canadian bank account to start paying rent with low fees.</p>
              <button onClick={() => setDrawerOpen(true)} className="px-8 py-3 rounded-xl text-white font-bold transition-all" style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}>
                Connect Bank Account
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!methodToDelete} onOpenChange={open => !open && setMethodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {methodToDelete?.bank_name || 'this account'} (••••{methodToDelete?.last4 || methodToDelete?.stripe_payment_method_id?.slice(-4)})? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePaymentMethod} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
