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
import { Textarea } from "@/components/ui/textarea";
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
  Pencil,
  Check,
  X,
  Search,
  Star,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StripeConnectProvider } from "@/components/stripe/StripeConnectProvider";
import { ConnectAccountOnboarding, ConnectAccountManagement } from "@stripe/react-connect-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51SIhcgRkKDAtZpXYFqQ1OK4OrOp6Y8j0ZN6F2qOKJzoKZeoCCfnLm4xjr5CI3L7s08EABtD1G87wcWNQ5b6kOw5o00E03lFJYY");

function DigitalWalletContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "bank">("credit");

  // Stripe loading check
  const [stripeLoading, setStripeLoading] = useState(true);
  
  useEffect(() => {
    // Check if Stripe is loaded
    if (stripe) {
      setStripeLoading(false);
      console.log('✅ Stripe loaded successfully');
    } else {
      console.log('⏳ Stripe loading...');
    }
  }, [stripe]);

  // Card Details State
  const [cardAdded, setCardAdded] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  // Bank Account State
  const [bankDetails, setBankDetails] = useState({
    routingNumber: "",
    accountNumber: "",
    accountHolderName: "",
    accountType: "checking" as "checking" | "savings"
  });

  // Bank Selection State
  const [showBankSelection, setShowBankSelection] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [isConnectingBank, setIsConnectingBank] = useState(false);

  // Popular Canadian Banks Data
  const popularBanks = [
    { id: 'rbc', name: 'RBC', logo: '🦁', color: 'bg-blue-600', fullName: 'Royal Bank of Canada' },
    { id: 'td', name: 'TD', logo: '🍁', color: 'bg-green-600', fullName: 'Toronto-Dominion Bank' },
    { id: 'scotiabank', name: 'Scotiabank', logo: '🏴', color: 'bg-red-600', fullName: 'Bank of Nova Scotia' },
    { id: 'bmo', name: 'BMO', logo: '🦅', color: 'bg-red-700', fullName: 'Bank of Montreal' },
    { id: 'cibc', name: 'CIBC', logo: '🏦', color: 'bg-red-500', fullName: 'Canadian Imperial Bank of Commerce' },
    { id: 'national', name: 'National Bank', logo: '🇨🇦', color: 'bg-green-700', fullName: 'National Bank of Canada' },
    { id: 'tangerine', name: 'Tangerine', logo: '🍊', color: 'bg-orange-500', fullName: 'Tangerine Bank' },
    { id: 'simplii', name: 'Simplii', logo: '💰', color: 'bg-red-400', fullName: 'Simplii Financial' },
  ];

  const allBanks = [
    ...popularBanks,
    { id: 'hsbc', name: 'HSBC Canada', logo: '🌍', color: 'bg-red-800', fullName: 'HSBC Bank Canada' },
    { id: 'laurentian', name: 'Laurentian', logo: '🏔️', color: 'bg-green-500', fullName: 'Laurentian Bank of Canada' },
    { id: 'desjardins', name: 'Desjardins', logo: '🌳', color: 'bg-green-600', fullName: 'Desjardins Group' },
    { id: 'vancity', name: 'Vancity', logo: '🌲', color: 'bg-green-400', fullName: 'Vancity Credit Union' },
    { id: 'meridian', name: 'Meridian', logo: '🌊', color: 'bg-blue-500', fullName: 'Meridian Credit Union' },
    { id: 'servus', name: 'Servus', logo: '🏘️', color: 'bg-purple-600', fullName: 'Servus Credit Union' },
    { id: 'first', name: 'First Nations', logo: '🏕️', color: 'bg-teal-600', fullName: 'First Nations Bank of Canada' },
    { id: 'bridgewater', name: 'Bridgewater', logo: '🌉', color: 'bg-blue-400', fullName: 'Bridgewater Bank' },
    { id: 'motusbank', name: 'Motusbank', logo: '🚗', color: 'bg-indigo-600', fullName: 'Motusbank' },
    { id: 'eq', name: 'EQ Bank', logo: '⚡', color: 'bg-yellow-600', fullName: 'EQ Bank' },
    { id: 'neo', name: 'Neo Financial', logo: '💎', color: 'bg-purple-500', fullName: 'Neo Financial' },
    { id: 'wealthsimple', name: 'Wealthsimple', logo: '📈', color: 'bg-black', fullName: 'Wealthsimple Cash' },
  ];

  // Filter banks based on search
  const filteredBanks = allBanks.filter(bank => 
    bank.name.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
    bank.fullName.toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

  const handleBankSelection = async (bank: any) => {
    // Check if Stripe is loaded
    if (!stripe) {
      console.error("❌ Stripe not loaded");
      toast.error("Payment system is still loading. Please wait a moment and try again.");
      return;
    }
    
    setSelectedBank(bank);
    setIsConnectingBank(true);
    
    console.log(`🍁 Starting Canadian bank connection for ${bank.name} (${bank.id})`);
    
    // Wait for Stripe to be fully ready
    if (!stripe.elements) {
      console.log("⏳ Waiting for Stripe to fully load...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const tid = toast.loading(`Connecting to ${bank.name}...`);
    try {
      console.log(`🟡 Creating Canadian Financial Connections Session for ${bank.name}...`);
      
      let sessionData;
      let sessionError;
      
      try {
        const response = await supabase.functions.invoke('manage-financial-connections', {
          body: { 
            action: 'create-session',
            preferred_bank: bank.id,
            country: 'CA' // Explicitly Canadian
          }
        });
        
        sessionData = response.data;
        sessionError = response.error;
        
        console.log("✅ Function call completed");
      } catch (invokeError) {
        console.error("❌ Function invoke failed:", invokeError);
        sessionError = { message: `Function call failed: ${invokeError.message}` };
      }

      console.log("📊 Session response:", { sessionData, sessionError });

      if (sessionError) {
        console.error("❌ Session Create Error:", sessionError);
        throw new Error(sessionError.message || `Failed to connect to ${bank.name}`);
      }

      if (!sessionData?.client_secret) {
        console.error("❌ No client secret in response:", sessionData);
        throw new Error(`No connection session created for ${bank.name}`);
      }

      console.log(`🟡 Opening ${bank.name} Canadian Bank Login Modal...`);
      console.log("🔑 Client secret:", sessionData.client_secret.substring(0, 20) + "...");

      if (!sessionData.client_secret.startsWith("fcsess_")) {
        console.error("❌ Invalid session format:", sessionData.client_secret);
        throw new Error(`Invalid bank connection format for ${bank.name}`);
      }

      // OPEN STRIPE BANK LOGIN MODAL
      console.log(`🚀 Launching Stripe Financial Connections for ${bank.name}...`);
      console.log("💳 Stripe object:", stripe);
      console.log("💳 Stripe methods available:", Object.getOwnPropertyNames(stripe));
      
      // Check if collectFinancialConnectionsAccounts method exists
      if (typeof stripe.collectFinancialConnectionsAccounts !== 'function') {
        console.error("❌ Stripe collectFinancialConnectionsAccounts method not available");
        toast.error("Stripe Financial Connections not available. Please refresh the page.", { id: tid });
        setIsConnectingBank(false);
        return;
      }
      
      console.log("✅ Stripe method available, opening modal...");
      
      let result;
      try {
        result = await stripe.collectFinancialConnectionsAccounts({
          clientSecret: sessionData.client_secret,
        });
        console.log("✅ Stripe modal call completed");
      } catch (stripeError) {
        console.error("❌ Stripe modal call failed:", stripeError);
        toast.error("Failed to open bank connection modal. Please try again.", { id: tid });
        setIsConnectingBank(false);
        return;
      }

      console.log("📊 Stripe result:", result);

      if (result.error) {
        console.error("❌ Bank Login Error:", result.error);
        if (result.error.code === 'canceled') {
          toast.info(`${bank.name} connection cancelled`, { id: tid });
          setIsConnectingBank(false);
          return;
        }
        
        // Handle 404 errors specifically
        if (result.error.message?.includes('404') || result.error.type === 'invalid_request_error') {
          console.error("❌ 404 Error - Bank connection URL issue");
          toast.error(`${bank.name} connection failed. This might be a temporary issue. Please try again.`, { id: tid });
        } else {
          throw new Error(`${bank.name} login failed: ${result.error.message}`);
        }
      }

      const sessionId = result.financialConnectionsSession.id;
      console.log(`✅ ${bank.name} Canadian Bank Login Successful! Session ID:`, sessionId);

      toast.loading(`Verifying ${bank.name} account...`, { id: tid });

      // EXCHANGE ACCOUNT FOR PAYMENT METHOD
      console.log(`🔄 Exchanging ${bank.name} session for payment method...`);
      const { error: exchangeError } = await supabase.functions.invoke('manage-financial-connections', {
        body: {
          action: "exchange-account",
          session_id: sessionId,
        }
      });

      if (exchangeError) {
        console.error("❌ Bank Account Exchange Error:", exchangeError);
        throw new Error(`Failed to save ${bank.name} account: ${exchangeError.message}`);
      }

      console.log(`✅ ${bank.name} Account Connected Successfully!`);
      toast.success(`${bank.name} account connected! 🎉`, { id: tid });
      
      // REFRESH PAYMENT METHODS
      await fetchPaymentMethods();
      setShowBankSelection(false);
      setIsConnectingBank(false);
      setSelectedBank(null);
      
      console.log(`🎉 ${bank.name} connection flow completed successfully`);
      
    } catch (err: any) {
      console.error(`❌ ${bank.name} Connection Error:`, {
        message: err.message,
        stack: err.stack,
        bank: bank.name,
        bankId: bank.id
      });
      
      toast.error(err.message || `Failed to connect to ${bank.name}`, { id: tid });
      setIsConnectingBank(false);
    }
  };

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
  const [stripeAccountStatus, setStripeAccountStatus] = useState<"not_started" | "in_progress" | "restricted" | "ready">("not_started");
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const [connectAccountDetails, setConnectAccountDetails] = useState<any>(null);
  const [isShowingEmbeddedOnboarding, setIsShowingEmbeddedOnboarding] = useState(false);
  const [isShowingEmbeddedManagement, setIsShowingEmbeddedManagement] = useState(false);

  // Wallet balance state
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [totalPaidOut, setTotalPaidOut] = useState(0);

  // Payment note state
  const [paymentNote, setPaymentNote] = useState("");

  // Seeker specific state
  const [seekerPayments, setSeekerPayments] = useState<any[]>([]);
  const [isLoadingSeekerPayments, setIsLoadingSeekerPayments] = useState(false);
  const [rentLedgers, setRentLedgers] = useState<any[]>([]);
  const [isLoadingLedgers, setIsLoadingLedgers] = useState(false);

  // Payment Methods Handling
  const [savedMethods, setSavedMethods] = useState<any[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('new');
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);

  // Edit Amount State
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [isSavingAmount, setIsSavingAmount] = useState(false);

  // Checkout Dialog State
  const [checkoutLedger, setCheckoutLedger] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Handle Stripe onboarding completion
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    if ((onboardingParam === 'complete' || onboardingParam === 'return') && role === 'landlord') {
      // Fetch fresh status from Stripe
      const refreshStatus = async () => {
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke('stripe-connect', {
            body: { action: 'refresh-status' }
          });

          if (statusError) throw statusError;

          if (statusData) {
            setStripeAccountStatus(statusData.onboarding_status || "not_started");
            setStripeAccountId(statusData.stripe_account_id);
            setConnectAccountDetails(statusData);

            // Show success message if account is ready
            if (statusData.onboarding_status === 'ready') {
              toast.success('Wallet setup completed successfully! Your payout account is now active.');
            } else if (statusData.onboarding_status === 'in_progress') {
              toast.info('Almost there! Please complete the remaining steps to activate payouts.');
            }
          }
        } catch (err) {
          console.error('Error refreshing Stripe status:', err);
          toast.error('Failed to verify account status. Please refresh the page.');
        }
      };

      refreshStatus();

      // Remove the query parameter
      searchParams.delete('onboarding');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, role]);

  useEffect(() => {
    if (role === 'landlord') {
      fetchLandlordPayments();
      fetchStripeStatus();
    } else {
      fetchSeekerPayments();
      fetchRentLedgers();
      fetchPaymentMethods();
    }
  }, [role, user?.email, user?.id]);

  const fetchPaymentMethods = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('payment_methods' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedMethods(data || []);

      // If we have saved methods, select the most recent one (or default)
      if (data && data.length > 0) {
        // Ideally checking for is_default, but for now just pick first or 'new' if forced
        // For UX, sticking to 'new' or pre-selecting could be debated. 
        // Let's keep 'new' to forcing user choice unless we want auto-select.
        // Actually, let's auto-select the first one matching the current 'paymentMethod' (credit/debit) filter?
        // We'll handle selection logic in the render/effect.
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const fetchRentLedgers = async () => {
    if (!user?.id) return;
    setIsLoadingLedgers(true);
    try {
      const { data, error } = await supabase
        .from('rent_ledgers' as any)
        .select(`
          *,
          property:properties(listing_title, address),
          lease:lease_contracts(auto_pay_enabled, payment_day_of_month)
        `)
        .eq('tenant_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setRentLedgers(data || []);
    } catch (err) {
      console.error('Error fetching rent ledgers:', err);
    } finally {
      setIsLoadingLedgers(false);
    }
  };

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

  const refreshStripeStatus = async () => {
    if (!user?.id) return;
    try {
      const { data: statusData, error: statusError } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'refresh-status' }
      });

      if (statusError) throw statusError;

      if (statusData) {
        setStripeAccountStatus(statusData.onboarding_status || "not_started");
        setStripeAccountId(statusData.stripe_account_id);
        setConnectAccountDetails(statusData);
      }
    } catch (err) {
      console.error('Error refreshing stripe status:', err);
    }
  };

  const fetchStripeStatus = async () => {
    if (!user?.id) return;
    try {
      const { data: statusData, error: statusError } = await supabase.functions.invoke('stripe-connect', {
        body: { action: 'status' }
      });

      if (statusError) throw statusError;

      if (statusData) {
        setStripeAccountStatus(statusData.onboarding_status || "not_started");
        setStripeAccountId(statusData.stripe_account_id);
        setConnectAccountDetails(statusData);
      }

      // Also fetch balances from payment_accounts (legacy table for now or keep synced)
      const { data: legacyData } = await supabase
        .from('payment_accounts' as any)
        .select('available_balance, pending_balance, total_paid_out')
        .eq('user_id', user.id)
        .eq('account_type', 'landlord')
        .maybeSingle() as any;

      if (legacyData) {
        setAvailableBalance(legacyData.available_balance || 0);
        setPendingBalance(legacyData.pending_balance || 0);
        setTotalPaidOut(legacyData.total_paid_out || 0);
      }
    } catch (err) {
      console.error('Error fetching stripe status:', err);
    }
  };

  const handleStripeOnboarding = async () => {
    if (!user?.id) return;
    setIsShowingEmbeddedOnboarding(true);
  };

  const handleManagePayouts = async () => {
    if (!user?.id) return;
    setIsShowingEmbeddedManagement(true);
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
      case 'succeeded':
        return { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200', helper: 'Payment received by Roomie AI' };
      case 'paid_to_landlord':
        return { label: 'Completed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', helper: 'Funds sent to your account' };
      case 'failed':
        return { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200', helper: 'Transaction failed' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', helper: 'Awaiting completion' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', helper: '' };
    }
  };

  const walletMetrics = React.useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthActivity = landlordPayments
      .filter(p => new Date(p.created_at) >= firstDayOfMonth && ['processing', 'paid', 'paid_to_landlord'].includes(p.payment_status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const available = landlordPayments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pending = landlordPayments
      .filter(p => p.payment_status === 'processing')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPaidOut = landlordPayments
      .filter(p => p.payment_status === 'paid_to_landlord')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return { thisMonthActivity, available, pending, totalPaidOut };
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

    const tid = toast.loading('Verifying and saving card...');

    try {
      const { paymentMethod: stripeMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardDetails.name
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Reject prepaid cards
      if (stripeMethod.card?.funding === 'prepaid') {
        throw new Error("Prepaid cards are not accepted. Please use a valid Debit or Credit card.");
      }

      const detectedType = stripeMethod.card?.funding === 'debit' ? 'debit' : 'credit';

      const { error: dbError } = await supabase
        .from('payment_methods' as any)
        .insert({
          user_id: user.id,
          stripe_payment_method_id: stripeMethod.id,
          card_type: detectedType,
          brand: stripeMethod.card?.brand,
          last4: stripeMethod.card?.last4,
          exp_month: stripeMethod.card?.exp_month,
          exp_year: stripeMethod.card?.exp_year,
          is_default: savedMethods.length === 0
        });

      if (dbError) throw dbError;

      // Refresh and Update State
      await fetchPaymentMethods();
      setSelectedMethodId(stripeMethod.id);
      setIsAddingNewCard(false);
      setCardDetails({ ...cardDetails, number: `**** **** **** ${stripeMethod.card?.last4}` }); // Cosmetic update for old logic if any remains

      // Switch view to match card type if needed
      if (detectedType !== paymentMethod) {
        setPaymentMethod(detectedType as "credit" | "debit");
      }

      toast.success('Card successfully verified and linked', { id: tid });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to verify card', { id: tid });
    }
  };

  // --- Edit Amount Handlers ---
  const handleStartEdit = (ledger: any) => {
    setEditingLedgerId(ledger.id);
    setEditAmount(ledger.rent_amount.toString());
  };

  const handleCancelEdit = () => {
    setEditingLedgerId(null);
    setEditAmount("");
  };

  const handleSaveAmount = async (ledgerId: string) => {
    if (!editAmount || isNaN(parseFloat(editAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSavingAmount(true);
    try {
      const { error } = await supabase
        .from('rent_ledgers' as any)
        .update({ rent_amount: parseFloat(editAmount) })
        .eq('id', ledgerId);

      if (error) throw error;

      toast.success("Rent amount updated");
      setEditingLedgerId(null);
      // Refresh list to show new amount
      fetchRentLedgers();
    } catch (err: any) {
      console.error("Error updating rent amount:", err);
      toast.error("Failed to update amount");
    } finally {
      setIsSavingAmount(false);
    }
  };

  // --- Checkout Handlers ---
  const handleCheckoutClick = (ledger: any) => {
    setCheckoutLedger(ledger);
    setIsCheckoutOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!checkoutLedger) return;

    // Validation: Ensure a payment method is selected
    if (selectedMethodId === 'new' && savedMethods.length === 0) {
      toast.error("Please add and save a payment method first.");
      setIsCheckoutOpen(false);
      return;
    }

    const methodIdToUse = selectedMethodId === 'new' ? savedMethods[0]?.stripe_payment_method_id : selectedMethodId;

    if (!methodIdToUse) {
      toast.error("Please add and save a payment method first.");
      setIsCheckoutOpen(false);
      return;
    }

    // Determine type for history
    const savedMethod = savedMethods.find(m => m.stripe_payment_method_id === methodIdToUse);
    const paymentType = savedMethod?.card_type === 'debit' ? 'debit_card' : 
                       savedMethod?.card_type === 'bank_account' ? 'bank_account' : 'credit_card';

    setIsCheckoutOpen(false); // Close dialog
    const tid = toast.loading(`Processing payment for ${new Date(checkoutLedger.due_date).toLocaleDateString()}...`);
    setIsPaying(true);

    try {
      const { data, error: functionError } = await (supabase.functions as any).invoke('execute-payment', {
        body: {
          rent_ledger_id: checkoutLedger.id,
          compliance_confirmation: true,
          payment_method_type: paymentType
        }
      });

      if (functionError) throw new Error(functionError.message);
      if (data?.error) throw new Error(data.error);

      // Confirm Card Payment using Saved Method ID
      const { error: stripeError, paymentIntent } = await stripe!.confirmCardPayment(data.client_secret, {
        payment_method: methodIdToUse
      });

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent?.status === 'succeeded') {
        toast.success(`Payment of $${checkoutLedger.rent_amount} successful!`, { id: tid });
        setPaymentSuccess({ amount: checkoutLedger.rent_amount, date: new Date().toLocaleDateString() });
        fetchRentLedgers();
        fetchSeekerPayments();
      } else {
        throw new Error('Payment verification failed.');
      }

    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Payment failed. Please try again.', { id: tid });
    } finally {
      setIsPaying(false);
      setCheckoutLedger(null);
    }
  };

  if (role === 'landlord') {
    return (
      <StripeConnectProvider>
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

          {/* Landlord Wallet Card */}
          <Card className="border-indigo-100 bg-white shadow-lg overflow-hidden border-t-4 border-t-indigo-600">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Wallet className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Landlord Wallet</CardTitle>
                  <CardDescription>Income tracking and automatic disbursements</CardDescription>
                </div>
              </div>
              {stripeAccountStatus === 'ready' ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex gap-1.5 px-3 py-1.5 rounded-full border-none shadow-sm animate-in zoom-in duration-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Ready to get paid
                </Badge>
              ) : stripeAccountStatus === 'not_started' ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1.5 rounded-full flex gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Setup Required
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 rounded-full flex gap-1.5">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  Verification in progress
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Metric 1: Available Balance */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Available Balance
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    ${availableBalance.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">Funds eligible for next payout</p>
                </div>

                {/* Metric 2: Pending Balance */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Balance
                  </p>
                  <p className="text-3xl font-bold text-slate-700">
                    ${pendingBalance.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">Funds currently processing</p>
                </div>

                {/* Metric 3: Total Paid Out */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Total Paid Out
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${totalPaidOut.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">Lifetime earnings disbursed</p>
                </div>

                {/* Metric 4: Next Payout Date */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Next Payout Date
                  </p>
                  <p className="text-xl font-semibold text-slate-700 pt-1.5">
                    Automatic
                  </p>
                  <p className="text-[10px] text-slate-400">2-3 business days after clearing</p>
                </div>
              </div>

              {/* Wallet Explanation Section */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                {stripeAccountStatus === 'ready' ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 mb-1">Bank Account Connected</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Your payout account is active. Rent payments will be automatically transferred to your bank account within 2-3 business days.
                          </p>
                          {connectAccountDetails?.stripe_account_id && (
                            <p className="text-[10px] text-slate-400 mt-2 font-mono">
                              Account ID: {connectAccountDetails.stripe_account_id.substring(0, 20)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={handleManagePayouts}
                        variant="outline"
                        size="sm"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shrink-0"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-1">How payouts work</h4>
                      <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                        Connect your bank once. Roomie AI deposits rent automatically. Secure, no paperwork for most landlords.
                      </p>
                    </div>

                    <Button
                      onClick={handleStripeOnboarding}
                      className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Connect Bank Account (30 seconds)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.info("Bank setup skipped. You can proceed with card payment or add bank account later.");
                        setSelectedMethodId('credit'); // Default to credit card
                      }}
                      className="w-full md:w-auto mt-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Skip Bank Setup
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Embedded Onboarding Dialog */}
          <Dialog open={isShowingEmbeddedOnboarding} onOpenChange={setIsShowingEmbeddedOnboarding}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Setup Payout Account</DialogTitle>
                <DialogDescription>
                  Enter your details securely to receive payments directly to your bank account.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 min-h-[600px]">
                <ConnectAccountOnboarding
                  onExit={() => {
                    setIsShowingEmbeddedOnboarding(false);
                    refreshStripeStatus();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Embedded Management Dialog */}
          <Dialog open={isShowingEmbeddedManagement} onOpenChange={setIsShowingEmbeddedManagement}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Payouts</DialogTitle>
                <DialogDescription>
                  View your account status and update bank information.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 min-h-[600px]">
                <ConnectAccountManagement />
              </div>
            </DialogContent>
          </Dialog>

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
                        <TableHead className="w-[100px]">Payment ID</TableHead>
                        <TableHead className="w-[140px]">Date & Time</TableHead>
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
                            <TableCell>
                              <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                                {payment.transaction_id?.substring(0, 10) || payment.id.substring(0, 6)}...
                              </code>
                            </TableCell>
                            <TableCell className="font-medium text-xs md:text-sm">
                              <div className="flex flex-col">
                                <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
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
      </StripeConnectProvider>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Digital Wallet</h1>
          <p className="text-muted-foreground text-lg">
            Manage your rent payments, schedule, and history.
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
                    onValueChange={(val: "credit" | "debit" | "bank") => {
                      setPaymentMethod(val);
                      setIsAddingNewCard(false);
                      // Auto-select first stored method of this type, or new
                      const firstMatch = savedMethods.find(m => m.card_type === val);
                      setSelectedMethodId(firstMatch ? firstMatch.stripe_payment_method_id : 'new');
                    }}
                    className="flex flex-col gap-2"
                  >
                    {/* Credit Card Option + List */}
                    <div className={`border p-3 rounded-lg transition-colors ${paymentMethod === 'credit' ? 'bg-accent/10 border-indigo-200' : 'hover:bg-accent/50'}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit" id="credit" />
                        <Label htmlFor="credit" className="flex-1 cursor-pointer font-medium flex items-center gap-2 text-sm">
                          Credit Card
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Recommended</Badge>
                        </Label>
                      </div>

                      {paymentMethod === 'credit' && (
                        <div className="mt-3 pl-6 space-y-2">
                          {savedMethods.filter(m => m.card_type === 'credit').map(method => (
                            <div
                              key={method.id}
                              onClick={() => { setSelectedMethodId(method.stripe_payment_method_id); setIsAddingNewCard(false); }}
                              className={`p-2 border rounded text-sm flex items-center justify-between cursor-pointer ${selectedMethodId === method.stripe_payment_method_id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-8 bg-slate-800 rounded text-white text-[9px] flex items-center justify-center font-bold uppercase">{method.brand || 'CARD'}</div>
                                <span>•••• {method.last4}</span>
                              </div>
                              {selectedMethodId === method.stripe_payment_method_id && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                            </div>
                          ))}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-muted-foreground h-8"
                            onClick={() => { setIsAddingNewCard(true); setSelectedMethodId('new'); }}
                          >
                            + Add another credit card
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Debit Card Option + List */}
                    <div className={`border p-3 rounded-lg transition-colors ${paymentMethod === 'debit' ? 'bg-accent/10 border-indigo-200' : 'hover:bg-accent/50'}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="debit" id="debit" />
                        <Label htmlFor="debit" className="flex-1 cursor-pointer font-medium text-sm">Debit Card</Label>
                      </div>

                      {paymentMethod === 'debit' && (
                        <div className="mt-3 pl-6 space-y-2">
                          {savedMethods.filter(m => m.card_type === 'debit').map(method => (
                            <div
                              key={method.id}
                              onClick={() => { setSelectedMethodId(method.stripe_payment_method_id); setIsAddingNewCard(false); }}
                              className={`p-2 border rounded text-sm flex items-center justify-between cursor-pointer ${selectedMethodId === method.stripe_payment_method_id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-8 bg-slate-600 rounded text-white text-[9px] flex items-center justify-center font-bold uppercase">{method.brand || 'CARD'}</div>
                                <span>•••• {method.last4}</span>
                              </div>
                              {selectedMethodId === method.stripe_payment_method_id && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                            </div>
                          ))}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-muted-foreground h-8"
                            onClick={() => { setIsAddingNewCard(true); setSelectedMethodId('new'); }}
                          >
                            + Add another debit card
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Bank Account Option */}
                    <div className={`border p-3 rounded-lg transition-colors ${paymentMethod === 'bank' ? 'bg-accent/10 border-indigo-200' : 'hover:bg-accent/50'}`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex-1 cursor-pointer font-medium flex items-center gap-2 text-sm">
                          Bank Account (ACH)
                          <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Lowest Fee</Badge>
                        </Label>
                      </div>

                      {paymentMethod === 'bank' && (
                        <div className="mt-3 pl-6 space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800">
                              💡 Bank transfers have the lowest fees (typically $0.25-0.50) and are ideal for recurring rent payments.
                            </p>
                          </div>

                          {savedMethods.filter(m => m.card_type === 'bank_account').map(method => (
                            <div
                              key={method.id}
                              onClick={() => { setSelectedMethodId(method.stripe_payment_method_id); setIsAddingNewCard(false); }}
                              className={`p-2 border rounded text-sm flex items-center justify-between cursor-pointer ${selectedMethodId === method.stripe_payment_method_id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-8 bg-emerald-600 rounded text-white text-[9px] flex items-center justify-center font-bold">BANK</div>
                                <span>•••• {method.last4}</span>
                              </div>
                              {selectedMethodId === method.stripe_payment_method_id && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                            </div>
                          ))}

                          <div className="space-y-3 p-3 border border-dashed rounded-lg bg-slate-50">
                            <p className="text-xs font-semibold text-slate-700">Connect Your Canadian Bank Account:</p>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-800 mb-3">
                                🔐 Securely login to your Canadian bank to connect your account. We never see or store your bank credentials.
                              </p>
                              
                              <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => setShowBankSelection(true)}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                Choose Your Canadian Bank
                              </Button>
                              
                              <p className="text-[10px] text-blue-600 mt-2">
                                🍁 Supports all major Canadian banks including RBC, TD, Scotiabank, BMO, CIBC, and more.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </RadioGroup>

                  {/* New Card Entry Form */}
                  {(isAddingNewCard || (savedMethods.length === 0 && selectedMethodId === 'new')) && (
                    <div className="mt-4 bg-card border p-3 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="text-xs font-semibold mb-1">Enter {paymentMethod === 'credit' ? 'Credit' : 'Debit'} Card Details:</div>
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
                        {savedMethods.length > 0 && (
                          <Button variant="ghost" size="sm" className="flex-1 h-8" onClick={() => { setIsAddingNewCard(false); setSelectedMethodId(savedMethods[0]?.stripe_payment_method_id); }}>Cancel</Button>
                        )}
                        <Button size="sm" className="flex-1 h-8" onClick={handleSaveCard}>Save & Select</Button>
                      </div>
                    </div>
                  )}
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Payment Note (optional)</Label>
                      <Textarea
                        placeholder="e.g. Partial rent for this month"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value.slice(0, 500))}
                        className="bg-white"
                      />
                      <p className="text-[10px] text-right text-slate-400">{paymentNote.length}/500</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button variant="outline" onClick={handleSave} disabled={isLoading || isPaying}>
                        Save Details
                      </Button>
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 font-bold shadow-md"
                        onClick={async () => {
                          // Updated Payment Logic matching handleConfirmPayment
                          if (!isSaved) { toast.error("Please save details first."); return; }
                          if (!isComplianceChecked) { toast.error("Please confirm compliance."); return; }
                          const amount = parseFloat(rentAmount);
                          if (isNaN(amount) || amount <= 0) { toast.error("Invalid amount"); return; }

                          // Determine Method
                          const methodIdToUse = selectedMethodId === 'new' ? savedMethods[0]?.stripe_payment_method_id : selectedMethodId;
                          if (!methodIdToUse) { toast.error("Please add and save a payment method first."); return; }

                          const savedMethod = savedMethods.find(m => m.stripe_payment_method_id === methodIdToUse);
                          const paymentType = savedMethod?.card_type === 'debit' ? 'debit_card' : 
                                         savedMethod?.card_type === 'bank_account' ? 'bank_account' : 'credit_card';

                          setIsPaying(true);
                          const tid = toast.loading("Processing payment...");

                          try {
                            const { data, error: functionError } = await (supabase.functions as any).invoke('execute-payment', {
                              body: {
                                amount,
                                compliance_confirmation: isComplianceChecked,
                                note: paymentNote,
                                payment_method_type: paymentType
                              }
                            });

                            if (functionError) {
                              let msg = functionError.message;
                              try { msg = (await functionError.context.json()).error || msg; } catch { }
                              throw new Error(msg);
                            }
                            if (data?.error) throw new Error(data.error);

                            if (!data?.client_secret) throw new Error("Missing client secret");
                            if (!stripe || !elements) throw new Error("Stripe error");

                            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
                              payment_method: methodIdToUse
                            });

                            if (stripeError) throw new Error(stripeError.message);

                            if (paymentIntent?.status === 'succeeded') {
                              toast.success("Payment Sent!", { id: tid });
                              setPaymentSuccess({ amount, date: new Date().toLocaleString() });
                              setPaymentNote(""); // Clear note
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
            <Button variant="outline" size="sm" onClick={() => {
              fetchSeekerPayments();
              fetchRentLedgers();
            }}>
              <History className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Rent Schedule Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Rent Schedule
            </h3>
            {isLoadingLedgers ? (
              <div className="py-8 flex justify-center"><Clock className="animate-spin h-6 w-6 text-muted-foreground" /></div>
            ) : rentLedgers.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-lg border border-dashed text-center">
                <p className="text-sm text-muted-foreground">No active lease schedule found.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Auto-Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentLedgers.map((ledger) => {
                      const isPayable = ledger.status === 'unpaid' || ledger.status === 'overdue';
                      const isEditing = editingLedgerId === ledger.id;
                      const dueDate = new Date(ledger.due_date);

                      return (
                        <TableRow key={ledger.id}>
                          <TableCell className="font-medium">
                            {dueDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                          </TableCell>
                          <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">$</span>
                                <Input
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="h-8 w-24"
                                  type="number"
                                />
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSaveAmount(ledger.id)} disabled={isSavingAmount}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={handleCancelEdit} disabled={isSavingAmount}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                ${ledger.rent_amount}
                                {isPayable && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-indigo-600 p-0"
                                    onClick={() => handleStartEdit(ledger)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {ledger.lease?.auto_pay_enabled ? (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">On</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Off</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              ledger.status === 'paid' ? "bg-green-100 text-green-800 border-green-200" :
                                ledger.status === 'pending' ? "bg-blue-100 text-blue-800 border-blue-200" :
                                  ledger.status === 'overdue' ? "bg-red-100 text-red-800 border-red-200" :
                                    "bg-slate-100 text-slate-800 border-slate-200"
                            }>
                              {ledger.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={isPayable ? "default" : "secondary"}
                              disabled={!isPayable || isPaying || isEditing}
                              className={isPayable ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                              onClick={() => handleCheckoutClick(ledger)}
                            >
                              Pay Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Checkout Confirmation
                </DialogTitle>
                <DialogDescription>
                  Please review your payment details before confirming.
                </DialogDescription>
              </DialogHeader>

              {checkoutLedger && (
                <div className="space-y-4 py-4">
                  <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment For:</span>
                      <span className="font-medium">Rent - {new Date(checkoutLedger.due_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{new Date(checkoutLedger.due_date).toLocaleDateString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-semibold text-slate-700">Total Amount:</span>
                      <span className="font-bold text-xl text-indigo-600">${checkoutLedger.rent_amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-md bg-white">
                    <div className="bg-slate-100 p-2 rounded">
                      <CreditCard className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="text-sm">
                      {(() => {
                        const selectedCard = savedMethods.find(m => m.stripe_payment_method_id === selectedMethodId);
                        return (
                          <p className="font-medium">
                            Method: {selectedCard
                              ? `${selectedCard.brand ? selectedCard.brand.toUpperCase() : 'Card'} •••• ${selectedCard.last4}`
                              : (cardDetails.number && cardDetails.number.length > 4 ? `Card •••• ${cardDetails.number.slice(-4)}` : 'New Card')}
                          </p>
                        );
                      })()}
                      <p className="text-xs text-muted-foreground">Secure transaction via Stripe</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:justify-between gap-2">
                <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} disabled={isPaying}>Cancel</Button>
                <Button onClick={handleConfirmPayment} disabled={isPaying} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                  {isPaying ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Confirm & Pay</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              Payment History
            </h3>
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
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seekerPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                            {payment.transaction_id?.substring(0, 15) || payment.id.substring(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{payment.recipient_email}</span>
                            <span className="text-[10px] text-muted-foreground">Digital Transfer</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <span className="text-xs text-muted-foreground line-clamp-1 italic">
                            {payment.note || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-indigo-600">
                          ${(payment.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={
                            ['paid', 'paid_to_landlord', 'succeeded'].includes(payment.payment_status)
                              ? "bg-green-100 text-green-800 border-green-200"
                              : payment.payment_status === 'failed'
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                          }>
                            {payment.payment_status === 'paid_to_landlord' ? 'Completed' :
                              ['paid', 'succeeded'].includes(payment.payment_status) ? 'Paid' :
                                payment.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent >
      </Card >

      {/* Bank Selection Dialog */}
      <Dialog open={showBankSelection} onOpenChange={setShowBankSelection}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Choose Your Canadian Bank
            </DialogTitle>
            <DialogDescription>
              Select your Canadian bank to securely connect your account. We support all major Canadian banks and credit unions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for your Canadian bank..."
                value={bankSearchTerm}
                onChange={(e) => setBankSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Popular Banks Grid */}
            {!bankSearchTerm && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Popular Banks
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularBanks.map((bank) => (
                    <Button
                      key={bank.id}
                      variant="outline"
                      className={`h-20 flex-col gap-2 relative ${isConnectingBank && selectedBank?.id === bank.id ? 'opacity-50' : ''}`}
                      onClick={() => !isConnectingBank && handleBankSelection(bank)}
                      disabled={isConnectingBank}
                    >
                      <div className={`absolute top-2 right-2 w-8 h-8 ${bank.color} rounded-full flex items-center justify-center text-white text-lg`}>
                        {bank.logo}
                      </div>
                      <span className="text-sm font-medium">{bank.name}</span>
                      {isConnectingBank && selectedBank?.id === bank.id && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span className="text-xs text-blue-600">Connecting...</span>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* All Banks List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {bankSearchTerm ? 'Search Results' : 'All Banks'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredBanks.map((bank) => (
                  <Button
                    key={bank.id}
                    variant="outline"
                    className={`h-16 justify-start relative ${isConnectingBank && selectedBank?.id === bank.id ? 'opacity-50' : ''}`}
                    onClick={() => !isConnectingBank && handleBankSelection(bank)}
                    disabled={isConnectingBank}
                  >
                    <div className={`w-10 h-10 ${bank.color} rounded-full flex items-center justify-center text-white text-lg mr-3`}>
                      {bank.logo}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-xs text-muted-foreground">{bank.fullName}</div>
                    </div>
                    {isConnectingBank && selectedBank?.id === bank.id && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-600">Connecting...</span>
                      </div>
                    )}
                  </Button>
                ))}
              </div>
              
              {filteredBanks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No banks found matching "{bankSearchTerm}"</p>
                  <p className="text-sm">Try searching with a different term</p>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 text-sm">Bank-Level Security</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Your bank login credentials are encrypted and sent directly to your bank. 
                    We never store or have access to your bank username or password.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBankSelection(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
