import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export const AuthDebugComponent = () => {
  const [authState, setAuthState] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setSessionData({ session, error: sessionError });

      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      setAuthState({ user, error: userError });

      console.log('Auth Debug:', {
        contextUser: user,
        sessionUser: session?.user,
        directUser: user,
        sessionError,
        userError
      });
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <p><strong>Context User:</strong> {user ? `${user.email} (${user.id})` : 'None'}</p>
      <p><strong>Session User:</strong> {sessionData?.session?.user ? sessionData.session.user.email : 'None'}</p>
      <p><strong>Direct User:</strong> {authState?.user ? authState.user.email : 'None'}</p>
      
      {sessionData?.error && (
        <p style={{color: 'red'}}><strong>Session Error:</strong> {sessionData.error.message}</p>
      )}
      
      {authState?.error && (
        <p style={{color: 'red'}}><strong>User Error:</strong> {authState.error.message}</p>
      )}
      
      <button onClick={checkAuth} style={{ marginTop: '5px', padding: '2px 5px' }}>
        Refresh
      </button>
    </div>
  );
};