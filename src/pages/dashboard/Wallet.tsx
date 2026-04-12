import { useState } from "react";
import { Building2, ShieldCheck, Home } from "lucide-react";
import DigitalWallet from "@/pages/dashboard/tenant/TenantPayments";

export default function WalletPage() {
  const [tab, setTab] = useState<"rent" | "mortgage">("rent");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Tab switcher */}
      <div className="px-6 pt-6 pb-0">
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-sm">
          <button
            onClick={() => setTab("rent")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              tab === "rent"
                ? "bg-white text-purple-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Building2 className={`h-4 w-4 ${tab === "rent" ? "text-purple-600" : "text-slate-400"}`} />
            Pay Your Rent
          </button>
          <button
            onClick={() => setTab("mortgage")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              tab === "mortgage"
                ? "bg-white text-orange-600 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${tab === "mortgage" ? "text-orange-600" : "text-slate-400"}`} />
            Pay Your Mortgage
          </button>
        </div>
      </div>

      {tab === "rent" ? (
        <DigitalWallet />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="rounded-full bg-orange-50 p-6 mb-5">
            <Home className="h-12 w-12 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Mortgage Payments</h2>
          <p className="text-slate-500 max-w-sm">
            Mortgage payment functionality is coming soon. Once your mortgage is set up, you'll be able to manage and track payments here.
          </p>
        </div>
      )}
    </div>
  );
}
