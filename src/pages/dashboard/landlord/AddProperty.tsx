import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Home, MapPin, DollarSign, Camera, FileText, CheckCircle, X, Upload, Train, ShoppingBag, GraduationCap, Coffee, Loader2, Sparkles, Volume2, Square, Box, Film } from "lucide-react";
import { useRoleBasedVerification } from "@/hooks/useRoleBasedVerification";
import { ai3DService } from "@/services/ai3DService";

import { useNavigate } from "react-router-dom";
import { createProperty, uploadPropertyImage, fetchPropertyById, updateProperty, createSalesListing, updateSalesListing, fetchSalesListingById } from "@/services/propertyService";
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
import { ImageUpload } from "@/components/ui/image-upload";
import { aiDescriptionService } from "@/services/aiDescriptionService";
import { PropertyVideoPlayer } from "@/components/property/PropertyVideoPlayer";
import { aiVideoService } from "@/services/aiVideoService";



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
  listingCategory: string; // 'rental' or 'sale'

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

  // Sales Information
  salesPrice: string;
  downpaymentTarget: string;

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
  images: string[]; // Changed from File[] to string[] for URLs
  descriptionAudioUrl?: string;
  threeDModelUrl?: string;
  isCoOwnership?: boolean;
}

const initialFormData: PropertyFormData = {
  listingTitle: "",
  propertyType: "",
  propertyAddress: "",
  description: "",
  listingCategory: "rental",
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
  images: [],
  descriptionAudioUrl: "",
  threeDModelUrl: "",
  salesPrice: "",
  downpaymentTarget: "",
  isCoOwnership: false
};

const steps = [
  { id: 1, title: "Property Listing", icon: Home }
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { role } = useRole();
  const { isVerified, loading: verificationLoading, requireVerification } = useRoleBasedVerification();
  const [currentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [detailedDetection, setDetailedDetection] = useState<PropertyIntelligence | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFacility, setSelectedFacility] = useState<{ name: string, coordinates: { lat: number, lng: number }, distance: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const DRAFT_KEY = "add_property_draft_v1";
  const [editId, setEditId] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [hasLocalAudioPreview, setHasLocalAudioPreview] = useState(false);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [videoScript, setVideoScript] = useState<string>("");
  const [includeVideo, setIncludeVideo] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(true);


  // Load model-viewer script
  useEffect(() => {
    // Check if script is already loaded to prevent duplicates
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      // Use Google CDN for stability
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.body.appendChild(script);
    }
  }, []);

  // No progress calculation needed for single page form

  // Function to reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setDetailedDetection(null);
    setErrors({});
    setSelectedFacility(null);
    setEditId(null);
    setExistingImageUrls([]);
    setHasLocalAudioPreview(false);
    // Clear draft from localStorage
    try {
      localStorage.removeItem(DRAFT_KEY);
      console.log('🧹 Form reset and draft cleared');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

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

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Restore draft on mount - but only if not creating a new property
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillId = params.get('prefill');
    const isNewProperty = !prefillId;

    if (isNewProperty) {
      // For new properties, clear any existing draft and start fresh
      try {
        localStorage.removeItem(DRAFT_KEY);
        setFormData(initialFormData);
        console.log('🆕 Starting fresh form for new property');
      } catch (error) {
        console.error('Error clearing draft:', error);
      }
    } else {
      // For editing existing properties, restore draft if available
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          setFormData((prev) => ({ ...prev, ...draft }));
          toast.info("Draft restored");
        }
      } catch { }
    }
  }, []);

  // Detect when creating a new property (no prefill parameter) and reset form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillId = params.get('prefill');

    if (!prefillId && editId === null) {
      // This is a new property creation, ensure form is clean
      resetForm();
      const category = params.get('category');
      if (category === 'sale') {
        setFormData(prev => ({ ...prev, listingCategory: 'sale' }));
      }
    }
  }, [window.location.search]);

  // Detect edit mode (?prefill=:id) and load existing property
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillId = params.get('prefill');
    if (!prefillId) return;
    (async () => {
      try {
        setEditId(prefillId);
        const category = params.get('category');
        let data: any;
        if (category === 'sale') {
          data = await fetchSalesListingById(prefillId);
        } else {
          data = await fetchPropertyById(prefillId);
        }
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
          images: Array.isArray(data.images) ? data.images : [], // Fix: Load images into form state
          descriptionAudioUrl: data.description_audio_url || "",
          threeDModelUrl: data.three_d_model_url || "",
          listingCategory: data.listing_category || (params.get('category') === 'sale' ? "sale" : "rental"),
          salesPrice: data.sales_price?.toString() || "",
          downpaymentTarget: data.downpayment_target?.toString() || ""
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
      } catch { }
    }, 8000);
    return () => clearInterval(id);
  }, [formData]);

  // Also save on field changes (cheap)
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch { }
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

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Inline validation
    if (field === 'monthlyRent') {
      if (formData.listingCategory === 'rental') {
        const clean = value.replace(/[^0-9.]/g, '');
        if (!clean) {
          setErrors((e) => ({ ...e, monthlyRent: 'Monthly rent is required' }));
        } else {
          setErrors((e) => { const { monthlyRent, ...rest } = e; return rest as any; });
        }
      } else {
        // If not rental, clear any previous monthlyRent error
        setErrors((e) => { const { monthlyRent, ...rest } = e; return rest as any; });
      }
    }
    if (field === 'salesPrice') {
      if (formData.listingCategory === 'sale') {
        const clean = value.replace(/[^0-9.]/g, '');
        if (!clean) {
          setErrors((e) => ({ ...e, salesPrice: 'Sales price is required' }));
        } else {
          setErrors((e) => { const { salesPrice, ...rest } = e; return rest as any; });
        }
      } else {
        setErrors((e) => { const { salesPrice, ...rest } = e; return rest as any; });
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

  // No step navigation needed for single page form

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      const mins = Math.ceil(meters / 80);
      return `${mins} min walk`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleSubmit = async () => {
    console.log("🚀 Starting property submission...");
    console.log("📋 Form data:", formData);

    // Check verification before allowing property submission
    if (requireVerification('Publish listing')) {
      return; // User will be redirected
    }

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
      if (formData.listingCategory === 'rental' && !formData.monthlyRent) errors.monthlyRent = 'Monthly rent is required';
      if (formData.listingCategory === 'sale' && !formData.salesPrice) errors.salesPrice = 'Sales price is required';

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

      // Images are already uploaded and stored in formData.images as URLs
      const imageUrls = formData.images; // These are already URLs from the ImageUpload component

      // Prepare property data for database
      const propertyData = {
        user_id: user.id,
        property_type: formData.propertyType,
        listing_title: formData.listingTitle || formData.propertyAddress,
        description: formData.description || null,
        description_audio_url: formData.descriptionAudioUrl || null,
        video_script: videoScript || null,
        background_music_url: selectedMusic || null,
        video_enabled: includeVideo,
        audio_enabled: includeAudio,
        address: safeAddress,
        city: safeCity,
        state: safeState,
        zip_code: safeZip,
        neighborhood: formData.neighborhood || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        public_transport_access: formData.publicTransportAccess || null,
        nearby_amenities: formData.nearbyAmenities || [],
        monthly_rent: formData.monthlyRent ? parseFloat(String(formData.monthlyRent).replace(/[^0-9.]/g, '')) : null,
        security_deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        lease_terms: formData.leaseTerms || null, // Fixed: use lease_terms instead of lease_duration
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
        const updates: any = {
          ...propertyData,
          isCoOwnership: formData.isCoOwnership,
          salesPrice: formData.salesPrice,
          downpaymentTarget: formData.downpaymentTarget
        };
        if (imageUrls.length > 0) {
          updates.images = [...existingImageUrls, ...imageUrls];
        } else {
          delete updates.images;
        }
        console.log("📝 Update payload:", updates);
        if (formData.listingCategory === 'sale') {
          await updateSalesListing(editId, updates);
        } else {
          await updateProperty(editId, updates);
        }
        console.log("✅ Property updated successfully!");
        toast.success("Property updated successfully!");
      } else {
        console.log("🆕 Creating new property...");
        let result;
        if (formData.listingCategory === 'sale') {
          result = await createSalesListing({
            ...propertyData,
            salesPrice: formData.salesPrice,
            downpaymentTarget: formData.downpaymentTarget,
            isCoOwnership: formData.isCoOwnership
          });
        } else {
          result = await createProperty(propertyData);
        }
        console.log("📤 Create result:", result);
        if (!result) {
          console.error("❌ Failed to create property - no result returned");
          toast.error("Failed to create property");
          return;
        }
        console.log("✅ Property created successfully!");
        toast.success("Property listed successfully!");
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch { }
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
          <div className="space-y-8">
            {/* SECTION 1: Property Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                <h3 className="text-lg font-semibold text-gray-800">Property Information</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="space-y-2 max-w-xs flex-1">
                    <Label htmlFor="listingCategory" className="text-sm font-medium">Listing Category</Label>
                    <Select value={formData.listingCategory} onValueChange={(value) => handleInputChange("listingCategory", value)}>
                      <SelectTrigger className="h-9 w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rental">Rentals</SelectItem>
                        <SelectItem value="sale">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.listingCategory === "sale" && (
                    <div className="flex items-center space-x-2 self-end pb-2">
                      <Checkbox
                        id="isCoOwnership"
                        checked={formData.isCoOwnership}
                        onCheckedChange={(checked) => handleInputChange("isCoOwnership", checked)}
                      />
                      <Label htmlFor="isCoOwnership" className="text-sm font-medium cursor-pointer">
                        Open to co-ownership
                      </Label>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <AddressAutocomplete
                      label="Property Address"
                      placeholder="Search address..."
                      required
                      onAddressSelect={async (suggestion) => {
                        try {
                          setFormData((prev) => ({
                            ...prev,
                            propertyAddress: suggestion.place_name || suggestion.text || suggestion.id,
                            listingTitle: suggestion.place_name || suggestion.text || suggestion.id // Auto-set listing title
                          }));
                          const addressDetails = await locationService.getAddressDetails(suggestion);
                          if (addressDetails) {
                            const coordinates = addressDetails.coordinates;
                            setFormData((prev) => ({
                              ...prev,
                              address: addressDetails.address || "",
                              city: addressDetails.city || "",
                              state: addressDetails.state || "",
                              zipCode: addressDetails.zipCode || "",
                              neighborhood: addressDetails.neighborhood || "",
                              latitude: coordinates?.lat || undefined,
                              longitude: coordinates?.lng || undefined,
                              nearbyAmenities: [],
                            }));
                            if (coordinates?.lat) toast.success("Location verified");
                          }
                        } catch (e) { console.error(e); }
                      }}
                      onInputChange={(value) => {
                        try {
                          setFormData((prev) => ({
                            ...prev,
                            propertyAddress: value,
                            listingTitle: value // Sync listing title
                          }));
                        } catch {
                          // ignore input errors
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-sm font-medium">Property Type</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                      <SelectTrigger className="h-9 w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="one-bed-room-share-cando">Shared 1-Bed Condo</SelectItem>
                        <SelectItem value="two-bed-room-share-cando">Shared 2-Bed Condo</SelectItem>
                        <SelectItem value="entire-one-bed-room-cando">Entire 1-Bed Condo</SelectItem>
                        <SelectItem value="entire-two-bed-room-cando">Entire 2-Bed Condo</SelectItem>
                        <SelectItem value="room-from-house">Private Room (House)</SelectItem>
                        <SelectItem value="entire-house">Entire House</SelectItem>
                        <SelectItem value="entire-basement">Entire Basement</SelectItem>
                        <SelectItem value="room-from-basement">Room in Basement</SelectItem>
                        <SelectItem value="shared-room">Shared Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Detected Amenities Section - Moved under Property Address */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Detected Nearby Facilities</Label>
                    {detailedDetection && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 font-medium">
                        ✓ &nbsp;Real-time Data Verified
                      </span>
                    )}
                  </div>

                  {detailedDetection?.detectedAmenities ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Transportation */}
                      {(detailedDetection.detectedAmenities.metro.length > 0 || detailedDetection.detectedAmenities.buses.length > 0) && (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <Train className="h-4 w-4" />
                            <h4 className="font-semibold text-sm">Transportation</h4>
                          </div>
                          <div className="space-y-2">
                            {detailedDetection.detectedAmenities.metro.slice(0, 2).map((item, i) => (
                              <div key={`metro-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-700 truncate">
                                  {item.name} {item.line ? <span className="text-slate-500 font-normal">({item.line})</span> : null}
                                </span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                            {detailedDetection.detectedAmenities.buses.slice(0, 3).map((item, i) => (
                              <div key={`bus-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="text-slate-600 truncate">{item.name} {item.routeNumber !== 'Transit' ? `(${item.routeNumber})` : ''}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shopping & Banking */}
                      {(detailedDetection.detectedAmenities.shoppingMalls.length > 0 || detailedDetection.detectedAmenities.plazas.length > 0 || detailedDetection.detectedAmenities.banks.length > 0) && (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 text-emerald-700 mb-2">
                            <ShoppingBag className="h-4 w-4" />
                            <h4 className="font-semibold text-sm">Shopping & Services</h4>
                          </div>
                          <div className="space-y-2">
                            {[...detailedDetection.detectedAmenities.shoppingMalls, ...detailedDetection.detectedAmenities.plazas].slice(0, 3).map((item, i) => (
                              <div key={`shop-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                            {detailedDetection.detectedAmenities.banks.slice(0, 2).map((item, i) => (
                              <div key={`bank-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="text-slate-600 truncate">{item.name}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education & Health */}
                      {(detailedDetection.detectedAmenities.schools.length > 0 || detailedDetection.detectedAmenities.hospitals.length > 0) && (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 text-red-700 mb-2">
                            <GraduationCap className="h-4 w-4" />
                            <h4 className="font-semibold text-sm">Health & Education</h4>
                          </div>
                          <div className="space-y-2">
                            {detailedDetection.detectedAmenities.hospitals.slice(0, 2).map((item, i) => (
                              <div key={`health-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                            {detailedDetection.detectedAmenities.schools.slice(0, 3).map((item, i) => (
                              <div key={`school-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="text-slate-600 truncate">{item.name}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lifestyle: Parks, Gyms, Restaurants */}
                      {(detailedDetection.detectedAmenities.parks.length > 0 || detailedDetection.detectedAmenities.gyms.length > 0 || detailedDetection.detectedAmenities.restaurants.length > 0) && (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 text-orange-700 mb-2">
                            <Coffee className="h-4 w-4" />
                            <h4 className="font-semibold text-sm">Lifestyle</h4>
                          </div>
                          <div className="space-y-2">
                            {[...detailedDetection.detectedAmenities.parks, ...detailedDetection.detectedAmenities.gyms].slice(0, 3).map((item, i) => (
                              <div key={`life-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                            {detailedDetection.detectedAmenities.restaurants.slice(0, 3).map((item, i) => (
                              <div key={`rest-${i}`} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="text-slate-600 truncate">{item.name}</span>
                                <span className="text-slate-500 whitespace-nowrap ml-2">{formatDistance(item.distance)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">
                        Enter a valid property address above to automatically detect nearby transport, shops, and amenities.
                      </p>
                    </div>
                  )}
                </div>

                {/* Photo Upload - Full Width Standard Panel */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Property Photos</Label>
                  {currentUserId && (
                    <ImageUpload
                      propertyId="temp"
                      userId={currentUserId}
                      images={formData.images}
                      onImagesChange={(newImages) => {
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      maxImages={10}
                    />
                  )}
                </div>

                {/* 3D Generation Section - Only if images exist */}
                {(formData.images && formData.images.length > 0) && (
                  <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Box className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-indigo-900">AI 3D Model Generator</h3>
                          <p className="text-xs text-indigo-600">Create a 3D walkthrough from your photos</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={isGenerating3D || !!formData.threeDModelUrl}
                        onClick={async () => {
                          setIsGenerating3D(true);
                          try {
                            const imagesFor3D = existingImageUrls.length > 0 ? existingImageUrls : (formData.images as string[]);
                            const modelUrl = await ai3DService.generate3DModel(imagesFor3D, editId || 'new');
                            setFormData(prev => ({ ...prev, threeDModelUrl: modelUrl }));
                            toast.success("3D Model attached! (Simulated)");
                          } catch (e) {
                            toast.error("Failed to generate 3D model");
                          } finally {
                            setIsGenerating3D(false);
                          }
                        }}
                      >
                        {isGenerating3D ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Meshing...
                          </>
                        ) : formData.threeDModelUrl ? (
                          <>
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Ready
                          </>
                        ) : (
                          <>
                            <Box className="mr-2 h-3 w-3" />
                            Generate 3D
                          </>
                        )}
                      </Button>
                    </div>
                    {formData.threeDModelUrl && (
                      <div className="mt-4 border rounded-lg bg-slate-50 overflow-hidden">
                        <div className="p-2 border-b bg-white flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-700">Preview 3D Model</span>
                          <span className="text-[10px] text-slate-500">Interact to rotate</span>
                        </div>
                        <div className="w-full h-64 relative bg-gray-100">
                          <model-viewer
                            src={formData.threeDModelUrl}
                            ios-src=""
                            alt="A 3D model of the property"
                            heading="Property 3D Model"
                            interaction-prompt="auto"
                            auto-rotate
                            camera-controls
                            ar
                            shadow-intensity="1"
                            touch-action="pan-y"
                            style={{ width: '100%', height: '100%', backgroundColor: '#f0f4f8', display: 'block' }}
                          >
                          </model-viewer>
                        </div>
                        <div className="p-2 bg-yellow-50 text-xs text-center text-yellow-800 font-medium border-t border-yellow-100 flex flex-col gap-1">
                          <span>✓ Model attached to listing (Simulation)</span>
                          <span className="text-[10px] text-yellow-600 opacity-80">
                            * Note: Creating a real 3D mesh from 2D images requires a heavy GPU-based API (e.g., CSM.ai, Luma).
                            This preview demonstrates the interactive viewer capability with a sample model.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Video Tour Section */}
                {(formData.images && formData.images.length > 0) && (
                  <div className="mt-4 p-4 border border-pink-100 bg-pink-50/50 rounded-xl transition-all duration-500">
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-6">

                      {/* Left: Title & Info */}
                      <div className="flex items-center gap-3 shrink-0 xl:w-1/4 self-start xl:self-center">
                        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                          <Film className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-pink-900">AI Video Tour</h3>
                          <p className="text-[10px] text-pink-600">Showcase with voiceover</p>
                        </div>
                      </div>

                      {/* Center: Video Preview Area */}
                      {/* Center: Video Preview Area */}
                      <div className={`flex-grow w-full max-w-lg mx-auto bg-white/50 rounded-lg border border-pink-100 flex items-center justify-center overflow-hidden shadow-sm relative ${isVideoReady ? '' : 'h-48'}`}>
                        {isVideoReady ? (
                          <div className="w-full">
                            <PropertyVideoPlayer
                              images={existingImageUrls.length > 0 ? existingImageUrls : (formData.images as string[]) || []}
                              audioUrl={formData.descriptionAudioUrl || undefined}
                              script={includeAudio ? videoScript : undefined} // Controlled by checkbox
                              musicUrl={selectedMusic || undefined}
                              address={formData.propertyAddress}
                              price={formData.monthlyRent}
                              amenities={[]}
                              autoPlay={false}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-pink-300 gap-2">
                            <Film className="h-10 w-10 opacity-30" />
                            <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">Preview Area</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Controls */}
                      <div className="flex flex-col gap-3 shrink-0 xl:w-1/4 items-end w-full pl-4 border-l border-pink-100/50">

                        {/* Tour Settings */}
                        <div className="flex flex-col gap-2 w-full xl:w-[160px] mb-1 p-2 bg-pink-50/50 rounded-lg border border-pink-100/50">
                          <span className="text-[10px] font-bold text-pink-900 uppercase tracking-wide mb-1">Tour Configuration</span>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="show-video"
                              checked={includeVideo}
                              onCheckedChange={(c) => setIncludeVideo(!!c)}
                              className="h-3 w-3 border-pink-300 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                            />
                            <label htmlFor="show-video" className="text-[10px] font-medium text-pink-700 cursor-pointer select-none">
                              Visual Tour
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="enable-voice"
                              checked={includeAudio}
                              onCheckedChange={(c) => setIncludeAudio(!!c)}
                              className="h-3 w-3 border-pink-300 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                            />
                            <label htmlFor="enable-voice" className="text-[10px] font-medium text-pink-700 cursor-pointer select-none">
                              Sales Voice Agent
                            </label>
                          </div>
                        </div>

                        <Select value={selectedMusic || ""} onValueChange={setSelectedMusic}>
                          <SelectTrigger className="w-full xl:w-[160px] h-8 text-[10px] bg-white border-pink-200 shadow-sm focus:ring-pink-200">
                            <SelectValue placeholder="Select Vibe 🎵" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">Uplifting Vibe</SelectItem>
                            <SelectItem value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3">Chill Lo-Fi</SelectItem>
                            <SelectItem value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">Cinematic</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          size="sm"
                          className={`w-full xl:w-[160px] h-9 text-xs shadow-pink-200 shadow-md ${isVideoReady
                            ? "bg-white text-pink-600 border border-pink-200 hover:bg-pink-50"
                            : "bg-pink-600 hover:bg-pink-700 text-white"
                            }`}
                          disabled={isGeneratingVideo}
                          onClick={async () => {
                            if (isVideoReady) {
                              setIsVideoReady(false);
                            }
                            setIsGeneratingVideo(true);
                            try {
                              // Generate conversational script locally
                              const script = aiDescriptionService.generatePodcastScript({
                                address: formData.propertyAddress,
                                propertyType: formData.propertyType || "Property",
                                monthlyRent: formData.monthlyRent,
                                bedrooms: "1",
                                bathrooms: "1",
                                amenities: formData.amenities,
                                nearbyAmenities: formData.nearbyAmenities || [],
                                images: existingImageUrls,
                                detailedDetection: detailedDetection?.detectedAmenities || undefined
                              });
                              setVideoScript(script);

                              const result = await aiVideoService.generateVideo(editId || 'new');
                              if (result.status === 'ready') {
                                setIsVideoReady(true);
                                toast.success("Video generated!");
                              }
                            } catch (e) {
                              toast.error("Generation failed");
                            } finally {
                              setIsGeneratingVideo(false);
                            }
                          }}
                        >
                          {isGeneratingVideo ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Creating...
                            </>
                          ) : isVideoReady ? (
                            <>
                              <CheckCircle className="mr-2 h-3 w-3" />
                              Regenerate Video
                            </>
                          ) : (
                            <>
                              <Film className="mr-2 h-3 w-3" />
                              Generate Video
                            </>
                          )}
                        </Button>

                        {isVideoReady && (
                          <p className="text-[10px] text-pink-400 text-right w-full pr-1">
                            Video ready for listing
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* Map Visualization (if available) */}
                {formData.latitude && (
                  <div className="h-[200px] rounded-md border overflow-hidden">
                    <PropertyMap
                      center={{ lat: formData.latitude, lng: formData.longitude! }}
                      selectedAddress={formData.propertyAddress}
                      className="w-full h-full"
                      facilityMarker={selectedFacility}
                    />
                  </div>
                )}


              </div>
            </section>

            {/* SECTION 3: Features & Amenities */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
                <h3 className="text-lg font-semibold text-gray-800">Features & Amenities</h3>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Property Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        className="h-4 w-4 rounded bg-white"
                      />
                      <Label htmlFor={amenity} className="text-xs font-normal cursor-pointer">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="parking" className="text-sm font-medium">Parking</Label>
                  <Select value={formData.parking} onValueChange={(value) => handleInputChange("parking", value)}>
                    <SelectTrigger className="h-9 border-gray-300 shadow-sm focus:border-blue-500">
                      <SelectValue placeholder="Select parking" />
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

                <div className="space-y-2">
                  <Label htmlFor="petPolicy" className="text-sm font-medium">Pet Policy</Label>
                  <Select value={formData.petPolicy} onValueChange={(value) => handleInputChange("petPolicy", value)}>
                    <SelectTrigger className="h-9 border-gray-300 shadow-sm focus:border-blue-500">
                      <SelectValue placeholder="Select policy" />
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium block mb-2">Utilities Included</Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {["Water", "Electricity", "Gas", "Internet"].map((utility) => (
                      <div key={utility} className="flex items-center space-x-2">
                        <Checkbox
                          id={utility}
                          checked={formData.utilitiesIncluded.includes(utility)}
                          onCheckedChange={(checked) => handleArrayChange("utilitiesIncluded", utility, checked as boolean)}
                          className="h-4 w-4 bg-white"
                        />
                        <Label htmlFor={utility} className="text-xs font-normal">{utility}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: Rental/Sales Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">4</div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {formData.listingCategory === 'sale' ? 'Sales Information' : 'Rental Information'}
                </h3>
              </div>

              {formData.listingCategory === 'sale' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salesPrice" className="text-sm font-medium">Sales Price ($)</Label>
                    <Input
                      id="salesPrice"
                      placeholder="0.00"
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) => handleInputChange("salesPrice", e.target.value)}
                      className="h-9 border-gray-300 shadow-sm focus:border-blue-500"
                    />
                    {errors.salesPrice && <p className="text-xs text-red-500 font-medium">{errors.salesPrice}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableDate" className="text-sm font-medium">Available Date</Label>
                    <Input
                      id="availableDate"
                      type="date"
                      value={formData.availableDate}
                      onChange={(e) => handleInputChange("availableDate", e.target.value)}
                      className="h-9 border-gray-300 shadow-sm focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="downpaymentTarget" className="text-sm font-medium">Downpayment Target ($)</Label>
                    <Input
                      id="downpaymentTarget"
                      placeholder="0.00"
                      type="number"
                      value={formData.downpaymentTarget}
                      onChange={(e) => handleInputChange("downpaymentTarget", e.target.value)}
                      className="h-9 border-gray-300 shadow-sm focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRent" className="text-sm font-medium">Monthly Rent ($)</Label>
                      <Input
                        id="monthlyRent"
                        placeholder="0.00"
                        type="number"
                        value={formData.monthlyRent}
                        onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
                        className="h-9 border-gray-300 shadow-sm focus:border-blue-500"
                      />
                      {errors.monthlyRent && <p className="text-xs text-red-500 font-medium">{errors.monthlyRent}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="securityDeposit" className="text-sm font-medium">Security Deposit ($)</Label>
                      <Input
                        id="securityDeposit"
                        placeholder="0.00"
                        type="number"
                        value={formData.securityDeposit}
                        onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                        className="h-9 border-gray-300 shadow-sm focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="leaseTerms" className="text-sm font-medium">Lease Terms</Label>
                      <Select value={formData.leaseTerms} onValueChange={(value) => handleInputChange("leaseTerms", value)}>
                        <SelectTrigger className="h-9 border-gray-300 shadow-sm focus:border-blue-500">
                          <SelectValue placeholder="Select terms" />
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

                    <div className="space-y-2">
                      <Label htmlFor="availableDate" className="text-sm font-medium">Available Date</Label>
                      <Input
                        id="availableDate"
                        type="date"
                        value={formData.availableDate}
                        onChange={(e) => handleInputChange("availableDate", e.target.value)}
                        className="h-9 border-gray-300 shadow-sm focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="furnished" className="text-sm font-medium">Furnishing</Label>
                      <Select value={formData.furnished} onValueChange={(value) => handleInputChange("furnished", value)}>
                        <SelectTrigger className="h-9 border-gray-300 shadow-sm focus:border-blue-500">
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
                </>
              )}

              {/* Description inside Rental Info or Separate? Separate is better */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description" className="text-sm font-medium">Property Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    onClick={async () => {
                      setIsGeneratingDescription(true);
                      try {
                        const description = await aiDescriptionService.generateDescription({
                          address: formData.propertyAddress,
                          propertyType: formData.propertyType,
                          monthlyRent: formData.monthlyRent,
                          bedrooms: '0',
                          bathrooms: '0',
                          amenities: formData.amenities,
                          nearbyAmenities: formData.nearbyAmenities || [],
                          detailedDetection: detailedDetection?.detectedAmenities,
                          images: formData.images || []
                        });

                        setFormData(prev => ({
                          ...prev,
                          description: description
                        }));
                        toast.success("✨ Description generated by AI!");
                      } catch (error) {
                        toast.error("Failed to generate description");
                      } finally {
                        setIsGeneratingDescription(false);
                      }
                    }}
                    disabled={isGeneratingDescription || !formData.propertyAddress}
                  >
                    {isGeneratingDescription ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-3 w-3" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>

                <Textarea
                  id="description"
                  placeholder="Describe your property details... (Click 'Generate with AI' to get a head start!)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[150px] text-sm border-gray-300 shadow-sm focus:border-blue-500"
                />

                {/* Audio Description Section */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Sales Voice Agent</p>
                        <p className="text-xs text-slate-500">Generate an AI-narrated tour of this listing</p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                      disabled={isGeneratingAudio || !formData.description}
                      onClick={async () => {
                        setIsGeneratingAudio(true);
                        try {
                          const audioUrl = await aiDescriptionService.generateAudioDescription(
                            formData.description,
                            editId || currentUserId || 'temp-id'
                          );

                          if (audioUrl === 'local-tts-preview') {
                            setHasLocalAudioPreview(true);
                            toast.info("🔊 Playing preview with local voice. Deploy backend for premium AI voice.");
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              descriptionAudioUrl: audioUrl
                            }));
                            setHasLocalAudioPreview(false);
                            toast.success("🎙️ Voice description generated!");
                          }
                        } catch (error) {
                          toast.error("Failed to generate voice description");
                        } finally {
                          setIsGeneratingAudio(false);
                        }
                      }}
                    >

                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Generating Voice...
                        </>
                      ) : hasLocalAudioPreview ? (
                        <>
                          <Volume2 className="mr-2 h-3 w-3" />
                          Replay Preview
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-3 w-3" />
                          Generate Voice
                        </>
                      )}
                    </Button>

                    {hasLocalAudioPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
                        onClick={() => {
                          window.speechSynthesis.cancel();
                          toast.info("Stopped audio preview");
                        }}
                      >
                        <Square className="mr-2 h-3 w-3 fill-current" />
                        Stop
                      </Button>
                    )}
                  </div>

                  {formData.descriptionAudioUrl && (
                    <div className="bg-white border rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">My Property Voice Tour:</p>
                      <audio controls className="w-full h-8">
                        <source src={formData.descriptionAudioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 5: Additional Details */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">5</div>
                <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="roommatePreference" className="text-sm font-medium">{dynamicText.label.replace(/\*\*\d+\.\*\*\s*/, '')}</Label>
                  <Select value={formData.roommatePreference} onValueChange={(value) => handleInputChange("roommatePreference", value)}>
                    <SelectTrigger className="h-9 border-gray-300 shadow-sm focus:border-blue-500">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions" className="text-sm font-medium">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any additional notes..."
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  className="min-h-[80px] text-sm border-gray-300 shadow-sm focus:border-blue-500"
                />
              </div>
            </section>

            {/* Submit Action */}
            <div className="pt-6 mt-6 border-t flex justify-end">
              <Button
                onClick={handleSubmit}
                className="px-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                size="default"
              >
                {editId ? 'Save Changes' : 'Create Listing'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/landlord/properties")} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Add New Property</h1>
              <p className="text-sm text-muted-foreground">{editId ? 'Edit your property listing' : 'Fill out the details to list your property'}</p>
            </div>
          </div>
          {!editId && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="text-xs"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              Reset Form
            </Button>
          )}
        </div>

        {/* Form Content */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Home className="h-5 w-5 text-primary" />
              Property Details
            </CardTitle>
            <CardDescription className="text-sm">
              Enter the comprehensive details of your rental property below.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}