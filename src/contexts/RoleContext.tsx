
import { createContext, useContext, useState, ReactNode } from 'react';

// Define possible user roles
export type UserRole = 'seeker' | 'landlord' | 'developer' | 'admin';

type RoleContextType = {
  role: UserRole;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('seeker');

  const toggleRole = () => {
    // Cycle through roles: seeker -> landlord -> developer -> admin -> seeker
    setRole(prev => {
      switch(prev) {
        case 'seeker': return 'landlord';
        case 'landlord': return 'developer';
        case 'developer': return 'admin';
        case 'admin': return 'seeker';
        default: return 'seeker';
      }
    });
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
