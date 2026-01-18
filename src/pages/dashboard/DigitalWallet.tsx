import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/integrations/supabase/client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Building2,
  Trash2,
  ExternalLink,
  History,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle as AlertIcon,
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY");

function DigitalWalletContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit">("credit");

  // Card Details State
  const [cardAdded, setCardAdded] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const [recipientEmail, setRecipientEmail] = useState("");
  const [confirmRecipientEmail, setConfirmRecipientEmail] = useState("");
  const [isComplianceChecked, setIsComplianceChecked] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const navigate = useNavigate();
  const [recipientType, setRecipientType] = useState<"individual" | "business">("individual");
  const [recipientFirstName, setRecipientFirstName] = useState("");
  const [recipientLastName, setRecipientLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [rentAmount, setRentAmount] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<{ amount: number; date: string } | null>(null);

  // Landlord specific state
  const [landlordPayments, setLandlordPayments] = useState<any[]>([]);
  const [isFetchingLandlordData, setIsFetchingLandlordData] = useState(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<string>("not_started");
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);

  // Seeker specific state
  const [seekerPayments, setSeekerPayments] = useState<any[]>([]);
  const [isLoadingSeekerPayments, setIsLoadingSeekerPayments] = useState(false);

  // Handle Stripe onboarding completion
  useEffect(() => {
    const onboardingComplete = searchParams.get('onboarding');
    if (onboardingComplete === 'complete' && role === 'landlord') {
      toast.success('Stripe onboarding completed successfully! Your payout account is now active.');
      // Update the account status
      setStripeAccountStatus('completed');
      // Remove the query parameter
      searchParams.delete('onboarding');
      setSearchParams(searchParams, { replace: true });
      // Refresh the Stripe status from database
      fetchStripeStatus();
    }
  }, [searchParams, role]);

  useEffect(() => {
    if (role === 'landlord') {
      fetchLandlordPayments();
      fetchStripeStatus();
    } else {
      fetchSeekerPayments();
    }
  }, [role, user?.email, user?.id]);

  const fetchSeekerPayments = async () => {
    if (!user?.id) return;
    setIsLoadingSeekerPayments(true);
    try {
      const { data, error } = await supabase
        .from('rental_payments' as any)
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSeekerPayments(data || []);
    } catch (err) {
      console.error('Error fetching seeker payments:', err);
    } finally {
      setIsLoadingSeekerPayments(false);
    }
  };

  const fetchStripeStatus = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('payment_accounts' as any)
        .select('stripe_account_status, stripe_account_id')
        .eq('user_id', user.id)
        .eq('account_type', 'landlord')
        .maybeSingle() as any;

      if (data) {
        setStripeAccountStatus(data.stripe_account_status || "not_started");
        setStripeAccountId(data.stripe_account_id);
      }
    } catch (err) {
      console.error('Error fetching stripe status:', err);
    }
  };

  const handleStripeOnboarding = async () => {
    if (!user?.id) return;
    setIsRedirectingToStripe(true);
    const tid = toast.loading("Preparing your secure payout setup...");

    try {
      // Call the Edge Function - it handles both account creation and link generation
      const { data, error } = await supabase.functions.invoke('landlord-onboarding', {
        body: {}
      });

      console.log('Onboarding response:', { data, error });

      if (error) {
        const errorMsg = error.message || "Failed to initiate onboarding";
        const details = data?.error || data?.details || '';
        throw new Error(details ? `${errorMsg}: ${details}` : errorMsg);
      }

      if (data?.error) {
        throw new Error(`${data.error}${data.details ? ': ' + data.details : ''}`);
      }

      if (!data?.url) {
        throw new Error('No onboarding URL returned from server');
      }

      // Redirect to Stripe
      toast.success('Redirecting to Stripe...', { id: tid });
      window.location.href = data.url;

    } catch (err: any) {
      console.error('Stripe onboarding error:', err);
      toast.error(err.message || 'Failed to start onboarding', { id: tid });
      setIsRedirectingToStripe(false);
    }
  };

  const fetchLandlordPayments = async () => {
    if (!user?.email || !user?.id) return;
    setIsFetchingLandlordData(true);
    try {
      // Normalize email for searching
      const normalizedEmail = user.email.trim().toLowerCase();

      // Query payments where landlord_id matches OR recipient_email matches current user email
      const { data, error } = await supabase
        .from('rental_payments' as any)
        .select(`
          *,
          tenant:profiles!tenant_id(full_name, email)
        `)
        .or(`landlord_id.eq.${user.id},recipient_email.ilike.${normalizedEmail}`)
        .in('payment_status', ['processing', 'paid', 'paid_to_landlord'])
        .order('created_at', { ascending: false }) as any;

      if (error) throw error;
      setLandlordPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching landlord payments:', err);
      toast.error('Failed to load received payments');
    } finally {
      setIsFetchingLandlordData(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'processing':
      case 'paid':
        return { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', helper: 'Payment received, payout pending' };
      case 'paid_to_landlord':
        return { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200', helper: 'Funds sent to your account' };
      case 'failed':
        return { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200', helper: 'Transaction failed' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', helper: 'Awaiting completion' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', helper: '' };
    }
  };

  const totals = React.useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = landlordPayments
      .filter(p => new Date(p.created_at) >= firstDayOfMonth && ['processing', 'paid'].includes(p.payment_status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalReceived = landlordPayments
      .filter(p => p.payment_status === 'paid_to_landlord')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return { thisMonth, totalReceived };
  }, [landlordPayments]);

  // Fetch existing config
  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) return;
      try {
        const { data: rawData, error } = await supabase
          .from('seeker_digital_wallet_configs' as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching wallet config:', error);
          return;
        }

        if (rawData) {
          const data = rawData as any;
          setPaymentMethod(data.payment_method_type as "credit" | "debit" || "credit");
          setRecipientEmail(data.recipient_email || "");
          setConfirmRecipientEmail(data.recipient_email || ""); // Pre-fill confirm for UX if loaded from DB
          setRecipientType(data.recipient_type as "individual" | "business" || "individual");
          setRecipientFirstName(data.recipient_first_name || "");
          setRecipientLastName(data.recipient_last_name || "");
          setBusinessName(data.business_name || "");
          setRecipientPhone(data.recipient_phone || "");
          setRentAmount(data.rent_amount ? data.rent_amount.toString() : "");

          if (data.card_last4) {
            setCardAdded(true);
            setCardDetails(prev => ({
              ...prev,
              number: `**** **** **** ${data.card_last4}`,
              expiry: data.card_expiry || "",
              name: data.card_holder_name || ""
            }));
          }

          setIsSaved(data.is_configured || false);
          setIsComplianceChecked(data.compliance_confirmation || false);
        }
      } catch (err) {
        console.error("Unexpected error loading wallet config", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!cardAdded) {
      toast.error("Please add a payment method.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error("Please enter a valid recipient email.");
      return;
    }

    if (recipientEmail !== confirmRecipientEmail) {
      toast.error("Recipient emails do not match.");
      return;
    }

    if (!isComplianceChecked) {
      toast.error("You must confirm compliance to save changes.");
      return;
    }

    if (recipientType === "individual" && (!recipientFirstName || !recipientLastName)) {
      toast.error("Please enter the recipient's first and last name.");
      return;
    }

    if (recipientType === "business" && !businessName) {
      toast.error("Please enter the business name.");
      return;
    }

    if (!rentAmount || parseFloat(rentAmount) <= 0) {
      toast.error("Please enter a valid rent amount.");
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        payment_method_type: paymentMethod,
        recipient_email: recipientEmail,
        recipient_type: recipientType,
        recipient_first_name: recipientType === 'individual' ? recipientFirstName : null,
        recipient_last_name: recipientType === 'individual' ? recipientLastName : null,
        business_name: recipientType === 'business' ? businessName : null,
        recipient_phone: recipientPhone,
        rent_amount: parseFloat(rentAmount),
        is_configured: true,
        compliance_confirmation: isComplianceChecked,
        // Persist basic card display info
        card_last4: cardDetails.number.slice(-4),
        card_expiry: cardDetails.expiry,
        card_holder_name: cardDetails.name,
        card_brand: 'visa' // hardcoded for this demo as per simulation
      };

      const { error } = await supabase
        .from('seeker_digital_wallet_configs' as any)
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      // Success
      setIsSaved(true);
      toast.success("Digital Wallet configuration saved successfully.");

      console.log("Saved config:", payload);

    } catch (error) {
      console.error("Error saving wallet config:", error);
      toast.error("Failed to save configuration.");
    }
  };



  const handleSaveCard = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe is not ready");
      return;
    }

    if (!cardDetails.name) {
      toast.error("Please enter the name on the card");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const tid = toast.loading('Verifying card details...');

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardDetails.name
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setCardAdded(true);
      setIsAddingCard(false);
      setCardDetails({
        ...cardDetails,
        number: `**** **** **** ${paymentMethod.card.last4}`,
        expiry: "09/27" // mock for display
      });
      toast.success('Card successfully verified and linked', { id: tid });
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify card', { id: tid });
    }
  };

  if (role === 'landlord') {
    return (
      <div className="p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground text-lg">
              Payments received from tenants via Roomie AI.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLandlordPayments} disabled={isFetchingLandlordData}>
            <History className={`h-4 w-4 mr-2 ${isFetchingLandlordData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-600 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                This Month (Activity)
              </CardDescription>
              <CardTitle className="text-3xl font-bold">${totals.thisMonth.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Includes all non-failed payments initiated this month.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Total Paid to You
              </CardDescription>
              <CardTitle className="text-3xl font-bold">${totals.totalReceived.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Cumulative funds cleared and sent to your account.</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Settings Card */}
        <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Payout Settings
              </CardTitle>
              <CardDescription>Configure how you receive your rental income.</CardDescription>
            </div>
            {stripeAccountStatus === 'completed' ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white flex gap-1 px-3 py-1">
                <ShieldCheck className="h-3 w-3" />
                Payouts Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1 flex gap-1">
                <AlertCircle className="h-3 w-3" />
                Setup Required
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                {stripeAccountStatus === 'completed' ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Your Stripe account is successfully connected.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Account Identifier: <code className="bg-slate-100 px-1 rounded">{stripeAccountId?.replace(/^acct_/, 'xxxx_')}</code>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payouts will be automatically released once funds are cleared by the platform.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">To receive payouts, you must onboard with our payment partner, Stripe.</p>
                    <p className="text-xs text-muted-foreground">
                      We use Stripe Connect (Express) to securely handle bank transfers and identity verification.
                      No banking information is stored on Roomie AI servers.
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleStripeOnboarding}
                className={`w-full md:w-auto ${stripeAccountStatus === 'completed' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} shadow-md`}
                disabled={isRedirectingToStripe}
              >
                {isRedirectingToStripe ? (
                  <>
                    <History className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : stripeAccountStatus === 'completed' ? (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Stripe Account
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payout Setup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isFetchingLandlordData ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse">Fetching your payments...</p>
              </div>
            ) : landlordPayments.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No payments yet</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Payments will appear here once tenants pay rent through the platform.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="hidden md:table-cell">Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right w-[120px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {landlordPayments.map((payment) => {
                      const status = getStatusDisplay(payment.payment_status);
                      return (
                        <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-xs md:text-sm">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {payment.tenant?.full_name || 'Unknown Tenant'}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {payment.tenant?.email || 'No email provided'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                            <Badge variant="outline" className="bg-slate-50 font-normal">
                              {payment.payment_source === 'manual' ? 'Digital Wallet' : 'Application'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${(payment.amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className={`${status.color} px-2 py-0 border font-medium text-[10px] whitespace-nowrap`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/20 border-t py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex gap-3">
                <div className="mt-1"><Clock className="h-4 w-4 text-blue-600" /></div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Processing</p>
                  <p className="text-xs text-muted-foreground text-pretty">Payment received, payout pending</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1"><CheckCircle className="h-4 w-4 text-green-600" /></div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Paid</p>
                  <p className="text-xs text-muted-foreground text-pretty">Funds sent to your account</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Digital Wallet</h1>
          <p className="text-muted-foreground text-lg">
            Manage your rent payments and history.
          </p>
        </div>

        {/* The Action Button (Sheet Trigger) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-xl transition-all hover:scale-105 active:scale-95">
              <CreditCard className="mr-2 h-5 w-5" />
              Make a Payment
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Pay Rent</SheetTitle>
              <SheetDescription>
                Configure your payment details securely.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 pb-20">
              {/* Success Status (Inside Sheet) */}
              {paymentSuccess && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Payment Successful</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Paid ${paymentSuccess.amount.toFixed(2)} on {paymentSuccess.date}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setPaymentSuccess(null)}>
                    Make Another Payment
                  </Button>
                </div>
              )}

              {isSaved && !paymentSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 text-sm font-medium">Wallet Configured & Ready</span>
                </div>
              )}

              {/* 1. Payment Method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> 1. Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(val: "credit" | "debit") => setPaymentMethod(val)}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="flex-1 cursor-pointer font-medium flex items-center gap-2 text-sm">
                        Credit Card
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Recommended</Badge>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="debit" id="debit" />
                      <Label htmlFor="debit" className="flex-1 cursor-pointer font-medium text-sm">Debit Card</Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-3">
                    <div className={cardAdded && !isAddingCard ? "hidden" : "block"}>
                      {!cardAdded && !isAddingCard ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded text-center border border-dashed">No card linked</div>
                          <Button onClick={() => setIsAddingCard(true)} variant="outline" size="sm" className="w-full">
                            + Add Card
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-card border p-3 rounded-lg space-y-3">
                          <div className="p-3 border rounded-md bg-background min-h-[40px]">
                            <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
                          </div>
                          <Input
                            placeholder="Cardholder Name"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="h-9 text-sm"
                          />
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="flex-1 h-8" onClick={() => setIsAddingCard(false)}>Cancel</Button>
                            <Button size="sm" className="flex-1 h-8" onClick={handleSaveCard}>Save Card</Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {cardAdded && !isAddingCard && (
                      <div className="bg-secondary/50 p-3 rounded-lg flex items-center justify-between border">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-10 bg-slate-800 rounded flex items-center justify-center text-white text-[10px] font-bold">CARD</div>
                          <div>
                            <p className="font-medium text-sm">**** {cardDetails.number.slice(-4)}</p>
                            <p className="text-xs text-muted-foreground">{cardDetails.name}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setCardAdded(false); setIsAddingCard(true); }}>Change</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 2. Recipient Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> 2. Recipient
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Landlord Email <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="landlord@example.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Confirm Email <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Confirm email" value={confirmRecipientEmail} onChange={(e) => setConfirmRecipientEmail(e.target.value)}
                      className="h-9"
                      onPaste={(e) => {
                        e.preventDefault();
                        toast.error("Please type manualy");
                      }}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3">
                    <Checkbox id="compliance" checked={isComplianceChecked} onCheckedChange={(c) => setIsComplianceChecked(c === true)} className="mt-1" />
                    <Label htmlFor="compliance" className="text-xs leading-normal cursor-pointer text-yellow-900">
                      I confirm this is a legitimate rent payment and not a self-transfer.
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Recipient Type */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <User className="h-4 w-4" /> 3. Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={recipientType} onValueChange={(val: any) => setRecipientType(val)} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="individual" id="ind" /><Label htmlFor="ind" className="text-sm cursor-pointer">Individual</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="business" id="bus" /><Label htmlFor="bus" className="text-sm cursor-pointer">Business</Label></div>
                  </RadioGroup>

                  {recipientType === "individual" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">First Name</Label>
                        <Input placeholder="John" value={recipientFirstName} onChange={(e) => setRecipientFirstName(e.target.value)} className="h-9" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Last Name</Label>
                        <Input placeholder="Doe" value={recipientLastName} onChange={(e) => setRecipientLastName(e.target.value)} className="h-9" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs">Business Name</Label>
                      <Input placeholder="Property Management Ltd" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-9" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 4. Payment Amount */}
              <Card className="border-indigo-100 bg-indigo-50/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-900">
                    <DollarSign className="h-4 w-4" /> 4. Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                    <Input
                      type="number" className="pl-7 text-lg font-bold" placeholder="0.00"
                      value={rentAmount} onChange={(e) => setRentAmount(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <Button variant="outline" onClick={handleSave} disabled={isLoading || isPaying}>
                      Save Details
                    </Button>
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 font-bold shadow-md"
                      onClick={async () => {
                        // Copied Payment Logic
                        if (!isSaved) { toast.error("Please save details first."); return; }
                        if (!isComplianceChecked) { toast.error("Please confirm compliance."); return; }
                        const amount = parseFloat(rentAmount);
                        if (isNaN(amount) || amount <= 0) { toast.error("Invalid amount"); return; }

                        setIsPaying(true);
                        const tid = toast.loading("Processing payment...");

                        try {
                          const { data, error: functionError } = await (supabase.functions as any).invoke('execute-payment', {
                            body: { amount, compliance_confirmation: isComplianceChecked }
                          });

                          if (functionError) {
                            let msg = functionError.message;
                            try { msg = (await functionError.context.json()).error || msg; } catch { }
                            throw new Error(msg);
                          }
                          if (data?.error) throw new Error(data.error);

                          if (!data?.client_secret) throw new Error("Missing client secret");
                          if (!stripe || !elements) throw new Error("Stripe error");

                          const cardElement = elements.getElement(CardElement);
                          if (!cardElement) throw new Error("Card error");

                          const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
                            payment_method: { card: cardElement, billing_details: { name: cardDetails.name } }
                          });

                          if (stripeError) throw new Error(stripeError.message);

                          if (paymentIntent?.status === 'succeeded') {
                            toast.success("Payment Sent!", { id: tid });
                            setPaymentSuccess({ amount, date: new Date().toLocaleString() });
                            fetchSeekerPayments(); // Update main table
                          }
                        } catch (err: any) {
                          console.error("Pay Error", err);
                          toast.error(err.message || "Failed", { id: tid });
                        } finally {
                          setIsPaying(false);
                        }
                      }}
                      disabled={isLoading || isPaying}
                    >
                      {isPaying ? (
                        <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>Processing...</span>
                      ) : (
                        `Pay $${rentAmount || '0.00'} Now`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 5. Payment History (Main Content) */}
      <Card className="border-t-4 border-t-indigo-600 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-bold text-xl">
                <History className="h-6 w-6 text-indigo-600" />
                Payment History
              </CardTitle>
              <CardDescription>
                A record of all your rental payments made through Roomie AI.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchSeekerPayments()}>
              <History className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSeekerPayments ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : seekerPayments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No payments found.</p>
              <p className="text-xs">Click "Make a Payment" to send your first rent.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seekerPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{payment.recipient_email}</span>
                          <span className="text-[10px] text-muted-foreground">Digital Transfer</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-indigo-600">
                        ${(payment.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={
                          payment.payment_status === 'paid' || payment.payment_status === 'paid_to_landlord'
                            ? "bg-green-100 text-green-800 border-green-200"
                            : payment.payment_status === 'failed'
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                        }>
                          {payment.payment_status === 'paid_to_landlord' ? 'Completed' :
                            payment.payment_status === 'paid' ? 'Processing' :
                              payment.payment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}

export default function DigitalWalletPage() {
  return (
    <Elements stripe={stripePromise}>
      <DigitalWalletContent />
    </Elements>
  );
}
