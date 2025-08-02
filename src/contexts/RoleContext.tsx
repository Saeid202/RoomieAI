
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
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRole = async () => {
    if (!user?.id) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userRole = await RoleService.getUserRole(user.id);
      setRole(userRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = async (checkRole: UserRole): Promise<boolean> => {
    if (!user?.id) return false;
    return await RoleService.hasRole(user.id, checkRole);
  };

  const refreshRole = async () => {
    await fetchUserRole();
  };

  useEffect(() => {
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
