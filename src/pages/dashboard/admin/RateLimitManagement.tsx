import { useState, useEffect, useCallback } from 'react';
import { EnhancedPageLayout, EnhancedHeader } from '@/components/ui/design-system';
import { RateLimitConfigPanel } from '@/components/admin/RateLimitConfigPanel';
import { RateLimitStatsDashboard } from '@/components/admin/RateLimitStatsDashboard';
import { RateLimitAuditLog } from '@/components/admin/RateLimitAuditLog';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface RateLimitConfig {
  global_enabled: string;
  max_requests: string;
  time_window_minutes: string;
  cleanup_after_days: string;
}

interface RateLimitStats {
  max_requests: number;
  time_window_minutes: number;
  total_requests: number;
  top_users: Array<{ user_id: string; request_count: number; email: string }>;
  blocked_users: Array<{ user_id: string; request_count: number; email: string }>;
  usage_distribution: Record<string, number>;
}

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

export default function RateLimitManagementPage() {
  const [config, setConfig] = useState<RateLimitConfig>({
    global_enabled: 'true',
    max_requests: '5',
    time_window_minutes: '60',
    cleanup_after_days: '90',
  });
  const [stats, setStats] = useState<RateLimitStats>({
    max_requests: 5,
    time_window_minutes: 60,
    total_requests: 0,
    top_users: [],
    blocked_users: [],
    usage_distribution: {},
  });
  const [auditData, setAuditData] = useState<AuditLogResponse>({
    data: [],
    pagination: { page: 1, page_size: 100, total_count: 0, total_pages: 0 },
  });
  const [auditFilters, setAuditFilters] = useState<AuditFilters>({});
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const { toast } = useToast();

  // Fetch configuration
  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-rate-limit-config', {
        body: {},
        query: { action: 'config' },
      });

      if (error) throw error;

      if (data.success && data.config) {
        setConfig({
          global_enabled: data.config.global_enabled || 'true',
          max_requests: data.config.max_requests || '5',
          time_window_minutes: data.config.time_window_minutes || '60',
          cleanup_after_days: data.config.cleanup_after_days || '90',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rate limit configuration.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const { data, error } = await supabase.functions.invoke('admin-rate-limit-config', {
        body: {},
        query: { action: 'stats' },
      });

      if (error) throw error;

      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch audit log
  const fetchAudit = useCallback(async (filters: AuditFilters = {}) => {
    try {
      setIsLoadingAudit(true);
      const { data, error } = await supabase.functions.invoke('admin-rate-limit-config', {
        body: {},
        query: {
          action: 'audit',
          user_id: filters.user_id || '',
          event_type: filters.event_type || '',
          start_time: filters.start_time || '',
          end_time: filters.end_time || '',
          page: '1',
          page_size: '100',
        },
      });

      if (error) throw error;

      if (data.success) {
        setAuditData(data);
      }
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setIsLoadingAudit(false);
    }
  }, []);

  // Update configuration
  const handleUpdateConfig = async (key: string, value: string) => {
    try {
      setIsLoadingConfig(true);
      const { data, error } = await supabase.functions.invoke('admin-rate-limit-config', {
        body: {
          action: 'update_config',
          config_key: key,
          config_value: value,
        },
      });

      if (error) throw error;

      if (data.success) {
        await fetchConfig();
      } else {
        throw new Error(data.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Reset user rate limit
  const handleResetUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-rate-limit-config', {
        body: {
          action: 'reset_user',
          user_id: userId,
        },
      });

      if (error) throw error;

      if (data.success) {
        await fetchStats();
        await fetchAudit(auditFilters);
      } else {
        throw new Error(data.error || 'Failed to reset user');
      }
    } catch (error) {
      console.error('Error resetting user:', error);
      throw error;
    }
  };

  // Export audit log
  const handleExportAudit = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-rate-limit-config', {
        body: {
          action: 'export_audit',
          start_time: auditFilters.start_time || '',
          end_time: auditFilters.end_time || '',
          event_type: auditFilters.event_type || '',
        },
      });

      if (error) throw error;

      // Create and download CSV
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rate-limit-audit-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Audit log has been exported to CSV.',
      });
    } catch (error) {
      console.error('Error exporting audit:', error);
      toast({
        title: 'Error',
        description: 'Failed to export audit log.',
        variant: 'destructive',
      });
    }
  };

  // Handle audit filter changes
  const handleAuditFilterChange = (filters: AuditFilters) => {
    setAuditFilters(filters);
    fetchAudit(filters);
  };

  // Initial data fetch
  useEffect(() => {
    fetchConfig();
    fetchStats();
    fetchAudit();
  }, [fetchConfig, fetchStats, fetchAudit]);

  // Auto-refresh stats every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <EnhancedPageLayout>
      <EnhancedHeader
        title="Rate Limit Management"
        subtitle="Configure and monitor document processing rate limits"
      />

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <RateLimitStatsDashboard
            stats={stats}
            onRefresh={fetchStats}
            onResetUser={handleResetUser}
            isLoading={isLoadingStats}
          />
        </TabsContent>

        <TabsContent value="config">
          <RateLimitConfigPanel
            config={config}
            onUpdateConfig={handleUpdateConfig}
            isLoading={isLoadingConfig}
          />
        </TabsContent>

        <TabsContent value="audit">
          <RateLimitAuditLog
            auditData={auditData}
            onFilterChange={handleAuditFilterChange}
            onExport={handleExportAudit}
            isLoading={isLoadingAudit}
          />
        </TabsContent>
      </Tabs>
    </EnhancedPageLayout>
  );
}