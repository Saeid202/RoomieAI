// =====================================================
// AI Screening Settings Page
// Standalone page for landlord to configure AI screening
// =====================================================

import { AIScreeningSettings } from "@/components/landlord/AIScreeningSettings";

export default function AIScreeningSettingsPage() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <AIScreeningSettings />
    </div>
  );
}