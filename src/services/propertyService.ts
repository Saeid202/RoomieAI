
import { supabase } from "@/integrations/supabase/client";

export type PropertyType = 'rent' | 'sale';

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
      owner_id: user.user.id
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
    ownerId: dbProperty.owner_id
  };
}
