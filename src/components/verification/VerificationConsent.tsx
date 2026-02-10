import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationConsentProps {
  onConsentChange: (consent: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function VerificationConsent({ onConsentChange, disabled = false, className }: VerificationConsentProps) {
  const [consent, setConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleConsentChange = (checked: boolean) => {
    setConsent(checked);
    onConsentChange(checked);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Consent Checkbox */}
      <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <Checkbox
          id="verification-consent"
          checked={consent}
          onCheckedChange={handleConsentChange}
          disabled={disabled}
          className="mt-1"
        />
        <div className="flex-1">
          <label 
            htmlFor="verification-consent" 
            className={`text-sm font-medium leading-relaxed cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            I consent to identity verification for fraud prevention and payments
          </label>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700">
              Required for secure transactions
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-600 hover:text-purple-700 h-auto p-0"
        >
          <span className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            {showDetails ? 'Hide' : 'Show'} Details
          </span>
        </Button>

        {showDetails && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">What we verify:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Government-issued ID (passport, driver's license, etc.)</li>
                  <li>• Proof of address (utility bill, bank statement)</li>
                  <li>• Liveness check (photo verification)</li>
                  <li>• Anti-money laundering screening</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Why we need this:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Prevent fraud and protect all users</li>
                  <li>• Ensure secure payment processing</li>
                  <li>• Comply with financial regulations</li>
                  <li>• Build trust in the Roomie AI community</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Your data protection:</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Encrypted storage and transmission</li>
                  <li>• Limited access to verification data</li>
                  <li>• Right to request data deletion</li>
                  <li>• GDPR and privacy law compliant</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {consent ? (
          <div className="flex items-center gap-2 text-green-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-medium">Consent provided</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Consent required</span>
          </div>
        )}
      </div>
    </div>
  );
}
