import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Wallet, Clock, Building2, CheckCircle2, ChevronRight, Plus, CreditCard } from "lucide-react";
import {
  getLandlordPayments,
  calculatePaymentSummary,
  getPaymentStatusDisplay,
  getPaymentMethodDisplay,
  calculateExpectedPayoutDate,
  type LandlordPayment
} from "@/services/landlordPaymentService";
import { formatCurrency } from "@/services/feeCalculationService";
import { LandlordWallet } from "@/components/dashboard/LandlordWallet";
import { DbWalletService } from "@/services/rent-smoothing/DbWalletService";
import { getPayoutStatus, savePayoutBankAccount, type PayoutStatus } from "@/services/payoutService";
import { toast } from "sonner";

const CANADIAN_BANKS = [
  { name: 'TD Canada Trust', code: '004' },
  { name: 'Royal Bank (RBC)', code: '003' },
  { name: 'Bank of Nova Scotia (Scotiabank)', code: '002' },
  { name: 'Bank of Montreal (BMO)', code: '001' },
  { name: 'CIBC', code: '010' },
  { name: 'National Bank', code: '006' },
  { name: 'HSBC Canada', code: '016' },
  { name: 'Desjardins', code: '815' },
  { name: 'Tangerine', code: '614' },
  { name: 'Other', code: '' },
];

const inputCls = `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base
  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400`;

export default function LandlordPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<LandlordPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatus | null>(null);

  // Bank account modal state
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState('');
  const [holderName, setHolderName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [transit, setTransit] = useState('');
  const [account, setAccount] = useState('');
  const [accountConfirm, setAccountConfirm] = useState('');
  const [showCheque, setShowCheque] = useState(false);

  // Wallet balance — reads from DB wallet_accounts
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    DbWalletService.getBalance(user.id).then(bal => {
      setWalletBalance(bal / 100); // cents → dollars for display
    }).catch(() => {});

    // Poll every 5 seconds to catch incoming payments
    const interval = setInterval(() => {
      DbWalletService.getBalance(user.id!).then(bal => {
        setWalletBalance(bal / 100);
      }).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    Promise.all([
      getLandlordPayments(user.id),
      getPayoutStatus(user.id),
    ])
      .then(([p, s]) => { setPayments(p); setPayoutStatus(s); })
      .catch(e => setError(e.message || 'Failed to load payments'))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-600">Please log in.</p></div>;

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4" />
        <p className="text-slate-600">Loading payments...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="px-6 py-8">
      <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
    </div>
  );

  const summary = calculatePaymentSummary(payments);

  const handleWithdraw = async (amount: number) => {
    await new Promise(r => setTimeout(r, 800));
    if (user?.id) {
      await DbWalletService.addBalance(user.id, -Math.round(amount * 100));
      const newBal = await DbWalletService.getBalance(user.id);
      setWalletBalance(newBal / 100);
    }
  };

  const openBankModal = () => {
    setHolderName(payoutStatus?.account_holder_name || '');
    setSelectedBank('');
    setInstitutionCode('');
    setTransit('');
    setAccount('');
    setAccountConfirm('');
    setBankError('');
    setShowCheque(false);
    setShowBankModal(true);
  };

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bank = CANADIAN_BANKS.find(b => b.name === e.target.value);
    setSelectedBank(e.target.value);
    setInstitutionCode(bank?.code || '');
  };

  const handleBankSave = async () => {
    if (!holderName.trim()) { setBankError('Enter the account holder name'); return; }
    if (!institutionCode || institutionCode.length !== 3) { setBankError('Select your bank or enter a 3-digit institution number'); return; }
    if (transit.length !== 5) { setBankError('Transit number must be exactly 5 digits'); return; }
    if (account.length < 7 || account.length > 12) { setBankError('Account number must be 7–12 digits'); return; }
    if (account !== accountConfirm) { setBankError('Account numbers do not match'); return; }
    setBankError('');
    setBankSaving(true);
    try {
      await savePayoutBankAccount({
        account_holder_name: holderName,
        institution_number: institutionCode,
        transit_number: transit,
        account_number: account,
      });
      // Refresh payout status
      if (user) {
        const updated = await getPayoutStatus(user.id);
        setPayoutStatus(updated);
      }
      setShowBankModal(false);
      toast.success('Bank account connected! Payouts are now enabled.');
    } catch (e: any) {
      setBankError(e.message || 'Failed to connect bank account. Please check your details.');
    } finally {
      setBankSaving(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-full px-6 py-8">
        {/* Landlord Wallet — serves as the page header */}
        <LandlordWallet
          balance={walletBalance}
          payments={payments.map(p => ({
            id: p.id,
            tenant_name: p.tenant_name,
            amount: p.net_amount,
            created_at: p.created_at,
            status: p.status,
          }))}
          payoutConnected={!!payoutStatus?.connected}
          payoutBankName={payoutStatus?.bank_name}
          payoutLast4={payoutStatus?.last4}
          onWithdraw={handleWithdraw}
        />

        {/* Bank Account Section */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Payout Accounts</p>
                  <p className="text-xs text-slate-400">Where your rent payments are sent</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {payoutStatus?.connected ? (
              <>
                {/* Connected account card */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">
                      {payoutStatus.bank_name || 'Bank Account'}
                      {payoutStatus.last4 && <span className="text-slate-500 font-normal ml-2">••••{payoutStatus.last4}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Pre-Authorized Debit · Default payout</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </span>
                    <button onClick={openBankModal} className="text-[10px] font-semibold text-purple-600 hover:underline">
                      Update
                    </button>
                  </div>
                </div>

                {/* Add more options */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={openBankModal}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                      <Plus className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">Add Bank Account</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">TD, RBC, BMO & more</p>
                    </div>
                  </button>
                  <button onClick={openBankModal}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <CreditCard className="h-5 w-5 text-slate-500 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">Add Debit Card</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Instant payout · 1% fee</p>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              /* Not connected state */
              <div className="flex flex-col items-center py-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
                  <Building2 className="h-7 w-7 text-amber-500" />
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">No payout account connected</p>
                <p className="text-xs text-slate-400 mb-4 max-w-[200px]">Connect your bank to receive rent payments automatically</p>
                <div className="flex gap-3 w-full">
                  <button onClick={openBankModal}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
                    style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}>
                    <Plus className="h-4 w-4" /> Add Bank Account
                  </button>
                  <button onClick={openBankModal}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <CreditCard className="h-4 w-4" /> Add Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 lg:grid-cols-3 mb-8">
          {[
            { label: 'Available Balance', value: summary.available_balance, sub: 'Ready for payout', icon: <Wallet className="h-5 w-5 text-white" />, grad: 'from-purple-500 to-orange-400', border: 'border-purple-200' },
            { label: 'Pending', value: summary.pending_balance, sub: 'Processing payments', icon: <TrendingUp className="h-5 w-5 text-white" />, grad: 'from-amber-400 to-orange-500', border: 'border-amber-200' },
            { label: 'This Month', value: summary.total_this_month, sub: 'Total received', icon: <DollarSign className="h-5 w-5 text-white" />, grad: 'from-green-400 to-emerald-500', border: 'border-green-200' },
          ].map(c => (
            <Card key={c.label} className={"border-2 shadow-sm " + c.border}>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">{c.label}</CardTitle>
                  <div className={"h-9 w-9 rounded-xl bg-gradient-to-br " + c.grad + " flex items-center justify-center"}>{c.icon}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-black text-slate-900">{formatCurrency(c.value)}</div>
                <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment History */}
        {payments.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 mb-6">
                <DollarSign className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Payments Yet</h3>
              <p className="text-slate-600 max-w-md">When tenants pay rent, you'll see their payments here.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-xl font-semibold text-slate-900">Payment History</CardTitle>
              <CardDescription>Recent rent payments from your tenants</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {payments.map(p => {
                const sd = getPaymentStatusDisplay(p.status);
                const pm = getPaymentMethodDisplay(p.payment_method_type);
                const ep = calculateExpectedPayoutDate(p.created_at, p.payment_method_type, p.expected_clear_date);
                return (
                  <div key={p.id} className="flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all bg-white">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-slate-900 text-lg">{p.tenant_name}</p>
                        <Badge variant={sd.variant} className="font-medium">{sd.label}</Badge>
                        <Badge variant="outline" className="border-slate-300 text-slate-700">{pm}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{p.property_address}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          Paid: {new Date(p.created_at).toLocaleDateString()} ·{' '}
                          {p.payment_cleared_at
                            ? `Paid out: ${new Date(p.payment_cleared_at).toLocaleDateString()}`
                            : `Expected: ${ep}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <p className="font-bold text-2xl text-slate-900">{formatCurrency(p.net_amount)}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Rent: {formatCurrency(p.amount)} - Fee: {formatCurrency(p.transaction_fee)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>

      {/* Bank Account Modal */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {payoutStatus?.connected ? 'Update Bank Account' : 'Connect Bank Account'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {payoutStatus?.connected && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <p className="font-semibold mb-0.5">Updating your bank account</p>
                <p className="text-xs">For security, please re-enter your complete banking details.</p>
              </div>
            )}

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Holder Name</label>
              <input type="text" className={inputCls} placeholder="Full legal name as on your bank account"
                value={holderName} onChange={e => setHolderName(e.target.value)} />
            </div>

            {/* Bank Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Bank</label>
              <select className={inputCls} value={selectedBank} onChange={handleBankSelect}>
                <option value="">Select your bank...</option>
                {CANADIAN_BANKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            {/* Institution + Transit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Institution Number</label>
                <input type="text" inputMode="numeric" maxLength={3} className={`${inputCls} font-mono`}
                  placeholder="3 digits" value={institutionCode}
                  onChange={e => setInstitutionCode(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Transit Number</label>
                  <button type="button" onClick={() => setShowCheque(v => !v)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    Where is this?
                  </button>
                </div>
                <input type="text" inputMode="numeric" maxLength={5} className={`${inputCls} font-mono`}
                  placeholder="5 digits" value={transit}
                  onChange={e => setTransit(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            {showCheque && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">Find these numbers at the bottom of a cheque:</p>
                <div className="font-mono bg-white border border-blue-200 rounded-lg p-3 text-center text-xs tracking-widest">
                  ⑆ <span className="text-purple-700 font-bold">TTTTT</span> ⑆ <span className="text-blue-700 font-bold">III</span> ⑆ <span className="text-green-700 font-bold">AAAAAAAAAA</span>
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span><span className="text-purple-700 font-bold">T</span> = Transit (5)</span>
                  <span><span className="text-blue-700 font-bold">I</span> = Institution (3)</span>
                  <span><span className="text-green-700 font-bold">A</span> = Account</span>
                </div>
              </div>
            )}

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
              <input type="text" inputMode="numeric" className={`${inputCls} font-mono`}
                placeholder="7–12 digits" value={account}
                onChange={e => setAccount(e.target.value.replace(/\D/g, ''))} />
            </div>

            {/* Confirm Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Account Number</label>
              <input type="text" inputMode="numeric" className={`${inputCls} font-mono`}
                placeholder="Re-enter account number" value={accountConfirm}
                onChange={e => setAccountConfirm(e.target.value.replace(/\D/g, ''))} />
            </div>

            {bankError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                {bankError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" disabled={bankSaving} onClick={handleBankSave}
                className="flex-1 py-3.5 rounded-xl text-white font-bold text-base disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}>
                {bankSaving ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg> Saving...</>
                ) : 'Save Bank Account'}
              </button>
              <button type="button" onClick={() => setShowBankModal(false)}
                className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              🔒 Your banking information is encrypted and processed securely via Stripe
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
