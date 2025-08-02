
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RoleService } from '@/services/roleService';

// Define possible user roles - now matches database enum
export type UserRole = 'seeker' | 'landlord' | 'admin' | 'developer';

type RoleContextType = {
  role: UserRole | null;
  loading: boolean;
  hasRole: (role: UserRole) => Promise<boolean>;
  refreshRole: () => Promise<void>;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>('seeker'); // Default to seeker
  const [loading, setLoading] = useState(false); // Start with false to prevent blocking
  const { user } = useAuth();

  const fetchUserRole = async () => {
    console.log('RoleContext: fetchUserRole called, user:', user?.id);
    
    if (!user?.id) {
      console.log('RoleContext: No user ID, setting role to seeker');
      setRole('seeker');
      setLoading(false);
      return;
    }

    // For now, just set a default role to bypass database issues
    console.log('RoleContext: Setting default role to seeker');
    setRole('seeker');
    setLoading(false);
  };

  const hasRole = async (checkRole: UserRole): Promise<boolean> => {
    // Simplified check - just return true for seeker for now
    return role === checkRole || checkRole === 'seeker';
  };

  const refreshRole = async () => {
    await fetchUserRole();
  };

  useEffect(() => {
    console.log('RoleContext: useEffect triggered, user?.id:', user?.id);
    fetchUserRole();
  }, [user?.id]);

  return (
    <RoleContext.Provider value={{ role, loading, hasRole, refreshRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
