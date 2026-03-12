import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkPackageReadiness } from "@/services/mortgagePackageService";
import { MortgageProfile } from "@/types/mortgage";
import { fetchMortgageProfile } from "@/services/mortgageProfileService";
import { 
  CheckCircle, AlertCircle, XCircle, CreditCard, FileText, 
  Users, Globe, Star, Shield, Info, User, Calendar, 
  Building2, ArrowRight, Lock, Eye, EyeOff
} from "lucide-react";

interface ReadinessResult {
  isReady: boolean;
  profile: {
    complete: boolean;
    missingFields: string[];
  };
  documents: {
    complete: boolean;
    uploaded: number;
    required: number;
    missingDocuments: string[];
  };
  consent: {
    given: boolean;
    date: string | null;
  };
  canSubmitToHomieBroker: boolean;
  canSubmitToNewton: boolean;
}

export default function MortgageConsentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mortgageProfile, setMortgageProfile] = useState<MortgageProfile | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipAddress, setIpAddress] = useState<string>("");
  
  // Form state
  const [submissionChannel, setSubmissionChannel] = useState<"homie" | "newton" | "both">("both");
  const [consentChecks, setConsentChecks] = useState({
    creditCheck: false,
    informationAccuracy: false,
    documentSharing: false,
    consentWithdrawal: false
  });
  const [fullName, setFullName] = useState("");
  const [todayDate, setTodayDate] = useState("");

  // Load user and profile data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        setCurrentUserId(user.id);

        // Get today's date
        const today = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        setTodayDate(today);

        // Fetch mortgage profile
        const profile = await fetchMortgageProfile(user.id);
        setMortgageProfile(profile);
        setFullName(profile?.full_name || "");

        // Get IP address
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        setIpAddress(ipData.ip);

        // Check package readiness
        const readinessResult = await checkPackageReadiness(user.id);
        setReadiness(readinessResult);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load mortgage package data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate, toast]);

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!readiness) return false;
    if (!readiness.isReady) return false;
    if (!fullName || !mortgageProfile || fullName !== mortgageProfile.full_name) return false;
    if (!submissionChannel) return false;
    if (!consentChecks.creditCheck || 
        !consentChecks.informationAccuracy || 
        !consentChecks.documentSharing || 
        !consentChecks.consentWithdrawal) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!currentUserId || !mortgageProfile) return;

    try {
      // Update mortgage profile with submission data
      const { error } = await supabase
        .from("mortgage_profiles")
        .update({
          submission_channel: submissionChannel,
          submission_consent_date: new Date().toISOString(),
          submission_consent_ip: ipAddress
        })
        .eq("id", mortgageProfile.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "Failed to submit mortgage package. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Show success message
      toast({
        title: "Package Submitted",
        description: "Your mortgage package has been successfully submitted."
      });

      // Navigate to results page
      navigate("/mortgage-results");
    } catch (error) {
      console.error("Error submitting package:", error);
      toast({
        title: "Error",
        description: "Failed to submit mortgage package. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your mortgage package...</p>
        </div>
      </div>
    );
  }

  if (!readiness || !mortgageProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Unable to load your mortgage package.</p>
        </div>
      </div>
    );
  }

  // Determine status message
  const getStatusMessage = () => {
    if (readiness.isReady) {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
            <CheckCircle className="h-6 w-6" />
            <span>Profile Complete</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
            <FileText className="h-6 w-6" />
            <span>{readiness.documents.uploaded} Documents Uploaded</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
            <Shield className="h-6 w-6" />
            <span>Ready to Submit</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
          <AlertCircle className="h-6 w-6" />
          <span>Missing Required Information</span>
        </div>
        {readiness.profile.missingFields.length > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Profile: {readiness.profile.missingFields.join(", ")}</span>
          </div>
        )}
        {readiness.documents.missingDocuments.length > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Documents: {readiness.documents.missingDocuments.join(", ")}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
          Submit Your Mortgage Package
        </h1>
        <p className="text-gray-600 text-lg">
          Review your package and choose how you'd like to submit it
        </p>
      </div>

      {/* Status Section */}
      <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          {getStatusMessage()}
        </CardContent>
      </Card>

      {/* Submission Options */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-purple-600" />
          Choose Submission Option
        </h2>
        
        <RadioGroup value={submissionChannel} onValueChange={(value) => setSubmissionChannel(value as "homie" | "newton" | "both")} className="space-y-4">
          {/* Option 1: HomieAI Verified Brokers Only */}
          <div className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${submissionChannel === "homie" ? "border-purple-600 bg-purple-50/50" : "border-gray-200 hover:border-purple-300 bg-white"}`}>
            <RadioGroupItem value="homie" id="option-homie" className="absolute top-6 right-6" />
            <Label htmlFor="option-homie" className="flex items-start gap-4 cursor-pointer w-full">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-gray-900">HomieAI Verified Brokers Only</span>
                  {submissionChannel === "homie" && <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">Selected</span>}
                </div>
                <p className="text-sm text-gray-600">
                  Your profile is shared with verified brokers inside HomieAI only. Documents stay inside HomieAI secure platform.
                </p>
              </div>
            </Label>
          </div>

          {/* Option 2: Newton Velocity Network Only */}
          <div className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${submissionChannel === "newton" ? "border-purple-600 bg-purple-50/50" : "border-gray-200 hover:border-purple-300 bg-white"}`}>
            <RadioGroupItem value="newton" id="option-newton" className="absolute top-6 right-6" />
            <Label htmlFor="option-newton" className="flex items-start gap-4 cursor-pointer w-full">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-gray-900">Newton Velocity Network Only</span>
                  {submissionChannel === "newton" && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Selected</span>}
                </div>
                <p className="text-sm text-gray-600">
                  Your profile is shared with 200+ lenders and brokers on Newton's national network.
                </p>
              </div>
            </Label>
          </div>

          {/* Option 3: Both (Recommended) */}
          <div className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${submissionChannel === "both" ? "border-purple-600 bg-purple-50/50" : "border-gray-200 hover:border-purple-300 bg-white"}`}>
            <RadioGroupItem value="both" id="option-both" className="absolute top-6 right-6" />
            <Label htmlFor="option-both" className="flex items-start gap-4 cursor-pointer w-full">
              <div className="p-3 bg-green-100 rounded-xl">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-gray-900">Both (Recommended ⭐)</span>
                  {submissionChannel === "both" && <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">Selected</span>}
                </div>
                <p className="text-sm text-gray-600">
                  Maximum exposure. Best chance of fastest approval and lowest rate. 87% of users choose this option.
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Legal Consent Checkboxes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          Legal Consent
        </h2>

        <div className="space-y-4 bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="consent-credit-check"
              checked={consentChecks.creditCheck}
              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, creditCheck: checked as boolean }))}
              className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
            />
            <Label htmlFor="consent-credit-check" className="text-sm text-gray-700 cursor-pointer leading-tight">
              I consent to a credit check being performed by HomieAI and/or selected mortgage brokers
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox 
              id="consent-accuracy"
              checked={consentChecks.informationAccuracy}
              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, informationAccuracy: checked as boolean }))}
              className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
            />
            <Label htmlFor="consent-accuracy" className="text-sm text-gray-700 cursor-pointer leading-tight">
              I confirm all information provided in this package is accurate and complete to the best of my knowledge
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox 
              id="consent-sharing"
              checked={consentChecks.documentSharing}
              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, documentSharing: checked as boolean }))}
              className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
            />
            <Label htmlFor="consent-sharing" className="text-sm text-gray-700 cursor-pointer leading-tight">
              I consent to my documents being shared with the parties selected above
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox 
              id="consent-withdrawal"
              checked={consentChecks.consentWithdrawal}
              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, consentWithdrawal: checked as boolean }))}
              className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
            />
            <Label htmlFor="consent-withdrawal" className="text-sm text-gray-700 cursor-pointer leading-tight">
              I understand my consent can be withdrawn at any time by contacting HomieAI support
            </Label>
          </div>
        </div>

        {/* Full Name Input */}
        <div className="space-y-2">
          <Label htmlFor="full-name" className="text-sm font-semibold text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name exactly as it appears in your profile"
            className="border-2 border-gray-300 focus:border-purple-500 h-12"
          />
          <p className="text-xs text-gray-500">
            Name must match exactly: <span className="font-semibold text-gray-700">{mortgageProfile.full_name}</span>
          </p>
          {fullName && fullName !== mortgageProfile.full_name && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Name does not match your profile
            </p>
          )}
        </div>

        {/* Date (Auto-filled, not editable) */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="text"
            value={todayDate}
            readOnly
            className="border-2 border-gray-300 bg-gray-50 text-gray-600 h-12"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-4 left-0 right-0 bg-white/90 backdrop-blur-sm border-t-2 border-purple-200 p-4 shadow-lg z-50">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || readiness?.isReady === false}
          className={`w-full h-14 text-lg font-bold shadow-lg transition-all ${
            isFormValid() && readiness?.isReady !== false
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {readiness?.isReady === false ? (
            <span className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Fix Missing Information First
            </span>
          ) : !isFormValid() ? (
            <span className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Complete All Requirements
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Submit Mortgage Package
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
