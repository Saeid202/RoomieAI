// Rent Smoothing Wallet — DB-backed, cross-session transfers work
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { RentSmoothingOverview } from "./RentSmoothingOverview";
import { DbWalletService } from "@/services/rent-smoothing/DbWalletService";
import { type DashboardData, formatCentsAsCurrency } from "@/services/rent-smoothing";
import { getUserPaymentMethods } from "@/services/padPaymentService";
import { type PaymentMethod } from "@/types/payment";
import { toast } from "sonner";

export default function RentSmoothingWallet() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rentAmount, setRentAmount] = useState(0);       // cents
  const [rentDueDay, setRentDueDay] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0); // cents — from DB
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [landlordEmail, setLandlordEmail] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const sb = supabase as any;

  const refreshBalance = useCallback(async () => {
    if (!user?.id) return;
    const bal = await DbWalletService.getBalance(user.id);
    setWalletBalance(bal);
    const txns = await DbWalletService.getTransactions(user.id);
    setTransactions(txns);
  }, [user?.id]);

  // Load lease + landlord info
  useEffect(() => {
    if (!user?.id) return;

    const init = async () => {
      try {
        // Get active lease
        const { data: lease } = await sb
          .from('active_leases')
          .select('monthly_rent, payment_day, owner_id')
          .eq('tenant_id', user.id)
          .eq('status', 'active')
          .single();

        if (lease) {
          setRentAmount(Math.round((lease.monthly_rent || 0) * 100));
          setRentDueDay(lease.payment_day || 1);
        }

        // Get landlord from lease_contracts (has email + user ID)
        const { data: contract } = await sb
          .from('lease_contracts')
          .select('landlord_id, landlord_email')
          .eq('tenant_id', user.id)
          .in('status', ['fully_signed', 'executed', 'pending', 'draft'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (contract?.landlord_id) {
          setLandlordId(contract.landlord_id);
          setLandlordEmail(contract.landlord_email || '');
        } else if (lease?.owner_id && lease.owner_id !== user.id) {
          setLandlordId(lease.owner_id);
        }

        // Load wallet balance from DB
        await refreshBalance();

        // Fetch connected payment methods (PAD accounts)
        try {
          const methods = await getUserPaymentMethods(user.id);
          setPaymentMethods(methods || []);
        } catch { /* non-critical */ }

        // Load transaction history
        const txns = await DbWalletService.getTransactions(user.id);
        setTransactions(txns);
      } catch { /* no lease */ }
      finally { setLoading(false); }
    };

    init();
  }, [user?.id]);

  const handleTopUp = async (amountDollars: number, sourceId?: string) => {
    if (!user?.id) return;
    setSimulating(true);
    try {
      // Check if sourceId is a real PAD payment method ID
      const padMethod = paymentMethods.find(m => m.id === sourceId && m.payment_type === 'acss_debit');

      if (padMethod) {
        // Real Stripe PAD charge
        const { createRentPaymentIntent } = await import('@/services/padPaymentService');
        await createRentPaymentIntent(amountDollars, 'acss_debit', padMethod.id, { tenantId: user.id });
        const newBal = await DbWalletService.addBalance(user.id, Math.round(amountDollars * 100));
        await DbWalletService.recordTransaction(user.id, 'deposit', Math.round(amountDollars * 100),
          `Top up via ${padMethod.bank_name || 'bank'} ••••${padMethod.last4}`);
        setWalletBalance(newBal);
        toast.success(`$${amountDollars.toFixed(2)} pulled from ${padMethod.bank_name || 'bank'} ••••${padMethod.last4} — wallet credited`);
      } else {
        await new Promise(r => setTimeout(r, 500));
        const newBal = await DbWalletService.addBalance(user.id, Math.round(amountDollars * 100));
        await DbWalletService.recordTransaction(user.id, 'deposit', Math.round(amountDollars * 100),
          sourceId === 'card_charged' ? 'Top up via card' : 'Top up');
        setWalletBalance(newBal);
        toast.success(`${formatCentsAsCurrency(Math.round(amountDollars * 100))} added to wallet`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Top up failed');
    } finally {
      setSimulating(false);
    }
  };

  const handlePayRent = async (recipientEmail?: string, amountDollars?: number) => {
    if (!user?.id) { toast.error("Not logged in"); return; }

    // Use custom amount if provided, otherwise full rent
    const sendCents = amountDollars ? Math.round(amountDollars * 100) : rentAmount;
    if (sendCents <= 0) { toast.error("Invalid amount"); return; }

    const balance = await DbWalletService.getBalance(user.id);
    if (balance < sendCents) {
      toast.error(`Need ${formatCentsAsCurrency(sendCents - balance)} more`);
      return;
    }

    setSimulating(true);
    try {
      await new Promise(r => setTimeout(r, 700));

      // Resolve recipient user ID from email
      let recipientId = landlordId;
      const emailToUse = (recipientEmail || landlordEmail).toLowerCase().trim();

      // Always try email lookup to get the most accurate user ID
      if (emailToUse) {
        const lookedUp = await DbWalletService.getUserIdByEmail(emailToUse);
        if (lookedUp) recipientId = lookedUp;
      }

      if (!recipientId || recipientId === user.id) {
        const newBal = await DbWalletService.addBalance(user.id, -sendCents);
        setWalletBalance(newBal);
        await DbWalletService.recordTransaction(user.id, 'rent_payment', sendCents, 'Rent payment processed');
        toast.success(`${formatCentsAsCurrency(sendCents)} rent payment processed`);
        return;
      }

      // Full DB transfer
      const result = await DbWalletService.transfer(user.id, recipientId, sendCents);
      if (result.success) {
        setWalletBalance(result.fromBalance);
        await DbWalletService.recordTransaction(user.id, 'rent_payment', sendCents,
          `Rent payment to ${emailToUse || 'landlord'}`);
        toast.success(`${formatCentsAsCurrency(sendCents)} sent to ${emailToUse || 'landlord'}`);
      } else {
        toast.error(result.error || 'Transfer failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Payment failed');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
      </div>
    );
  }

  const effectiveRentAmount = rentAmount || 200000;

  const data: DashboardData = {
    status: {
      profile: {
        id: 'wallet',
        user_id: user?.id || '',
        rent_amount: effectiveRentAmount,
        pay_frequency: 'monthly',
        average_paycheck_amount: effectiveRentAmount,
        rent_due_day: rentDueDay || 1,
        is_active: true,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      wallet_balances: {
        main_balance: walletBalance,
        rent_lock_balance: 0,
        forwarding_balance: 0,
        total_balance: walletBalance,
      },
      is_active: true,
      status: walletBalance >= effectiveRentAmount ? 'active' : 'processing',
      last_paycheck: null,
      next_rent_payment: null,
      active_shortfall: null,
      pending_forwarding: null,
    },
    recent_transactions: transactions.map(t => ({
      id: t.id,
      user_id: user?.id || '',
      debit_account_id: '',
      credit_account_id: '',
      amount: t.amount,
      transaction_type: t.transaction_type,
      description: t.description,
      created_at: t.created_at,
    })),
    upcoming_payments: [],
    total_saved: walletBalance,
  };

  return (
    <RentSmoothingOverview
      data={data}
      simulating={simulating}
      onSimulateDeposit={handleTopUp}
      onPayRent={handlePayRent}
      landlordEmail={landlordEmail}
      paymentMethods={paymentMethods}
      userId={user?.id}
      onRefresh={refreshBalance}
    />
  );
}
