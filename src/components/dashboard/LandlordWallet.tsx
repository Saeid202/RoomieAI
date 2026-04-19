// Landlord Wallet — receive rent, withdraw to bank or card
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/services/feeCalculationService";
import {
  Wallet, ArrowUpRight, History, Eye, EyeOff,
  CheckCircle2, ArrowDownLeft, Building2, ChevronRight,
  Loader2, TrendingUp, CreditCard, Plus
} from "lucide-react";
import { toast } from "sonner";

interface IncomingPayment {
  id: string;
  tenant_name: string;
  amount: number;
  created_at: string;
  status: string;
}

interface LandlordWalletProps {
  balance: number;
  payments: IncomingPayment[];
  payoutConnected: boolean;
  payoutBankName?: string;
  payoutLast4?: string;
  onWithdraw: (amount: number) => Promise<void>;
}

export function LandlordWallet({ balance, payments, payoutConnected, payoutBankName, payoutLast4, onWithdraw }: LandlordWalletProps) {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<"bank" | "card">("bank");
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;
    if (amt > balance) { toast.error("Amount exceeds available balance"); return; }
    setProcessing(true);
    try {
      await onWithdraw(amt);
      toast.success("$" + amt.toFixed(2) + " withdrawal initiated");
      setWithdrawAmount("");
      setWithdrawOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Withdrawal failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-6">

        {/* Balance hero */}
        <div className="px-5 pt-5 pb-4"
          style={{ background: "linear-gradient(to right, #8B5CF6, #A855F7, #FF6B35)" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-white/80" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Homie Wallet</span>
            </div>
            <button onClick={() => setShowBalance(s => !s)} className="text-white/70 hover:text-white transition-colors">
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 mb-1">
            <p className="text-3xl font-black text-white tracking-tight">
              {showBalance ? formatCurrency(balance) : "••••••"}
            </p>
            <p className="text-xs text-purple-200 mt-1">Available to withdraw · Rent payments received</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
          {[
            { icon: ArrowUpRight, label: "Withdraw", action: () => setWithdrawOpen(true), color: "text-green-600" },
            { icon: History,      label: "History",  action: () => setHistoryOpen(true),  color: "text-slate-600" },
          ].map(({ icon: Icon, label, action, color }) => (
            <button key={label} onClick={action}
              className="flex flex-col items-center gap-1.5 py-3.5 hover:bg-slate-50 transition-colors">
              <div className={`h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600">{label}</span>
            </button>
          ))}
        </div>

        {/* Latest incoming payment */}
        {payments.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Latest Payment</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{payments[0].tenant_name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(payments[0].created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                </p>
              </div>
              <p className="text-sm font-bold text-green-600">+{formatCurrency(payments[0].amount)}</p>
            </div>
          </div>
        )}

        {/* Payout account row — only show when connected with valid data */}
        {payoutConnected && (payoutBankName || payoutLast4) && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center justify-between py-2.5 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {"Payout to " + (payoutBankName || "Bank") + (payoutLast4 ? " ••••" + payoutLast4 : "")}
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Sheet */}
      <Sheet open={withdrawOpen} onOpenChange={open => { setWithdrawOpen(open); if (!open) setShowCardForm(false); }}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-lg font-black">Withdraw Funds</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">

            {/* Balance */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs font-semibold text-green-700">Available: {formatCurrency(balance)}</p>
            </div>

            {/* Amount */}
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount</p>
              <div className="flex items-center gap-1">
                <span className="text-4xl font-black text-slate-300">$</span>
                <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  className="flex-1 text-4xl font-black text-slate-900 bg-transparent border-none outline-none"
                  placeholder={balance.toFixed(2)} autoFocus />
              </div>
            </div>

            {/* Quick fill */}
            <div className="grid grid-cols-3 gap-2">
              {[balance * 0.25, balance * 0.5, balance].map((amt, i) => (
                <button key={i} onClick={() => setWithdrawAmount(amt.toFixed(2))}
                  className={`py-3 rounded-xl text-sm font-black transition-all ${
                    withdrawAmount === amt.toFixed(2) ? "text-white shadow-md" : "bg-white border-2 border-slate-200 text-slate-700 hover:border-green-400 hover:bg-green-50"
                  }`}
                  style={withdrawAmount === amt.toFixed(2) ? { background: "linear-gradient(to right, #10B981, #059669)" } : {}}>
                  {i === 0 ? "25%" : i === 1 ? "50%" : "All"}
                </button>
              ))}
            </div>

            {/* Payout destination */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Withdraw to</p>

              {/* Existing bank account */}
              {payoutConnected && (
                <button onClick={() => { setSelectedPayout("bank"); setShowCardForm(false); }}
                  className={"w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left " +
                    (selectedPayout === "bank" ? "border-green-500 bg-green-50" : "border-slate-100 bg-white hover:border-green-400")}>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{payoutBankName || "Bank Account"} ••••{payoutLast4}</p>
                    <p className="text-xs text-slate-400">1–2 business days · No fee</p>
                  </div>
                  {selectedPayout === "bank" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </button>
              )}

              {/* Debit card — instant */}
              <button onClick={() => { setSelectedPayout("card"); setShowCardForm(true); }}
                className={"w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left " +
                  (selectedPayout === "card" ? "border-purple-500 bg-purple-50" : "border-slate-100 bg-white hover:border-purple-400")}>
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Debit Card</p>
                  <p className="text-xs text-slate-400">Instant · 1% fee</p>
                </div>
                {selectedPayout === "card" && <CheckCircle2 className="h-5 w-5 text-purple-500" />}
              </button>

              {/* Add new bank */}
              <button onClick={() => { setWithdrawOpen(false); navigate("/dashboard/landlord/payout-setup"); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all text-left bg-white">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">Add Bank Account</p>
                  <p className="text-xs text-slate-400">TD, RBC, BMO, Scotiabank and more</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </button>
            </div>

            {/* Card form */}
            {showCardForm && selectedPayout === "card" && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Debit Card Details</p>
                <Input value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())}
                  placeholder="1234 5678 9012 3456" className="h-11 font-semibold tracking-widest border-2 border-slate-200" inputMode="numeric" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={cardExpiry}
                    onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,4); setCardExpiry(d.length>=3?d.slice(0,2)+'/'+d.slice(2):d); }}
                    placeholder="MM/YY" className="h-11 font-semibold border-2 border-slate-200" inputMode="numeric" />
                  <Input value={cardCvc}
                    onChange={e => setCardCvc(e.target.value.replace(/\D/g,'').slice(0,4))}
                    placeholder="CVC" className="h-11 font-semibold border-2 border-slate-200" inputMode="numeric" />
                </div>
              </div>
            )}

            <Button onClick={handleWithdraw}
              disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              className="w-full h-14 font-black text-lg rounded-2xl"
              style={{ background: "linear-gradient(to right, #10B981, #059669)" }}>
              {processing
                ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
                : "Withdraw " + (withdrawAmount ? "$" + parseFloat(withdrawAmount).toFixed(2) : "")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[70vh]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-bold">Payment History</SheetTitle>
          </SheetHeader>
          {payments.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No payments received yet</p>
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto">
              {payments.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{p.tenant_name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+{formatCurrency(p.amount)}</p>
                    <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded-full " +
                      (p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
