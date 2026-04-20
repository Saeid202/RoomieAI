
import {
  LayoutDashboard,
  Users,
  Users2,
  FileText,
  Hammer,
  Sparkles,
  BarChart3,
  Database,
  Settings,
  Package,
  Shield,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  EnhancedPageLayout,
  EnhancedHeader,
  EnhancedCard,
  StatCard
} from "@/components/ui/design-system";

export default function AdminHomePage() {
  return (
    <EnhancedPageLayout>
      {/* Enhanced Header */}
      <EnhancedHeader
        title="Admin Dashboard"
        subtitle="Manage your website content and settings"
      />

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={0} icon={Users} gradient="from-blue-500 to-blue-600" />
        <StatCard title="Active Pages" value={0} icon={FileText} gradient="from-green-500 to-emerald-500" />
        <StatCard title="Renovation Partners" value={0} icon={Hammer} gradient="from-orange-500 to-red-500" />
        <StatCard title="Construction Products" value={0} icon={Package} gradient="from-indigo-500 to-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/admin/pages" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Page Management</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage website pages and content blocks
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/users" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">User Management</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage user accounts, roles, and permissions
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/renovation-partners" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Renovation Partners</CardTitle>
              <Hammer className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage renovation partners and service providers
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/cleaners" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Cleaners</CardTitle>
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage cleaning service providers
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/construction" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Construction</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage construction products, suppliers, and marketplace
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/reporting" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Rent Reporting Preview</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review internal rent payment performance history
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/reporting-batches" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Reporting Jobs</CardTitle>
              <Database className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage monthly reporting batches (Dry Run)
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/settings" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Settings</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure website settings and preferences
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/rate-limits" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Rate Limits</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage document processing rate limits and view audit logs
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/communities" className="block">
          <EnhancedCard className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Communities</CardTitle>
              <Users2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage seeker communities, moderate posts, and handle reports
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>

        <Link to="/dashboard/admin/wallet" className="block">
          <EnhancedCard className="h-full border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-purple-900">Digital Wallet</CardTitle>
              <Wallet className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor balances, manage user wallets, adjust funds, and configure wallet settings
              </p>
            </CardContent>
          </EnhancedCard>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <EnhancedCard>
          <CardHeader>
            <CardTitle>Site Overview</CardTitle>
            <CardDescription>
              Key metrics and recent activity on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">0</span>
                <span className="text-sm text-muted-foreground">Total Pages</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">0</span>
                <span className="text-sm text-muted-foreground">Registered Users</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">0</span>
                <span className="text-sm text-muted-foreground">Active Listings</span>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      </div>
    </EnhancedPageLayout>
  );
}
