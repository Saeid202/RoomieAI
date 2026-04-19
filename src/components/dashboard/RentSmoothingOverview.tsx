// Homie Wallet — Coming Soon
import { Lock } from "lucide-react";
import { type DashboardData } from "@/services/rent-smoothing";
import { type PaymentMethod } from "@/types/payment";

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

export function RentSmoothingOverview(_props: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-8 flex flex-col items-center justify-center text-center"
        style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 60%, #FF6B35 100%)" }}>
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
