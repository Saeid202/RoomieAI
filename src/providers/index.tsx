import ThemeProvider from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { RoleProvider } from "@/contexts/RoleContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
