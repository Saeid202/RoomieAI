import { supabase } from '@/integrations/supabase/client';

export interface CreateWorkExchangeOfferData {
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
  images: string[];
  contactPreference: string;
}

export interface WorkExchangeOffer {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

class WorkExchangeServiceSimple {
  /**
   * Create a new work exchange offer - simplified version
   */
  async createWorkExchangeOffer(data: CreateWorkExchangeOfferData) {
    try {
      console.log("Starting work exchange offer creation...");
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error('User must be authenticated to create a work exchange offer');
      }

      console.log("User authenticated:", user.id);

      // Fetch user profile to get real name
      let userName = 'Anonymous';
      let userEmail = user.email || '';
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          // Use profile data if available
          userName = profile.full_name || 'Anonymous';
          userEmail = profile.email || user.email || '';
        } else {
          // Fallback to user metadata
          userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Anonymous';
        }
      } catch (error) {
        console.log("Could not fetch profile, using metadata:", error);
        userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Anonymous';
      }

      console.log("Using user name:", userName);

      // Generate a title from the work requested and space type
      const generatedTitle = `${data.workRequested} - ${data.spaceType.replace('-', ' ')} in ${data.city}`;

      // Prepare data for database
      const offerData: any = {
        user_id: user.id,
        created_by: user.id, // Required by database - set to user_id
        user_name: userName,
        user_email: userEmail,
        title: generatedTitle, // Required by database
        space_type: data.spaceType,
        work_requested: data.workRequested,
        duration: data.duration,
        work_hours_per_week: data.workHoursPerWeek,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode || null,
        amenities_provided: data.amenitiesProvided || [],
        additional_notes: data.additionalNotes?.trim() || null,
        images: data.images || [],
        contact_preference: data.contactPreference,
        status: 'active'
      };

      console.log("Prepared offer data:", offerData);

      // Insert into database
      const { data: result, error: insertError } = await supabase
        .from('work_exchange_offers' as any)
        .insert(offerData)
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }

      console.log("Successfully created work exchange offer:", result);
      return result;
    } catch (error) {
      console.error('Error creating work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Fetch work exchange offers from CURRENT USER only
   */
  async fetchUserOffers(): Promise<WorkExchangeOffer[]> {
    try {
      console.log("Fetching current user's work exchange offers...");
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error("User must be authenticated to fetch work exchange offers");
      }

      console.log("Current user ID:", user.id);

      // Fetch offers from CURRENT USER only
      const { data: offers, error: fetchError } = await supabase
        .from("work_exchange_offers" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Database fetch error:", fetchError);
        throw fetchError;
      }

      console.log("Fetched user's offers:", offers);

      // Map database results to interface
      const mappedOffers: WorkExchangeOffer[] = offers.map((offer: any) => ({
        id: offer.id,
        userId: offer.user_id,
        userName: offer.user_name || 'Anonymous',
        userEmail: offer.user_email,
        spaceType: offer.space_type,
        workRequested: offer.work_requested,
        duration: offer.duration,
        workHoursPerWeek: offer.work_hours_per_week,
        address: offer.address,
        city: offer.city,
        state: offer.state,
        zipCode: offer.zip_code,
        amenitiesProvided: offer.amenities_provided || [],
        additionalNotes: offer.additional_notes,
        contactPreference: offer.contact_preference,
        status: offer.status,
        createdAt: offer.created_at,
        updatedAt: offer.updated_at
      }));

      return mappedOffers;
    } catch (error) {
      console.error("Error fetching user's work exchange offers:", error);
      throw error;
    }
  }

  /**
   * Update an existing work exchange offer
   */
  async updateWorkExchangeOffer(offerId: string, data: CreateWorkExchangeOfferData) {
    try {
      console.log("Updating work exchange offer:", offerId);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error('User must be authenticated to update a work exchange offer');
      }

      // Prepare data for database
      const updateData = {
        space_type: data.spaceType,
        work_requested: data.workRequested,
        duration: data.duration,
        work_hours_per_week: data.workHoursPerWeek,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        amenities_provided: data.amenitiesProvided,
        additional_notes: data.additionalNotes,
        contact_preference: data.contactPreference,
        updated_at: new Date().toISOString()
      };

      console.log("Prepared update data:", updateData);

      // Update in database
      const { data: result, error: updateError } = await supabase
        .from('work_exchange_offers' as any)
        .update(updateData)
        .eq('id', offerId)
        .eq('user_id', user.id) // Ensure user can only update their own offers
        .select()
        .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      console.log("Successfully updated work exchange offer:", result);
      return result;
    } catch (error) {
      console.error('Error updating work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Delete a work exchange offer
   */
  async deleteWorkExchangeOffer(offerId: string) {
    try {
      console.log("Deleting work exchange offer:", offerId);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error('User must be authenticated to delete a work exchange offer');
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('work_exchange_offers' as any)
        .delete()
        .eq('id', offerId)
        .eq('user_id', user.id); // Ensure user can only delete their own offers

      if (deleteError) {
        console.error("Database delete error:", deleteError);
        throw deleteError;
      }

      console.log("Successfully deleted work exchange offer:", offerId);
      return true;
    } catch (error) {
      console.error('Error deleting work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Fetch work exchange offers from OTHER users only (exclude current user's offers)
   */
  async fetchAllOffers(): Promise<WorkExchangeOffer[]> {
    try {
      console.log("Fetching work exchange offers from other users...");
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error("User must be authenticated to fetch work exchange offers");
      }

      console.log("Current user ID:", user.id);

      // Fetch active offers from OTHER users only (exclude current user)
      const { data: offers, error: fetchError } = await supabase
        .from("work_exchange_offers" as any)
        .select("*")
        .eq("status", "active")
        .neq("user_id", user.id) // Exclude current user's offers
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Database fetch error:", fetchError);
        throw fetchError;
      }

      console.log("Fetched offers from other users:", offers);

      // Map database results to interface
      const mappedOffers: WorkExchangeOffer[] = offers.map((offer: any) => ({
        id: offer.id,
        userId: offer.user_id,
        userName: offer.user_name || 'Anonymous',
        userEmail: offer.user_email,
        spaceType: offer.space_type,
        workRequested: offer.work_requested,
        duration: offer.duration,
        workHoursPerWeek: offer.work_hours_per_week,
        address: offer.address,
        city: offer.city,
        state: offer.state,
        zipCode: offer.zip_code,
        amenitiesProvided: offer.amenities_provided || [],
        additionalNotes: offer.additional_notes,
        contactPreference: offer.contact_preference,
        status: offer.status,
        createdAt: offer.created_at,
        updatedAt: offer.updated_at
      }));

      return mappedOffers;
    } catch (error) {
      console.error("Error fetching work exchange offers from other users:", error);
      throw error;
    }
  }
}

export const workExchangeServiceSimple = new WorkExchangeServiceSimple();