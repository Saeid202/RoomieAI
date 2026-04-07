// Test Data Service - For debugging property visibility issues
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;

export async function createTestProperties() {
  console.log("🧪 Creating test properties...");

  try {
    // Get landlord user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ No user found");
      return;
    }

    console.log("👤 Current user:", user.id, user.email);

    // Create test properties
    const testProperties = [
      {
        user_id: user.id,
        listing_title: "Beautiful 2BR Downtown Apartment",
        property_type: "apartment",
        listing_category: "rental",
        description: "Spacious 2-bedroom apartment in downtown core with modern amenities",
        address: "123 Main Street",
        city: "Toronto",
        state: "ON",
        zip_code: "M5V 3A8",
        monthly_rent: 1500,
        bedrooms: 2,
        bathrooms: 1,
        status: "active",
        parking: "Street parking",
        pet_policy: "Cats allowed",
        amenities: ["Gym", "Pool", "Parking"],
        images: []
      },
      {
        user_id: user.id,
        listing_title: "Cozy 1BR Studio Near Transit",
        property_type: "studio",
        listing_category: "rental",
        description: "Cozy studio apartment near subway station",
        address: "456 Queen Street",
        city: "Toronto",
        state: "ON",
        zip_code: "M6J 1A1",
        monthly_rent: 1200,
        bedrooms: 1,
        bathrooms: 1,
        status: "active",
        parking: "No parking",
        pet_policy: "No pets",
        amenities: ["Laundry", "Heating included"],
        images: []
      },
      {
        user_id: user.id,
        listing_title: "Spacious 3BR House with Yard",
        property_type: "house",
        listing_category: "rental",
        description: "Large 3-bedroom house with backyard and garage",
        address: "789 King Street",
        city: "Toronto",
        state: "ON",
        zip_code: "M5H 2R2",
        monthly_rent: 2500,
        bedrooms: 3,
        bathrooms: 2,
        status: "active",
        parking: "Garage",
        pet_policy: "Dogs and cats allowed",
        amenities: ["Yard", "Garage", "Basement"],
        images: []
      }
    ];

    console.log("📦 Inserting", testProperties.length, "test properties...");

    const { data, error } = await sb
      .from('properties')
      .insert(testProperties)
      .select();

    if (error) {
      console.error("❌ Error inserting test properties:", error);
      return;
    }

    console.log("✅ Test properties created successfully:", data?.length || 0, "properties");
    console.log("📋 Created properties:", data);

    return data;
  } catch (error) {
    console.error("❌ Exception in createTestProperties:", error);
  }
}

export async function deleteAllProperties() {
  console.log("🗑️ Deleting all properties...");

  try {
    const { data, error } = await sb
      .from('properties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error("❌ Error deleting properties:", error);
      return;
    }

    console.log("✅ All properties deleted");
    return data;
  } catch (error) {
    console.error("❌ Exception in deleteAllProperties:", error);
  }
}

export async function checkPropertiesInDatabase() {
  console.log("🔍 Checking properties in database...");

  try {
    const { data, error } = await sb
      .from('properties')
      .select('id, listing_title, user_id, status, monthly_rent, city')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error checking properties:", error);
      return;
    }

    console.log("✅ Total properties in database:", data?.length || 0);
    if (data && data.length > 0) {
      console.log("📋 Properties:", data);
    }

    return data;
  } catch (error) {
    console.error("❌ Exception in checkPropertiesInDatabase:", error);
  }
}
