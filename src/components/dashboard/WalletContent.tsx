import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { SimplePaymentForm } from "@/components/payment/SimplePaymentForm";
import { useAuth } from "@/hooks/useAuth";
import { 
  CreditCard, Loader2, Trash2, Plus, Star, Building2, 
  ChevronLeft, ArrowRight, History, ShieldCheck, 
  DollarSign, TrendingUp, Wallet, Clock, CheckCircle2 
} from "lucide-react";
import { 
  getUserPaymentMethods, 
  createRentPaymentIntent, 
  recordRentPayment,
  getUserPayments
} from "@/services/padPaymentService";
import { getUserApplications } from "@/services/rentalApplicationService";
import { PaymentMethod } from "@/types/payment";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/services/feeCalculationService";
import { getTenantContracts, TenantContractView } from "@/services/leaseContractService";
import { format, addMonths, setDate, isBefore, isAfter } from "date-fns";

export function WalletContent() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [activeFlow, setActiveFlow] = useState<"none" | "rent" | "mortgage">("rent");
  const [isProcessing, setIsProcessing] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isPropertyConfirmed, setIsPropertyConfirmed] = useState(false);
  const [activeLeases, setActiveLeases] = useState<TenantContractView[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const activeLease = activeLeases.find(l => l.application_id === selectedAppId);
  const activeApplication = applications.find(app => app.id === selectedAppId);
  
  const currentRentAmount = activeLease?.monthly_rent || activeApplication?.property?.monthly_rent || 2000;
  const mortgageAmount = 1500;

  useEffect(() => {
    fetchPaymentMethods();
    fetchApplications();
    fetchLeases();
    fetchPayments();
  }, [user?.id]);

  const fetchPaymentMethods = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const methods = await getUserPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setDeletingMethodId(methodId);
    try {
      await deletePaymentMethod(methodId);
      toast.success('Payment method removed successfully');
      fetchPaymentMethods();
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingMethodId(null);
    }
  };

  const fetchApplications = async () => {
    if (!user?.id) return;
    try {
      const apps = await getUserApplications();
      // Filter for approved or under review applications 
      // Also exclude those that already have a contract (since we fetch leases separately)
      const validApps = apps.filter(app => 
        (app.status === 'approved' || app.status === 'under_review') && 
        (!app.lease_contract || app.lease_contract.length === 0)
      );
      setApplications(validApps);
      if (validApps.length > 0 && !selectedAppId) {
        setSelectedAppId(validApps[0].id);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchLeases = async () => {
    if (!user?.id) return;
    try {
      const leases = await getTenantContracts();
      // Only show fully signed or executed leases
      const active = leases.filter(l => l.status === 'fully_signed' || l.status === 'executed');
      setActiveLeases(active);
    } catch (err) {
      console.error('Error fetching leases:', err);
    }
  };

  const fetchPayments = async () => {
    if (!user?.id) return;
    try {
      const userPayments = await getUserPayments(user.id);
      setPayments(userPayments);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const pendingAmount = payments
    .filter(p => p.status === 'initiated' || p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPaidThisMonth = payments
    .filter(p => {
      if (p.status !== 'completed' && p.status !== 'succeeded') return false;
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const calculateNextDueDate = (startDateStr: string) => {
    try {
      const start = new Date(startDateStr);
      const now = new Date();
      const dayOfMonth = start.getDate();
      
      let nextDue = setDate(now, dayOfMonth);
      
      // If today is past the due date this month, set to next month
      if (isBefore(nextDue, now)) {
        nextDue = addMonths(nextDue, 1);
      }
      
      return format(nextDue, 'MMM do');
    } catch (e) {
      return "1st of month";
    }
  };

  const handlePayment = async (amount: number, methodId: string, metadata?: { landlordId?: string; propertyId?: string }) => {
    setIsProcessing(true);
    try {
      const method = paymentMethods.find(m => m.id === methodId);
      if (!method) throw new Error("Payment method not found");

      // 1. Create Payment Intent
      const { paymentIntentId, clientSecret } = await createRentPaymentIntent(
        amount,
        method.payment_type as any,
        method.id,
        {
          tenantId: user?.id,
          landlordId: metadata?.landlordId,
          propertyId: metadata?.propertyId,
        }
      );

      // 2. Record Payment in DB
      await recordRentPayment({
        amount,
        paymentMethodType: method.payment_type as any,
        paymentMethodId: method.id,
        stripePaymentIntentId: paymentIntentId,
        propertyId: metadata?.propertyId,
        tenantId: user?.id,
        landlordId: metadata?.landlordId,
      });

      toast.success('Payment initiated successfully!');
      setActiveFlow("none");
      setIsPropertyConfirmed(false);
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access your wallet</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Banner - Updated to Landlord Style */}
      <div className="relative rounded-xl overflow-hidden shadow-lg mb-8" style={{background: 'linear-gradient(to right, #8B5CF6, #A855F7, #FF6B35)'}}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative px-6 py-5 flex items-center gap-4">
          <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Digital Wallet</h1>
            <p className="text-purple-100 text-sm font-medium mt-0.5">Fast, secure, and stress-free payments</p>
          </div>
        </div>
      </div>

      {/* Payment Accounts Section - Landlord Style Strip */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">Payment Accounts</p>
          <button
            onClick={() => { setShowAddFlow(paymentMethods.length > 0 ? false : true); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)', color: 'white'}}
          >
            <Plus className="h-3.5 w-3.5" />
            {paymentMethods.length === 0 ? 'Add Payment Method' : 'Manage Accounts'}
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  {(() => {
                    const def = paymentMethods.find(m => m.is_default) || paymentMethods[0];
                    return `${def.bank_name || 'Bank Account'} ••••${def.last4 || def.stripe_payment_method_id?.slice(-4)}`;
                  })()}
                </p>
                <p className="text-xs text-slate-500">Pre-Authorized Debit · Primary source</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">No bank account connected</p>
                <p className="text-xs text-slate-500">Connect your account to start making payments</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Not set up
            </span>
          </div>
        )}
      </div>

      {/* Quick Info Cards - Dynamic based on active leases */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {activeLeases.length > 0 ? (
          activeLeases.map((lease, idx) => (
            <Card key={lease.contract_id} className="border-slate-200 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <CardHeader className="pb-3 px-5 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Next Rent Payment {activeLeases.length > 1 ? `(${idx + 1})` : ''}
                  </CardTitle>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-2xl font-black text-slate-900">{formatCurrency(lease.monthly_rent)}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500 font-medium">Due {calculateNextDueDate(lease.lease_start_date)}</p>
                  <p className="text-[10px] text-purple-600 font-bold max-w-[120px] truncate">{lease.property_address.split(',')[0]}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-slate-200 shadow-sm opacity-60">
            <CardHeader className="pb-3 px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Payment</CardTitle>
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-2xl font-black text-slate-300">$0.00</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">No active lease found</p>
            </CardContent>
          </Card>
        )}

        {/* Global Status Cards */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 px-5 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</CardTitle>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">In process</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 px-5 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid (Month)</CardTitle>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                <Wallet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalPaidThisMonth)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{format(new Date(), 'MMMM')} spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Bar - Prominent Segmented Control */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-sm w-full">
          <button
            onClick={() => setActiveFlow("rent")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeFlow === "rent" 
                ? "bg-white text-purple-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Building2 className={`h-4 w-4 ${activeFlow === "rent" ? "text-purple-600" : "text-slate-400"}`} />
            Pay Your Rent
          </button>
          <button
            onClick={() => setActiveFlow("mortgage")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeFlow === "mortgage" 
                ? "bg-white text-orange-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${activeFlow === "mortgage" ? "text-orange-600" : "text-slate-400"}`} />
            Pay Your Mortgage
          </button>
        </div>
      </div>

      {activeFlow !== "none" && (
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 mb-20">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-purple-50 border-2 border-gray-50">
            <div className="text-center mb-12">
              <div className={`h-20 w-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${activeFlow === 'rent' ? 'bg-purple-100' : 'bg-red-100'}`}>
                {activeFlow === 'rent' ? (
                  <Building2 className="h-10 w-10 text-purple-600" />
                ) : (
                  <ShieldCheck className="h-10 w-10 text-red-600" />
                )}
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 capitalize">
                Pay Your {activeFlow}
              </h2>
              <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">
                Enter details below to proceed
              </p>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-10 px-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 mb-6 font-medium">You need to connect a bank account first</p>
                <Button 
                  onClick={() => { setShowAddFlow(true); setModalOpen(true); }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-8 py-6"
                >
                  Connect Bank Account
                </Button>
              </div>
            ) : activeFlow === "rent" && !isPropertyConfirmed ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeLeases.length === 0 && applications.length === 0 ? (
                  <div className="text-center py-10 px-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-amber-700 font-bold">No active leases or approved properties found.</p>
                    <p className="text-amber-600 text-sm mt-2">You need a signed lease or an approved application to pay rent.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Active Leases First */}
                      {activeLeases.map((lease) => (
                        <div 
                          key={lease.contract_id}
                          onClick={() => setSelectedAppId(lease.application_id)}
                          className={`relative overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                            selectedAppId === lease.application_id 
                              ? "border-purple-600 ring-4 ring-purple-100 bg-purple-50/20" 
                              : "border-slate-100 bg-white hover:border-purple-200"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-6 p-6">
                            <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-purple-100 flex items-center justify-center">
                              <Building2 className="h-10 w-10 text-purple-600" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">{lease.property_address.split(',')[0]}</h3>
                                <Badge className="bg-green-600 text-white border-none font-bold">ACTIVE LEASE</Badge>
                              </div>
                              <p className="text-slate-500 font-medium">{lease.property_address}</p>
                              <div className="pt-2 flex items-center gap-6">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Monthly Rent</p>
                                  <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(lease.monthly_rent)}</p>
                                </div>
                                <div className="h-10 w-px bg-slate-100" />
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                  <Badge variant="outline" className="mt-1 border-purple-200 text-purple-700 bg-purple-50 font-bold capitalize">
                                    {lease.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Other Approved Applications */}
                      {applications.map((app) => (
                        <div 
                          key={app.id}
                          onClick={() => setSelectedAppId(app.id)}
                          className={`relative overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                            selectedAppId === app.id 
                              ? "border-purple-600 ring-4 ring-purple-100 bg-purple-50/20" 
                              : "border-slate-100 bg-white hover:border-purple-200"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-6 p-6">
                            <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                              {app.property?.images?.[0] ? (
                                <img src={app.property.images[0]} alt={app.property.listing_title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building2 className="h-10 w-10 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900">{app.property?.listing_title}</h3>
                                {selectedAppId === app.id && (
                                  <Badge className="bg-purple-600 text-white border-none font-bold">SELECTED</Badge>
                                )}
                              </div>
                              <p className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {app.property?.address}, {app.property?.city}
                              </p>
                              <div className="pt-2 flex items-center gap-6">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Monthly Rent</p>
                                  <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(app.property?.monthly_rent || 0)}</p>
                                </div>
                                <div className="h-10 w-px bg-slate-100" />
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Lease Status</p>
                                  <Badge variant="outline" className="mt-1 border-green-200 text-green-700 bg-green-50 font-bold">
                                    {app.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => setIsPropertyConfirmed(true)}
                      className="w-full py-8 text-xl font-black rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-200 transition-all active:scale-[0.98]"
                    >
                      Verify & Proceed to Payment
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <SimplePaymentForm
                type={activeFlow === "rent" ? "rent" : "mortgage"}
                defaultAmount={activeFlow === "rent" ? currentRentAmount : mortgageAmount}
                paymentMethods={paymentMethods}
                onPay={handlePayment}
                metadata={activeFlow === "rent" ? {
                  landlordId: activeLease ? undefined : activeApplication?.property?.user_id,
                  propertyId: activeLease?.property_address ? undefined : activeApplication?.property?.id,
                  // Note: PadPaymentFlow handle metadata better, we pass what we have
                  applicationId: selectedAppId
                } : undefined}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </div>
      )}

      <div className="space-y-8 mt-12">
        {/* Connected Accounts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-400" />
              Connected Accounts
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => { setShowAddFlow(false); setModalOpen(true); }}
              className="text-purple-600 font-bold"
            >
              Manage All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.length === 0 ? (
              <div className="lg:col-span-3 p-10 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Plus className="h-8 w-8 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">No accounts connected yet</p>
                <Button variant="link" onClick={() => { setShowAddFlow(true); setModalOpen(true); }} className="text-purple-600 font-bold">Connect your first account</Button>
              </div>
            ) : (
              <>
                {paymentMethods.slice(0, 3).map((method) => (
                  <Card key={method.id} className="rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all duration-300">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-slate-900 text-sm truncate">{method.bank_name}</p>
                        <p className="text-xs font-medium text-slate-400">••••{method.last4}</p>
                      </div>
                      {method.is_default && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-none font-bold text-[10px]">DEFAULT</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {paymentMethods.length > 3 && (
                  <div 
                    onClick={() => setModalOpen(true)}
                    className="cursor-pointer rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    +{paymentMethods.length - 3} more accounts
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400" />
                Recent Activity
              </h2>
              <Button variant="ghost" className="text-purple-600 font-bold">View All</Button>
            </div>
            <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                          {i === 0 ? <ShieldCheck className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{i === 0 ? 'Mortgage' : 'Rent'}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500">Yesterday</p>
                            <span className="text-slate-300">•</span>
                            <p className="text-xs text-slate-500">RBC Bank</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-base">${i === 0 ? '1,500.00' : '2,000.00'}</p>
                        <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50 text-[10px] font-bold px-1.5 py-0 h-4">COMPLETED</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <div className="space-y-4">
             <Card className="h-full bg-slate-900 rounded-xl border-none shadow-sm p-8 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">Secure Payments</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Transactions are protected by bank-level encryption and Canadian PAD standards.
                  </p>
                </div>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg py-5 text-sm">
                  Learn More
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Methods Modal - Updated to Landlord Style Dialog */}
      <Dialog 
        open={modalOpen} 
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setTimeout(() => setShowAddFlow(false), 300); // Reset after animation
        }}
      >
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {showAddFlow ? 'Connect Bank Account' : 'Payment Accounts'}
            </DialogTitle>
            {!showAddFlow && <p className="text-sm text-slate-500">Manage your connected bank accounts</p>}
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {showAddFlow ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={() => setShowAddFlow(false)}
                  className="mb-6 text-xs font-bold text-slate-400 hover:text-purple-600 flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to accounts
                </button>
                <RentPaymentFlow
                  userId={user!.id}
                  propertyId=""
                  landlordId=""
                  rentAmount={0}
                  dueDate=""
                  onBankConnected={() => {
                    setShowAddFlow(false);
                    fetchPaymentMethods();
                    toast.success('Bank account connected!');
                  }}
                  onCancel={() => setShowAddFlow(false)}
                  connectOnly={true}
                />
              </div>
            ) : (
              <>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold mb-6">No accounts connected yet</p>
                    <button
                      onClick={() => setShowAddFlow(true)}
                      className="w-full px-5 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all active:scale-[0.98]"
                      style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}
                    >
                      Connect Bank Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${method.is_default ? 'border-purple-200 bg-purple-50/30' : 'border-slate-100 bg-white hover:border-purple-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm ${method.is_default ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{method.bank_name || 'Bank Account'} ••••{method.last4}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PAD ENABLED</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.is_default && (
                            <Star className="h-3.5 w-3.5 fill-purple-600 text-purple-600" />
                          )}
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            disabled={deletingMethodId === method.id}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            {deletingMethodId === method.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddFlow(true)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all mt-2 group"
                    >
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                      Add Another Account
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
