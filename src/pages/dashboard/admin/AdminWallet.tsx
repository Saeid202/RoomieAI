import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Search,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Home,
  RefreshCw,
  Snowflake,
  PlusCircle,
  MinusCircle,
  Clock,
  Filter,
  Settings,
  ToggleLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EnhancedPageLayout,
  EnhancedHeader,
  StatCard,
  EnhancedCard,
  EnhancedSectionHeader,
} from "@/components/ui/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletAccount {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  user_email?: string;
}

interface PlatformStats {
  totalBalance: number;
  txThisMonth: number;
  rentPaid: number;
  topUps: number;
}

interface WalletSettings {
  feeRate: number;
  minAmount: number;
  maxAmount: number;
  walletEnabled: boolean;
  comingSoon: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(n);

const statusColor: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  reversed: "bg-gray-100 text-gray-600",
};

const typeColor: Record<string, string> = {
  top_up: "bg-blue-100 text-blue-700",
  rent_payment: "bg-purple-100 text-purple-700",
  withdrawal: "bg-orange-100 text-orange-700",
  credit: "bg-green-100 text-green-700",
  debit: "bg-red-100 text-red-700",
  refund: "bg-teal-100 text-teal-700",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminWalletPage() {
  // Platform stats
  const [stats, setStats] = useState<PlatformStats>({
    totalBalance: 0,
    txThisMonth: 0,
    rentPaid: 0,
    topUps: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // User wallet search
  const [searchEmail, setSearchEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundWallet, setFoundWallet] = useState<WalletAccount | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Transaction monitor
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txStatusFilter, setTxStatusFilter] = useState("all");
  const [txSearch, setTxSearch] = useState("");

  // Wallet settings (local state — wire to DB as needed)
  const [settings, setSettings] = useState<WalletSettings>({
    feeRate: 1.5,
    minAmount: 10,
    maxAmount: 10000,
    walletEnabled: true,
    comingSoon: false,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data: wallets } = await db
        .from("wallet_accounts")
        .select("balance");

      const totalBalance = (wallets ?? []).reduce(
        (sum: number, w: any) => sum + (w.balance ?? 0),
        0
      );

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: txMonth } = await db
        .from("wallet_transactions")
        .select("id, type, amount")
        .gte("created_at", startOfMonth.toISOString());

      const txThisMonth = (txMonth ?? []).length;
      const rentPaid = (txMonth ?? [])
        .filter((t: any) => t.type === "rent_payment")
        .reduce((s: number, t: any) => s + (t.amount ?? 0), 0);
      const topUps = (txMonth ?? [])
        .filter((t: any) => t.type === "top_up")
        .reduce((s: number, t: any) => s + (t.amount ?? 0), 0);

      setStats({ totalBalance, txThisMonth, rentPaid, topUps });
    } catch (e) {
      console.error("Stats fetch error", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const { data, error } = await db
        .from("wallet_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data ?? []);
    } catch (e) {
      console.error("Tx fetch error", e);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [fetchStats, fetchTransactions]);

  // ── User wallet search ───────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearchLoading(true);
    setFoundWallet(null);
    try {
      // Look up user profile by email
      const { data: profile } = await db
        .from("user_profiles")
        .select("id, full_name, email")
        .ilike("email", searchEmail.trim())
        .maybeSingle();

      if (!profile) {
        toast.error("No user found with that email.");
        return;
      }

      const { data: wallet } = await db
        .from("wallet_accounts")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (!wallet) {
        toast.error("This user has no wallet account.");
        return;
      }

      setFoundWallet({
        ...wallet,
        user_email: profile.email,
        user_name: profile.full_name,
      });
    } catch (e: any) {
      toast.error(e.message ?? "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFreezeToggle = async () => {
    if (!foundWallet) return;
    const next = !foundWallet.is_frozen;
    try {
      const { error } = await db
        .from("wallet_accounts")
        .update({ is_frozen: next })
        .eq("id", foundWallet.id);
      if (error) throw error;
      setFoundWallet((w) => w ? { ...w, is_frozen: next } : w);
      toast.success(next ? "Wallet frozen." : "Wallet unfrozen.");
    } catch (e: any) {
      toast.error(e.message ?? "Toggle failed.");
    }
  };

  const handleAdjust = async (direction: "credit" | "debit") => {
    if (!foundWallet) return;
    const raw = direction === "credit" ? creditAmount : debitAmount;
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid positive amount.");
      return;
    }
    if (!adjustReason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    setAdjustLoading(true);
    try {
      const delta = direction === "credit" ? amount : -amount;
      const newBalance = foundWallet.balance + delta;
      if (newBalance < 0) {
        toast.error("Insufficient balance for debit.");
        return;
      }

      const { error: balErr } = await db
        .from("wallet_accounts")
        .update({ balance: newBalance })
        .eq("id", foundWallet.id);
      if (balErr) throw balErr;

      await db.from("wallet_transactions").insert({
        wallet_id: foundWallet.id,
        type: direction,
        amount,
        currency: foundWallet.currency ?? "CAD",
        status: "completed",
        description: `Admin ${direction}: ${adjustReason}`,
      });

      setFoundWallet((w) => w ? { ...w, balance: newBalance } : w);
      direction === "credit" ? setCreditAmount("") : setDebitAmount("");
      setAdjustReason("");
      toast.success(`${direction === "credit" ? "Credited" : "Debited"} ${fmt(amount)} successfully.`);
      fetchStats();
      fetchTransactions();
    } catch (e: any) {
      toast.error(e.message ?? "Adjustment failed.");
    } finally {
      setAdjustLoading(false);
    }
  };

  // ── Filtered transactions ────────────────────────────────────────────────────

  const filteredTx = transactions.filter((t) => {
    const matchType = txTypeFilter === "all" || t.type === txTypeFilter;
    const matchStatus = txStatusFilter === "all" || t.status === txStatusFilter;
    const matchSearch =
      !txSearch ||
      t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(txSearch.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // ── Settings save (stub — wire to a settings table as needed) ────────────────

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate async
    setSettingsSaving(false);
    toast.success("Wallet settings saved.");
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <EnhancedPageLayout>
      {/* ── Header ── */}
      <EnhancedHeader
        title="Wallet Control Centre"
        subtitle="Monitor balances, manage user wallets, and configure platform settings"
        actionButton={
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => { fetchStats(); fetchTransactions(); }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* ── Section 1: Platform Overview ── */}
      <div>
        <EnhancedSectionHeader
          icon={TrendingUp}
          title="Platform Overview"
          description="Live snapshot of wallet activity across all users"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Balances"
            value={statsLoading ? "—" : fmt(stats.totalBalance)}
            icon={Wallet}
            gradient="from-purple-500 to-purple-700"
          />
          <StatCard
            title="Transactions This Month"
            value={statsLoading ? "—" : stats.txThisMonth}
            icon={TrendingUp}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Rent Paid (MTD)"
            value={statsLoading ? "—" : fmt(stats.rentPaid)}
            icon={Home}
            gradient="from-orange-500 to-orange-600"
          />
          <StatCard
            title="Top-Ups (MTD)"
            value={statsLoading ? "—" : fmt(stats.topUps)}
            icon={ArrowDownCircle}
            gradient="from-green-500 to-emerald-600"
          />
        </div>
      </div>

      {/* ── Section 2: User Wallet Search ── */}
      <EnhancedCard>
        <EnhancedSectionHeader
          icon={Search}
          title="User Wallet Search"
          description="Look up a user's wallet by email to view balance, freeze, or adjust funds"
        />

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="user@example.com"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Button onClick={handleSearch} disabled={searchLoading}>
            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>

        {/* Result card */}
        {foundWallet && (
          <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 space-y-6">
            {/* User info + freeze */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-gray-900">{foundWallet.user_name ?? "Unknown"}</p>
                <p className="text-sm text-gray-500">{foundWallet.user_email}</p>
                <p className="text-2xl font-black text-purple-700 mt-1">{fmt(foundWallet.balance, foundWallet.currency)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Snowflake className={`h-5 w-5 ${foundWallet.is_frozen ? "text-blue-500" : "text-gray-300"}`} />
                <Switch
                  checked={foundWallet.is_frozen}
                  onCheckedChange={handleFreezeToggle}
                  aria-label="Freeze wallet"
                />
                <span className="text-sm font-medium text-gray-600">
                  {foundWallet.is_frozen ? "Frozen" : "Active"}
                </span>
                <Badge className={foundWallet.is_frozen ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                  {foundWallet.is_frozen ? "Frozen" : "Active"}
                </Badge>
              </div>
            </div>

            {/* Manual credit / debit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Credit */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
                <p className="font-semibold text-green-800 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Manual Credit
                </p>
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount (CAD)"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="bg-white"
                />
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={adjustLoading}
                  onClick={() => handleAdjust("credit")}
                >
                  {adjustLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Apply Credit
                </Button>
              </div>

              {/* Debit */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                <p className="font-semibold text-red-800 flex items-center gap-2">
                  <MinusCircle className="h-4 w-4" /> Manual Debit
                </p>
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount (CAD)"
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                  className="bg-white"
                />
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={adjustLoading}
                  onClick={() => handleAdjust("debit")}
                >
                  {adjustLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Apply Debit
                </Button>
              </div>
            </div>

            {/* Reason field */}
            <div className="space-y-1">
              <Label htmlFor="adjust-reason">Reason / Note (required)</Label>
              <Textarea
                id="adjust-reason"
                placeholder="e.g. Correction for duplicate charge, promotional credit…"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
      </EnhancedCard>

      {/* ── Section 3: Transaction Monitor ── */}
      <EnhancedCard>
        <EnhancedSectionHeader
          icon={Filter}
          title="Transaction Monitor"
          description="Browse and filter all platform wallet transactions"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Search description or ID…"
            value={txSearch}
            onChange={(e) => setTxSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="top_up">Top-Up</SelectItem>
              <SelectItem value="rent_payment">Rent Payment</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="debit">Debit</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reload
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading transactions…
                  </TableCell>
                </TableRow>
              ) : filteredTx.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTx.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-gray-500">{tx.id.slice(0, 8)}…</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[tx.type] ?? "bg-gray-100 text-gray-600"}`}>
                        {tx.type?.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{fmt(tx.amount, tx.currency)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[tx.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {tx.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {tx.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                        {tx.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-gray-600">{tx.description ?? "—"}</TableCell>
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-gray-400 mt-2">Showing {filteredTx.length} of {transactions.length} transactions (latest 100)</p>
      </EnhancedCard>

      {/* ── Section 4: Withdrawal Queue ── */}
      <EnhancedCard>
        <EnhancedSectionHeader
          icon={ArrowUpCircle}
          title="Withdrawal Queue"
          description="Pending user withdrawal requests awaiting approval"
        />
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="rounded-full bg-orange-50 p-4">
                      <Clock className="h-8 w-8 text-orange-300" />
                    </div>
                    <p className="font-medium text-gray-500">Withdrawal queue coming soon</p>
                    <p className="text-sm max-w-xs">
                      Once withdrawal requests are enabled, pending approvals will appear here for review.
                    </p>
                    <Badge className="bg-orange-100 text-orange-600 mt-1">Future Feature</Badge>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </EnhancedCard>

      {/* ── Section 5: Wallet Settings ── */}
      <EnhancedCard>
        <EnhancedSectionHeader
          icon={Settings}
          title="Wallet Settings"
          description="Configure platform-wide wallet rules and feature flags"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fee & limits */}
          <div className="space-y-5">
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Fees & Limits</h4>

            <div className="space-y-1">
              <Label htmlFor="fee-rate">Transaction Fee Rate (%)</Label>
              <Input
                id="fee-rate"
                type="number"
                min="0"
                step="0.1"
                value={settings.feeRate}
                onChange={(e) => setSettings((s) => ({ ...s, feeRate: parseFloat(e.target.value) || 0 }))}
                className="max-w-xs"
              />
              <p className="text-xs text-gray-400">Applied to top-ups and withdrawals.</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="min-amount">Minimum Transaction Amount (CAD)</Label>
              <Input
                id="min-amount"
                type="number"
                min="0"
                value={settings.minAmount}
                onChange={(e) => setSettings((s) => ({ ...s, minAmount: parseFloat(e.target.value) || 0 }))}
                className="max-w-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="max-amount">Maximum Transaction Amount (CAD)</Label>
              <Input
                id="max-amount"
                type="number"
                min="0"
                value={settings.maxAmount}
                onChange={(e) => setSettings((s) => ({ ...s, maxAmount: parseFloat(e.target.value) || 0 }))}
                className="max-w-xs"
              />
            </div>
          </div>

          {/* Feature flags */}
          <div className="space-y-5">
            <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Feature Flags</h4>

            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="font-medium text-gray-800">Wallet Enabled</p>
                <p className="text-xs text-gray-500">Allow users to access and use their wallets</p>
              </div>
              <Switch
                checked={settings.walletEnabled}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, walletEnabled: v }))}
                aria-label="Enable wallet globally"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
              <div>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Coming Soon Mode
                </p>
                <p className="text-xs text-gray-500">Show "coming soon" banner to users instead of wallet UI</p>
              </div>
              <Switch
                checked={settings.comingSoon}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, comingSoon: v }))}
                aria-label="Toggle coming soon mode"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              <ToggleLeft className="h-4 w-4" />
              Changes take effect immediately after saving.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            className="bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90 px-8"
          >
            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Settings
          </Button>
        </div>
      </EnhancedCard>
    </EnhancedPageLayout>
  );
}
