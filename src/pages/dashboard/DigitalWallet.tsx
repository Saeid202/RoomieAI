import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  CreditCard, 
  Banknote,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  Building,
  Zap,
  Shield,
  Star,
  Gift,
  Target,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { StripePaymentForm, QuickPayment } from "@/components/payment/StripePaymentForm";

interface WalletBalance {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  lastUpdated: string;
}

interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'transfer' | 'bonus' | 'fee';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: Record<string, any>;
  createdAt: string;
}

interface WalletStats {
  totalBalance: number;
  monthlyDeposits: number;
  monthlyWithdrawals: number;
  monthlyPayments: number;
  transactionCount: number;
  averageTransaction: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export default function DigitalWalletPage() {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdrawFunds, setShowWithdrawFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockBalance: WalletBalance = {
        id: "wallet1",
        userId: "user1",
        balance: 1250.75,
        currency: "CAD",
        status: "active",
        lastUpdated: new Date().toISOString()
      };

      const mockTransactions: WalletTransaction[] = [
        {
          id: "tx1",
          walletId: "wallet1",
          type: "deposit",
          amount: 500.00,
          description: "Added funds via credit card",
          status: "completed",
          metadata: { method: "credit_card", card_last4: "4242" },
          createdAt: "2024-11-15T10:30:00Z"
        },
        {
          id: "tx2",
          walletId: "wallet1",
          type: "payment",
          amount: -1500.00,
          description: "Rent payment for Downtown Apartment",
          status: "completed",
          metadata: { property_id: "prop1", property_name: "Downtown Apartment" },
          createdAt: "2024-11-01T09:00:00Z"
        },
        {
          id: "tx3",
          walletId: "wallet1",
          type: "refund",
          amount: 250.00,
          description: "Refund for overpayment",
          status: "completed",
          metadata: { original_payment_id: "pay1" },
          createdAt: "2024-10-28T14:20:00Z"
        },
        {
          id: "tx4",
          walletId: "wallet1",
          type: "bonus",
          amount: 50.00,
          description: "Referral bonus",
          status: "completed",
          metadata: { referral_code: "REF123" },
          createdAt: "2024-10-20T16:45:00Z"
        }
      ];

      const mockStats: WalletStats = {
        totalBalance: 1250.75,
        monthlyDeposits: 500.00,
        monthlyWithdrawals: 0,
        monthlyPayments: 1500.00,
        transactionCount: 4,
        averageTransaction: 562.50,
        topCategories: [
          { category: "Rent Payments", amount: 1500.00, count: 1 },
          { category: "Deposits", amount: 500.00, count: 1 },
          { category: "Refunds", amount: 250.00, count: 1 },
          { category: "Bonuses", amount: 50.00, count: 1 }
        ]
      };

      setWalletBalance(mockBalance);
      setTransactions(mockTransactions);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (paymentIntent: any) => {
    try {
      // Mock implementation - replace with actual API call
      const depositAmount = parseFloat(amount);
      setWalletBalance(prev => prev ? {
        ...prev,
        balance: prev.balance + depositAmount,
        lastUpdated: new Date().toISOString()
      } : null);
      
      toast.success(`Successfully added $${depositAmount.toFixed(2)} to your wallet!`);
      setShowAddFunds(false);
      setAmount("");
      loadWalletData();
    } catch (error) {
      toast.error('Failed to add funds');
    }
  };

  const handleWithdrawFunds = async () => {
    try {
      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount > (walletBalance?.balance || 0)) {
        toast.error('Insufficient funds');
        return;
      }

      // Mock implementation - replace with actual API call
      setWalletBalance(prev => prev ? {
        ...prev,
        balance: prev.balance - withdrawAmount,
        lastUpdated: new Date().toISOString()
      } : null);
      
      toast.success(`Successfully withdrew $${withdrawAmount.toFixed(2)} from your wallet!`);
      setShowWithdrawFunds(false);
      setAmount("");
      loadWalletData();
    } catch (error) {
      toast.error('Failed to withdraw funds');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4 text-purple-500" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-yellow-500" />;
      case 'fee':
        return <Minus className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
      case 'bonus':
        return 'text-green-600';
      case 'withdrawal':
      case 'payment':
      case 'fee':
        return 'text-red-600';
      case 'transfer':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Wallet className="h-8 w-8 text-purple-600" />
          Digital Wallet
        </h1>
        <p className="text-muted-foreground">
          Manage your wallet balance, view transactions, and track your spending.
        </p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
              <p className="text-4xl font-bold">
                {formatCurrency(walletBalance?.balance || 0, walletBalance?.currency)}
              </p>
              <p className="text-sm opacity-90 mt-1">
                Last updated: {walletBalance?.lastUpdated ? formatDate(walletBalance.lastUpdated) : 'Never'}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Funds to Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <QuickPayment
                      amount={parseFloat(amount) * 100 || 0}
                      onSuccess={handleAddFunds}
                      onError={(error) => toast.error(error)}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showWithdrawFunds} onOpenChange={setShowWithdrawFunds}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        max={walletBalance?.balance || 0}
                        step="0.01"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Available: {formatCurrency(walletBalance?.balance || 0)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowWithdrawFunds(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleWithdrawFunds} className="flex-1">
                        Withdraw Funds
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Deposits</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.monthlyDeposits || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Payments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats?.monthlyPayments || 0)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.transactionCount || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats?.averageTransaction || 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedTransaction(transaction)}>
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}></div>
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(category.amount)}</p>
                        <p className="text-sm text-muted-foreground">{category.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Spending trends chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Transaction distribution chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-reload</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically add funds when balance is low
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Spending alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when spending exceeds limits
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transaction notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for all transactions
                  </p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getTransactionIcon(selectedTransaction.type)}
                <div>
                  <p className="font-medium">{selectedTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedTransaction.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className={`font-medium ${getTransactionColor(selectedTransaction.type)}`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm">{selectedTransaction.id}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
