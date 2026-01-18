import { createClient } from '@supabase/supabase-js';

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
        // Using environment variables for security
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bjesofgfbuyzjamyliys.supabase.co';
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 3. Verify Authentication & Authorization
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

        // Verify the user has admin role
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

        if (roleError || !roleData) {
            console.warn(`Unauthorized access attempt by user: ${user.email}`);
            return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
        }

        // 4. Fetch Users (using Service Role Client to bypass RLS)
        // We fetch from user_profiles which is the primary table for user management
        const { data: users, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Database fetch error:', fetchError.message);
            throw fetchError;
        }

        // 5. Return success response
        return res.status(200).json({ users });

    } catch (error: any) {
        console.error('API Handler Exception:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
