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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {editingOffer ? "Edit Work Exchange Offer" : "Create Work Exchange Offer"}
            </h1>
            <p className="text-muted-foreground mt-1">Offer your space in exchange for work services</p>
          </div>
          <Button variant="outline" onClick={handleCloseForm}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Space Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Space Information
              </CardTitle>
              <CardDescription>Tell us about the space you're offering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="spaceType">Space Type *</Label>
                <Select value={formData.spaceType} onValueChange={(value) => handleInputChange("spaceType", value)}>
                  <SelectTrigger className={errors.spaceType ? "border-red-500" : ""}>
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
                <Label htmlFor="workRequested">Work Requested *</Label>
                <Textarea
                  id="workRequested"
                  placeholder="Describe the work you need (e.g., house cleaning, pet care, tutoring, IT support, cooking, gardening, childcare, maintenance, etc.)"
                  value={formData.workRequested}
                  onChange={(e) => handleInputChange("workRequested", e.target.value)}
                  className={errors.workRequested ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.workRequested && <p className="text-sm text-red-500 mt-1">{errors.workRequested}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                    <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <Label htmlFor="workHoursPerWeek">Work Hours Per Week *</Label>
                  <Input
                    id="workHoursPerWeek"
                    type="text"
                    placeholder="e.g., 10 hours per week"
                    value={formData.workHoursPerWeek}
                    onChange={(e) => handleInputChange("workHoursPerWeek", e.target.value)}
                    className={errors.workHoursPerWeek ? "border-red-500" : ""}
                  />
                  {errors.workHoursPerWeek && <p className="text-sm text-red-500 mt-1">{errors.workHoursPerWeek}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>Where is your space located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    placeholder="State/Province"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <Label htmlFor="zipCode">Postal Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="Postal code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities Provided</CardTitle>
              <CardDescription>What amenities will you provide to the worker?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Any additional details about your offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any additional information, requirements, or preferences (e.g., must love dogs, quiet hours, etc.)"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="contactPreference">Contact Preference *</Label>
                <Select value={formData.contactPreference} onValueChange={(value) => handleInputChange("contactPreference", value)}>
                  <SelectTrigger className={errors.contactPreference ? "border-red-500" : ""}>
                    <SelectValue placeholder="How should people contact you?" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactPreferences.map((pref) => (
                      <SelectItem key={pref.value} value={pref.value}>
                        {pref.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contactPreference && <p className="text-sm text-red-500 mt-1">{errors.contactPreference}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingOffer ? "Updating Offer..." : "Creating Offer..."}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editingOffer ? "Update Work Exchange Offer" : "Create Work Exchange Offer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Exchange Housing</h1>
          <p className="text-muted-foreground mt-1">Provide services in exchange for reduced rent or free housing</p>
        </div>
        <Button onClick={handleCreateOffer} size="lg">
          <Briefcase className="h-5 w-5 mr-2" />
          Offer Your Space
        </Button>
      </div>
      
      {/* How It Works Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Space Owners</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Workers</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Popular Work Exchange Types</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              My Work Exchange Offers
            </CardTitle>
            <CardDescription>Manage your work exchange offers</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUserOffers ? (
              <div className="text-center py-8">Loading your offers...</div>
            ) : userOffers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You haven't created any work exchange offers yet.
                <br />
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={handleCreateOffer}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOffers.map((offer) => (
                  <div key={offer.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {offer.spaceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} in {offer.city}
                          </h3>
                          <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                            {offer.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {offer.city}, {offer.state} • Created {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
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
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      <Card>
        <CardHeader>
          <CardTitle>Available Work Exchange Opportunities</CardTitle>
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
  );
}
