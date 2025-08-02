import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define possible user roles - matches database enum
export type UserRole = 'seeker' | 'landlord' | 'admin' | 'developer';

type SimpleRoleContextType = {
  role: UserRole;
  loading: boolean;
  setRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
  refreshRole: () => void;
};

const SimpleRoleContext = createContext<SimpleRoleContextType | undefined>(undefined);

export function SimpleRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('seeker');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const setRole = (newRole: UserRole) => {
    console.log('SimpleRoleContext: Setting role to:', newRole);
    setRoleState(newRole);
  };

  const hasRole = (checkRole: UserRole): boolean => {
    return role === checkRole;
  };

  const refreshRole = () => {
    // For now, get role from user metadata if available
    if (user?.user_metadata?.role) {
      console.log('SimpleRoleContext: Refreshing role from metadata:', user.user_metadata.role);
      setRole(user.user_metadata.role);
    }
  };

  useEffect(() => {
    // Initialize role from user metadata when user changes
    if (user?.user_metadata?.role) {
      console.log('SimpleRoleContext: User changed, setting role:', user.user_metadata.role);
      setRole(user.user_metadata.role);
    }
  }, [user?.user_metadata?.role]);

  return (
    <SimpleRoleContext.Provider value={{ role, loading, setRole, hasRole, refreshRole }}>
      {children}
    </SimpleRoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(SimpleRoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a SimpleRoleProvider');
  }
  return context;
}