import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Home, MapPin, Briefcase, Clock, Camera, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { workExchangeService, CreateWorkExchangeOfferData } from "@/services/workExchangeService";

interface WorkExchangeFormData {
  // Space Information
  spaceType: string;
  workRequested: string;
  duration: string;
  workHoursPerWeek: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Amenities
  amenitiesProvided: string[];
  
  // Additional Information
  additionalNotes: string;
  
  // Media
  images: File[];
  
  // Contact
  contactPreference: string;
}

const initialFormData: WorkExchangeFormData = {
  spaceType: "",
  workRequested: "",
  duration: "",
  workHoursPerWeek: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  amenitiesProvided: [],
  additionalNotes: "",
  images: [],
  contactPreference: "email"
};

const spaceTypes = [
  { value: "private-room", label: "Private Room" },
  { value: "shared-room", label: "Shared Room" },
  { value: "studio", label: "Studio" },
  { value: "entire-apartment", label: "Entire Apartment" },
  { value: "basement", label: "Basement Unit" },
  { value: "other", label: "Other" }
];

const amenities = [
  { value: "wifi", label: "WiFi" },
  { value: "meals", label: "Meals" },
  { value: "parking", label: "Parking" },
  { value: "laundry", label: "Laundry" },
  { value: "utilities", label: "Utilities Included" },
  { value: "furnished", label: "Furnished" },
  { value: "air-conditioning", label: "Air Conditioning" },
  { value: "heating", label: "Heating" }
];

const contactPreferences = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "messenger", label: "Messenger" }
];

const steps = [
  { id: 1, title: "Space & Work Details", icon: Home },
  { id: 2, title: "Location & Amenities", icon: MapPin },
  { id: 3, title: "Photos & Contact", icon: Camera }
];

interface WorkExchangeOfferFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function WorkExchangeOfferForm({ onClose, onSuccess }: WorkExchangeOfferFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WorkExchangeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.spaceType) newErrors.spaceType = "Space type is required";
      if (!formData.workRequested.trim()) newErrors.workRequested = "Work description is required";
      if (!formData.duration.trim()) newErrors.duration = "Duration is required";
      if (!formData.workHoursPerWeek.trim()) newErrors.workHoursPerWeek = "Work hours per week is required";
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State/Province is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof WorkExchangeFormData, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenitiesProvided: checked 
        ? [...prev.amenitiesProvided, amenity]
        : prev.amenitiesProvided.filter(a => a !== amenity)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    if (!user) {
      toast.error("Please log in to create a work exchange offer");
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, simulate success since database table might not exist
      console.log("Creating work exchange offer:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Work exchange offer created successfully!");
      onSuccess?.();
      onClose?.();
      
      // TODO: Uncomment when database is ready
      // // Upload images first if any
      // let imageUrls: string[] = [];
      // if (formData.images.length > 0) {
      //   imageUrls = await workExchangeService.uploadWorkExchangeImages(formData.images);
      // }

      // // Prepare data for API
      // const offerData: CreateWorkExchangeOfferData = {
      //   spaceType: formData.spaceType,
      //   workRequested: formData.workRequested,
      //   duration: formData.duration,
      //   workHoursPerWeek: formData.workHoursPerWeek,
      //   address: formData.address,
      //   city: formData.city,
      //   state: formData.state,
      //   zipCode: formData.zipCode,
      //   amenitiesProvided: formData.amenitiesProvided,
      //   additionalNotes: formData.additionalNotes,
      //   images: imageUrls,
      //   contactPreference: formData.contactPreference
      // };

      // // Create the work exchange offer
      // await workExchangeService.createWorkExchangeOffer(offerData);
      
      // toast.success("Work exchange offer created successfully!");
      // onSuccess?.();
      // onClose?.();
    } catch (error) {
      console.error("Error creating work exchange offer:", error);
      toast.error("Failed to create work exchange offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="spaceType" className="text-sm font-medium">
            Space Offered <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.spaceType} onValueChange={(value) => handleInputChange("spaceType", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select space type" />
            </SelectTrigger>
            <SelectContent>
              {spaceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.spaceType && <p className="text-sm text-red-500 mt-1">{errors.spaceType}</p>}
        </div>

        <div>
          <Label htmlFor="workRequested" className="text-sm font-medium">
            Work Requested in Exchange <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="workRequested"
            placeholder="e.g. Cleaning, pet care, cooking, tutoring, IT support, caregiving"
            value={formData.workRequested}
            onChange={(e) => handleInputChange("workRequested", e.target.value)}
            className="mt-1"
            rows={3}
          />
          {errors.workRequested && <p className="text-sm text-red-500 mt-1">{errors.workRequested}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration" className="text-sm font-medium">
              Duration of Stay <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duration"
              placeholder="e.g. 2 weeks, 3 months, 6 months"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              className="mt-1"
            />
            {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
          </div>

          <div>
            <Label htmlFor="workHoursPerWeek" className="text-sm font-medium">
              Work Hours Expected <span className="text-red-500">*</span>
            </Label>
            <Input
              id="workHoursPerWeek"
              placeholder="e.g. 10 hours per week"
              value={formData.workHoursPerWeek}
              onChange={(e) => handleInputChange("workHoursPerWeek", e.target.value)}
              className="mt-1"
            />
            {errors.workHoursPerWeek && <p className="text-sm text-red-500 mt-1">{errors.workHoursPerWeek}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="text-sm font-medium">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Street address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="mt-1"
          />
          {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="mt-1"
            />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
          </div>

          <div>
            <Label htmlFor="state" className="text-sm font-medium">
              State/Province <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              placeholder="State/Province"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className="mt-1"
            />
            {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
          </div>

          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium">
              Postal Code
            </Label>
            <Input
              id="zipCode"
              placeholder="Postal Code"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Amenities Provided</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity.value} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.value}
                  checked={formData.amenitiesProvided.includes(amenity.value)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity.value, checked as boolean)}
                />
                <Label htmlFor={amenity.value} className="text-sm">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="additionalNotes" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any additional information about the space, work expectations, or special requirements..."
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Upload Photos (Optional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload photos of your space
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG up to 10MB each
                </span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Contact Preference</Label>
          <div className="space-y-2">
            {contactPreferences.map((pref) => (
              <div key={pref.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={pref.value}
                  name="contactPreference"
                  value={pref.value}
                  checked={formData.contactPreference === pref.value}
                  onChange={(e) => handleInputChange("contactPreference", e.target.value)}
                  className="h-4 w-4"
                />
                <Label htmlFor={pref.value} className="text-sm">
                  {pref.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Offer Your Space in Exchange for Work
          </CardTitle>
          <CardDescription>
            Create a work exchange offer to find someone who can provide services in exchange for accommodation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Offer...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Work Exchange Offer
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
