import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

interface RateLimitStats {
  max_requests: number;
  time_window_minutes: number;
  total_requests: number;
  top_users: Array<{ user_id: string; request_count: number; email: string }>;
  blocked_users: Array<{ user_id: string; request_count: number; email: string }>;
  usage_distribution: Record<string, number>;
}

interface RateLimitStatsDashboardProps {
  stats: RateLimitStats;
  onRefresh: () => void;
  onResetUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

export function RateLimitStatsDashboard({ stats, onRefresh, onResetUser, isLoading }: RateLimitStatsDashboardProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleResetUser = async (userId: string) => {
    try {
      await onResetUser(userId);
      toast({
        title: 'Rate limit reset',
        description: 'User rate limit has been reset successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset user rate limit.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkReset = async () => {
    try {
      for (const userId of selectedUsers) {
        await onResetUser(userId);
      }
      setSelectedUsers([]);
      toast({
        title: 'Rate limits reset',
        description: `${selectedUsers.length} users have been reset successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset some user rate limits.',
        variant: 'destructive',
      });
    }
  };

  const distributionData = [
    { range: '0-25%', label: 'Low Usage', color: 'bg-green-500' },
    { range: '26-50%', label: 'Medium-Low', color: 'bg-blue-500' },
    { range: '51-75%', label: 'Medium-High', color: 'bg-yellow-500' },
    { range: '76-99%', label: 'High Usage', color: 'bg-orange-500' },
    { range: '100%', label: 'At Limit', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total_requests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Max Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.max_requests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time Window</CardDescription>
            <CardTitle className="text-3xl">{stats.time_window_minutes}m</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Usage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Distribution</CardTitle>
          <CardDescription>
            Distribution of users by their current request count percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distributionData.map(({ range, label, color }) => {
              const count = stats.usage_distribution?.[range] || 0;
              const percentage = stats.total_requests > 0
                ? Math.round((count / stats.total_requests) * 100)
                : 0;
              return (
                <div key={range} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium">{range}</span>
                  <span className="w-24 text-sm text-muted-foreground">{label}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Users by Request Count</CardTitle>
              <CardDescription>
                Users with the highest document processing activity
              </CardDescription>
            </div>
            <Button onClick={onRefresh} disabled={isLoading} variant="outline" size="sm">
              <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.top_users && stats.top_users.length > 0 ? (
            <>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">
                        <Checkbox
                          checked={selectedUsers.length === stats.top_users.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(stats.top_users.map(u => u.user_id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Email</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Request Count</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_users.map((user) => {
                      const percentage = (user.request_count / stats.max_requests) * 100;
                      const isBlocked = percentage >= 100;
                      return (
                        <tr key={user.user_id} className="border-b">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedUsers.includes(user.user_id)}
                              onCheckedChange={() => handleUserSelect(user.user_id)}
                            />
                          </td>
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">{user.request_count}</td>
                          <td className="p-4">
                            {isBlocked ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                At Limit
                              </span>
                            ) : percentage >= 75 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                High
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetUser(user.user_id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Reset
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleBulkReset} variant="destructive" disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset {selectedUsers.length} Selected Users
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No users have made document processing requests yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Blocked Users */}
      {stats.blocked_users && stats.blocked_users.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Users at Rate Limit</CardTitle>
            <CardDescription>
              These users have reached their rate limit and cannot process more documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-red-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-red-100">
                    <th className="h-10 px-4 text-left align-middle font-medium">Email</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">Request Count</th>
                    <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.blocked_users.map((user) => (
                    <tr key={user.user_id} className="border-b">
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.request_count}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetUser(user.user_id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}