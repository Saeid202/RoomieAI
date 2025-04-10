
import { useState } from "react";
import { PreferenceSelector } from "./PreferenceSelector";

export function ProfileContent() {
  const [showProfileSection, setShowProfileSection] = useState(true);
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">What are you looking for?</h2>
          <p className="text-gray-600 mb-6">
            Select your housing preference. You can change this at any time.
          </p>
          <PreferenceSelector />
        </div>
      </div>
    </div>
  );
}
