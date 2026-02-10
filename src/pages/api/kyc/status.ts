import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Query KYC status from database
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (kycError && kycError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected for new users
      console.error('Error fetching KYC status:', kycError);
      return res.status(500).json({ error: 'Failed to fetch KYC status' });
    }

    // Default status for users without KYC record
    const defaultStatus = {
      status: 'not_verified',
      provider: null,
      reference_id: null,
      created_at: null,
      updated_at: null,
      verification_data: null,
      rejection_reason: null
    };

    const status = kycData || defaultStatus;

    // Return status response
    res.status(200).json({
      user_id: user.id,
      kyc_status: status.status,
      provider: status.provider,
      reference_id: status.reference_id,
      created_at: status.created_at,
      updated_at: status.updated_at,
      verification_data: status.verification_data,
      rejection_reason: status.rejection_reason,
      // UI-friendly status mapping
      ui_status: mapStatusToUI(status.status),
      can_retry: status.status === 'rejected' || status.status === 'failed',
      next_action: getNextAction(status.status)
    });

  } catch (error) {
    console.error('KYC status endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Map backend status to UI-friendly status
function mapStatusToUI(status: string): string {
  switch (status) {
    case 'not_verified':
      return 'Not Verified';
    case 'pending':
      return 'Pending';
    case 'verified':
      return 'Verified';
    case 'rejected':
      return 'Action Required';
    case 'failed':
      return 'Action Required';
    case 'expired':
      return 'Action Required';
    default:
      return 'Not Verified';
  }
}

// Determine next action based on status
function getNextAction(status: string): string {
  switch (status) {
    case 'not_verified':
      return 'Verify Now';
    case 'pending':
      return 'Continue';
    case 'rejected':
    case 'failed':
    case 'expired':
      return 'Retry';
    case 'verified':
      return 'View Details';
    default:
      return 'Verify Now';
  }
}
