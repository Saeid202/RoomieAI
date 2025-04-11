
import { createContext, useContext, useState, ReactNode } from 'react';

// Define possible user roles
export type UserRole = 'seeker' | 'landlord';

type RoleContextType = {
  role: UserRole;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('seeker');

  const toggleRole = () => {
    setRole(prev => prev === 'seeker' ? 'landlord' : 'seeker');
  };

  return (
    <RoleContext.Provider value={{ role, toggleRole, setRole }}>
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
