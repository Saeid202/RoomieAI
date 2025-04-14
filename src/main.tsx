
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { RoleProvider } from './contexts/RoleContext.tsx'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RoleProvider>
      <App />
    </RoleProvider>
  </BrowserRouter>
);
