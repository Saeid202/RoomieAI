
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your website content and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/dashboard/admin/pages" className="block">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Page Management</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage website pages and content blocks
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/admin/users" className="block">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">User Management</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage user accounts, roles, and permissions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/admin/settings" className="block">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Settings</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure website settings and preferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
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
        </Card>
      </div>
    </div>
  );
}
