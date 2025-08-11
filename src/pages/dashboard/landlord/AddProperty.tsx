import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Home, MapPin, DollarSign, Camera, FileText, CheckCircle, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyFormData {
  // Basic Info
  propertyType: string;
  listingTitle: string;
  description: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  publicTransportAccess?: string;
  nearbyAmenities?: string[];
  
  // Rental Information
  monthlyRent: string;
  securityDeposit: string;
  leaseTerms: string;
  availableDate: string;
  furnished: string;
  
  // Amenities
  amenities: string[];
  parking: string;
  petPolicy: string;
  utilitiesIncluded: string[];
  
  // Additional Info
  specialInstructions: string;
  roommatePreference: string;
  images: File[];
}

const initialFormData: PropertyFormData = {
  propertyType: "",
  listingTitle: "",
  description: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  neighborhood: "",
  publicTransportAccess: "",
  nearbyAmenities: [],
  monthlyRent: "",
  securityDeposit: "",
  leaseTerms: "",
  availableDate: "",
  furnished: "",
  amenities: [],
  parking: "",
  petPolicy: "",
  utilitiesIncluded: [],
  specialInstructions: "",
  roommatePreference: "",
  images: []
};

const steps = [
  { id: 1, title: "Basic Information", icon: Home },
  { id: 2, title: "Location Details", icon: MapPin },
  { id: 3, title: "Rental Information", icon: DollarSign },
  { id: 4, title: "Amenities & Features", icon: CheckCircle },
  { id: 5, title: "Photos & Final Details", icon: Camera }
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof PropertyFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    console.log("handleImageUpload called with:", files);
    if (files) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
      );
      console.log("Filtered images:", newImages);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 10) // Max 10 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a property");
        return;
      }

      // Validate required fields
      if (!formData.propertyType || !formData.listingTitle || !formData.address || 
          !formData.city || !formData.state || !formData.zipCode || !formData.monthlyRent) {
        toast.error("Please fill in all required fields");
        return;
      }

      // TODO: Upload images to storage (placeholder for now)
      const imageUrls: string[] = [];
      
      // Prepare property data for database
      const propertyData = {
        user_id: user.id,
        property_type: formData.propertyType,
        listing_title: formData.listingTitle,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        neighborhood: formData.neighborhood || null,
        public_transport_access: formData.publicTransportAccess || null,
        nearby_amenities: formData.nearbyAmenities || [],
        monthly_rent: parseFloat(formData.monthlyRent),
        security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        lease_duration: formData.leaseTerms || null,
        available_date: formData.availableDate || null,
        furnished: formData.furnished || null,
        amenities: formData.amenities || [],
        parking: formData.parking || null,
        pet_policy: formData.petPolicy || null,
        utilities_included: formData.utilitiesIncluded || [],
        special_instructions: formData.specialInstructions || null,
        roommate_preference: formData.roommatePreference || null,
        images: imageUrls
      };

      console.log("Submitting property data:", propertyData);
      
      const result = await createProperty(propertyData);
      
      if (result) {
        toast.success("Property listed successfully!");
        navigate("/dashboard/landlord/properties");
      } else {
        toast.error("Failed to create property");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("An error occurred while creating the property");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="propertyType">**1.** Property Type</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharing-room">A sharing room</SelectItem>
                  <SelectItem value="sharing-apartment">A sharing apartment (Cando)</SelectItem>
                  <SelectItem value="sharing-house">A sharing house</SelectItem>
                  <SelectItem value="single-one-bed">A single one bed (Cando)</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="two-bed">Two Bed (Cando)</SelectItem>
                  <SelectItem value="entire-house">Entire house or Cando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="listingTitle">**2.** Listing Title</Label>
              <Input
                id="listingTitle"
                placeholder="e.g., Beautiful 2-bedroom apartment in downtown"
                value={formData.listingTitle}
                onChange={(e) => handleInputChange("listingTitle", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">**3.** Property Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your property, highlighting key features and what makes it special..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address">**1.** Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">**2.** City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">**3.** State/Province</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">**4.** ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">**5.** Neighborhood</Label>
                <Input
                  id="neighborhood"
                  placeholder="Downtown, Midtown, etc."
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="publicTransport">**6.** Public Transport Access</Label>
              <Textarea
                id="publicTransport"
                placeholder="Describe nearby public transport options (bus stops, train stations, etc.)"
                value={formData.publicTransportAccess || ""}
                onChange={(e) => handleInputChange("publicTransportAccess", e.target.value)}
              />
            </div>

            <div>
              <Label>**7.** Nearby Amenities</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  "Shopping Centers", "Restaurants", "Schools", "Hospitals",
                  "Parks", "Gyms", "Banks", "Pharmacies"
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nearby-${amenity}`}
                      checked={formData.nearbyAmenities?.includes(amenity) || false}
                      onCheckedChange={(checked) => handleArrayChange("nearbyAmenities", amenity, checked as boolean)}
                    />
                    <Label htmlFor={`nearby-${amenity}`} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyRent">**1.** Monthly Rent ($)</Label>
                <Input
                  id="monthlyRent"
                  placeholder="2500"
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="securityDeposit">**2.** Security Deposit ($)</Label>
                <Input
                  id="securityDeposit"
                  placeholder="2500"
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="leaseTerms">**3.** Lease Terms</Label>
              <Select value={formData.leaseTerms} onValueChange={(value) => handleInputChange("leaseTerms", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lease terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month-to-month">Month-to-Month</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="2-years">2 Years</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availableDate">**4.** Available Date</Label>
                <Input
                  id="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={(e) => handleInputChange("availableDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="furnished">**5.** Furnishing</Label>
                <Select value={formData.furnished} onValueChange={(value) => handleInputChange("furnished", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Fully Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>**1.** Property Amenities</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  "Air Conditioning", "Heating", "Dishwasher", "Washer/Dryer",
                  "Balcony/Patio", "Hardwood Floors", "Carpet", "Fireplace",
                  "Swimming Pool", "Gym/Fitness Center", "Elevator", "Garden"
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleArrayChange("amenities", amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="parking">**2.** Parking</Label>
              <Select value={formData.parking} onValueChange={(value) => handleInputChange("parking", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parking option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parking</SelectItem>
                  <SelectItem value="street">Street Parking</SelectItem>
                  <SelectItem value="driveway">Driveway</SelectItem>
                  <SelectItem value="garage">Garage</SelectItem>
                  <SelectItem value="covered">Covered Parking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="petPolicy">**3.** Pet Policy</Label>
              <Select value={formData.petPolicy} onValueChange={(value) => handleInputChange("petPolicy", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pet policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-pets">No Pets</SelectItem>
                  <SelectItem value="cats-only">Cats Only</SelectItem>
                  <SelectItem value="dogs-only">Dogs Only</SelectItem>
                  <SelectItem value="cats-dogs">Cats & Dogs</SelectItem>
                  <SelectItem value="small-pets">Small Pets Only</SelectItem>
                  <SelectItem value="all-pets">All Pets Welcome</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>**4.** Utilities Included</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Water", "Electricity", "Gas", "Internet", "Cable TV", "Trash"].map((utility) => (
                  <div key={utility} className="flex items-center space-x-2">
                    <Checkbox
                      id={utility}
                      checked={formData.utilitiesIncluded.includes(utility)}
                      onCheckedChange={(checked) => handleArrayChange("utilitiesIncluded", utility, checked as boolean)}
                    />
                    <Label htmlFor={utility} className="text-sm">{utility}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="roommatePreference">**1.** Roommate Preference</Label>
              <Select value={formData.roommatePreference} onValueChange={(value) => handleInputChange("roommatePreference", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">No Preference</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="professionals">Professionals Only</SelectItem>
                  <SelectItem value="same-gender">Same Gender</SelectItem>
                  <SelectItem value="non-smokers">Non-Smokers</SelectItem>
                  <SelectItem value="quiet">Quiet Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialInstructions">**2.** Special Instructions or Requirements</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special requirements, rules, or instructions for potential tenants..."
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>**3.** Property Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center mb-4">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    Upload high-quality photos of your property (up to 10 images, max 10MB each)
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Review Your Listing</h4>
              <p className="text-sm text-muted-foreground">
                Please review all the information above before submitting your property listing. 
                You'll be able to edit these details after submission.
              </p>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/landlord/properties")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Property</h1>
            <p className="text-muted-foreground">Fill out the details to list your property</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between mb-8 overflow-x-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-0 flex-1 ${
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.id <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-center font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with basic information about your property"}
              {currentStep === 2 && "Where is your property located?"}
              {currentStep === 3 && "Tell us about the property specifications"}
              {currentStep === 4 && "Set your rental terms and pricing"}
              {currentStep === 5 && "What amenities and features does your property offer?"}
              {currentStep === 6 && "Add photos and final details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Property Listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}