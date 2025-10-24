import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  EnhancedPageLayout,
  EnhancedHeader,
  EnhancedCard,
  EnhancedButton,
  EnhancedFormField,
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect
} from "@/components/ui/design-system";
import {
  ArrowLeft,
  Home,
  User,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Send,
  Pen,
} from "lucide-react";
import { fetchPropertyById, Property } from "@/services/propertyService";
import {
  submitRentalApplication,
  hasUserAppliedForProperty,
  updateApplicationStatus,
  getApplicationById,
} from "@/services/rentalApplicationService";
import { LeaseContractTemplate } from "@/components/lease/LeaseContractTemplate";
import { LeaseContract } from "@/services/leaseContractService";
import OntarioLeaseForm2229E from "@/components/ontario/OntarioLeaseForm2229E";
import { OntarioLeaseDisplay } from "@/components/lease/OntarioLeaseDisplay";
import {
  generateOntarioLeaseContract,
  downloadOntarioLeasePdf,
} from "@/services/ontarioLeaseService";
import {
  OntarioLeaseFormData,
  OntarioLeaseContract,
} from "@/types/ontarioLease";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { testDatabaseConnection } from "@/utils/databaseTest";
import {
  uploadRentalDocument,
  getApplicationDocuments,
} from "@/services/rentalDocumentService";
import { fetchUserProfileForApplication } from "@/services/userProfileService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RentalApplicationData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  employer: string;
  monthlyIncome: string;

  // Rental Preferences
  moveInDate: string;
  leaseDuration: string;
  petOwnership: boolean;
  smokingStatus: string;

  // References
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;

  // Documents
  referenceLetters: File[];
  employmentLetter: File[];
  creditScoreLetter: File[];
  additionalDocuments: File[];

  // Additional Information
  additionalInfo: string;
  agreeToTerms: boolean;

  // Contract Signing
  contractSigned: boolean;
  signatureData: string;

  // Payment Information
  paymentCompleted: boolean;
}

const initialApplicationData: RentalApplicationData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  occupation: "",
  employer: "",
  monthlyIncome: "",
  moveInDate: "",
  leaseDuration: "",
  petOwnership: false,
  smokingStatus: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  referenceLetters: [],
  employmentLetter: [],
  creditScoreLetter: [],
  additionalDocuments: [],
  additionalInfo: "",
  agreeToTerms: false,
  contractSigned: false,
  signatureData: "",
  paymentCompleted: false,
};

const steps = [
  { id: 1, title: "Property Overview", icon: Home },
  { id: 2, title: "Application & Documents", icon: FileText },
  { id: 3, title: "Sign Lease Contract", icon: Pen },
  { id: 4, title: "Payment", icon: DollarSign },
];

export default function RentalApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState<RentalApplicationData>(
    initialApplicationData
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyApplied, setHasAlreadyApplied] = useState(false);
  const [previewContract, setPreviewContract] = useState<
    LeaseContract | OntarioLeaseContract | null
  >(null);
  const [documentsSubmittedForReview, setDocumentsSubmittedForReview] =
    useState(false);
  const [createdApplicationId, setCreatedApplicationId] = useState<
    string | null
  >(null);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [ontarioFormData, setOntarioFormData] =
    useState<OntarioLeaseFormData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileAutoFilled, setProfileAutoFilled] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchPropertyById(id);
        setProperty(data as Property);
      } catch (error) {
        console.error("Failed to load property:", error);
        toast.error("Failed to load property details");
        navigate("/dashboard/rental-options");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id, navigate]);

  useEffect(() => {
    // Enhanced user profile loading with comprehensive fallback
    const loadUserProfile = async () => {
      if (!user) return;
      
      setLoadingProfile(true);
      try {
        console.log("Loading user profile for auto-fill...");
        const profileData = await fetchUserProfileForApplication(user.id);
        
        setApplicationData(prev => ({
          ...prev,
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone || prev.phone,
          occupation: profileData.occupation || prev.occupation,
        }));
        
        setProfileAutoFilled(true);
        console.log("Profile auto-filled successfully:", profileData);
        
        if (profileData.fullName || profileData.email) {
          toast.success("Profile information auto-filled", {
            description: "Your information has been pre-filled from your profile"
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to basic data
        setApplicationData(prev => ({
          ...prev,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || '',
        }));
        console.log("Using fallback profile data");
      } finally {
        setLoadingProfile(false);
      }
    };
    
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    // Check if user has already applied for this property (only if not editing existing application)
    const checkExistingApplication = async () => {
      if (!id || !user) return;

      // Check URL parameters for applicationId first
      const urlParams = new URLSearchParams(window.location.search);
      const appIdParam = urlParams.get("applicationId");

      // If we have an applicationId, we're editing an existing application
      if (appIdParam) {
        setHasAlreadyApplied(false);
        return;
      }

      try {
        const hasApplied = await hasUserAppliedForProperty(id, user.id);
        setHasAlreadyApplied(hasApplied);

        if (hasApplied) {
          toast.info("You have already applied for this property.");
        }
      } catch (error) {
        console.error("Error checking existing application:", error);
      }
    };

    checkExistingApplication();
  }, [id, user]);

  useEffect(() => {
    // Check URL parameters for step and applicationId
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get("step");
    const appIdParam = urlParams.get("applicationId");

    if (stepParam) {
      setCurrentStep(parseInt(stepParam));
    }

    if (appIdParam) {
      setCreatedApplicationId(appIdParam);
      loadExistingApplication(appIdParam);
    }
  }, []);

  const loadExistingApplication = async (applicationId: string) => {
    try {
      console.log("Loading existing application:", applicationId);
      const app = await getApplicationById(applicationId);
      if (app) {
        console.log("Existing application data:", app);
        // Pre-fill form with existing data
        setApplicationData((prev) => ({
          ...prev,
          fullName: app.full_name,
          email: app.email,
          phone: app.phone,
          occupation: app.occupation,
          monthlyIncome: app.monthly_income.toString(),
          moveInDate: app.move_in_date || "",
          emergencyContactName: app.emergency_contact_name || "",
          emergencyContactPhone: app.emergency_contact_phone || "",
          emergencyContactRelation: app.emergency_contact_relation || "",
          additionalInfo: app.additional_info || "",
          contractSigned: app.contract_signed || false,
          paymentCompleted: app.payment_completed || false,
        }));

        if (app.status === "under_review") {
          setDocumentsSubmittedForReview(true);
        }

        // Load existing documents
        const docs = await getApplicationDocuments(applicationId);
        setExistingDocuments(docs);
        console.log("Existing documents:", docs);
      }
    } catch (error) {
      console.error("Failed to load existing application:", error);
      toast.error("Failed to load existing application data");
    }
  };

  // Don't auto-generate preview contract - let user fill out Ontario form first
  // useEffect(() => {
  //   if (currentStep === 3 && property && user && !previewContract) {
  //     generatePreviewContract();
  //   }
  // }, [currentStep, property, user, previewContract]);

  // Load PDF when entering Step 3
  // Removed legacy PDF loading - we now use the web form

  const generatePreviewContract = () => {
    if (!property || !user) return;

    const startDate =
      applicationData.moveInDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const duration = parseInt(
      applicationData.leaseDuration?.replace("-months", "") || "12"
    );
    const endDate = new Date(
      new Date(startDate).getTime() + duration * 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    const mockContract: LeaseContract = {
      id: `preview-${Date.now()}`,
      application_id: `preview-app-${Date.now()}`,
      property_id: property.id,
      landlord_id: property.user_id,
      tenant_id: user.id,

      lease_start_date: startDate,
      lease_end_date: endDate,
      monthly_rent: property.monthly_rent,
      security_deposit: property.security_deposit || property.monthly_rent,
      lease_duration_months: duration,

      property_address: property.address,
      property_city: property.city,
      property_state: property.state,
      property_zip: property.zip_code,
      property_type: property.property_type,
      property_bedrooms: property.bedrooms,
      property_bathrooms: property.bathrooms,
      property_square_footage: property.square_footage,

      landlord_name: "Property Owner", // This would come from landlord profile
      landlord_email: "landlord@example.com", // This would come from landlord profile
      landlord_phone: "",
      tenant_name:
        applicationData.fullName ||
        user.user_metadata?.full_name ||
        user.email ||
        "",
      tenant_email: applicationData.email || user.email || "",
      tenant_phone: applicationData.phone || "",

      pet_policy:
        property.pet_policy || "No pets allowed without written permission",
      smoking_policy:
        applicationData.smokingStatus === "non-smoker"
          ? "Smoking is prohibited on the premises"
          : "Smoking policy to be determined",
      utilities_included: property.utilities_included || [],
      parking_details: property.parking,
      maintenance_responsibility:
        "Landlord responsible for major repairs, tenant responsible for routine maintenance",
      additional_terms: property.special_instructions || "",

      status: "draft",
      contract_template_version: "v1.0",
      generated_by: user.id,
      electronic_signature_consent: true,
      terms_acceptance_landlord: false,
      terms_acceptance_tenant: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPreviewContract(mockContract);
  };

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (
    field: keyof RentalApplicationData,
    value: string | boolean
  ) => {
    setApplicationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    field: keyof RentalApplicationData,
    files: FileList | null
  ) => {
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) =>
          file.size <= 10 * 1024 * 1024 && // 10MB limit
          (file.type.includes("pdf") ||
            file.type.includes("image") ||
            file.type.includes("document"))
      );

      setApplicationData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as File[]), ...validFiles].slice(0, 5), // Max 5 files per category
      }));
    }
  };

  const removeFile = (field: keyof RentalApplicationData, index: number) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: (prev[field] as File[]).filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => {
        const newStep = prev + 1;
        // Clear preview contract when entering step 3 to show Ontario form
        if (newStep === 3) {
          setPreviewContract(null);
        }
        return newStep;
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => {
        const newStep = prev - 1;
        // Clear preview contract when going back from step 3
        if (prev === 3) {
          setPreviewContract(null);
        }
        return newStep;
      });
    }
  };

  const handleSignContract = (signatureData: string) => {
    setApplicationData((prev) => ({
      ...prev,
      contractSigned: true,
      signatureData: signatureData,
      agreeToTerms: true, // Auto-agree to terms when signing
    }));
    toast.success("Contract signed successfully!");
  };

  const handleOntarioFormSubmit = async (data: OntarioLeaseFormData) => {
    try {
      if (!createdApplicationId) {
        toast.error(
          "No application found. Please complete the application first."
        );
        return;
      }

      // Check if tenant has agreed to sign
      if (!data.tenantAgreement) {
        toast.error("You must agree to sign the contract to proceed.");
        return;
      }

      // Generate Ontario lease contract
      const contract = await generateOntarioLeaseContract({
        application_id: createdApplicationId,
        ontario_form_data: data,
        lease_start_date: data.tenancyStartDate.toISOString().split("T")[0],
        lease_end_date: data.tenancyEndDate ? data.tenancyEndDate.toISOString().split("T")[0] : '',
      });

      setOntarioFormData(data);
      setPreviewContract(contract);
      toast.success("Ontario lease contract generated and sent to landlord for signature!");
    } catch (error) {
      console.error("Error generating Ontario lease contract:", error);
      toast.error("Failed to generate lease contract. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("🚀 handleSubmit called - starting submission process");
      setIsSubmitting(true);

      // Debug: Log current application data
      console.log("Current application data:", applicationData);
      console.log("Contract signed:", applicationData.contractSigned);
      console.log("User:", user);
      console.log("Property ID:", id);
      console.log("Current step:", currentStep);
      console.log("Steps length:", steps.length);

      // Validate required fields (only for final submission)
      const missingFields = [];
      if (!applicationData.fullName) missingFields.push("Full Name");
      if (!applicationData.email) missingFields.push("Email");
      if (!applicationData.phone) missingFields.push("Phone");
      if (!applicationData.occupation) missingFields.push("Occupation");
      if (!applicationData.monthlyIncome) missingFields.push("Monthly Income");
      // Note: Contract signing is optional for initial submission
      // if (!applicationData.contractSigned)
      //   missingFields.push("Contract Signature");

      console.log("Missing fields:", missingFields);

      if (missingFields.length > 0) {
        toast.error(`Please complete: ${missingFields.join(", ")}`);
        return;
      }

      if (!id || !user) {
        toast.error("Missing property or user information");
        return;
      }

      // For now, skip document uploads to simplify the submission process
      // Documents can be uploaded after the application is created
      const documentUrls = {
        reference_documents: [],
        employment_documents: [],
        credit_documents: [],
        additional_documents: []
      };

      console.log("Skipping document uploads for now - will be implemented later");

      // Submit application to backend with all fields
      const applicationInput: any = {
        property_id: id,
        applicant_id: user.id,
        full_name: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        date_of_birth: applicationData.dateOfBirth || undefined,
        occupation: applicationData.occupation,
        employer: applicationData.employer || undefined,
        monthly_income: parseFloat(applicationData.monthlyIncome),
        move_in_date: applicationData.moveInDate || undefined,
        lease_duration: applicationData.leaseDuration || undefined,
        pet_ownership: applicationData.petOwnership,
        smoking_status: applicationData.smokingStatus || undefined,
        emergency_contact_name: applicationData.emergencyContactName || undefined,
        emergency_contact_phone: applicationData.emergencyContactPhone || undefined,
        emergency_contact_relation: applicationData.emergencyContactRelation || undefined,
        reference_documents: documentUrls.reference_documents,
        employment_documents: documentUrls.employment_documents,
        credit_documents: documentUrls.credit_documents,
        additional_documents: documentUrls.additional_documents,
        additional_info: applicationData.additionalInfo || undefined,
        agree_to_terms: true, // Required by database constraint
        signature_data: applicationData.signatureData || undefined,
        contract_signed: applicationData.contractSigned || false,
        payment_completed: applicationData.paymentCompleted || false
      };

      console.log("Submitting application with data:", applicationInput);
      await submitRentalApplication(applicationInput);

      toast.success("Rental application and contract submitted successfully!");
      navigate("/dashboard/rental-options");
    } catch (error) {
      console.error("Error submitting application:", error);
      console.error("Error details:", error);
      toast.error(
        `Failed to submit application: ${error.message || "Please try again."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>
      );
    }

    if (!property) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Property not found</h3>
          <p className="text-muted-foreground mt-2">
            The property you're looking for doesn't exist.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/dashboard/rental-options")}
          >
            Back to Listings
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {property.listing_title}
              </h2>
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <MapPin className="h-4 w-4" />
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Rent:</span>
                    <span className="font-semibold">
                      ${property.monthly_rent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Property Type:
                    </span>
                    <span className="font-semibold">
                      {property.property_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bedrooms:</span>
                    <span className="font-semibold">
                      {property.bedrooms || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bathrooms:</span>
                    <span className="font-semibold">
                      {property.bathrooms || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-semibold">
                      {property.available_date
                        ? new Date(property.available_date).toLocaleDateString()
                        : "Immediately"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {property.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                4-Step Rental Process
              </h3>
              <p className="text-blue-800 text-sm">
                1. Review property details → 2. Complete application & upload
                documents → 3. Sign lease contract → 4. Make payment to secure
                your rental.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Applicant Information
              </h2>

              {/* Personal Information */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    {profileAutoFilled && applicationData.fullName && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Auto-filled
                      </span>
                    )}
                    {loadingProfile && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </span>
                    )}
                  </div>
                  <Input
                    id="fullName"
                    value={applicationData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                    className={profileAutoFilled && applicationData.fullName ? "bg-green-50 border-green-200" : ""}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="email">Email Address *</Label>
                    {profileAutoFilled && applicationData.email && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Auto-filled
                      </span>
                    )}
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className={profileAutoFilled && applicationData.email ? "bg-green-50 border-green-200" : ""}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    {profileAutoFilled && applicationData.phone && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Auto-filled
                      </span>
                    )}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className={profileAutoFilled && applicationData.phone ? "bg-green-50 border-green-200" : ""}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="occupation">Occupation *</Label>
                    {profileAutoFilled && applicationData.occupation && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Auto-filled
                      </span>
                    )}
                  </div>
                  <Input
                    id="occupation"
                    value={applicationData.occupation}
                    onChange={(e) =>
                      handleInputChange("occupation", e.target.value)
                    }
                    placeholder="Enter your occupation"
                    className={profileAutoFilled && applicationData.occupation ? "bg-green-50 border-green-200" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={applicationData.monthlyIncome}
                    onChange={(e) =>
                      handleInputChange("monthlyIncome", e.target.value)
                    }
                    placeholder="Enter your monthly income"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="moveInDate"
                    className="!line-clamp-1 !leading-6"
                  >
                    Preferred Move-in Date
                  </Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={applicationData.moveInDate}
                    onChange={(e) =>
                      handleInputChange("moveInDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={applicationData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      placeholder="Enter contact name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={applicationData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      placeholder="Enter contact phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactRelation">
                      Relationship
                    </Label>
                    <Input
                      id="emergencyContactRelation"
                      value={applicationData.emergencyContactRelation}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactRelation",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Parent, Friend"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Required Documents</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Upload the following documents to support your rental
                application. All files must be under 10MB. Accepted formats:
                PDF, JPG, PNG, DOC, DOCX
              </p>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                {/* Reference Letters */}
                <div className="space-y-3">
                  <Label>Reference Letters</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) =>
                        handleFileUpload("referenceLetters", e.target.files)
                      }
                      className="w-full text-xs md:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] md:file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Letters from previous landlords, employers, or character
                      references
                    </p>
                  </div>
                  {applicationData.referenceLetters.length > 0 && (
                    <div className="space-y-2">
                      {applicationData.referenceLetters.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile("referenceLetters", index)
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Employment Letter */}
                <div className="space-y-3">
                  <Label>Employment Letter</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) =>
                        handleFileUpload("employmentLetter", e.target.files)
                      }
                      className="w-full text-xs md:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] md:file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Letter from employer confirming employment and salary
                    </p>
                  </div>
                  {applicationData.employmentLetter.length > 0 && (
                    <div className="space-y-2">
                      {applicationData.employmentLetter.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile("employmentLetter", index)
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Credit Score Letter */}
                <div className="space-y-3">
                  <Label>Credit Score Report</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) =>
                        handleFileUpload("creditScoreLetter", e.target.files)
                      }
                      className="w-full text-xs md:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] md:file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Credit report from authorized credit bureau
                    </p>
                  </div>
                  {applicationData.creditScoreLetter.length > 0 && (
                    <div className="space-y-2">
                      {applicationData.creditScoreLetter.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile("creditScoreLetter", index)
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Documents */}
                <div className="space-y-3">
                  <Label>Additional</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) =>
                        handleFileUpload("additionalDocuments", e.target.files)
                      }
                      className="w-full text-xs md:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] md:file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                      Bank statements, pay stubs, or other supporting documents
                    </p>
                  </div>
                  {applicationData.additionalDocuments.length > 0 && (
                    <div className="space-y-2">
                      {applicationData.additionalDocuments.map(
                        (file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted p-2 rounded"
                          >
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeFile("additionalDocuments", index)
                              }
                            >
                              ×
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t pt-6">
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={applicationData.additionalInfo}
                  onChange={(e) =>
                    handleInputChange("additionalInfo", e.target.value)
                  }
                  placeholder="Any additional information you'd like to share with the landlord..."
                  className="min-h-[100px] mt-2"
                />
              </div>
            </div>

            {/* Previously Uploaded Documents */}
            {existingDocuments.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                  Previously Uploaded Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["reference", "employment", "credit", "additional"].map(
                    (type) => {
                      const typeDocs = existingDocuments.filter(
                        (doc) => doc.document_type === type
                      );
                      if (typeDocs.length === 0) return null;

                      const typeLabels = {
                        reference: "Reference Letters",
                        employment: "Employment Documents",
                        credit: "Credit Reports",
                        additional: "Additional Documents",
                      };

                      return (
                        <div key={type} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {typeLabels[type as keyof typeof typeLabels]}
                          </Label>
                          <div className="space-y-2">
                            {typeDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {doc.original_filename}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Uploaded{" "}
                                      {new Date(
                                        doc.created_at
                                      ).toLocaleDateString()}{" "}
                                      •{" "}
                                      {(
                                        doc.file_size_bytes /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(doc.storage_url, "_blank")
                                  }
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Save & Submit Documents Button */}
            <div className="border-t pt-6">
              <Card
                className={`border-2 ${
                  documentsSubmittedForReview
                    ? "border-green-200"
                    : "border-blue-200"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {!documentsSubmittedForReview ? (
                      <>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-blue-800 mb-2">
                            Submit Documents for Early Review
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            You can submit your documents now for landlord
                            review, or continue with the full application
                            process.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          Documents Submitted for Review!
                        </h3>
                        <p className="text-green-700 mb-4">
                          Your documents have been sent to the landlord. You can
                          continue with the full application or wait for their
                          review.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {!documentsSubmittedForReview && (
                        <>
                          {(!applicationData.fullName ||
                            !applicationData.email ||
                            !applicationData.phone) && (
                            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
                              <p className="font-medium">
                                Required fields missing:
                              </p>
                              <ul className="list-disc list-inside text-xs mt-1">
                                {!applicationData.fullName && (
                                  <li>Full Name</li>
                                )}
                                {!applicationData.email && (
                                  <li>Email Address</li>
                                )}
                                {!applicationData.phone && (
                                  <li>Phone Number</li>
                                )}
                              </ul>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-3 text-sm font-medium"
                            onClick={async () => {
                              console.log("Save & Submit button clicked");
                              console.log("Application data:", applicationData);

                              // Save documents for review logic
                              if (!id || !user) {
                                toast.error("Missing application information");
                                return;
                              }

                              // Check required fields
                              if (!applicationData.fullName.trim()) {
                                toast.error("Please enter your full name");
                                return;
                              }
                              if (!applicationData.email.trim()) {
                                toast.error("Please enter your email address");
                                return;
                              }
                              if (!applicationData.phone.trim()) {
                                toast.error("Please enter your phone number");
                                return;
                              }

                              try {
                                setIsSubmitting(true);
                                console.log("Creating basic application...");
                                console.log("Property ID:", id);
                                console.log("User ID:", user.id);
                                console.log("User email:", user.email);

                                // 1) Create basic application for document submission (ensure required fields)
                                toast.message("Creating application...", {
                                  description: "Saving your basic info",
                                });
                                const basicApplication: any = {
                                  property_id: id,
                                  applicant_id: user.id,
                                  full_name: applicationData.fullName,
                                  email: applicationData.email,
                                  phone: applicationData.phone,
                                  occupation:
                                    applicationData.occupation ||
                                    "Not specified",
                                  monthly_income:
                                    parseFloat(applicationData.monthlyIncome) ||
                                    1,
                                  move_in_date:
                                    applicationData.moveInDate || undefined,
                                  emergency_contact_name:
                                    applicationData.emergencyContactName ||
                                    undefined,
                                  emergency_contact_phone:
                                    applicationData.emergencyContactPhone ||
                                    undefined,
                                  emergency_contact_relation:
                                    applicationData.emergencyContactRelation ||
                                    undefined,
                                  additional_info:
                                    applicationData.additionalInfo || undefined,
                                  contract_signed: false,
                                  payment_completed: false,
                                  pet_ownership: !!applicationData.petOwnership,
                                } as const;

                                console.log(
                                  "Submitting application:",
                                  basicApplication
                                );
                                const created = await submitRentalApplication(
                                  basicApplication
                                );
                                const appId = created.id;
                                setCreatedApplicationId(appId);
                                console.log(
                                  "Application submitted successfully with ID:",
                                  appId
                                );

                                // 2) Upload selected documents to storage and create DB records
                                const totalFiles =
                                  applicationData.referenceLetters.length +
                                  applicationData.employmentLetter.length +
                                  applicationData.creditScoreLetter.length +
                                  applicationData.additionalDocuments.length;
                                console.log(
                                  "Total files to upload:",
                                  totalFiles
                                );
                                console.log("File breakdown:", {
                                  reference:
                                    applicationData.referenceLetters.length,
                                  employment:
                                    applicationData.employmentLetter.length,
                                  credit:
                                    applicationData.creditScoreLetter.length,
                                  additional:
                                    applicationData.additionalDocuments.length,
                                });

                                if (totalFiles > 0) {
                                  toast.message("Uploading documents...", {
                                    description: `${totalFiles} file(s) will be uploaded`,
                                  });
                                } else {
                                  toast.message("No documents selected", {
                                    description:
                                      "You can upload later; application will be under review",
                                  });
                                }

                                const uploadGroups: Array<{
                                  type:
                                    | "reference"
                                    | "employment"
                                    | "credit"
                                    | "additional";
                                  files: File[];
                                }> = [
                                  {
                                    type: "reference",
                                    files: applicationData.referenceLetters,
                                  },
                                  {
                                    type: "employment",
                                    files: applicationData.employmentLetter,
                                  },
                                  {
                                    type: "credit",
                                    files: applicationData.creditScoreLetter,
                                  },
                                  {
                                    type: "additional",
                                    files: applicationData.additionalDocuments,
                                  },
                                ];

                                let uploadedCount = 0;
                                let failedCount = 0;

                                for (const { type, files } of uploadGroups) {
                                  for (const file of files) {
                                    try {
                                      console.log(
                                        `Attempting to upload ${type} document:`,
                                        file.name,
                                        `(${file.size} bytes)`
                                      );
                                      const result = await uploadRentalDocument(
                                        {
                                          application_id: appId,
                                          document_type: type,
                                          file,
                                          description: `${type} document: ${file.name}`,
                                        }
                                      );
                                      console.log(
                                        `Successfully uploaded ${type} document:`,
                                        file.name,
                                        "Result:",
                                        result
                                      );
                                      toast.success(
                                        `✅ ${type} uploaded: ${file.name}`
                                      );
                                      uploadedCount++;
                                    } catch (e) {
                                      console.error(
                                        `Failed to upload ${type} document ${file.name}:`,
                                        e
                                      );
                                      toast.error(
                                        `❌ Failed to upload ${type}: ${
                                          file.name
                                        } - ${
                                          e instanceof Error
                                            ? e.message
                                            : "Unknown error"
                                        }`
                                      );
                                      failedCount++;
                                    }
                                  }
                                }

                                console.log(
                                  `Upload summary: ${uploadedCount} successful, ${failedCount} failed`
                                );
                                if (failedCount > 0) {
                                  toast.error(
                                    `${failedCount} documents failed to upload. Check console for details.`
                                  );
                                }

                                // 3) Update application status to under_review
                                toast.message(
                                  "Marking application under review..."
                                );
                                await updateApplicationStatus(
                                  appId,
                                  "under_review"
                                );

                                toast.success(
                                  "Documents and application submitted for landlord review!"
                                );

                                // Show success state
                                setDocumentsSubmittedForReview(true);
                                setApplicationData((prev) => ({
                                  ...prev,
                                  agreeToTerms: true,
                                }));
                              } catch (error) {
                                console.error(
                                  "Error submitting for review:",
                                  error
                                );
                                const msg =
                                  error instanceof Error
                                    ? error.message
                                    : "Unknown error";
                                toast.error(`Failed to submit: ${msg}`);
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={
                              !applicationData.fullName.trim() ||
                              !applicationData.email.trim() ||
                              !applicationData.phone.trim() ||
                              isSubmitting
                            }
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {isSubmitting
                              ? "Submitting..."
                              : "Save & Submit for Review"}
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                      💡 <strong>Pro tip:</strong> Submitting documents early
                      may get you faster approval from the landlord
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Sign Lease Contract</h2>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Residential Tenancy Agreement (Standard Form of Lease)
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-bold mb-2">Note:</p>
                        <p className="text-xs">
                          This tenancy agreement is required for tenancies entered into on March 1, 2021 or later. It does not apply to care homes, sites in mobile home parks and land lease communities, most social housing, certain other special tenancies or co-operative housing (see Part A of General Information).
                          <br /><br />
                          Residential tenancies in Ontario are governed by the Residential Tenancies Act, 2006. This agreement cannot take away a right or responsibility under the Act.
                          <br /><br />
                          Under the Ontario Human Rights Code, everyone has the right to equal treatment in housing without discrimination or harassment.
                          <br /><br />
                          All sections of this agreement are mandatory and cannot be changed.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>
                  2229E (2020/12) © Queen's Printer for Ontario, 2020
                  <br />
                  Disponible en français
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Conditional rendering based on whether the form has been filled */}
                {!previewContract ? (
                  <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      Complete Lease Agreement
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Fill out all sections of the Ontario lease agreement to
                      generate the final contract.
                    </p>
                  </div>
                ) : (
                  <OntarioLeaseDisplay contract={previewContract} />
                )}
              </CardContent>
            </Card>

            {/* Form to fill out the lease */}
            <OntarioLeaseForm2229E
              property={property}
              applicant={applicationData}
              onSubmit={handleOntarioFormSubmit}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Payment (Optional)</h2>
              <p className="text-muted-foreground">
                You can make payment now to secure your rental, or complete the
                application and pay later.
              </p>
            </div>

            {/* Payment Summary */}
            {property && (
              <Card className="border-2 border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>First Month Rent:</span>
                      <span className="font-semibold">
                        ${property.monthly_rent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-semibold">
                        $
                        {(
                          property.security_deposit || property.monthly_rent
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Due:</span>
                      <span className="text-green-600">
                        $
                        {(
                          property.monthly_rent +
                          (property.security_deposit || property.monthly_rent)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!applicationData.paymentCompleted ? (
              <div className="space-y-4">
                {/* Mock Payment Interface */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Choose your payment method to complete the rental process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => {
                          setApplicationData((prev) => ({
                            ...prev,
                            paymentCompleted: true,
                          }));
                          toast.success("Payment completed successfully!");
                        }}
                      >
                        <CheckCircle className="h-6 w-6 mb-2" />
                        Credit Card
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => {
                          setApplicationData((prev) => ({
                            ...prev,
                            paymentCompleted: true,
                          }));
                          toast.success("Payment completed successfully!");
                        }}
                      >
                        <CheckCircle className="h-6 w-6 mb-2" />
                        Bank Transfer
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => {
                          setApplicationData((prev) => ({
                            ...prev,
                            paymentCompleted: true,
                          }));
                          toast.success("Payment completed successfully!");
                        }}
                      >
                        <CheckCircle className="h-6 w-6 mb-2" />
                        PayPal
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Click any payment method to simulate payment completion
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Payment Success */
              <div className="text-center py-8">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-green-800 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-green-700 text-lg mb-2">
                    $
                    {property
                      ? (
                          property.monthly_rent +
                          (property.security_deposit || property.monthly_rent)
                        ).toLocaleString()
                      : "0"}{" "}
                    paid successfully
                  </p>
                  <p className="text-sm text-green-600">
                    Payment processed on {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-muted-foreground">
                  You can now complete your rental application. The landlord
                  will be notified immediately.
                </p>
              </div>
            )}

            {/* Payment Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                Payment Information
              </h3>
              <p className="text-blue-700 text-sm">
                Payment is optional at this stage. You can complete your
                application now and arrange payment later with the landlord, or
                pay now to secure your rental immediately.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!id) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Invalid Property ID</h3>
        <Button
          className="mt-4"
          onClick={() => navigate("/dashboard/rental-options")}
        >
          Back to Listings
        </Button>
      </div>
    );
  }

  if (hasAlreadyApplied) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Application Already Submitted
          </h3>
          <p className="text-green-800 mb-4">
            You have already submitted a rental application for this property.
            The landlord will review your application and contact you within 2-3
            business days.
          </p>
        </div>
        <div className="space-y-2">
          <Button onClick={() => navigate("/dashboard/rental-options")}>
            View Other Properties
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EnhancedPageLayout>
      {/* Enhanced Header */}
      <EnhancedHeader
        title="Rental Application"
        subtitle={`Step ${currentStep} of ${steps.length}`}
        actionButton={
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </EnhancedButton>
        }
      />

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <EnhancedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1]?.icon &&
                (() => {
                  const IconComponent = steps[currentStep - 1].icon;
                  return <IconComponent className="h-5 w-5" />;
                })()}
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </EnhancedCard>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <EnhancedButton
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </EnhancedButton>

          {currentStep < steps.length ? (
            <div className="flex flex-col items-end gap-2">
              
              <EnhancedButton
                onClick={nextStep}
                // disabled={currentStep === 3 && !applicationData.contractSigned}
                className={
                  applicationData.contractSigned || currentStep !== 3
                    ? "bg-primary hover:bg-primary/90"
                    : ""
                }
              >
                Next
              </EnhancedButton>
              {currentStep === 3 && !applicationData.contractSigned && (
                <p className="text-sm text-muted-foreground">
                  Please sign the contract above to continue to payment
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <EnhancedButton
                onClick={async () => {
                  console.log("🔘 Complete Rental Application button clicked");
                  console.log("Button click registered - calling handleSubmit");
                  alert("Button clicked! Starting submission process...");
                  
                  // Direct test of the submission process
                  try {
                    console.log("🚀 Starting direct submission test");
                    await handleSubmit();
                    console.log("✅ Submission completed successfully");
                  } catch (error) {
                    console.error("❌ Error in button click handler:", error);
                    alert("Error: " + error.message);
                    toast.error("Button click failed: " + error.message);
                  }
                }}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Complete Rental Application"}
              </EnhancedButton>
              {/* Debug info */}
              <p className="text-xs text-muted-foreground">
                Debug: Step {currentStep} of {steps.length}
              </p>
            </div>
          )}
        </div>
    </EnhancedPageLayout>
  );
}
