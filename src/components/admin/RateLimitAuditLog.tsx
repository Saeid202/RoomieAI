import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  event_type: string;
  user_id: string | null;
  user_email: string | null;
  admin_user_id: string | null;
  admin_email: string | null;
  document_id: string | null;
  property_id: string | null;
  ip_address: string | null;
  event_details: Record<string, unknown>;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface AuditLogResponse {
  data: AuditEntry[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

interface AuditFilters {
  user_id?: string;
  event_type?: string;
  start_time?: string;
  end_time?: string;
}

interface RateLimitAuditLogProps {
  auditData: AuditLogResponse;
  onFilterChange: (filters: AuditFilters) => void;
  onExport: () => void;
  isLoading: boolean;
}

export function RateLimitAuditLog({ auditData, onFilterChange, onExport, isLoading }: RateLimitAuditLogProps) {
  const [filters, setFilters] = useState<AuditFilters>({});
  const { toast } = useToast();

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange('page', newPage.toString());
  };

  const eventTypeColors: Record<string, string> = {
    request_allowed: 'bg-green-100 text-green-800',
    request_blocked: 'bg-red-100 text-red-800',
    config_change: 'bg-blue-100 text-blue-800',
    user_reset: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              View all document processing requests and administrative actions
            </CardDescription>
          </div>
          <Button onClick={onExport} disabled={isLoading} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="filter_user_id">User ID</Label>
            <Input
              id="filter_user_id"
              placeholder="Filter by User ID"
              value={filters.user_id || ''}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter_event_type">Event Type</Label>
            <Select
              value={filters.event_type || ''}
              onValueChange={(value) => handleFilterChange('event_type', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Event Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Event Types</SelectItem>
                <SelectItem value="request_allowed">Request Allowed</SelectItem>
                <SelectItem value="request_blocked">Request Blocked</SelectItem>
                <SelectItem value="config_change">Config Change</SelectItem>
                <SelectItem value="user_reset">User Reset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter_start_time">Start Time</Label>
            <Input
              id="filter_start_time"
              type="datetime-local"
              value={filters.start_time || ''}
              onChange={(e) => handleFilterChange('start_time', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter_end_time">End Time</Label>
            <Input
              id="filter_end_time"
              type="datetime-local"
              value={filters.end_time || ''}
              onChange={(e) => handleFilterChange('end_time', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium">Timestamp</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Event Type</th>
                <th className="h-10 px-4 text-left align-middle font-medium">User</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Admin</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditData.data && auditData.data.length > 0 ? (
                auditData.data.map((entry) => (
                  <tr key={entry.id} className="border-b">
                    <td className="p-4 text-sm">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventTypeColors[entry.event_type] || 'bg-gray-100 text-gray-800'}`}>
                        {entry.event_type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {entry.user_email || entry.user_id?.slice(0, 8) || '-'}
                    </td>
                    <td className="p-4 text-sm">
                      {entry.admin_email || entry.admin_user_id?.slice(0, 8) || '-'}
                    </td>
                    <td className="p-4 text-sm">
                      {entry.event_type === 'config_change' && entry.old_value && entry.new_value && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Changed:</span>
                          <span className="mx-1">{entry.old_value}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="ml-1 font-medium">{entry.new_value}</span>
                        </div>
                      )}
                      {entry.event_type === 'user_reset' && entry.event_details && (
                        <div className="text-xs text-muted-foreground">
                          Deleted: {entry.event_details.deleted_count || 0} records
                        </div>
                      )}
                      {entry.event_type === 'request_blocked' && (
                        <div className="text-xs text-red-600">
                          Rate limit exceeded
                        </div>
                      )}
                      {entry.ip_address && (
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {entry.ip_address}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No audit log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {auditData.pagination && auditData.pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {auditData.pagination.page} of {auditData.pagination.total_pages}
              <span className="ml-2">
                ({auditData.pagination.total_count} total entries)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(auditData.pagination.page - 1)}
                disabled={auditData.pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(auditData.pagination.page + 1)}
                disabled={auditData.pagination.page >= auditData.pagination.total_pages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}