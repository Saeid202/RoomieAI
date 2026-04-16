import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProviders } from "@/providers"
import App from './App.tsx'
import './index.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err))
  })
}

// Initialize React Query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
})

// Add error boundary for the entire application
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Render the application
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <App />
      </AppProviders>
    </QueryClientProvider>
  </BrowserRouter>
);
