// Simple test to verify the page loads
import { useState } from "react";

export default function TestClients() {
  const [test] = useState("Hello from Clients Page");
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{test}</h1>
      <p>If you see this, the page is loading correctly.</p>
    </div>
  );
}
