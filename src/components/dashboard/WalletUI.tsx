import { useState, useEffect } from "react";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, ChevronRight,
  Eye, EyeOff, Copy, CheckCircle2, AlertTriangle, Loader2,
  CreditCard, Building2, TrendingUp, History,
} from "lucide-react";
import { toast } from "sonner";
import { formatCentsAsCurrency, type DashboardData, type WalletTransaction } from "@/services/rent-smoothing";
import { type PaymentMethod } from "@/types/payment";
import { CardTopUpForm } from "@/components/payment/CardTopUpForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  data: DashboardData;
  simulating: boolean;
  onSimulateDeposit: (amount: number, sourceId?: string) => Promise<void>;
  onPayRent?: (recipientEmail?: string, amountDollars?: number) => Promise<void>;
  landlordEmail?: string;
  paymentMethods?: PaymentMethod[];
  userId?: string;
  onRefresh: () => void;
}

type Sheet = "topup" | "pay" | "history" | null;

export function WalletUI({
  data,
  simulating,
  onSimulateDeposit,
  onPayRent,
  landlordEmail,
  paymentMethods = [],
  userId,
  onRefresh,
}: Props) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);

  // Top-up sheet state
  const [topupAmount, setTopupAmount] = useState("");
  const [topupSource, setTopupSource] = useState<string>("pad_first");
  const [topupLoading, setTopupLoading] = useState(false);

  // Pay rent sheet state
  const [payAmount, setPayAmount] = useState("");
  const [payEmail, setPayEmail] = useState(landlordEmail ?? "");
  const [payLoading, setPayLoading] = useState(false);

  const walletBalance = data.status.wallet_balances.main_balance; // cents
  const rentAmount = data.status.profile?.rent_amount ?? 0; // cents
  const rentLocked = data.status.wallet_balances.rent_lock_balance; // cents
  const isCovered = rentLocked >= rentAmount && rentAmount > 0;
  const coveragePct = rentAmount > 0 ? Math.min(100, Math.round((rentLocked / rentAmount) * 100)) : 0;
  const shortfall = Math.max(0, rentAmount - rentLocked); // cents

  // PAD accounts from paymentMethods
  const padAccounts = paymentMethods.filter(
    (pm) => pm.payment_type === "acss_debit" && pm.mandate_status === "active"
  );

  // Set default topup source
  useEffect(() => {
    if (padAccounts.length > 0) setTopupSource(padAccounts[0].id);
    else setTopupSource("card");
  }, [paymentMethods.length]);

  // Sync pay email when landlordEmail changes
  useEffect(() => {
    if (landlordEmail) setPayEmail(landlordEmail);
  }, [landlordEmail]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleTopUp = async () => {
    const dollars = parseFloat(topupAmount);
    if (!dollars || dollars <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setTopupLoading(true);
    try {
      await onSimulateDeposit(Math.round(dollars * 100), topupSource);
      toast.success(`${formatCentsAsCurrency(Math.round(dollars * 100))} added to wallet`);
      setSheet(null);
      setTopupAmount("");
      onRefresh();
    } catch {
      toast.error("Top-up failed. Try again.");
    } finally {
      setTopupLoading(false);
    }
  };

  const handlePayRent = async () => {
    const dollars = parseFloat(payAmount);
    if (!dollars || dollars <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setPayLoading(true);
    try {
      await onPayRent?.(payEmail || undefined, dollars);
      toast.success(`${formatCentsAsCurrency(Math.round(dollars * 100))} sent`);
      setSheet(null);
      setPayAmount("");
      onRefresh();
    } catch {
      toast.error("Payment failed. Try again.");
    } finally {
      setPayLoading(false);
    }
  };

  const quickTopupPills = [500, 1000, 1500, ...(shortfall > 0 ? [shortfall / 100] : [])];

  return (
    <>
      <div className="space-y-3">
        {/* ── Balance Hero Card ── */}
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 60%, #FF6B35 100%)" }}
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-white/70" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Homie Wallet</span>
              </div>
              <button
                onClick={() => setBalanceHidden((v) => !v)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {balanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="mt-2 mb-4">
              <p className="text-4xl font-black text-white tracking-tight">
                {balanceHidden ? "••••••" : formatCentsAsCurrency(walletBalance)}
              </p>
              <p className="text-xs text-white/60 mt-0.5">Available balance</p>
            </div>

            {/* Rent coverage bar */}
            {rentAmount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white/70">Rent coverage</span>
                  <span className="text-xs font-black text-white">{coveragePct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${coveragePct}%`,
                      background: isCovered
                        ? "linear-gradient(to right, #34D399, #10B981)"
                        : "linear-gradient(to right, #FCD34D, #F59E0B)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-white/50">
                    {balanceHidden ? "••••" : formatCentsAsCurrency(rentLocked)} locked
                  </span>
                  <span className="text-xs text-white/50">
                    of {balanceHidden ? "••••" : formatCentsAsCurrency(rentAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: ArrowDownLeft, label: "Top Up", color: "text-purple-600", bg: "bg-purple-50", action: () => setSheet("topup") },
            { icon: ArrowUpRight, label: "Withdraw", color: "text-slate-500", bg: "bg-slate-50", action: () => toast.info("Withdrawals coming soon") },
            { icon: History, label: "History", color: "text-orange-500", bg: "bg-orange-50", action: () => setSheet("history") },
          ].map(({ icon: Icon, label, color, bg, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/30 transition-all active:scale-95"
            >
              <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-4.5 w-4.5 ${color}`} />
              </div>
              <span className="text-xs font-bold text-slate-600">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Rent Status ── */}
        {rentAmount > 0 && (
          <div className="rounded-2xl border-2 border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rent Due</p>
                <p className="text-xl font-black text-slate-900">{formatCentsAsCurrency(rentAmount)}</p>
                {isCovered ? (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">Fully covered</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600">
                      {formatCentsAsCurrency(shortfall)} short
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  setPayAmount((rentAmount / 100).toFixed(2));
                  setSheet("pay");
                }}
                className="h-11 px-5 rounded-xl font-black text-white shadow-md"
                style={{
                  background: isCovered
                    ? "linear-gradient(to right, #10B981, #059669)"
                    : "linear-gradient(135deg, #8B5CF6, #FF6B35)",
                }}
              >
                Pay Rent
              </Button>
            </div>
          </div>
        )}

        {/* ── Virtual Bank Details ── */}
        <div className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
          <button
            onClick={() => setBankOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold text-slate-700">Virtual Bank Details</span>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${bankOpen ? "rotate-90" : ""}`}
            />
          </button>

          {bankOpen && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-100">
              {[
                { label: "Account Number", value: "1234567890", key: "acct" },
                { label: "Transit Number", value: "12345", key: "transit" },
                { label: "Institution", value: "001", key: "inst" },
              ].map(({ label, value, key }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-black text-slate-800 font-mono mt-0.5">{value}</p>
                  </div>
                  <button
                    onClick={() => copy(value, key)}
                    className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-purple-100 flex items-center justify-center transition-colors"
                  >
                    {copied === key
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TOP UP SHEET
      ══════════════════════════════════════════ */}
      <Sheet open={sheet === "topup"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8 max-h-[92vh] overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-xl font-black text-slate-900">Top Up Wallet</SheetTitle>
          </SheetHeader>

          {/* Big amount input */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
            <Input
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="h-16 pl-10 text-3xl font-black border-2 border-slate-200 rounded-2xl focus:border-purple-400"
            />
          </div>

          {/* Quick pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {quickTopupPills.map((amt) => (
              <button
                key={amt}
                onClick={() => setTopupAmount(amt.toFixed(2))}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-black transition-all ${
                  topupAmount === amt.toFixed(2)
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                }`}
              >
                {amt === shortfall / 100 && shortfall > 0 ? `+${formatCentsAsCurrency(shortfall)} shortfall` : `$${amt.toFixed(0)}`}
              </button>
            ))}
          </div>

          {/* Source selector */}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">From</p>
          <div className="space-y-2 mb-5">
            {padAccounts.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setTopupSource(pm.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                  topupSource === pm.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 bg-white hover:border-purple-200"
                }`}
              >
                <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800">
                    {pm.bank_name ?? "Bank Account"}
                  </p>
                  <p className="text-xs text-slate-500">
                    ••••{pm.last4} · PAD
                  </p>
                </div>
                {topupSource === pm.id && (
                  <CheckCircle2 className="h-4 w-4 text-purple-500 ml-auto" />
                )}
              </button>
            ))}

            {/* Credit/Debit Card option */}
            <button
              onClick={() => setTopupSource("card")}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                topupSource === "card"
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 bg-white hover:border-purple-200"
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4.5 w-4.5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800">Credit / Debit Card</p>
                <p className="text-xs text-slate-500">Instant · 2.9% + 30¢</p>
              </div>
              {topupSource === "card" && (
                <CheckCircle2 className="h-4 w-4 text-purple-500 ml-auto" />
              )}
            </button>
          </div>

          {/* Card form inline */}
          {topupSource === "card" ? (
            <CardTopUpForm
              amount={parseFloat(topupAmount) || 0}
              userId={userId ?? ""}
              onSuccess={(dollars) => {
                onSimulateDeposit(Math.round(dollars * 100), "card").then(() => {
                  setSheet(null);
                  setTopupAmount("");
                  onRefresh();
                });
              }}
              onCancel={() => setSheet(null)}
            />
          ) : (
            <Button
              onClick={handleTopUp}
              disabled={topupLoading || !topupAmount || parseFloat(topupAmount) <= 0}
              className="w-full h-14 rounded-2xl font-black text-base text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 60%, #FF6B35 100%)" }}
            >
              {topupLoading ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
              ) : (
                `Top Up ${topupAmount ? `$${parseFloat(topupAmount).toFixed(2)}` : ""}`
              )}
            </Button>
          )}
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════
          PAY RENT SHEET
      ══════════════════════════════════════════ */}
      <Sheet open={sheet === "pay"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-xl font-black text-slate-900">Pay Rent</SheetTitle>
          </SheetHeader>

          {/* Big amount input */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
            <Input
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="h-16 pl-10 text-3xl font-black border-2 border-slate-200 rounded-2xl focus:border-purple-400"
            />
          </div>

          {/* Quick buttons */}
          {rentAmount > 0 && (
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setPayAmount((rentAmount / 100).toFixed(2))}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-black text-slate-600 hover:border-purple-300 transition-all"
              >
                Full rent
              </button>
              <button
                onClick={() => setPayAmount((rentAmount / 200).toFixed(2))}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-black text-slate-600 hover:border-purple-300 transition-all"
              >
                Half rent
              </button>
            </div>
          )}

          {/* Recipient email */}
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Recipient Email
            </label>
            <Input
              value={payEmail}
              onChange={(e) => setPayEmail(e.target.value)}
              placeholder="landlord@email.com"
              type="email"
              className="h-12 border-2 border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <Button
            onClick={handlePayRent}
            disabled={payLoading || !payAmount || parseFloat(payAmount) <= 0}
            className="w-full h-14 rounded-2xl font-black text-base text-white shadow-lg"
            style={{
              background: isCovered
                ? "linear-gradient(to right, #10B981, #059669)"
                : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 60%, #FF6B35 100%)",
            }}
          >
            {payLoading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending...</>
            ) : (
              `Send ${payAmount ? `$${parseFloat(payAmount).toFixed(2)}` : ""}`
            )}
          </Button>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════
          HISTORY SHEET
      ══════════════════════════════════════════ */}
      <Sheet open={sheet === "history"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-xl font-black text-slate-900">Transaction History</SheetTitle>
          </SheetHeader>

          {data.recent_transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">No transactions yet</p>
              <p className="text-xs text-slate-400 mt-1">Top up your wallet to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent_transactions.map((tx: WalletTransaction) => {
                const isCredit = tx.transaction_type === "deposit";
                const isRent = tx.transaction_type === "rent_payment";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 bg-white"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCredit ? "bg-emerald-50" : isRent ? "bg-purple-50" : "bg-slate-50"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-4.5 w-4.5 text-emerald-600" />
                      ) : isRent ? (
                        <Wallet className="h-4.5 w-4.5 text-purple-600" />
                      ) : (
                        <Clock className="h-4.5 w-4.5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {tx.description ?? tx.transaction_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString("en-CA", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-black flex-shrink-0 ${
                        isCredit ? "text-emerald-600" : "text-slate-800"
                      }`}
                    >
                      {isCredit ? "+" : "−"}{formatCentsAsCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
