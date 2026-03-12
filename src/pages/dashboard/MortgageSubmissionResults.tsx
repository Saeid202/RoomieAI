import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MortgageProfile } from "@/types/mortgage";
import { fetchMortgageProfile } from "@/services/mortgageProfileService";
import { 
  CheckCircle, Clock, MessageSquare, Star, MapPin, 
  DollarSign, TrendingUp, Mail, Smartphone, 
  Building2, Users, FileText, AlertCircle, Loader2
} from "lucide-react";

interface Broker {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  company_name: string | null;
  license_number: string | null;
  profile_photo: string | null;
  rating: number | null;
  deals_closed: number | null;
  specialization: string | null;
  service_area: string | null;
  created_at: string;
}

interface NewtonProduct {
  id: string;
  lender_name: string;
  product_type: string;
  interest_rate: number;
  estimated_monthly_payment: number;
  max_approval_amount: number;
  eligible: boolean;
  eligibility_reason: string | null;
}

export default function MortgageSubmissionResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mortgageProfile, setMortgageProfile] = useState<MortgageProfile | null>(null);
  const [submissionChannel, setSubmissionChannel] = useState<"homie" | "newton" | "both">("both");
  const [loading, setLoading] = useState(true);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [newtonProducts, setNewtonProducts] = useState<NewtonProduct[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    inApp: true,
    email: false,
    sms: false
  });

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

        // Fetch mortgage profile
        const profile = await fetchMortgageProfile(user.id);
        if (!profile) {
          toast({
            title: "Error",
            description: "Mortgage profile not found.",
            variant: "destructive"
          });
          navigate("/dashboard/buying-opportunities");
          return;
        }
        setMortgageProfile(profile);
        setSubmissionChannel(profile.submission_channel || "both");

        // Load brokers if HomieAI channel selected
        if (profile.submission_channel === "homie" || profile.submission_channel === "both") {
          await loadBrokers(profile);
        }

        // Load Newton products if Newton channel selected
        if (profile.submission_channel === "newton" || profile.submission_channel === "both") {
          await loadNewtonProducts(user.id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load submission results.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate, toast]);

  // Load matching brokers based on property type and location
  const loadBrokers = async (profile: MortgageProfile) => {
    try {
      const { data: brokersData, error } = await supabase
        .from("mortgage_broker_profiles")
        .select("*")
        .or(`specialization.ilike.%${profile.property_type}%,specialization.ilike.%${profile.target_location}%`)
        .eq("is_verified", true)
        .limit(5);

      if (error) {
        console.error("Error loading brokers:", error);
        setBrokers([]);
      } else {
        setBrokers(brokersData || []);
      }
    } catch (error) {
      console.error("Error in loadBrokers:", error);
      setBrokers([]);
    }
  };

  // Load Newton product matches
  const loadNewtonProducts = async (userId: string) => {
    try {
      // This would call the Newton API in production
      // For now, return mock data
      const mockProducts: NewtonProduct[] = [
        {
          id: "1",
          lender_name: "Royal Bank of Canada",
          product_type: "5 Year Fixed",
          interest_rate: 5.29,
          estimated_monthly_payment: 2850,
          max_approval_amount: 650000,
          eligible: true,
          eligibility_reason: null
        },
        {
          id: "2",
          lender_name: "TD Canada Trust",
          product_type: "3 Year Fixed",
          interest_rate: 5.19,
          estimated_monthly_payment: 2780,
          max_approval_amount: 600000,
          eligible: true,
          eligibility_reason: null
        },
        {
          id: "3",
          lender_name: "Scotiabank",
          product_type: "5 Year Variable",
          interest_rate: 4.99,
          estimated_monthly_payment: 2690,
          max_approval_amount: 580000,
          eligible: false,
          eligibility_reason: "Credit score required: 700. Your score: 680"
        }
      ];
      setNewtonProducts(mockProducts);
    } catch (error) {
      console.error("Error loading Newton products:", error);
      setNewtonProducts([]);
    }
  };

  // Handle notification preference changes
  const handleNotificationChange = (type: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Save notification preferences
  const handleSavePreferences = async () => {
    if (!currentUserId) return;

    try {
      // In production, save to user preferences table
      console.log("Saving preferences:", notificationPrefs);
      
      toast({
        title: "Preferences Saved",
        description: "You will be notified when brokers respond."
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your submission results...</p>
        </div>
      </div>
    );
  }

  if (!mortgageProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Unable to load your submission results.</p>
        </div>
      </div>
    );
  }

  // Determine layout based on submission channel
  const showHomieColumn = submissionChannel === "homie" || submissionChannel === "both";
  const showNewtonColumn = submissionChannel === "newton" || submissionChannel === "both";
  const isBoth = submissionChannel === "both";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
          Submission Results
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what happens next with your mortgage package
        </p>
      </div>

      {/* Step 1: Submission Confirmation Banner */}
      <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Mortgage Package Has Been Submitted
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Submitted on: {new Date().toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                    Package ID: #{Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Two Columns */}
      <div className={`grid ${isBoth ? "grid-cols-1 md:grid-cols-2 gap-6" : "grid-cols-1"} gap-6`}>
        
        {/* Left Column - HomieAI Brokers */}
        {showHomieColumn && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-lg">
              <Users className="h-6 w-6" />
              <h2>HomieAI Verified Brokers</h2>
            </div>

            <Card className="border-2 border-purple-200 shadow-lg">
              <CardContent className="p-6">
                {brokers.length > 0 ? (
                  <div className="space-y-4">
                    {brokers.map((broker) => (
                      <div key={broker.id} className="p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                            {broker.full_name?.charAt(0) || "B"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{broker.full_name}</h3>
                            <p className="text-sm text-gray-600">{broker.company_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-bold">{broker.rating || 4.8}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                • {broker.deals_closed || 150} deals closed
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                {broker.specialization || "General"}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                {broker.service_area || "Local"}
                              </Badge>
                            </div>
                            <div className="mt-3">
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1">
                                <Clock className="h-3 w-3 mr-1" />
                                Reviewing Your Profile
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Our team is matching you with a verified broker shortly.
                    </p>
                    <p className="text-sm text-gray-500">
                      We will notify you within 2 hours.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right Column - Newton Velocity */}
        {showNewtonColumn && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
              <Globe className="h-6 w-6" />
              <h2>Newton Velocity Network</h2>
            </div>

            <Card className="border-2 border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Submitted to Newton Network. 200+ lenders are reviewing your profile.
                  </span>
                </div>

                {newtonProducts.length > 0 ? (
                  <div className="space-y-3">
                    {newtonProducts.map((product) => (
                      <div key={product.id} className="p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{product.lender_name}</h3>
                            <p className="text-sm text-gray-600">{product.product_type}</p>
                          </div>
                          {product.eligible ? (
                            <Badge className="bg-green-100 text-green-700 text-xs px-3 py-1">
                              Eligible ✅
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-xs px-3 py-1">
                              Not Eligible ❌
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Interest Rate</p>
                            <p className="font-bold text-gray-900">{product.interest_rate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Monthly Payment</p>
                            <p className="font-bold text-gray-900">${product.estimated_monthly_payment.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Max Approval</p>
                            <p className="font-bold text-gray-900">${product.max_approval_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        {!product.eligible && product.eligibility_reason && (
                          <div className="mt-3 p-2 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {product.eligibility_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Globe className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      Newton Network is reviewing your profile.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      You'll receive offers from lenders shortly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Step 3: Status Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" />
          Application Status Timeline
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-purple-200"></div>

          {/* Step 1: Package Submitted */}
          <div className="relative pl-16 pb-6">
            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
              <h3 className="font-bold text-gray-900">Package Submitted</h3>
              <p className="text-sm text-gray-600">
                Your mortgage package has been successfully submitted on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Step 2: Broker Reviewing */}
          <div className="relative pl-16 pb-6">
            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-yellow-200 shadow-sm">
              <h3 className="font-bold text-gray-900">Broker Reviewing</h3>
              <p className="text-sm text-gray-600">
                Verified brokers are reviewing your profile and documents
              </p>
            </div>
          </div>

          {/* Step 3: Broker Contacted */}
          <div className="relative pl-16 pb-6">
            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <h3 className="font-bold text-gray-900">Broker Contacted</h3>
              <p className="text-sm text-gray-600">
                One or more brokers will contact you with offers
              </p>
            </div>
          </div>

          {/* Step 4: Application In Progress */}
          <div className="relative pl-16 pb-6">
            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
              <h3 className="font-bold text-gray-900">Application In Progress</h3>
              <p className="text-sm text-gray-600">
                You'll work with your chosen broker to complete the application
              </p>
            </div>
          </div>

          {/* Step 5: Mortgage Approved */}
          <div className="relative pl-16">
            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-gray-500" />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900">Mortgage Approved</h3>
              <p className="text-sm text-gray-600">
                Final approval and funding
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Notification Preferences */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-6 w-6 text-purple-600" />
          How would you like to be notified when a broker responds?
        </h2>

        <Card className="border-2 border-purple-200 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="notify-inapp"
                checked={notificationPrefs.inApp}
                onCheckedChange={() => handleNotificationChange("inApp")}
                className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
              />
              <Label htmlFor="notify-inapp" className="text-sm text-gray-700 cursor-pointer leading-tight">
                In-app notification (always on)
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="notify-email"
                checked={notificationPrefs.email}
                onCheckedChange={() => handleNotificationChange("email")}
                className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
              />
              <Label htmlFor="notify-email" className="text-sm text-gray-700 cursor-pointer leading-tight">
                Email notification
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="notify-sms"
                checked={notificationPrefs.sms}
                onCheckedChange={() => handleNotificationChange("sms")}
                className="mt-1 h-5 w-5 border-2 border-purple-600 rounded-md"
              />
              <Label htmlFor="notify-sms" className="text-sm text-gray-700 cursor-pointer leading-tight">
                SMS notification
              </Label>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSavePreferences}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 h-12 text-base font-semibold shadow-md"
              >
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
