import { supabase } from '@/integrations/supabase/client';

export interface LandlordPayment {
  id: string;
  tenant_id: string;
  tenant_name: string;
  property_id: string;
  property_address: string;
  amount: number;
  transaction_fee: number;
  net_amount: number;
  status: string;
  payment_method_type: 'acss_debit' | 'card';
  created_at: string;
  expected_clear_date: string | null;
  payment_cleared_at: string | null;
}

export interface PaymentSummary {
  available_balance: number;
  pending_balance: number;
  total_this_month: number;
}

/**
 * Fetch all payments for a landlord's properties
 */
export async function getLandlordPayments(landlordId: string): Promise<LandlordPayment[]> {
  try {
    // First, get the payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('rental_payments')
      .select(`
        id,
        tenant_id,
        property_id,
        amount,
        transaction_fee,
        status,
        payment_method_type,
        created_at,
        expected_clear_date,
        payment_cleared_at
      `)
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });

    if (paymentsError) throw paymentsError;
    if (!paymentsData || paymentsData.length === 0) return [];

    // Get unique tenant IDs and property IDs
    const tenantIds = [...new Set(paymentsData.map(p => p.tenant_id))];
    const propertyIds = [...new Set(paymentsData.map(p => p.property_id))];

    // Fetch tenant names
    const { data: tenantsData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', tenantIds);

    // Fetch property addresses
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('id, title, address')
      .in('id', propertyIds);

    // Create lookup maps
    const tenantMap = new Map(tenantsData?.map(t => [t.id, t.full_name]) || []);
    const propertyMap = new Map(propertiesData?.map(p => [p.id, p.address || p.title]) || []);

    // Transform the data
    return paymentsData.map(payment => ({
      id: payment.id,
      tenant_id: payment.tenant_id,
      tenant_name: tenantMap.get(payment.tenant_id) || 'Unknown Tenant',
      property_id: payment.property_id,
      property_address: propertyMap.get(payment.property_id) || 'Unknown Property',
      amount: payment.amount,
      transaction_fee: payment.transaction_fee || 0,
      net_amount: payment.amount - (payment.transaction_fee || 0),
      status: payment.status,
      payment_method_type: payment.payment_method_type || 'card',
      created_at: payment.created_at,
      expected_clear_date: payment.expected_clear_date,
      payment_cleared_at: payment.payment_cleared_at
    }));
  } catch (error) {
    console.error('Error fetching landlord payments:', error);
    throw error;
  }
}

/**
 * Calculate payment summary for landlord
 */
export function calculatePaymentSummary(payments: LandlordPayment[]): PaymentSummary {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const available_balance = payments
    .filter(p => p.status === 'completed' || p.status === 'succeeded')
    .reduce((sum, p) => sum + p.net_amount, 0);

  const pending_balance = payments
    .filter(p => p.status === 'processing' || p.status === 'initiated')
    .reduce((sum, p) => sum + p.net_amount, 0);

  const total_this_month = payments
    .filter(p => new Date(p.created_at) >= firstDayOfMonth)
    .reduce((sum, p) => sum + p.net_amount, 0);

  return {
    available_balance,
    pending_balance,
    total_this_month
  };
}

/**
 * Format payment status for display
 */
export function getPaymentStatusDisplay(status: string): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'completed':
    case 'succeeded':
      return { label: 'Completed', variant: 'default' };
    case 'processing':
    case 'initiated':
      return { label: 'Processing', variant: 'secondary' };
    case 'failed':
      return { label: 'Failed', variant: 'destructive' };
    default:
      return { label: status, variant: 'outline' };
  }
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplay(type: string): string {
  switch (type) {
    case 'acss_debit':
      return 'PAD';
    case 'card':
      return 'Card';
    default:
      return type;
  }
}

/**
 * Calculate expected payout date
 */
export function calculateExpectedPayoutDate(
  paymentDate: string,
  paymentMethod: string,
  clearDate: string | null
): string {
  const payment = new Date(paymentDate);
  
  if (paymentMethod === 'acss_debit') {
    // PAD: 3-5 days to clear + 2-3 days payout = 8 days average
    const payout = new Date(payment);
    payout.setDate(payout.getDate() + 8);
    return payout.toISOString().split('T')[0];
  } else {
    // Card: 2-3 days = 2 days average
    const payout = new Date(payment);
    payout.setDate(payout.getDate() + 2);
    return payout.toISOString().split('T')[0];
  }
}
