
// Import the original Supabase client that has access to all tables
import { createClient } from "@supabase/supabase-js";

// Create a client with full access for property operations
const supabaseUrl = "https://yxppcpzqqolvkpzxuqfp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cHBjcHpxcW9sdmtwenh1cWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDMzMzksImV4cCI6MjA2NjYxOTMzOX0.Lv4nPWSiqL_cK9trxSjfWWbjrDEPeU501_AW5M-k3dc";

const supabaseClient = createClient(supabaseUrl, supabaseKey);

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  amenities: string[];
  available_date: string;
  property_type: string;
  lease_term: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
  console.log("Creating property:", propertyData);
  
  try {
    // Note: This assumes a 'properties' table exists. 
    // If it doesn't exist, this will gracefully fail with an error message
    const { data, error } = await supabaseClient
      .from('properties')
      .insert({
        ...propertyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating property:", error);
      throw new Error(`Failed to create property: ${error.message}`);
    }

    console.log("Property created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createProperty:", error);
    throw error;
  }
}

export async function fetchProperties(filters?: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  property_type?: string;
}) {
  console.log("Fetching properties with filters:", filters);
  
  try {
    let query = supabaseClient.from('properties').select('*');

    if (filters) {
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching properties:", error);
      // If properties table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.log("Properties table doesn't exist yet, returning empty array");
        return [];
      }
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    console.log("Properties fetched successfully:", data);
    return data || [];
  } catch (error) {
    console.error("Error in fetchProperties:", error);
    // Return empty array if table doesn't exist or other error
    return [];
  }
}

export async function fetchPropertyById(id: string) {
  console.log("Fetching property by ID:", id);
  
  try {
    const { data, error } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    console.log("Property fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchPropertyById:", error);
    throw error;
  }
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  console.log("Updating property:", id, updates);
  
  try {
    const { data, error } = await supabaseClient
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating property:", error);
      throw new Error(`Failed to update property: ${error.message}`);
    }

    console.log("Property updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in updateProperty:", error);
    throw error;
  }
}

export async function deleteProperty(id: string) {
  console.log("Deleting property:", id);
  
  try {
    const { error } = await supabaseClient
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting property:", error);
      throw new Error(`Failed to delete property: ${error.message}`);
    }

    console.log("Property deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProperty:", error);
    throw error;
  }
}
