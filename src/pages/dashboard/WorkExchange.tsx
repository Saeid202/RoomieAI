import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Clock, MapPin, ArrowRight, CheckCircle, Star, ArrowLeft, Upload, X, Edit, Trash2, Eye, Sparkles, Heart, BookOpen, Monitor, ChefHat, TreePine, Baby, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { workExchangeServiceSimple, CreateWorkExchangeOfferData } from "@/services/workExchangeServiceSimple";
import { WorkExchangeOffer } from "@/services/workExchangeServiceSimple";

interface WorkExchangeFormData {
  spaceType: string;
  workRequested: string;
  duration: string;
  workHoursPerWeek: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amenitiesProvided: string[];
  additionalNotes: string;
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

const workTypes = [
  "House cleaning",
  "Pet care",
  "Tutoring",
  "IT support",
  "Cooking",
  "Gardening",
  "Childcare",
  "Maintenance",
  "Laundry",
  "Shopping",
  "Transportation",
  "Other"
];

const durationOptions = [
  { value: "1-week", label: "1 week" },
  { value: "2-weeks", label: "2 weeks" },
  { value: "1-month", label: "1 month" },
  { value: "2-months", label: "2 months" },
  { value: "3-months", label: "3 months" },
  { value: "6-months", label: "6 months" },
  { value: "1-year", label: "1 year" },
  { value: "flexible", label: "Flexible" }
];

const amenities = [
  { value: "wifi", label: "WiFi" },
  { value: "meals", label: "Meals" },
  { value: "parking", label: "Parking" },
  { value: "laundry", label: "Laundry" },
  { value: "utilities", label: "Utilities" },
  { value: "furnished", label: "Furnished" },
  { value: "air-conditioning", label: "Air Conditioning" },
  { value: "heating", label: "Heating" }
];

const contactPreferences = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "messenger", label: "Messenger" }
];

export default function WorkExchangePage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<WorkExchangeOffer[]>([]);
  const [userOffers, setUserOffers] = useState<WorkExchangeOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingUserOffers, setLoadingUserOffers] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<WorkExchangeOffer | null>(null);
  const [formData, setFormData] = useState<WorkExchangeFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<WorkExchangeFormData>>({});

  useEffect(() => {
    loadOffers();
    loadUserOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoadingOffers(true);
      const fetchedOffers = await workExchangeServiceSimple.fetchAllOffers();
      setOffers(fetchedOffers);
    } catch (error) {
      console.error("Error loading offers:", error);
      toast.error("Failed to load work exchange offers");
    } finally {
      setLoadingOffers(false);
    }
  };

  const loadUserOffers = async () => {
    try {
      setLoadingUserOffers(true);
      const fetchedUserOffers = await workExchangeServiceSimple.fetchUserOffers();
      setUserOffers(fetchedUserOffers);
    } catch (error) {
      console.error("Error loading user offers:", error);
      toast.error("Failed to load your offers");
    } finally {
      setLoadingUserOffers(false);
    }
  };

  const handleCreateOffer = () => {
    if (!user) {
      toast.error("Please log in to create a work exchange offer");
      return;
    }
    setShowOfferForm(true);
  };

  const handleCloseForm = () => {
    setShowOfferForm(false);
    setEditingOffer(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleEditOffer = (offer: WorkExchangeOffer) => {
    setEditingOffer(offer);
    setFormData({
      spaceType: offer.spaceType,
      workRequested: offer.workRequested,
      duration: offer.duration,
      workHoursPerWeek: offer.workHoursPerWeek,
      address: offer.address,
      city: offer.city,
      state: offer.state,
      zipCode: offer.zipCode,
      amenitiesProvided: offer.amenitiesProvided,
      additionalNotes: offer.additionalNotes,
      contactPreference: offer.contactPreference
    });
    setShowOfferForm(true);
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer? This action cannot be undone.")) {
      return;
    }

    try {
      await workExchangeServiceSimple.deleteWorkExchangeOffer(offerId);
      toast.success("Offer deleted successfully!");
      loadUserOffers(); // Refresh user offers
      loadOffers(); // Refresh all offers
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const handleInputChange = (field: keyof WorkExchangeFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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

  const validateForm = (): boolean => {
    const newErrors: Partial<WorkExchangeFormData> = {};

    if (!formData.spaceType) newErrors.spaceType = "Space type is required";
    if (!formData.workRequested) newErrors.workRequested = "Work requested is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.workHoursPerWeek) newErrors.workHoursPerWeek = "Work hours per week is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State/Province is required";
    if (!formData.contactPreference) newErrors.contactPreference = "Contact preference is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please log in to create a work exchange offer");
      return;
    }

    console.log("Form submission started");
    console.log("User:", user);
    console.log("Form data:", formData);

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const offerData: CreateWorkExchangeOfferData = {
        spaceType: formData.spaceType,
        workRequested: formData.workRequested,
        duration: formData.duration,
        workHoursPerWeek: formData.workHoursPerWeek,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        amenitiesProvided: formData.amenitiesProvided,
        additionalNotes: formData.additionalNotes,
        images: [], // No image upload for now
        contactPreference: formData.contactPreference
      };

      console.log("Prepared offer data:", offerData);

      // Create or update the work exchange offer
      let result;
      if (editingOffer) {
        result = await workExchangeServiceSimple.updateWorkExchangeOffer(editingOffer.id, offerData);
        toast.success("Work exchange offer updated successfully!");
      } else {
        result = await workExchangeServiceSimple.createWorkExchangeOffer(offerData);
        toast.success("Work exchange offer created successfully!");
      }
      
      console.log("Service returned:", result);
      handleCloseForm();
      loadUserOffers(); // Refresh user offers
      loadOffers(); // Refresh all offers
    } catch (error) {
      console.error("Error creating work exchange offer:", error);
      toast.error(`Failed to create work exchange offer: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showOfferForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg orange-purple-gradient">
              <Briefcase className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gradient">
                {editingOffer ? "Edit Work Exchange Offer" : "Create Work Exchange Offer"}
              </h1>
              <p className="text-sm text-muted-foreground">Offer your space in exchange for work services</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleCloseForm}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Space Information */}
          <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Space Information
            </h3>
            
            <div className="space-y-4">
              {/* Field 1: Space Type */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
                  <Label htmlFor="spaceType" className="text-sm font-semibold">Space Type *</Label>
                </div>
                <select
                  id="spaceType"
                  value={formData.spaceType}
                  onChange={(e) => handleInputChange("spaceType", e.target.value)}
                  className={`w-full rounded-md border-2 ${errors.spaceType ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-sm h-9`}
                  required
                >
                  <option value="">Select space type</option>
                  {spaceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.spaceType && <p className="text-sm text-red-500 mt-1">{errors.spaceType}</p>}
              </div>

              {/* Field 2: Work Requested */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
                  <Label htmlFor="workRequested" className="text-sm font-semibold">Work Requested *</Label>
                </div>
                <Textarea
                  id="workRequested"
                  placeholder="Describe the work you need (e.g., house cleaning, pet care, tutoring, IT support)"
                  value={formData.workRequested}
                  onChange={(e) => handleInputChange("workRequested", e.target.value)}
                  className={`text-sm ${errors.workRequested ? 'border-red-500' : 'border-2 border-slate-300'}`}
                  rows={3}
                />
                {errors.workRequested && <p className="text-sm text-red-500 mt-1">{errors.workRequested}</p>}
              </div>

              {/* Fields 3-4: Duration and Work Hours */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
                    <Label htmlFor="duration" className="text-sm font-semibold">Duration *</Label>
                  </div>
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    className={`w-full rounded-md border-2 ${errors.duration ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-sm h-9`}
                    required
                  >
                    <option value="">Select duration</option>
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">4</span>
                    <Label htmlFor="workHoursPerWeek" className="text-sm font-semibold">Work Hours Per Week *</Label>
                  </div>
                  <Input
                    id="workHoursPerWeek"
                    type="text"
                    placeholder="e.g., 10 hours per week"
                    value={formData.workHoursPerWeek}
                    onChange={(e) => handleInputChange("workHoursPerWeek", e.target.value)}
                    className={`h-9 text-sm border-2 ${errors.workHoursPerWeek ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {errors.workHoursPerWeek && <p className="text-sm text-red-500 mt-1">{errors.workHoursPerWeek}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Location Information
            </h3>
            
            <div className="space-y-4">
              {/* Field 5: Address */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">5</span>
                  <Label htmlFor="address" className="text-sm font-semibold">Address *</Label>
                </div>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`h-9 text-sm border-2 ${errors.address ? 'border-red-500' : 'border-slate-300'}`}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Fields 6-8: City, State, Postal Code */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">6</span>
                    <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                  </div>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={`h-9 text-sm border-2 ${errors.city ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">7</span>
                    <Label htmlFor="state" className="text-sm font-semibold">State/Province *</Label>
                  </div>
                  <Input
                    id="state"
                    placeholder="State/Province"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className={`h-9 text-sm border-2 ${errors.state ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">8</span>
                    <Label htmlFor="zipCode" className="text-sm font-semibold">Postal Code</Label>
                  </div>
                  <Input
                    id="zipCode"
                    placeholder="Postal code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    className="h-9 text-sm border-2 border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Amenities Provided
            </h3>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">9</span>
                <Label className="text-sm font-semibold">What amenities will you provide?</Label>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {amenities.map((amenity) => (
                  <div key={amenity.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.value}
                      checked={formData.amenitiesProvided.includes(amenity.value)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity.value, checked as boolean)}
                    />
                    <Label htmlFor={amenity.value} className="text-sm font-medium">
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-600" />
              Additional Information
            </h3>
            
            <div className="space-y-4">
              {/* Field 10: Additional Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">10</span>
                  <Label htmlFor="additionalNotes" className="text-sm font-semibold">Additional Notes</Label>
                </div>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any additional information, requirements, or preferences"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  rows={3}
                  className="text-sm border-2 border-slate-300"
                />
              </div>

              {/* Field 11: Contact Preference */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">11</span>
                  <Label htmlFor="contactPreference" className="text-sm font-semibold">Contact Preference *</Label>
                </div>
                <select
                  id="contactPreference"
                  value={formData.contactPreference}
                  onChange={(e) => handleInputChange("contactPreference", e.target.value)}
                  className={`w-full rounded-md border-2 ${errors.contactPreference ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 text-sm h-9`}
                  required
                >
                  <option value="">How should people contact you?</option>
                  {contactPreferences.map((pref) => (
                    <option key={pref.value} value={pref.value}>
                      {pref.label}
                    </option>
                  ))}
                </select>
                {errors.contactPreference && <p className="text-sm text-red-500 mt-1">{errors.contactPreference}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full button-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingOffer ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingOffer ? "Update Offer" : "Create Offer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg orange-purple-gradient">
            <Briefcase className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gradient">
              Work Exchange Housing
            </h1>
            <p className="text-sm text-muted-foreground">Provide services in exchange for reduced rent or free housing</p>
          </div>
        </div>
        <Button onClick={handleCreateOffer} className="button-gradient text-white">
          <Briefcase className="h-5 w-5 mr-2" />
          Offer Your Space
        </Button>
      </header>
      
      <div className="space-y-6">
      
      {/* How It Works Section */}
      <Card className="border-orange-200/30 shadow-lg">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-gradient flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            How Work Exchange Works
          </CardTitle>
          <CardDescription>
            Exchange skills for housing - cleaning, tutoring, IT development, caregiving, pet sitting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Offer Your Space</h3>
              <p className="text-sm text-muted-foreground">
                List your available space and specify what work you need in exchange
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Find Workers</h3>
              <p className="text-sm text-muted-foreground">
                Connect with people who have the skills you need and are looking for housing
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Exchange Services</h3>
              <p className="text-sm text-muted-foreground">
                Agree on terms and start your work exchange arrangement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-purple-200/30 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg text-gradient">For Space Owners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Get Help Around the House</h4>
                <p className="text-sm text-muted-foreground">Cleaning, maintenance, pet care, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Reduce Housing Costs</h4>
                <p className="text-sm text-muted-foreground">Lower your expenses while helping others</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Build Community</h4>
                <p className="text-sm text-muted-foreground">Connect with like-minded people</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/30 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg text-gradient">For Workers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Affordable Housing</h4>
                <p className="text-sm text-muted-foreground">Reduce or eliminate rent costs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Flexible Schedule</h4>
                <p className="text-sm text-muted-foreground">Work around your other commitments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Gain Experience</h4>
                <p className="text-sm text-muted-foreground">Build skills while saving money</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Work Types */}
      <Card className="border-orange-200/30 shadow-lg">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-gradient">Popular Work Exchange Types</CardTitle>
          <CardDescription>Common services exchanged for housing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                name: "House Cleaning", 
                icon: Sparkles, 
                color: "bg-blue-100 text-blue-600",
                count: "45 offers" 
              },
              { 
                name: "Pet Care", 
                icon: Heart, 
                color: "bg-pink-100 text-pink-600",
                count: "32 offers" 
              },
              { 
                name: "Tutoring", 
                icon: BookOpen, 
                color: "bg-green-100 text-green-600",
                count: "28 offers" 
              },
              { 
                name: "IT Support", 
                icon: Monitor, 
                color: "bg-purple-100 text-purple-600",
                count: "25 offers" 
              },
              { 
                name: "Cooking", 
                icon: ChefHat, 
                color: "bg-orange-100 text-orange-600",
                count: "22 offers" 
              },
              { 
                name: "Gardening", 
                icon: TreePine, 
                color: "bg-emerald-100 text-emerald-600",
                count: "18 offers" 
              },
              { 
                name: "Childcare", 
                icon: Baby, 
                color: "bg-yellow-100 text-yellow-600",
                count: "15 offers" 
              },
              { 
                name: "Maintenance", 
                icon: Wrench, 
                color: "bg-gray-100 text-gray-600",
                count: "12 offers" 
              }
            ].map((work, index) => {
              const IconComponent = work.icon;
              return (
                <div key={index} className="text-center p-6 border rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
                  <div className={`w-16 h-16 ${work.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{work.name}</h4>
                  <p className="text-xs text-muted-foreground">{work.count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Offers Section */}
      {user && (
        <Card className="border-purple-200/30 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-gradient flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              My Work Exchange Offers
            </CardTitle>
            <CardDescription>Manage your work exchange offers</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {loadingUserOffers ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary animate-pulse" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-medium text-foreground">Loading your offers...</h2>
              </div>
            ) : userOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-medium text-foreground">No offers yet</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  You haven't created any work exchange offers yet. Create your first offer to get started.
                </p>
                <Button 
                  onClick={handleCreateOffer}
                  className="mt-6 button-gradient text-white"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userOffers.map((offer) => (
                  <div key={offer.id} className="rounded-lg border-2 border-slate-200/50 bg-white p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900">
                            {offer.spaceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} in {offer.city}
                          </h3>
                          <Badge variant={offer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {offer.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {offer.city}, {offer.state} • Created {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-700">{offer.workRequested}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {offer.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {offer.workHoursPerWeek}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {offer.address}
                          </span>
                        </div>
                        {offer.amenitiesProvided.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {offer.amenitiesProvided.map((amenity, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOffer(offer)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Opportunities */}
      <Card className="border-orange-200/30 shadow-lg">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-gradient">Available Work Exchange Opportunities</CardTitle>
          <CardDescription>Current opportunities for work exchange housing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          {loadingOffers ? (
            <div className="text-center py-8">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No work exchange opportunities available at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">
                        {offer.spaceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} in {offer.city}
                      </h3>
                      <p className="text-sm text-muted-foreground">{offer.userName} • {offer.city}, {offer.state}</p>
                      <p className="text-sm">{offer.workRequested}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 {offer.duration}</span>
                        <span>⏰ {offer.workHoursPerWeek}</span>
                        <span>📍 {offer.address}</span>
                      </div>
                      {offer.amenitiesProvided.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {offer.amenitiesProvided.map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
