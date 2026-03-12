import { createClient } from '@supabase/supabase-js';
import { buildMortgagePackage, checkPackageReadiness } from '@/services/mortgagePackageService';

export default async function handler(req: any, res: any) {
    // 1. Setup CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 2. Initialize Supabase with Service Role Key
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bjesofgfbuyzjamyliys.supabase.co';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 3. Verify Authentication
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Validate the token to get the user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth verification failed:', authError?.message);
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Get userId from params
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'userId parameter is required' });
        }

        // 4. Authorization Check
        // User can only access their own package
        // Brokers can access packages of users who have given consent
        const { data: userRole, error: roleError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (roleError) {
            console.error('Role check error:', roleError);
            return res.status(500).json({ error: 'Failed to verify user role' });
        }

        const isBroker = userRole?.role === 'mortgage_broker';
        const isOwnPackage = user.id === userId;

        if (!isOwnPackage && !isBroker) {
            return res.status(403).json({ error: 'Access denied: You can only access your own package' });
        }

        // If broker, verify consent
        if (isBroker) {
            const { data: consentData, error: consentError } = await supabase
                .from('mortgage_profiles')
                .select('broker_consent, user_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (consentError) {
                console.error('Consent check error:', consentError);
                return res.status(500).json({ error: 'Failed to verify consent' });
            }

            if (!consentData || !consentData.broker_consent) {
                return res.status(403).json({ 
                    error: 'Access denied: This user has not granted consent to share their package' 
                });
            }
        }

        // 5. Build the mortgage package
        const packageResult = await buildMortgagePackage(userId);

        // 6. Check package readiness
        const readinessResult = await checkPackageReadiness(userId);

        // 7. Return combined response
        return res.status(200).json({
            ...packageResult,
            readiness: readinessResult
        });

    } catch (error: any) {
        console.error('API Handler Exception:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
