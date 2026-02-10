import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// KYC Provider Interface
interface KYCProvider {
  name: string;
  initiateVerification: (userId: string, userData: any) => Promise<{
    referenceId: string;
    redirectUrl?: string;
    verificationUrl?: string;
  }>;
}

// Shufti Provider Implementation
class ShuftiProvider implements KYCProvider {
  name = 'shufti';

  async initiateVerification(userId: string, userData: any) {
    const shuftiUrl = 'https://api.shuftipro.com/';
    
    const payload = {
      client_id: '1f58fbfc920c2ec2c9b286f776e041892788ea9b242ae505f70a4271255869fc',
      secret_key: 'z8BdBavwUqBesrMRtKZnucoStTwiS06R',
      reference: `${userId}_${Date.now()}`,
      email: userData.email,
      country: userData.country || 'US',
      language: 'EN',
      verification_mode: 'image_only',
      // Document verification
      document: {
        name: userData.fullName,
        doc_number: userData.documentNumber || '',
        dob: userData.dateOfBirth || '',
        issue_date: userData.issueDate || '',
        expiry_date: userData.expiryDate || '',
        allow_offline: 1,
        supported_types: ['passport', 'id_card', 'driving_license'],
      },
      // Address verification
      address: {
        full_address: userData.fullAddress || '',
        name: userData.fullName,
        allow_offline: 1,
        supported_types: ['utility_bill', 'bank_statement', 'rent_agreement'],
      },
      // Consent
      consent: {
        supported_types: ['written'],
        text: 'I consent to verify my identity for Roomie AI platform.',
      },
      // Callback URLs
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/kyc/webhook/shufti`,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?verification=completed`,
    };

    try {
      const response = await fetch(shuftiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.event === 'request.accepted') {
        return {
          referenceId: result.reference,
          verificationUrl: result.url,
        };
      } else {
        throw new Error(`Shufti error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Shufti API error:', error);
      throw error;
    }
  }
}

// Mock Provider for testing
class MockProvider implements KYCProvider {
  name = 'mock';

  async initiateVerification(userId: string, userData: any) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      referenceId: `mock_${userId}_${Date.now()}`,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?verification=mock`,
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Get user data for KYC
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone_number')
      .eq('id', user.id)
      .single();

    const userData = {
      fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      email: user.email,
      phoneNumber: profile?.phone_number,
    };

    // Select provider (use mock for development, Shufti for production)
    const provider: KYCProvider = process.env.NODE_ENV === 'production' 
      ? new ShuftiProvider() 
      : new MockProvider();

    // Check if user already has pending verification
    const { data: existingKyc } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingKyc) {
      return res.status(400).json({ 
        error: 'Verification already in progress',
        reference_id: existingKyc.reference_id,
        verification_url: existingKyc.verification_data?.verification_url
      });
    }

    // Initiate verification with provider
    const verificationResult = await provider.initiateVerification(user.id, userData);

    // Save verification record to database
    const kycRecord = {
      user_id: user.id,
      provider: provider.name,
      reference_id: verificationResult.referenceId,
      status: 'pending',
      verification_data: {
        ...verificationResult,
        initiated_at: new Date().toISOString(),
        user_data: userData,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('kyc_verifications')
      .insert(kycRecord);

    if (insertError) {
      console.error('Error saving KYC record:', insertError);
      return res.status(500).json({ error: 'Failed to save verification record' });
    }

    // Return success response
    res.status(200).json({
      success: true,
      provider: provider.name,
      reference_id: verificationResult.referenceId,
      verification_url: verificationResult.verificationUrl,
      redirect_url: verificationResult.redirectUrl,
      status: 'pending',
      message: 'Verification initiated successfully'
    });

  } catch (error: any) {
    console.error('KYC start endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate verification',
      message: error.message || 'Internal server error'
    });
  }
}
