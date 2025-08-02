
import { createRoot } from 'react-dom/client';

// Minimal test to check if the issue is in main.tsx
console.log('Starting main.tsx execution...');

try {
  console.log('React imports successful');

  // Render the application
  const rootElement = document.getElementById("root");
  console.log('Root element found:', rootElement);
  
  if (!rootElement) {
    console.error("Failed to find the root element");
    document.body.innerHTML = "<h1>ERROR: Root element not found!</h1>";
  } else {
    console.log('About to render...');
    createRoot(rootElement).render(
      <div style={{padding: '20px', backgroundColor: 'red', color: 'white', fontSize: '24px'}}>
        <h1>BASIC TEST - React is Working!</h1>
        <p>If you see this, the issue was in the complex component tree</p>
        <p>Current time: {new Date().toISOString()}</p>
      </div>
    );
    console.log('Render completed');
  }
} catch (error) {
  console.error('Critical error in main.tsx:', error);
  document.body.innerHTML = `<h1 style="color: red;">CRITICAL ERROR: ${error.message}</h1>`;
}
