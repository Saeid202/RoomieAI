
import { supabase } from "@/integrations/supabase/client";

export type PropertyType = 'rent' | 'sale';
export type AmenityType = string;

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  imageUrls: string[];
  createdAt: string;
  ownerId: string;
  squareFeet?: number;
  yearBuilt?: number;
  amenities?: AmenityType[];
  petPolicy?: string;
  utilities?: string[];
  furnishedStatus?: string;
  availability?: string;
  virtualTourUrl?: string;
  parkingType?: string;
  lotSize?: number;
  // Developer specific fields
  propertyStatus?: string;
  developerName?: string;
  developmentName?: string;
  totalUnits?: number;
  communityAmenities?: string[];
  constructionMaterials?: string;
  energyEfficiencyFeatures?: string[];
  neighborhood?: string;
  schoolDistrict?: string;
  nearbyAmenities?: string[];
  neighborhoodDescription?: string;
  basePrice?: number;
  pricePerSqFt?: number;
  hoaFees?: number;
  propertyTaxRate?: number;
  financingOptions?: string[];
  downPaymentMin?: number;
  closingCostEstimate?: number;
}

export async function createProperty(property: Omit<Property, 'id' | 'createdAt' | 'ownerId'>) {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('You must be logged in to create a property');
  }
  
  const { data, error } = await supabase
    .from('properties')
    .insert({
      title: property.title,
      description: property.description,
      address: property.address,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      property_type: property.propertyType,
      image_urls: property.imageUrls,
      owner_id: user.user.id,
      square_feet: property.squareFeet,
      year_built: property.yearBuilt,
      amenities: property.amenities,
      pet_policy: property.petPolicy,
      utilities: property.utilities,
      furnished_status: property.furnishedStatus,
      availability: property.availability,
      virtual_tour_url: property.virtualTourUrl,
      parking_type: property.parkingType,
      lot_size: property.lotSize,
      // Developer specific fields
      property_status: property.propertyStatus,
      developer_name: property.developerName,
      development_name: property.developmentName,
      total_units: property.totalUnits,
      community_amenities: property.communityAmenities,
      construction_materials: property.constructionMaterials,
      energy_efficiency_features: property.energyEfficiencyFeatures,
      neighborhood: property.neighborhood,
      school_district: property.schoolDistrict,
      nearby_amenities: property.nearbyAmenities,
      neighborhood_description: property.neighborhoodDescription,
      base_price: property.basePrice,
      price_per_sqft: property.pricePerSqFt,
      hoa_fees: property.hoaFees,
      property_tax_rate: property.propertyTaxRate,
      financing_options: property.financingOptions,
      down_payment_min: property.downPaymentMin,
      closing_cost_estimate: property.closingCostEstimate
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }
  
  return mapPropertyFromDB(data);
}

export async function getPropertiesByOwnerId() {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.user.id);
  
  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
  
  return data ? data.map(mapPropertyFromDB) : [];
}

// Helper function to map database column names to our frontend property interface
function mapPropertyFromDB(dbProperty: any): Property {
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    address: dbProperty.address,
    price: dbProperty.price,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    propertyType: dbProperty.property_type as PropertyType,
    imageUrls: dbProperty.image_urls || [],
    createdAt: dbProperty.created_at,
    ownerId: dbProperty.owner_id,
    squareFeet: dbProperty.square_feet,
    yearBuilt: dbProperty.year_built,
    amenities: dbProperty.amenities,
    petPolicy: dbProperty.pet_policy,
    utilities: dbProperty.utilities,
    furnishedStatus: dbProperty.furnished_status,
    availability: dbProperty.availability,
    virtualTourUrl: dbProperty.virtual_tour_url,
    parkingType: dbProperty.parking_type,
    lotSize: dbProperty.lot_size,
    // Developer specific fields
    propertyStatus: dbProperty.property_status,
    developerName: dbProperty.developer_name,
    developmentName: dbProperty.development_name,
    totalUnits: dbProperty.total_units,
    communityAmenities: dbProperty.community_amenities,
    constructionMaterials: dbProperty.construction_materials,
    energyEfficiencyFeatures: dbProperty.energy_efficiency_features,
    neighborhood: dbProperty.neighborhood,
    schoolDistrict: dbProperty.school_district,
    nearbyAmenities: dbProperty.nearby_amenities,
    neighborhoodDescription: dbProperty.neighborhood_description,
    basePrice: dbProperty.base_price,
    pricePerSqFt: dbProperty.price_per_sqft,
    hoaFees: dbProperty.hoa_fees,
    propertyTaxRate: dbProperty.property_tax_rate,
    financingOptions: dbProperty.financing_options,
    downPaymentMin: dbProperty.down_payment_min,
    closingCostEstimate: dbProperty.closing_cost_estimate
  };
}

// New function to upload property images
export async function uploadPropertyImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `properties/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Common amenities options for properties
export const COMMON_AMENITIES = [
  'Air Conditioning', 'Heating', 'Washer/Dryer', 'Dishwasher', 
  'Refrigerator', 'Microwave', 'Oven', 'Stove', 'Balcony/Patio',
  'Pool', 'Gym', 'Elevator', 'Security System', 'Wheelchair Accessible',
  'High-Speed Internet', 'Cable TV', 'Fireplace', 'Hardwood Floors'
];

// Common utilities that might be included
export const COMMON_UTILITIES = [
  'Water', 'Electricity', 'Gas', 'Internet', 'Cable TV', 'Trash'
];

// Common parking options
export const PARKING_OPTIONS = [
  'Street Parking', 'Garage', 'Driveway', 'Carport', 'Assigned Spot', 'No Parking'
];

// Common furnished status options
export const FURNISHED_OPTIONS = [
  'Furnished', 'Partially Furnished', 'Unfurnished'
];

// Common pet policy options
export const PET_POLICY_OPTIONS = [
  'No Pets Allowed', 'Cats Allowed', 'Dogs Allowed', 'Small Pets Only', 'All Pets Welcome', 'Case by Case'
];
