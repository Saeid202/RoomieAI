import { createContext, useContext, useState, ReactNode } from 'react';

// Define possible user roles
export type UserRole = 'seeker' | 'landlord' | 'admin' | 'developer' | 'renovator' | 'mortgage_broker';

type RoleContextType = {
  role: UserRole | null;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Don't default to 'seeker' - let RoleInitializer set it
  const [role, setRole] = useState<UserRole | null>(null);

  const toggleRole = () => {
    // Cycle through roles: seeker -> landlord -> admin -> developer -> renovator -> mortgage_broker -> seeker
    setRole(prev => {
      switch (prev) {
        case 'seeker': return 'landlord';
        case 'landlord': return 'admin';
        case 'admin': return 'developer';
        case 'developer': return 'renovator';
        case 'renovator': return 'mortgage_broker';
        case 'mortgage_broker': return 'seeker';
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
