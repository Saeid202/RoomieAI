import { supabase } from "@/integrations/supabase/client";

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
  images: string[];
  contactPreference: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

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

export interface WorkExchangeFilters {
  location?: string;
  spaceType?: string;
  duration?: string;
  amenities?: string[];
  status?: string;
}

class WorkExchangeService {
  /**
   * Create a new work exchange offer
   */
  async createWorkExchangeOffer(data: CreateWorkExchangeOfferData): Promise<WorkExchangeOffer> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to create a work exchange offer');
      }

      // Get user profile information - handle case where profiles table might not exist
      let userName = 'Anonymous';
      let userEmail = user.email || '';

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          userName = profile.full_name || 'Anonymous';
          userEmail = profile.email || user.email || '';
        }
      } catch (profileError) {
        console.log('Profiles table not found or user profile not available, using auth user data');
        userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Anonymous';
        userEmail = user.email || '';
      }

      const offerData = {
        user_id: user.id,
        user_name: userName,
        user_email: userEmail,
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
        images: data.images,
        contact_preference: data.contactPreference,
        status: 'active'
      };

      console.log('Attempting to insert work exchange offer:', offerData);

      const { data: result, error } = await supabase
        .from('work_exchange_offers')
        .insert(offerData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Successfully created work exchange offer:', result);
      return this.mapDatabaseToOffer(result);
    } catch (error) {
      console.error('Error creating work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Fetch all work exchange offers with optional filters
   */
  async fetchWorkExchangeOffers(filters?: WorkExchangeFilters): Promise<WorkExchangeOffer[]> {
    try {
      let query = supabase
        .from('work_exchange_offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.location) {
        query = query.or(`city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      if (filters?.spaceType) {
        query = query.eq('space_type', filters.spaceType);
      }

      if (filters?.duration) {
        query = query.ilike('duration', `%${filters.duration}%`);
      }

      if (filters?.amenities && filters.amenities.length > 0) {
        query = query.overlaps('amenities_provided', filters.amenities);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(offer => this.mapDatabaseToOffer(offer));
    } catch (error) {
      console.error('Error fetching work exchange offers:', error);
      throw error;
    }
  }

  /**
   * Fetch work exchange offers created by the current user
   */
  async fetchUserOffers(): Promise<WorkExchangeOffer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase
        .from('work_exchange_offers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(offer => this.mapDatabaseToOffer(offer));
    } catch (error) {
      console.error('Error fetching user work exchange offers:', error);
      throw error;
    }
  }

  /**
   * Update an existing work exchange offer
   */
  async updateWorkExchangeOffer(id: string, data: Partial<CreateWorkExchangeOfferData>): Promise<WorkExchangeOffer> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Verify ownership
      const { data: existingOffer } = await supabase
        .from('work_exchange_offers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existingOffer || existingOffer.user_id !== user.id) {
        throw new Error('You can only update your own work exchange offers');
      }

      const updateData: any = {};
      
      if (data.spaceType) updateData.space_type = data.spaceType;
      if (data.workRequested) updateData.work_requested = data.workRequested;
      if (data.duration) updateData.duration = data.duration;
      if (data.workHoursPerWeek) updateData.work_hours_per_week = data.workHoursPerWeek;
      if (data.address) updateData.address = data.address;
      if (data.city) updateData.city = data.city;
      if (data.state) updateData.state = data.state;
      if (data.zipCode) updateData.zip_code = data.zipCode;
      if (data.amenitiesProvided) updateData.amenities_provided = data.amenitiesProvided;
      if (data.additionalNotes) updateData.additional_notes = data.additionalNotes;
      if (data.images) updateData.images = data.images;
      if (data.contactPreference) updateData.contact_preference = data.contactPreference;

      const { data: result, error } = await supabase
        .from('work_exchange_offers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToOffer(result);
    } catch (error) {
      console.error('Error updating work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Delete a work exchange offer
   */
  async deleteWorkExchangeOffer(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Verify ownership
      const { data: existingOffer } = await supabase
        .from('work_exchange_offers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existingOffer || existingOffer.user_id !== user.id) {
        throw new Error('You can only delete your own work exchange offers');
      }

      const { error } = await supabase
        .from('work_exchange_offers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Upload images for work exchange offer
   */
  async uploadWorkExchangeImages(files: File[]): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('work-exchange-images')
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('work-exchange-images')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading work exchange images:', error);
      throw error;
    }
  }

  /**
   * Get work exchange offer by ID
   */
  async getWorkExchangeOffer(id: string): Promise<WorkExchangeOffer | null> {
    try {
      const { data, error } = await supabase
        .from('work_exchange_offers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return this.mapDatabaseToOffer(data);
    } catch (error) {
      console.error('Error fetching work exchange offer:', error);
      throw error;
    }
  }

  /**
   * Map database result to WorkExchangeOffer interface
   */
  private mapDatabaseToOffer(data: any): WorkExchangeOffer {
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      userEmail: data.user_email,
      spaceType: data.space_type,
      workRequested: data.work_requested,
      duration: data.duration,
      workHoursPerWeek: data.work_hours_per_week,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      amenitiesProvided: data.amenities_provided || [],
      additionalNotes: data.additional_notes,
      images: data.images || [],
      contactPreference: data.contact_preference,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const workExchangeService = new WorkExchangeService();
