import { useState, useEffect } from "react";
import { Building2, ShieldCheck, CreditCard, Plus, Home, Loader2, Trash2, Star } from "lucide-react";
import DigitalWallet from "@/pages/dashboard/tenant/TenantPayments";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { getUserPaymentMethods, deletePaymentMethod } from "@/services/padPaymentService";
import { PaymentMethod } from "@/types/payment";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function WalletPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"rent" | "mortgage">("rent");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);

  const fetchMethods = async () => {
    if (!user?.id) return;
    try {
      const methods = await getUserPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch {}
  };

  useEffect(() => { fetchMethods(); }, [user?.id]);

  const handleDelete = async (method: PaymentMethod) => {
    setDeletingMethodId(method.id);
    try {
      await deletePaymentMethod(method.id);
      toast.success('Payment method removed');
      fetchMethods();
    } catch { toast.error('Failed to remove'); }
    finally { setDeletingMethodId(null); }
  };

  const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Tab switcher */}
      <div className="px-6 pt-6 pb-0">
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-sm">
          <button onClick={() => setTab("rent")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${tab === "rent" ? "bg-white text-purple-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
            <Building2 className={`h-4 w-4 ${tab === "rent" ? "text-purple-600" : "text-slate-400"}`} />
            Pay Your Rent
          </button>
          <button onClick={() => setTab("mortgage")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${tab === "mortgage" ? "bg-white text-orange-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
            <ShieldCheck className={`h-4 w-4 ${tab === "mortgage" ? "text-orange-600" : "text-slate-400"}`} />
            Pay Your Mortgage
          </button>
        </div>
      </div>

      {tab === "rent" ? (
        <DigitalWallet />
      ) : (
        <div className="px-6 py-8">
          {/* Same gradient header as rent tab */}
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
                  <p className="text-purple-100 text-sm font-medium mt-0.5">Manage your mortgage payments with Canadian Pre-Authorized Debit (PAD)</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(true)}
                className="flex-shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
                {paymentMethods.length === 0 ? (
                  <><Plus className="h-4 w-4" /> Add Payment</>
                ) : (
                  <><Building2 className="h-4 w-4" />
                    {`${defaultMethod.bank_name || 'Bank'} ••••${defaultMethod.last4 || defaultMethod.stripe_payment_method_id?.slice(-4)}`}
                    <span className="ml-1 opacity-70">▾</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coming soon */}
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-orange-50 p-6 mb-5">
              <Home className="h-12 w-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Mortgage Payments Coming Soon</h2>
            <p className="text-slate-500 max-w-sm">
              Once your mortgage is set up, you'll be able to manage and track payments here using your connected bank account.
            </p>
          </div>
        </div>
      )}

      {/* Shared payment methods drawer */}
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
                  userId={user!.id} propertyId="" landlordId="" rentAmount={0} dueDate=""
                  onBankConnected={() => { setShowAddFlow(false); fetchMethods(); toast.success('Bank account connected!'); }}
                  onCancel={() => setShowAddFlow(false)}
                  connectOnly={true}
                />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-10">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">No payment methods yet</p>
                <button onClick={() => setShowAddFlow(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}>
                  Connect Bank Account
                </button>
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
                      <button onClick={() => handleDelete(method)} disabled={deletingMethodId === method.id}
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
    </div>
  );
}
