import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { RoleProvider } from "@/contexts/RoleContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/test" element={<div>Test Page</div>} />
      <Route path="/debug" element={<div>Debug Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard (will be added)</div>} />
      <Route path="/dashboard/profile" element={<div>Profile (will be added)</div>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
