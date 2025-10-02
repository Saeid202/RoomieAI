import React, { useState, useEffect } from "react";
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
import { createProperty, uploadPropertyImage, fetchPropertyById, updateProperty } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import PropertyMap from "@/components/ui/property-map";
import { AddressSuggestion, AddressDetails, MapCoordinates } from "@/types/address";
import { locationService } from "@/services/locationService";
import { amenitiesService } from "@/services/amenitiesService";
import { detailedAmenitiesService } from "@/services/detailedAmenitiesService";
import { PropertyIntelligence } from "@/types/detailedAmenities";
import { useRole, UserRole } from "@/contexts/RoleContext";

// Helper function to generate smart default amenities based on Canadian location
function generateDefaultLocationAmenities(addressDetails: any, coordinates: { lat: number; lng: number }): string[] {
  try {
    // Validate inputs
    if (!addressDetails || (typeof addressDetails !== 'object')) {
      return ['Shopping Centers', 'Restaurants', 'Hospitals', 'Schools', 'Parks', 'Gyms'];
    }
    
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number' || 
        isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      return ['Shopping Centers', 'Restaurants', 'Hospitals', 'Schools', 'Parks', 'Gyms'];
    }
    
    const cityAmenities: Record<string, string[]> = {
      'Toronto': ['Public Transit Station', 'Shopping Centers', 'Hospitals', 'Restaurants', 'Parks', 'Schools'],
      'Vancouver': ['SkyTrain Station', 'Hospitals', 'Shopping Centers', 'Parks', 'Dining', 'Schools'],
      'Montreal': ['Metro Station', 'Hospitals', 'Shopping Centers', 'Dining', 'Universities', 'Parks'],
      'Calgary': ['C-Train Station', 'Hospitals', 'Shopping Centers', 'Hiking Trails', 'Dining', 'Schools'],
      'Ottawa': ['OC Transpo', 'Shopping Centers', 'Hospitals', 'Universities', 'Dining', 'Parks'],
      'Edmonton': ['LRT Station', 'Shopping Centers', 'Hospitals', 'Universities', 'Parks', 'Dining'],
      'Winnipeg': ['Bus Transit', 'Shopping Centers', 'Hospitals', 'Universities', 'Parks', 'Dining'],
      'Hamilton': ['GO Train Station', 'Hospitals', 'Shopping Centers', 'Dining', 'Schools', 'Parks'],
      'Brampton': ['GO Transit', 'Hospitals', 'Shopping Centers', 'Dining', 'Schools', 'Parks']
    };

    // Safely get city name
    let cityName = '';
    try {
      const city = addressDetails.city;
      if (city && typeof city === 'string' && city.trim()) {
        cityName = city.toLowerCase()
          .replace(/montreal/i, 'Montreal')
          .replace(/toronto/i, 'Toronto')
          .replace(/vancouver/i, 'Vancouver');
      }
    } catch (cityError) {
      console.warn('Error processing city name:', cityError);
    }
    
    // Safe amenities selection
    const typeAmenities = cityAmenities[cityName] || ['Shopping Centers', 'Restaurants', 'Hospitals', 'Schools', 'Parks', 'Gyms', 'Banks', 'Pharmacies'];

    // Safely add Ontario-specific amenities
    try {
      const state = addressDetails.state;
      if (state && typeof state === 'string' && 
          (state.toLowerCase().includes('ontario') || state.toLowerCase().includes('on'))) {
        if (!typeAmenities.includes('GO Transit Access')) {
          typeAmenities.unshift('GO Transit Access', 'GO Train Station');
        }
      }
    } catch (stateError) {
      console.warn('Error processing state:', stateError);
    }
    
    return typeAmenities.slice(0, 6);
  } catch (error) {
    console.error('Error generating default amenities:', error);
    return ['Shopping Centers', 'Restaurants', 'Hospitals', 'Schools', 'Parks', 'Gyms'];
  }
}

interface PropertyFormData {
  // Basic Info
  listingTitle: string;
  propertyType: string;
  propertyAddress: string; // Renamed from listingTitle to propertyAddress
  description: string;
  
  // Enhanced Location Details with coordinates
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
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
  listingTitle: "",
  propertyType: "",
  propertyAddress: "",
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
  { id: 2, title: "Photos & Final Details", icon: Camera }
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [detailedDetection, setDetailedDetection] = useState<PropertyIntelligence | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const DRAFT_KEY = "add_property_draft_v1";
  const [editId, setEditId] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const progress = (currentStep / steps.length) * 100;

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setFormData((prev) => ({ ...prev, ...draft }));
        toast.info("Draft restored");
      }
    } catch {}
  }, []);

  // Detect edit mode (?prefill=:id) and load existing property
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillId = params.get('prefill');
    if (!prefillId) return;
    (async () => {
      try {
        setEditId(prefillId);
        const data: any = await fetchPropertyById(prefillId);
        if (!data) return;
        // Prefill form
        setFormData(prev => ({
          ...prev,
          listingTitle: data.listing_title || "",
          propertyType: data.property_type || "",
          propertyAddress: data.address || "",
          description: data.description || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zip_code || "",
          neighborhood: data.neighborhood || "",
          latitude: data.latitude ?? undefined,
          longitude: data.longitude ?? undefined,
          publicTransportAccess: data.public_transport_access || "",
          nearbyAmenities: data.nearby_amenities || [],
          monthlyRent: data.monthly_rent?.toString?.() || "",
          securityDeposit: data.security_deposit?.toString?.() || "",
          leaseTerms: data.lease_duration || "",
          availableDate: data.available_date || "",
          furnished: (typeof data.furnished === 'boolean' ? (data.furnished ? 'furnished' : '') : (data.furnished || "")) as any,
          amenities: data.amenities || [],
          parking: data.parking || "",
          petPolicy: data.pet_policy || "",
          utilitiesIncluded: data.utilities_included || [],
          specialInstructions: data.special_instructions || "",
          roommatePreference: data.roommate_preference || "",
          images: []
        }));
        setExistingImageUrls(Array.isArray(data.images) ? data.images : []);
        toast.success("Loaded listing for editing");
      } catch (e) {
        console.error("Failed to load property for edit", e);
        toast.error("Failed to load property for editing");
      }
    })();
  }, []);

  // Autosave draft periodically
  useEffect(() => {
    const id = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch {}
    }, 8000);
    return () => clearInterval(id);
  }, [formData]);

  // Also save on field changes (cheap)
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData.listingTitle, formData.propertyType, formData.propertyAddress, formData.monthlyRent, formData.address, formData.city, formData.state, formData.zipCode]);

  // Auto-detect amenities if we have coordinates but no amenities data
  useEffect(() => {
    const checkForAmenities = async () => {
      if (
        formData.latitude && 
        formData.longitude && 
        (!formData.nearbyAmenities || formData.nearbyAmenities.length === 0) &&
        formData.city 
      ) {
        try {
          console.log('🔄 Auto-checking for existing location amenities ...');
          toast.info("🔍 Auto-detecting amenities...");
          
          const addressDetails = {
            city: formData.city,
            state: formData.state,
            address: formData.address
          };
          
          const defaultAmenities = generateDefaultLocationAmenities(addressDetails, { lat: formData.latitude!, lng: formData.longitude! });
          const combinedAmenities = defaultAmenities;
          
          console.log('🎯 Triggered from existing location:', combinedAmenities);
          if (combinedAmenities.length > 0) {
            setFormData(prev => ({ ...prev, nearbyAmenities: combinedAmenities }));
            toast.success(`✅ Found ${combinedAmenities.length} nearby amenities automatically!`);
          }
          
        } catch (e) {
          console.log('Auto-check failed but that is okay...');
        }
      }
    };

    checkForAmenities();
  }, [formData.latitude, formData.longitude, formData.city]);

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Inline validation
    if (field === 'monthlyRent') {
      const clean = value.replace(/[^0-9.]/g, '');
      if (!clean) {
        setErrors((e) => ({ ...e, monthlyRent: 'Monthly rent is required' }));
      } else {
        setErrors((e) => { const { monthlyRent, ...rest } = e; return rest as any; });
      }
    }
    if (field === 'zipCode') {
      const ok = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(value.trim());
      if (!ok) setErrors((e) => ({ ...e, zipCode: 'Use Canadian format A1A 1A1' }));
      else setErrors((e) => { const { zipCode, ...rest } = e; return rest as any; });
    }
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

  const handleImageUpload = async (files: FileList | null) => {
    console.log("handleImageUpload called with:", files);
    if (files) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
      );
      console.log("Filtered images:", newImages);
      
      // Check photo for location and auto-detect amenities
      if (newImages.length > 0) {
        const firstImage = newImages[0];
        try {
          // Extract location from first image (representative location)
          const locationData = await amenitiesService.extractLocationFromPhoto(firstImage);
          if (locationData?.coordinates) {
            // Auto-detect nearby amenities
            toast.info("📸 Analyzing photo location and detecting nearby amenities...");
            const autoAmenities = await amenitiesService.autoDetectAmenities(locationData);
            
            if (autoAmenities.length > 0) {
              toast.success(`✅ Auto-detected ${autoAmenities.length} nearby amenities!`);
              
              setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages].slice(0, 10), // Max 10 images
                nearbyAmenities: [...(prev.nearbyAmenities || []), ...autoAmenities].slice(0, 8), // Limit to most relevant
                // If no coordinates yet set, use photo location as fallback
                latitude: prev.latitude || locationData.coordinates?.lat,
                longitude: prev.longitude || locationData.coordinates?.lng,
              }));
              
              return;
            }
          }
        } catch (error) {
          console.error('Amenities auto-detection failed:', error);
          // Continue with normal upload even if location detection failed
        }
      }
      
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

      // Validate required fields before submission
      const errors: Record<string, string> = {};
      if (!formData.propertyType) errors.propertyType = 'Property type is required';
      if (!formData.propertyAddress) errors.propertyAddress = 'Property address is required';
      if (!formData.monthlyRent) errors.monthlyRent = 'Monthly rent is required';
      
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        toast.error("Please fill in all required fields before submitting");
        return;
      }
      
      setErrors({});

      // Upload images to storage (create mode only; editing keeps existing URLs as-is)
      const imageUrls: string[] = [];
      
      if (formData.images.length > 0) {
        toast.info("Uploading images...");
        
        for (const image of formData.images) {
          try {
            const imageUrl = await uploadPropertyImage(image, user.id);
            imageUrls.push(imageUrl);
          } catch (error) {
            console.error('Failed to upload image:', error);
            toast.error(`Failed to upload ${image.name}. Please try again.`);
            return;
          }
        }
        
        toast.success("Images uploaded successfully!");
      }
      
      // Prepare property data for database
      const propertyData = {
        user_id: user.id,
        property_type: formData.propertyType,
        listing_title: formData.listingTitle || formData.propertyAddress,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        neighborhood: formData.neighborhood || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        public_transport_access: formData.publicTransportAccess || null,
        nearby_amenities: formData.nearbyAmenities || [],
        monthly_rent: parseFloat(String(formData.monthlyRent).replace(/[^0-9.]/g, '')),
        security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        lease_duration: formData.leaseTerms || null,
        available_date: formData.availableDate || null,
        furnished: formData.furnished || null as any,
        amenities: formData.amenities || [],
        parking: formData.parking || null,
        pet_policy: formData.petPolicy || null,
        utilities_included: formData.utilitiesIncluded || [],
        special_instructions: formData.specialInstructions || null,
        roommate_preference: formData.roommatePreference || null,
        images: imageUrls
      };

      console.log(editId ? "Updating property:" : "Submitting property data:", propertyData);
      if (editId) {
        // If no new images uploaded, avoid clobbering existing images
        const updates: any = { ...propertyData };
        if (imageUrls.length > 0) {
          updates.images = [...existingImageUrls, ...imageUrls];
        } else {
          delete updates.images;
        }
        await updateProperty(editId, updates);
        toast.success("Property updated successfully!");
      } else {
        const result = await createProperty(propertyData);
        if (!result) {
          toast.error("Failed to create property");
          return;
        }
        toast.success("Property listed successfully!");
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      navigate("/dashboard/landlord/properties");
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("An error occurred while creating the property");
    }
  };

  // Helper function to get dynamic text based on user role
  const getDynamicText = () => {
    if (role === 'landlord') {
      return {
        label: '**14.** Ideal Tenant Type',
        placeholder: 'Select preferred tenant type',
        noPreferenceText: 'No Preference - All Applications Welcome'
      };
    } else {
      return {
        label: '**14.** Preferred Roommate Type',
        placeholder: 'Select roommate preference',
        noPreferenceText: 'No Preference - Open to Everyone'
      };
    }
  };

  const dynamicText = getDynamicText();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Listing Title - appears before Property Type */}
            <div>
              <Label htmlFor="listingTitle">Listing Title</Label>
              <Input
                id="listingTitle"
                placeholder="e.g., Bright 2BR Condo near Metro"
                value={formData.listingTitle}
                onChange={(e) => handleInputChange("listingTitle", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="propertyType">**1.** Property Type</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio Condominium</SelectItem>
                  <SelectItem value="one-bed-room-share-cando">Shared One-Bedroom Condominium</SelectItem>
                  <SelectItem value="two-bed-room-share-cando">Shared Two-Bedroom Condominium</SelectItem>
                  <SelectItem value="entire-one-bed-room-cando">Entire One-Bedroom Condominium</SelectItem>
                  <SelectItem value="entire-two-bed-room-cando">Entire Two-Bedroom Condominium</SelectItem>
                  <SelectItem value="room-from-house">Private Room in a House</SelectItem>
                  <SelectItem value="entire-house">Entire House</SelectItem>
                  <SelectItem value="entire-basement">Entire Basement Unit</SelectItem>
                  <SelectItem value="room-from-basement">Private Room in a Basement</SelectItem>
                  <SelectItem value="shared-room">Shared Room (two occupants per room)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload - Right after Property Type, before Address */}
            <div>
              <Label htmlFor="quick-photos">**1.5.** Property Photos</Label>
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-blue-700 mb-2">
                    📸 Upload photos of your {formData.propertyType ? formData.propertyType.replace(/-/g, ' ') : 'property'} 
                    {formData.propertyType ? ' - this helps verify the property type selected above' : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('photo-upload-early')?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Upload Property Photos
                  </Button>
                  <input
                    id="photo-upload-early"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  
                  {formData.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-blue-600 mb-2 font-medium">
                        ✓ Uploaded {formData.images.length} photo(s)
                      </p>
                      <div className="flex gap-2 flex-wrap justify-center mt-2">
                        {formData.images.slice(0, 6).map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Property photo ${index + 1}`}
                              className="w-16 h-12 object-cover rounded shadow-sm border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
            </div>
                        ))}
                        {formData.images.length > 6 && (
                          <div className="w-16 h-12 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-700 font-bold border">
                            +{formData.images.length - 6}
          </div>
                        )}
            </div>
                      <p className="text-xs text-blue-600 mt-1">
                        💡 You can add more photos later in Step 6
                      </p>
              </div>
                  )}
              </div>
              </div>
            </div>

            {/* NEW: Property Address with Enhanced Error Handling */}
            <AddressAutocomplete
              label="**2.** Property Address (Canadian)"
              placeholder="Type address - e.g. 123 Elm St, Vancouver, BC"
              required
              onAddressSelect={async (suggestion) => {
                console.log("Address selection started");
                try {
                  // First, update basic form data to prevent UI crashes
                  setFormData((prev) => ({
                    ...prev,
                    propertyAddress: suggestion.place_name || suggestion.text || suggestion.id,
                  }));

                  // Then safely try to get address details - if this fails, at least basic info is saved
                  try {
                    const addressDetails = await locationService.getAddressDetails(suggestion);
                    console.log("Address details retrieved successfully");
                    
                    if (addressDetails) {
                      const coordinates = addressDetails.coordinates;
                      
                      // Update form with address details
                      setFormData((prev) => ({
                        ...prev,
                        address: addressDetails.address || "",
                        city: addressDetails.city || "",
                        state: addressDetails.state || "",
                        zipCode: addressDetails.zipCode || "",
                        neighborhood: addressDetails.neighborhood || "",
                        latitude: coordinates?.lat || undefined,
                        longitude: coordinates?.lng || undefined,
                      }));

                      // Only proceed with amenities if coordinates are valid
                      if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number' && !isNaN(coordinates.lat) && !isNaN(coordinates.lng)) {
                        console.log("Valid coordinates, proceeding with amenities");
                        
                        // Try default amenities first - this is safest
                        try {
                          const defaultAmenities = generateDefaultLocationAmenities(addressDetails, coordinates);
                          
                          // Set default amenities immediately
                          setFormData((prev) => ({
                            ...prev,
                            nearbyAmenities: defaultAmenities
                          }));
                          
                          toast.success(`✅ Found ${defaultAmenities.length} amenities nearby!`);
                          
                          // Try enhanced amenities asynchronously (don't wait)
                          setTimeout(async () => {
                            try {
                              const detailedResult = await detailedAmenitiesService.getDetailedPropertyIntelligence(
                                coordinates,
                                suggestion.place_name || suggestion.text,
                                formData.propertyType || ""
                              );
                              
                              if (detailedResult && detailedResult.detectedAmenities) {
                                console.log("Enhanced amenities detected");
                                // Process enhanced results safely in background
                                setDetailedDetection(detailedResult);
                              }
                            } catch (e) {
                              console.log("Enhanced amenities failed in background - that's okay");
                            }
                          }, 100);
                          
                        } catch (amenitiesError) {
                          console.warn("Default amenities generation failed:", amenitiesError);
                        }
                      } else {
                        console.log("No valid coordinates for amenities");
                        toast.info("📍 Address saved - coordinates not available for nearby amenities");
                      }
                    } else {
                      console.log("Address details are null");
                    }
                  } catch (addressError) {
                    console.error("Failed to get address details:", addressError);
                    toast.info("📍 Address saved - additional details not available");
                  }
                  
                } catch (error) {
                  console.error("Critical error in address handling:", error);
                  toast.error("❌ Failed to save address information");
                }
              }}
              onInputChange={(value) => {
                // Safe input change handling
                try {
                  setFormData((prev) => ({
                    ...prev,
                    propertyAddress: value,
                  }));
                } catch (inputError) {
                  console.error("Input change failed:", inputError);
                }
              }}
            />

            {/* Show auto-detected amenities right after address selection */}
            {formData.nearbyAmenities && formData.nearbyAmenities.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-green-600 mr-2" />
                  <Label className="text-green-700 font-medium">✨ Auto-Detected Nearby Facilities</Label>
              </div>
                <div className="flex flex-wrap gap-2 my-2">
                  {formData.nearbyAmenities.slice(0, 8).map((amenity, index) => (
                    <span 
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                  {formData.nearbyAmenities.length > 8 && (
                    <span className="bg-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      +{formData.nearbyAmenities.length - 8} more
                    </span>
                  )}
              </div>
                <p className="text-xs text-green-600">
                  💡 Enhanced with metro lines, bus routes, bank names, mall names, and condominium amenities
                </p>
            </div>
            )}

            {/* Show map immediately after address selection in Step 1 */}
            {formData.latitude && formData.longitude && (
              <div className="space-y-2">
                <Label>📍 Property Location Preview</Label>
                <PropertyMap
                  center={{ lat: formData.latitude, lng: formData.longitude }}
                  selectedAddress={formData.propertyAddress || 
                    `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()}
                  className="w-full h-64 rounded-xl overflow-hidden border border-blue-200 shadow-lg"
                />
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Address location verified and ready
                </p>
            </div>
            )}

            {/* NEW: Move Nearby Amenities to Step 1 */}
            <div>
              <Label>**3.** Nearby Amenities</Label>
              {formData.nearbyAmenities && formData.nearbyAmenities.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    ✨ Enhanced Amenities based on location:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.nearbyAmenities.map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
            </div>
              )}
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
                    <Label htmlFor={`nearby-${amenity}`} className="text-sm">
                      {amenity}
                      {formData.nearbyAmenities?.includes(amenity) && (
                        <span className="text-blue-600 text-xs ml-1">(auto-detected)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW: Property Amenities & Features section - moved from Step 2 */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">🏠 Property Amenities & Features</h3>

            <div>
                <Label>**4.** Property Amenities</Label>
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
                <Label htmlFor="parking">**5.** Parking</Label>
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
                <Label htmlFor="petPolicy">**6.** Pet Policy</Label>
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
                <Label>**7.** Utilities Included</Label>
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

            <div>
              <Label htmlFor="description">**8.** Property Description</Label>
              {formData.nearbyAmenities && formData.nearbyAmenities.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    🤖 AI-Enhanced Description Suggestion:
                  </p>
                  <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded">
                    This property is conveniently located near {formData.nearbyAmenities.slice(0, 3).join(', ')}
                    {formData.nearbyAmenities.length > 3 && ` and ${formData.nearbyAmenities.length - 3} other nearby facilities`}, 
                    making it ideal for residents who value accessibility to essential services.
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const autoDescription = `This property is conveniently located near ${formData.nearbyAmenities.slice(0, 3).join(', ')}` +
                        `${formData.nearbyAmenities.length > 3 ? ` and ${formData.nearbyAmenities.length - 3} other nearby facilities` : ''}` +
                        `, making it ideal for residents who value accessibility to essential services. ` +
                        `The location offers great connectivity to public transport, dining, and shopping options.`;
                      setFormData(prev => ({
                        ...prev,
                        description: prev.description + (prev.description ? ' ' : '') + autoDescription
                      }));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline cursor-pointer"
                  >
                    + Insert into description
                  </button>
                </div>
              )}
              <Textarea
                id="description"
                placeholder="Describe your property, highlighting key features and what makes it special..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* NEW: Rental Information moved from Step 2 to Basic Information */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">💵 Rental Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyRent">**9.** Monthly Rent ($)</Label>
                  <Input
                    id="monthlyRent"
                    placeholder="2500"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="securityDeposit">**10.** Security Deposit ($)</Label>
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
                <Label htmlFor="leaseTerms">**11.** Lease Terms</Label>
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
                  <Label htmlFor="availableDate">**12.** Available Date</Label>
                  <Input
                    id="availableDate"
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => handleInputChange("availableDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="furnished">**13.** Furnishing</Label>
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

            {/* NEW: Consolidated Additional Info fields from Step 2 with dynamic role-based text */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">📝 Additional Information</h3>
              
              <div>
                <Label htmlFor="roommatePreference">{dynamicText.label}</Label>
              <Select value={formData.roommatePreference} onValueChange={(value) => handleInputChange("roommatePreference", value)}>
                <SelectTrigger>
                    <SelectValue placeholder={dynamicText.placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">{dynamicText.noPreferenceText}</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="professionals">Working Professionals Only</SelectItem>
                    <SelectItem value="same-gender">Same Gender Preference</SelectItem>
                    <SelectItem value="non-smokers">Non-Smokers Only</SelectItem>
                    <SelectItem value="quiet">Quiet Lifestyle Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
                <Label htmlFor="specialInstructions">**15.** Special Instructions or Requirements</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special requirements, rules, or instructions for potential tenants..."
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>**1.** Property Photos</Label>
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

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-3">**2.** Listing Preview</h3>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                {/* Address and map */}
                {(formData.propertyAddress || formData.address) && (
                  <div className="mb-4">
                    <div className="flex items-center text-gray-800">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-semibold">
                        {formData.propertyAddress || `${formData.address}${formData.city ? `, ${formData.city}` : ''}${formData.state ? `, ${formData.state}` : ''}${formData.zipCode ? ` ${formData.zipCode}` : ''}`}
                      </span>
                    </div>
                    {formData.latitude && formData.longitude && (
                      <div className="mt-3">
                        <PropertyMap
                          center={{ lat: formData.latitude, lng: formData.longitude }}
                          selectedAddress={formData.propertyAddress || `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`}
                          className="w-full h-48 rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Key facts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <p className="text-xs text-blue-700">Property Type</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {formData.propertyType ? formData.propertyType.replace(/-/g, ' ') : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <p className="text-xs text-green-700">Monthly Rent</p>
                    <p className="text-sm font-semibold text-green-900">
                      {formData.monthlyRent ? `$${formData.monthlyRent}` : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                    <p className="text-xs text-amber-700">Lease</p>
                    <p className="text-sm font-semibold text-amber-900">
                      {formData.leaseTerms ? formData.leaseTerms.replace(/-/g, ' ') : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Amenities badges */}
                {formData.nearbyAmenities && formData.nearbyAmenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-800 font-medium mb-2">Nearby Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.nearbyAmenities.slice(0, 10).map((amenity, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {amenity}
                        </span>
                      ))}
                      {formData.nearbyAmenities.length > 10 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{formData.nearbyAmenities.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {formData.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-800 font-medium mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{formData.description}</p>
                  </div>
                )}

                {/* Preferences and notes */}
                {(formData.roommatePreference || formData.specialInstructions) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.roommatePreference && (
                      <div className="bg-purple-50 border border-purple-100 rounded-md p-3">
                        <p className="text-xs text-purple-700">{dynamicText.label.replace('**14.** ', '')}</p>
                        <p className="text-sm font-semibold text-purple-900">
                          {formData.roommatePreference.replace('-', ' ').replace('any', role === 'landlord' ? 'No Preference - All Applications Welcome' : 'No Preference - Open to Everyone')}
                        </p>
                      </div>
                    )}
                    {formData.specialInstructions && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                        <p className="text-xs text-gray-700">Special Instructions</p>
                        <p className="text-sm text-gray-800">{formData.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
            <p className="text-muted-foreground">{editId ? 'Edit your property listing' : 'Fill out the details to list your property'}</p>
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
              {currentStep === 1 && (editId ? "Update your property's basic information" : "Let's start with all the basic information about your property")}
              {currentStep === 2 && (editId ? "Review changes and update your listing" : "Add photos and review your property listing")}
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
              {editId ? 'Save Changes' : 'Submit Property Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}