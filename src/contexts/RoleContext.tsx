import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

// Define possible user roles
export type UserRole = 'seeker' | 'landlord' | 'admin' | 'developer' | 'renovator' | 'mortgage_broker' | 'lawyer' | 'lender';

type RoleContextType = {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Don't default to 'seeker' - let RoleInitializer set it
  const [role, setRole] = useState<UserRole | null>(null);

  const value = useMemo(() => ({ role, setRole }), [role]);

  return (
    <RoleContext.Provider value={value}>
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
