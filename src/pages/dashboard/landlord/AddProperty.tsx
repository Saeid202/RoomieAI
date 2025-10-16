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
  { id: 2, title: "Preview & Submit", icon: Camera }
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [detailedDetection, setDetailedDetection] = useState<PropertyIntelligence | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFacility, setSelectedFacility] = useState<{name: string, coordinates: {lat: number, lng: number}, distance: number} | null>(null);
  const DRAFT_KEY = "add_property_draft_v1";
  const [editId, setEditId] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const progress = (currentStep / steps.length) * 100;

  // Handle facility click to show on map
  const handleFacilityClick = (facilityName: string) => {
    console.log("🔍 Facility clicked:", facilityName);
    alert(`Facility clicked: ${facilityName}`); // Simple test to see if click works
    console.log("📊 Detailed detection available:", !!detailedDetection);
    console.log("📊 Detailed detection data:", detailedDetection);
    
    if (!detailedDetection?.detectedAmenities) {
      console.log("❌ No detailed amenities available");
      toast.warning("Facility details not available");
      return;
    }

    // Extract facility name and distance from the display string
    const match = facilityName.match(/^(.+?)\s*\((\d+)m\)$/);
    if (!match) {
      console.log("❌ Could not parse facility name:", facilityName);
      toast.warning("Could not parse facility information");
      return;
    }

    const [, name, distanceStr] = match;
    const distance = parseInt(distanceStr);
    console.log("🎯 Parsed facility:", { name, distance });

    // Find the facility in our detailed detection data
    const allFacilities = [
      ...detailedDetection.detectedAmenities.metro,
      ...detailedDetection.detectedAmenities.buses,
      ...detailedDetection.detectedAmenities.banks,
      ...detailedDetection.detectedAmenities.shoppingMalls,
      ...detailedDetection.detectedAmenities.plazas,
      ...detailedDetection.detectedAmenities.gyms,
      ...detailedDetection.detectedAmenities.hospitals,
      ...detailedDetection.detectedAmenities.schools,
      ...detailedDetection.detectedAmenities.restaurants,
      ...detailedDetection.detectedAmenities.parks
    ];

    console.log("🔍 All facilities found:", allFacilities.length);
    console.log("🔍 Sample facilities:", allFacilities.slice(0, 3));

    const facility = allFacilities.find(f => 
      f.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(f.name.toLowerCase())
    );

    console.log("🎯 Found facility:", facility);

    if (facility && facility.coordinates) {
      console.log("✅ Setting facility with coordinates:", facility.coordinates);
      setSelectedFacility({
        name: facility.name,
        coordinates: facility.coordinates,
        distance: facility.distance
      });
      toast.success(`📍 Showing ${facility.name} on map`);
    } else {
      console.log("⚠️ No exact coordinates found, trying estimation");
      // If we can't find exact coordinates, estimate based on property location and distance
      if (formData.latitude && formData.longitude) {
        // Simple estimation - this is not precise but gives a general direction
        const estimatedCoords = {
          lat: formData.latitude + (Math.random() - 0.5) * 0.01,
          lng: formData.longitude + (Math.random() - 0.5) * 0.01
        };
        
        console.log("📍 Using estimated coordinates:", estimatedCoords);
        setSelectedFacility({
          name,
          coordinates: estimatedCoords,
          distance
        });
        toast.info(`📍 Showing estimated location for ${name}`);
      } else {
        console.log("❌ No property coordinates available");
        toast.warning("Property coordinates not available for facility location");
      }
    }
  };

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
          
          // Try real-time amenities detection first
          const detailedResult = await detailedAmenitiesService.getDetailedPropertyIntelligence(
            { lat: formData.latitude!, lng: formData.longitude! },
            formData.address || formData.propertyAddress,
            formData.propertyType || ""
          );
          
          if (detailedResult && detailedResult.detectedAmenities) {
            // Convert detailed amenities to simple string array for display
            const realAmenities: string[] = [];
            
            // Add specific facility names with distances
            detailedResult.detectedAmenities.metro.forEach(metro => {
              realAmenities.push(`${metro.name} (${Math.round(metro.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.buses.forEach(bus => {
              realAmenities.push(`${bus.name} (${Math.round(bus.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.banks.forEach(bank => {
              realAmenities.push(`${bank.name} (${Math.round(bank.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.shoppingMalls.forEach(mall => {
              realAmenities.push(`${mall.name} (${Math.round(mall.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.plazas.forEach(plaza => {
              realAmenities.push(`${plaza.name} (${Math.round(plaza.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.gyms.forEach(gym => {
              realAmenities.push(`${gym.name} (${Math.round(gym.distance)}m)`);
            });
            
            // Add new facility types
            detailedResult.detectedAmenities.hospitals.forEach(hospital => {
              realAmenities.push(`${hospital.name} (${Math.round(hospital.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.schools.forEach(school => {
              realAmenities.push(`${school.name} (${Math.round(school.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.restaurants.forEach(restaurant => {
              realAmenities.push(`${restaurant.name} (${Math.round(restaurant.distance)}m)`);
            });
            
            detailedResult.detectedAmenities.parks.forEach(park => {
              realAmenities.push(`${park.name} (${Math.round(park.distance)}m)`);
            });
            
            if (realAmenities.length > 0) {
              setFormData(prev => ({ ...prev, nearbyAmenities: realAmenities.slice(0, 8) }));
              setDetailedDetection(detailedResult);
              console.log("💾 Stored detailed detection (auto-detect):", detailedResult);
              toast.success(`✅ Found ${realAmenities.length} real facilities nearby!`);
            } else {
              // Fallback to basic amenities
              const addressDetails = {
                city: formData.city,
                state: formData.state,
                address: formData.address
              };
              const defaultAmenities = generateDefaultLocationAmenities(addressDetails, { lat: formData.latitude!, lng: formData.longitude! });
              setFormData(prev => ({ ...prev, nearbyAmenities: defaultAmenities }));
              toast.warning("⚠️ Using basic amenities - no detailed facilities found");
            }
          } else {
            // Fallback to basic amenities
            const addressDetails = {
              city: formData.city,
              state: formData.state,
              address: formData.address
            };
            const defaultAmenities = generateDefaultLocationAmenities(addressDetails, { lat: formData.latitude!, lng: formData.longitude! });
            setFormData(prev => ({ ...prev, nearbyAmenities: defaultAmenities }));
            toast.warning("⚠️ Using basic amenities - detailed detection unavailable");
          }
          
        } catch (e) {
          console.log('Auto-check failed, using fallback amenities...');
          // Fallback to basic amenities
          const addressDetails = {
            city: formData.city,
            state: formData.state,
            address: formData.address
          };
          const defaultAmenities = generateDefaultLocationAmenities(addressDetails, { lat: formData.latitude!, lng: formData.longitude! });
          setFormData(prev => ({ ...prev, nearbyAmenities: defaultAmenities }));
          toast.warning("⚠️ Using basic amenities - real-time detection failed");
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
      
      // Check photo for location and auto-detect amenities (non-blocking)
      if (newImages.length > 0) {
        const firstImage = newImages[0];
        
        // Always add images first, then try amenities detection in background
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages].slice(0, 10) // Max 10 images
        }));
        
        // Try amenities detection in background (don't block image upload)
        setTimeout(async () => {
          try {
            console.log("🔍 Attempting amenities detection from photo...");
            toast.info("📸 Analyzing photo location and detecting nearby amenities...");
            
            // Extract location from first image (representative location)
            const locationData = await amenitiesService.extractLocationFromPhoto(firstImage);
            if (locationData?.coordinates) {
              // Try real-time amenities detection from photo location
              try {
                const detailedResult = await detailedAmenitiesService.getDetailedPropertyIntelligence(
                  locationData.coordinates,
                  "Photo Location",
                  formData.propertyType || ""
                );
                
                if (detailedResult && detailedResult.detectedAmenities) {
                  // Convert detailed amenities to simple string array for display
                  const realAmenities: string[] = [];
                  
                  // Add specific facility names with distances
                  detailedResult.detectedAmenities.metro.forEach(metro => {
                    realAmenities.push(`${metro.name} (${Math.round(metro.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.buses.forEach(bus => {
                    realAmenities.push(`${bus.name} (${Math.round(bus.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.banks.forEach(bank => {
                    realAmenities.push(`${bank.name} (${Math.round(bank.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.shoppingMalls.forEach(mall => {
                    realAmenities.push(`${mall.name} (${Math.round(mall.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.plazas.forEach(plaza => {
                    realAmenities.push(`${plaza.name} (${Math.round(plaza.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.gyms.forEach(gym => {
                    realAmenities.push(`${gym.name} (${Math.round(gym.distance)}m)`);
                  });
                  
                  // Add new facility types
                  detailedResult.detectedAmenities.hospitals.forEach(hospital => {
                    realAmenities.push(`${hospital.name} (${Math.round(hospital.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.schools.forEach(school => {
                    realAmenities.push(`${school.name} (${Math.round(school.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.restaurants.forEach(restaurant => {
                    realAmenities.push(`${restaurant.name} (${Math.round(restaurant.distance)}m)`);
                  });
                  
                  detailedResult.detectedAmenities.parks.forEach(park => {
                    realAmenities.push(`${park.name} (${Math.round(park.distance)}m)`);
                  });
                  
                  if (realAmenities.length > 0) {
                    toast.success(`✅ Auto-detected ${realAmenities.length} real facilities from photo!`);
                    
                    setFormData(prev => ({
                      ...prev,
                      nearbyAmenities: [...(prev.nearbyAmenities || []), ...realAmenities].slice(0, 8), // Limit to most relevant
                      // If no coordinates yet set, use photo location as fallback
                      latitude: prev.latitude || locationData.coordinates?.lat,
                      longitude: prev.longitude || locationData.coordinates?.lng,
                    }));
                    
                    setDetailedDetection(detailedResult);
                  } else {
                    toast.info("📍 No facilities detected from photo location");
                  }
                } else {
                  // Fallback to basic amenities detection
                  const autoAmenities = await amenitiesService.autoDetectAmenities(locationData);
                  
                  if (autoAmenities.length > 0) {
                    toast.success(`✅ Auto-detected ${autoAmenities.length} nearby amenities from photo!`);
                    
                    setFormData(prev => ({
                      ...prev,
                      nearbyAmenities: [...(prev.nearbyAmenities || []), ...autoAmenities].slice(0, 8), // Limit to most relevant
                      // If no coordinates yet set, use photo location as fallback
                      latitude: prev.latitude || locationData.coordinates?.lat,
                      longitude: prev.longitude || locationData.coordinates?.lng,
                    }));
                  } else {
                    toast.info("📍 No additional amenities detected from photo location");
                  }
                }
              } catch (detailedError) {
                console.warn('Detailed amenities detection from photo failed:', detailedError);
                // Fallback to basic amenities detection
                const autoAmenities = await amenitiesService.autoDetectAmenities(locationData);
                
                if (autoAmenities.length > 0) {
                  toast.success(`✅ Auto-detected ${autoAmenities.length} nearby amenities from photo!`);
                  
                  setFormData(prev => ({
                    ...prev,
                    nearbyAmenities: [...(prev.nearbyAmenities || []), ...autoAmenities].slice(0, 8), // Limit to most relevant
                    // If no coordinates yet set, use photo location as fallback
                    latitude: prev.latitude || locationData.coordinates?.lat,
                    longitude: prev.longitude || locationData.coordinates?.lng,
                  }));
                } else {
                  toast.info("📍 No additional amenities detected from photo location");
                }
              }
            } else {
              toast.warning("⚠️ Could not extract location from photo for amenities detection");
            }
          } catch (error) {
            console.warn('⚠️ Amenities auto-detection failed (non-blocking):', error);
            toast.warning("⚠️ Could not detect amenities from photo - please enter address manually");
          }
        }, 100);
        
        return; // Exit early since we've already added the images
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
    console.log("🚀 Starting property submission...");
    console.log("📋 Form data:", formData);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log("👤 Current user:", user);
      
      if (!user) {
        console.error("❌ No user found");
        toast.error("You must be logged in to create a property");
        return;
      }

      // Validate required fields before submission
      const errors: Record<string, string> = {};
      if (!formData.propertyType) errors.propertyType = 'Property type is required';
      if (!formData.propertyAddress && !formData.address) errors.propertyAddress = 'Property address is required';
      if (!formData.monthlyRent) errors.monthlyRent = 'Monthly rent is required';
      
      console.log("✅ Validation errors:", errors);
      
      // Ensure DB required fields are present; fall back to typed address
      const safeAddress = formData.address || formData.propertyAddress;
      const safeCity = formData.city || "";
      const safeState = formData.state || "";
      const safeZip = formData.zipCode || "";
      
      console.log("📍 Address details:", { safeAddress, safeCity, safeState, safeZip });
      
      if (Object.keys(errors).length > 0) {
        console.error("❌ Validation failed:", errors);
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
        address: safeAddress,
        city: safeCity,
        state: safeState,
        zip_code: safeZip,
        neighborhood: formData.neighborhood || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        public_transport_access: formData.publicTransportAccess || null,
        nearby_amenities: formData.nearbyAmenities || [],
        monthly_rent: parseFloat(String(formData.monthlyRent).replace(/[^0-9.]/g, '')),
        security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        // For current DB (legacy), send lease_terms; service will map if needed
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

      console.log("📦 Property data prepared:", propertyData);
      console.log(editId ? "🔄 Updating property:" : "📤 Submitting property data:", propertyData);
      if (editId) {
        console.log("🔄 Updating existing property...");
        // If no new images uploaded, avoid clobbering existing images
        const updates: any = { ...propertyData };
        if (imageUrls.length > 0) {
          updates.images = [...existingImageUrls, ...imageUrls];
        } else {
          delete updates.images;
        }
        console.log("📝 Update payload:", updates);
        await updateProperty(editId, updates);
        console.log("✅ Property updated successfully!");
        toast.success("Property updated successfully!");
      } else {
        console.log("🆕 Creating new property...");
        const result = await createProperty(propertyData);
        console.log("📤 Create result:", result);
        if (!result) {
          console.error("❌ Failed to create property - no result returned");
          toast.error("Failed to create property");
          return;
        }
        console.log("✅ Property created successfully!");
        toast.success("Property listed successfully!");
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      navigate("/dashboard/landlord/properties");
    } catch (error: any) {
      console.error("❌ Error creating property:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      const message = typeof error?.message === 'string' ? error.message : 'An error occurred while creating the property';
      toast.error(`❌ ${message}`);
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
          <div className="space-y-10">
            {/* Listing Title - appears before Property Type */}
            <div className="space-y-4">
              <Label htmlFor="listingTitle" className="text-lg font-bold text-gray-900">Listing Title</Label>
              <Input
                id="listingTitle"
                placeholder="e.g., Bright 2BR Condo near Metro"
                value={formData.listingTitle}
                onChange={(e) => handleInputChange("listingTitle", e.target.value)}
                className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="propertyType" className="text-lg font-bold text-gray-900">**1.** Property Type</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                <SelectTrigger className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent className="font-semibold">
                  <SelectItem value="studio" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Studio Condominium</SelectItem>
                  <SelectItem value="one-bed-room-share-cando" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Shared One-Bedroom Condominium</SelectItem>
                  <SelectItem value="two-bed-room-share-cando" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Shared Two-Bedroom Condominium</SelectItem>
                  <SelectItem value="entire-one-bed-room-cando" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Entire One-Bedroom Condominium</SelectItem>
                  <SelectItem value="entire-two-bed-room-cando" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Entire Two-Bedroom Condominium</SelectItem>
                  <SelectItem value="room-from-house" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Private Room in a House</SelectItem>
                  <SelectItem value="entire-house" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Entire House</SelectItem>
                  <SelectItem value="entire-basement" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Entire Basement Unit</SelectItem>
                  <SelectItem value="room-from-basement" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Private Room in a Basement</SelectItem>
                  <SelectItem value="shared-room" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Shared Room (two occupants per room)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload - Right after Property Type, before Address */}
            <div className="space-y-3">
              <Label htmlFor="quick-photos" className="text-base font-medium text-gray-700">**1.5.** Property Photos</Label>
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-6">
                <div className="text-center">
                  <Camera className="mx-auto h-10 w-10 text-blue-600 mb-3" />
                  <p className="text-base text-blue-700 mb-4 font-medium">
                    📸 Upload photos of your {formData.propertyType ? formData.propertyType.replace(/-/g, ' ') : 'property'} 
                    {formData.propertyType ? ' - this helps verify the property type selected above' : ''}
                  </p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => document.getElementById('photo-upload-early')?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Camera className="h-5 w-5 mr-2" />
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
                    <div className="mt-6">
                      <p className="text-base text-blue-700 mb-4 font-bold">
                        ✓ Uploaded {formData.images.length} photo(s)
                      </p>
                      <div className="flex gap-4 flex-wrap justify-center mt-4">
                        {formData.images.slice(0, 6).map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Property photo ${index + 1}`}
                              className="w-24 h-20 object-cover rounded-lg shadow-lg border-2 border-white"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-3 -right-3 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
            </div>
                        ))}
                        {formData.images.length > 6 && (
                          <div className="w-24 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-base text-blue-700 font-bold border-2 border-white shadow-lg">
                            +{formData.images.length - 6}
          </div>
                        )}
            </div>
                      <p className="text-base text-blue-700 mt-3 font-bold">
                        💡 You'll review your listing in the next step before submitting.
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
                        
                        // Show loading state immediately
                        toast.info("🔍 Detecting nearby facilities...");
                        
                        // Clear any cached generic amenities first
                        setFormData((prev) => ({
                          ...prev,
                          nearbyAmenities: []
                        }));
                        
                        // Clear cache to ensure fresh data
                        detailedAmenitiesService.clearCache();
                        
                        // Try real-time amenities detection first
                        try {
                          console.log("🔍 Starting real-time amenities detection...");
                          console.log("Coordinates:", coordinates);
                          console.log("Address:", suggestion.place_name || suggestion.text);
                          
                          const detailedResult = await detailedAmenitiesService.getDetailedPropertyIntelligence(
                            coordinates,
                            suggestion.place_name || suggestion.text,
                            formData.propertyType || ""
                          );
                          
                          console.log("📊 Detailed result:", detailedResult);
                          
                          if (detailedResult && detailedResult.detectedAmenities) {
                            console.log("✅ Real-time amenities detected");
                            console.log("Detected amenities:", detailedResult.detectedAmenities);
                            
                            // Convert detailed amenities to simple string array for display
                            const realAmenities: string[] = [];
                            
                            // Add specific facility names with distances
                            detailedResult.detectedAmenities.metro.forEach(metro => {
                              realAmenities.push(`${metro.name} (${Math.round(metro.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.buses.forEach(bus => {
                              realAmenities.push(`${bus.name} (${Math.round(bus.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.banks.forEach(bank => {
                              realAmenities.push(`${bank.name} (${Math.round(bank.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.shoppingMalls.forEach(mall => {
                              realAmenities.push(`${mall.name} (${Math.round(mall.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.plazas.forEach(plaza => {
                              realAmenities.push(`${plaza.name} (${Math.round(plaza.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.gyms.forEach(gym => {
                              realAmenities.push(`${gym.name} (${Math.round(gym.distance)}m)`);
                            });
                            
                            // Add new facility types
                            detailedResult.detectedAmenities.hospitals.forEach(hospital => {
                              realAmenities.push(`${hospital.name} (${Math.round(hospital.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.schools.forEach(school => {
                              realAmenities.push(`${school.name} (${Math.round(school.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.restaurants.forEach(restaurant => {
                              realAmenities.push(`${restaurant.name} (${Math.round(restaurant.distance)}m)`);
                            });
                            
                            detailedResult.detectedAmenities.parks.forEach(park => {
                              realAmenities.push(`${park.name} (${Math.round(park.distance)}m)`);
                            });
                            
                            console.log("🎯 Real amenities array:", realAmenities);
                            
                            // Set real-time amenities
                            setFormData((prev) => ({
                              ...prev,
                              nearbyAmenities: realAmenities.slice(0, 8) // Limit to 8 most relevant
                            }));
                            
                            // Store detailed detection for potential future use
                            setDetailedDetection(detailedResult);
                            console.log("💾 Stored detailed detection:", detailedResult);
                            
                            if (realAmenities.length > 0) {
                              toast.success(`✅ Found ${realAmenities.length} real facilities nearby!`);
                            } else {
                              toast.info("📍 No facilities detected in this area");
                            }
                          } else {
                            console.log("❌ No detailed amenities detected, falling back to generic");
                            // Fallback to basic amenities if detailed detection fails
                            const defaultAmenities = generateDefaultLocationAmenities(addressDetails, coordinates);
                            setFormData((prev) => ({
                              ...prev,
                              nearbyAmenities: defaultAmenities
                            }));
                            toast.warning("⚠️ Using basic amenities - detailed detection unavailable");
                          }
                        } catch (amenitiesError) {
                          console.error("❌ Real-time amenities detection failed:", amenitiesError);
                          console.error("Error details:", amenitiesError);
                          
                          // Fallback to basic amenities
                          const defaultAmenities = generateDefaultLocationAmenities(addressDetails, coordinates);
                          setFormData((prev) => ({
                            ...prev,
                            nearbyAmenities: defaultAmenities
                          }));
                          toast.warning("⚠️ Using basic amenities - real-time detection failed");
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
              <div className="bg-green-50 border border-green-300 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-green-700 mr-3" />
                  <Label className="text-green-800 font-bold text-lg">✨ Auto-Detected Nearby Facilities</Label>
              </div>
                <div className="flex flex-wrap gap-3 my-4">
                  {formData.nearbyAmenities.slice(0, 8).map((amenity, index) => (
                    <span 
                      key={index}
                      onClick={() => handleFacilityClick(amenity)}
                      className="bg-green-100 text-green-900 px-4 py-3 rounded-full text-base font-bold shadow-md cursor-pointer hover:bg-green-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      title="Click to view on map"
                    >
                      {amenity}
                    </span>
                  ))}
                  {formData.nearbyAmenities.length > 8 && (
                    <span className="bg-green-200 text-green-800 px-4 py-3 rounded-full text-base font-bold shadow-md">
                      +{formData.nearbyAmenities.length - 8} more
                    </span>
                  )}
              </div>
                <p className="text-base text-green-700 font-bold">
                  💡 Enhanced with metro lines, bus routes, bank names, mall names, and condominium amenities
                </p>
            </div>
            )}

            {/* Show map immediately after address selection in Step 1 */}
            {formData.latitude && formData.longitude && (
              <div className="space-y-4">
                <Label className="text-lg font-bold text-gray-900">📍 Property Location Preview</Label>
                <PropertyMap
                  center={{ lat: formData.latitude, lng: formData.longitude }}
                  selectedAddress={formData.propertyAddress || 
                    `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()}
                  className="w-full h-80 rounded-xl overflow-hidden border border-blue-300 shadow-xl"
                  facilityMarker={selectedFacility}
                />
                <p className="text-base text-blue-700 mt-3 flex items-center font-bold">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address location verified and ready
                </p>
                {selectedFacility && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">
                          Showing: {selectedFacility.name} ({selectedFacility.distance}m)
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFacility(null)}
                        className="text-green-600 border-green-300 hover:bg-green-100"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
            </div>
            )}

            {/* NEW: Move Nearby Amenities to Step 1 */}
            <div className="space-y-4">
              <Label className="text-lg font-bold text-gray-900">**3.** Nearby Amenities</Label>
              {formData.nearbyAmenities && formData.nearbyAmenities.length > 0 && (
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-5 mb-5">
                  <p className="text-lg text-blue-800 font-bold mb-4">
                    ✨ Enhanced Amenities based on location:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {formData.nearbyAmenities.map((amenity, index) => (
                      <span 
                        key={index}
                        onClick={() => handleFacilityClick(amenity)}
                        className="bg-blue-100 text-blue-900 px-4 py-3 rounded-lg text-base font-bold shadow-md cursor-pointer hover:bg-blue-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        title="Click to view on map"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
            </div>
              )}
              <div className="grid grid-cols-3 gap-5 mt-5">
                {[
                  "Shopping Centers", "Restaurants", "Schools", "Hospitals",
                  "Parks", "Gyms", "Banks", "Pharmacies"
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-4">
                    <Checkbox
                      id={`nearby-${amenity}`}
                      checked={formData.nearbyAmenities?.includes(amenity) || false}
                      onCheckedChange={(checked) => handleArrayChange("nearbyAmenities", amenity, checked as boolean)}
                    />
                    <Label htmlFor={`nearby-${amenity}`} className="text-base font-bold text-gray-900">
                      {amenity}
                      {formData.nearbyAmenities?.includes(amenity) && (
                        <span className="text-blue-700 text-sm ml-2 font-bold">(auto-detected)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW: Property Amenities & Features section - moved from Step 2 */}
            <div className="border-t pt-10 mt-10">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">🏠 Property Amenities & Features</h3>

            <div className="space-y-4">
                <Label className="text-lg font-bold text-gray-900">**4.** Property Amenities</Label>
              <div className="grid grid-cols-3 gap-5 mt-5">
                {[
                  "Air Conditioning", "Heating", "Dishwasher", "Washer/Dryer",
                  "Balcony/Patio", "Hardwood Floors", "Carpet", "Fireplace",
                  "Swimming Pool", "Gym/Fitness Center", "Elevator", "Garden"
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-4">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleArrayChange("amenities", amenity, checked as boolean)}
                    />
                    <Label htmlFor={amenity} className="text-base font-bold text-gray-900">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
                <Label htmlFor="parking" className="text-lg font-bold text-gray-900">**5.** Parking</Label>
              <Select value={formData.parking} onValueChange={(value) => handleInputChange("parking", value)}>
                <SelectTrigger className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold">
                  <SelectValue placeholder="Select parking option" />
                </SelectTrigger>
                <SelectContent className="font-semibold">
                  <SelectItem value="none" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">No Parking</SelectItem>
                  <SelectItem value="street" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Street Parking</SelectItem>
                  <SelectItem value="driveway" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Driveway</SelectItem>
                  <SelectItem value="garage" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Garage</SelectItem>
                  <SelectItem value="covered" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Covered Parking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
                <Label htmlFor="petPolicy" className="text-lg font-bold text-gray-900">**6.** Pet Policy</Label>
              <Select value={formData.petPolicy} onValueChange={(value) => handleInputChange("petPolicy", value)}>
                <SelectTrigger className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold">
                  <SelectValue placeholder="Select pet policy" />
                </SelectTrigger>
                <SelectContent className="font-semibold">
                  <SelectItem value="no-pets" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">No Pets</SelectItem>
                  <SelectItem value="cats-only" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Cats Only</SelectItem>
                  <SelectItem value="dogs-only" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Dogs Only</SelectItem>
                  <SelectItem value="cats-dogs" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Cats & Dogs</SelectItem>
                  <SelectItem value="small-pets" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Small Pets Only</SelectItem>
                  <SelectItem value="all-pets" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">All Pets Welcome</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
                <Label className="text-lg font-bold text-gray-900">**7.** Utilities Included</Label>
              <div className="grid grid-cols-3 gap-5 mt-5">
                {["Water", "Electricity", "Gas", "Internet", "Cable TV", "Trash"].map((utility) => (
                  <div key={utility} className="flex items-center space-x-4">
                    <Checkbox
                      id={utility}
                      checked={formData.utilitiesIncluded.includes(utility)}
                      onCheckedChange={(checked) => handleArrayChange("utilitiesIncluded", utility, checked as boolean)}
                    />
                    <Label htmlFor={utility} className="text-base font-bold text-gray-900">{utility}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

            <div className="space-y-4">
              <Label htmlFor="description" className="text-lg font-bold text-gray-900">**8.** Property Description</Label>
              {formData.nearbyAmenities && formData.nearbyAmenities.length > 0 && (
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-5 mb-5">
                  <p className="text-lg text-blue-800 font-bold mb-4">
                    🤖 AI-Enhanced Description Suggestion:
                  </p>
                  <div className="text-base text-blue-700 bg-blue-100 p-4 rounded-lg font-semibold">
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
                    className="text-base text-blue-700 hover:text-blue-900 mt-3 underline cursor-pointer font-bold"
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
                className="min-h-[160px] text-lg border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold"
              />
            </div>

            {/* NEW: Rental Information moved from Step 2 to Basic Information */}
            <div className="border-t pt-10 mt-10">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">💵 Rental Information</h3>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="monthlyRent" className="text-lg font-bold text-gray-900">**9.** Monthly Rent ($)</Label>
                  <Input
                    id="monthlyRent"
                    placeholder="2500"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                    className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="securityDeposit" className="text-lg font-bold text-gray-900">**10.** Security Deposit ($)</Label>
                  <Input
                    id="securityDeposit"
                    placeholder="2500"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                    className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <Label htmlFor="leaseTerms" className="text-lg font-bold text-gray-900">**11.** Lease Terms</Label>
                <Select value={formData.leaseTerms} onValueChange={(value) => handleInputChange("leaseTerms", value)}>
                  <SelectTrigger className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold">
                    <SelectValue placeholder="Select lease terms" />
                  </SelectTrigger>
                  <SelectContent className="font-semibold">
                    <SelectItem value="month-to-month" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Month-to-Month</SelectItem>
                    <SelectItem value="6-months" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">6 Months</SelectItem>
                    <SelectItem value="1-year" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">1 Year</SelectItem>
                    <SelectItem value="2-years" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">2 Years</SelectItem>
                    <SelectItem value="flexible" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <Label htmlFor="availableDate" className="text-lg font-bold text-gray-900">**12.** Available Date</Label>
                  <Input
                    id="availableDate"
                    type="date"
                    value={formData.availableDate}
                    onChange={(e) => handleInputChange("availableDate", e.target.value)}
                    className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="furnished" className="text-lg font-bold text-gray-900">**13.** Furnishing</Label>
                  <Select value={formData.furnished} onValueChange={(value) => handleInputChange("furnished", value)}>
                    <SelectTrigger className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="font-semibold">
                      <SelectItem value="furnished" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Fully Furnished</SelectItem>
                      <SelectItem value="semi-furnished" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Semi-Furnished</SelectItem>
                      <SelectItem value="unfurnished" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* NEW: Consolidated Additional Info fields from Step 2 with dynamic role-based text */}
            <div className="border-t pt-10 mt-10">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">📝 Additional Information</h3>
              
              <div className="space-y-4">
                <Label htmlFor="roommatePreference" className="text-lg font-bold text-gray-900">{dynamicText.label}</Label>
              <Select value={formData.roommatePreference} onValueChange={(value) => handleInputChange("roommatePreference", value)}>
                <SelectTrigger className="text-lg h-14 border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold">
                    <SelectValue placeholder={dynamicText.placeholder} />
                </SelectTrigger>
                <SelectContent className="font-semibold">
                    <SelectItem value="any" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">{dynamicText.noPreferenceText}</SelectItem>
                  <SelectItem value="students" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Students Only</SelectItem>
                    <SelectItem value="professionals" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Working Professionals Only</SelectItem>
                    <SelectItem value="same-gender" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Same Gender Preference</SelectItem>
                    <SelectItem value="non-smokers" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Non-Smokers Only</SelectItem>
                    <SelectItem value="quiet" className="text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-900">Quiet Lifestyle Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 mt-8">
                <Label htmlFor="specialInstructions" className="text-lg font-bold text-gray-900">**15.** Special Instructions or Requirements</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special requirements, rules, or instructions for potential tenants..."
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                className="min-h-[140px] text-lg border-gray-400 focus:border-blue-600 focus:ring-blue-600 font-semibold"
              />
            </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-3">**1.** Listing Preview</h3>
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
                          facilityMarker={selectedFacility}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full py-8 px-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/landlord/properties")} className="shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-2">Add New Property</h1>
            <p className="text-xl text-gray-700 font-semibold">{editId ? 'Edit your property listing' : 'Fill out the details to list your property'}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">Step {currentStep} of {steps.length}</span>
            <span className="text-lg text-gray-700 font-semibold">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-4 bg-gray-300" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between mb-10 overflow-x-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-0 flex-1 ${
                  step.id <= currentStep ? "text-blue-700" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg transition-all duration-200 ${
                    step.id <= currentStep
                      ? "bg-blue-600 text-white shadow-xl"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-base text-center font-bold">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-4 text-3xl font-bold text-gray-900">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-8 w-8 text-blue-700" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-xl text-gray-800 font-semibold mt-3">
              {currentStep === 1 && (editId ? "Update your property's basic information" : "Let's start with all the basic information about your property")}
            {currentStep === 2 && (editId ? "Review changes and update your listing" : "Review your property listing before submitting")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-10 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-2"
          >
            <ArrowLeft className="h-6 w-6 mr-3" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep} className="px-10 py-4 text-lg font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              Next
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="px-10 py-4 text-lg font-bold bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <CheckCircle className="h-6 w-6 mr-3" />
              {editId ? 'Save Changes' : 'Submit Property Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}