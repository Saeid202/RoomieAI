// Homie Wallet gate — reads admin Coming Soon setting
// ON  (comingSoon=true)  → show lock screen
// OFF (comingSoon=false) → show full wallet UI
import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { type DashboardData } from "@/services/rent-smoothing";
import { type PaymentMethod } from "@/types/payment";
import { WalletUI } from "@/components/dashboard/WalletUI";

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

export function RentSmoothingOverview(props: Props) {
  const [comingSoon, setComingSoon] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      // Read from localStorage (set by admin)
      const local = localStorage.getItem("wallet_coming_soon");
      // Default: true (locked) until admin explicitly turns it off
      setComingSoon(local === null ? true : local === "true");
    };
    check();
  }, []);

  if (comingSoon === null) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
      </div>
    );
  }

  if (comingSoon) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-8 flex flex-col items-center justify-center text-center"
          style={{ background: "linear-gradient(to right, #8B5CF6, #A855F7, #FF6B35)" }}>
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <p className="text-lg font-black text-white">Homie Wallet</p>
          <p className="text-sm text-purple-200 mt-1 font-medium">Coming Soon</p>
          <p className="text-xs text-purple-300 mt-2 max-w-[200px] leading-relaxed">
            Top up, pay rent, and manage your balance — launching shortly.
          </p>
        </div>
      </div>
    );
  }

  // Wallet is live — render full UI
  return <WalletUI {...props} />;
}
