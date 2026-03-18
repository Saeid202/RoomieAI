// =====================================================
// Admin Rate Limit Config - Edge Function
// =====================================================
// Purpose: Admin interface for managing document rate limits
// Provides: GET config/stats/audit, POST update_config/reset_user/bulk_reset/export_audit
// Requires: super_admin role
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check super_admin role
    const { data: userData } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single();

    if (userData?.raw_user_meta_data?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient permissions. Super admin role required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const method = req.method;

    if (method === 'GET') {
      return handleGetRequest(supabase, action, url, user.id);
    } else if (method === 'POST') {
      const body = await req.json();
      return handlePostRequest(supabase, action, body, user.id);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }
  } catch (error) {
    logger.error('Admin rate limit config error', { message: (error as any).message });
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleGetRequest(
  supabase: any,
  action: string | null,
  url: URL,
  adminUserId: string
): Promise<Response> {
  switch (action) {
    case 'config': {
      const { data, error } = await supabase.rpc('get_rate_limit_config');
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, config: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'stats': {
      const { data, error } = await supabase.rpc('get_rate_limit_stats');
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, stats: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'audit': {
      const userId = url.searchParams.get('user_id');
      const eventType = url.searchParams.get('event_type');
      const startTime = url.searchParams.get('start_time');
      const endTime = url.searchParams.get('end_time');
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('page_size') || '100');

      const { data, error } = await supabase.rpc('get_rate_limit_audit_log', {
        p_user_id: userId || null,
        p_event_type: eventType || null,
        p_start_time: startTime || null,
        p_end_time: endTime || null,
        p_page: page,
        p_page_size: pageSize
      });

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    default:
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action parameter. Use: config, stats, or audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
  }
}

async function handlePostRequest(
  supabase: any,
  action: string | null,
  body: Record<string, unknown>,
  adminUserId: string
): Promise<Response> {
  switch (action) {
    case 'update_config': {
      const configKey = body.config_key as string;
      const configValue = body.config_value as string;

      if (!configKey || configValue === undefined) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing config_key or config_value' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate config key
      const validKeys = ['global_enabled', 'max_requests', 'time_window_minutes', 'cleanup_after_days'];
      if (!validKeys.includes(configKey)) {
        return new Response(
          JSON.stringify({ success: false, error: `Invalid config key. Valid keys: ${validKeys.join(', ')}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate config value based on key
      if (configKey === 'max_requests') {
        const numValue = parseInt(configValue);
        if (isNaN(numValue) || numValue < 1 || numValue > 1000) {
          return new Response(
            JSON.stringify({ success: false, error: 'max_requests must be between 1 and 1000' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }

      if (configKey === 'time_window_minutes') {
        const numValue = parseInt(configValue);
        if (isNaN(numValue) || numValue < 1 || numValue > 1440) {
          return new Response(
            JSON.stringify({ success: false, error: 'time_window_minutes must be between 1 and 1440 (24 hours)' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }

      if (configKey === 'global_enabled') {
        if (configValue !== 'true' && configValue !== 'false') {
          return new Response(
            JSON.stringify({ success: false, error: 'global_enabled must be true or false' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }

      const { data, error } = await supabase.rpc('update_rate_limit_config', {
        p_config_key: configKey,
        p_config_value: String(configValue),
        p_admin_user_id: adminUserId
      });

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'reset_user': {
      const userId = body.user_id as string;

      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing user_id' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { data, error } = await supabase.rpc('reset_user_rate_limit', {
        p_user_id: userId,
        p_admin_user_id: adminUserId
      });

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'bulk_reset_users': {
      const userIds = body.user_ids as string[];

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'user_ids must be a non-empty array' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Process in batches to avoid timeouts
      const batchSize = 100;
      const results: Array<{ user_id: string; success: boolean; error?: string }> = [];

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        for (const userId of batch) {
          try {
            const { data, error } = await supabase.rpc('reset_user_rate_limit', {
              p_user_id: userId,
              p_admin_user_id: adminUserId
            });

            if (error) throw error;
            results.push({ user_id: userId, success: true });
          } catch (err: any) {
            results.push({ user_id: userId, success: false, error: err.message });
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'export_audit': {
      const startTime = body.start_time as string;
      const endTime = body.end_time as string;
      const eventType = body.event_type as string;

      const { data, error } = await supabase.rpc('get_rate_limit_audit_log', {
        p_user_id: null,
        p_event_type: eventType || null,
        p_start_time: startTime || null,
        p_end_time: endTime || null,
        p_page: 1,
        p_page_size: 10000
      });

      if (error) throw error;

      // Convert to CSV
      const csv = convertToCSV((data as AuditLogResponse).data);

      return new Response(
        csv,
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=rate-limit-audit-log.csv'
          }
        }
      );
    }

    default:
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action parameter. Use: update_config, reset_user, bulk_reset_users, or export_audit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
  }
}

function convertToCSV(data: AuditEntry[]): string {
  if (!data || data.length === 0) {
    return 'No data available';
  }

  const headers = [
    'ID',
    'Event Type',
    'User ID',
    'User Email',
    'Admin User ID',
    'Admin Email',
    'Document ID',
    'Property ID',
    'IP Address',
    'Old Value',
    'New Value',
    'Created At'
  ];

  const rows = data.map(row => [
    row.id,
    row.event_type,
    row.user_id || '',
    row.user_email || '',
    row.admin_user_id || '',
    row.admin_email || '',
    row.document_id || '',
    row.property_id || '',
    row.ip_address || '',
    row.old_value || '',
    row.new_value || '',
    row.created_at
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}