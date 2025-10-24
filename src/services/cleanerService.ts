import { supabase } from '@/integrations/supabase/client';

export interface Cleaner {
  id: string;
  name: string;
  company: string;
  rating: number;
  review_count: number;
  services: string[];
  location: string;
  phone?: string;
  email?: string;
  availability?: string;
  hourly_rate?: string;
  description?: string;
  image_url?: string;
  verified: boolean;
  response_time?: string;
  completed_jobs: number;
  years_experience: number;
  certifications: string[];
  portfolio: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CleanerInput {
  name: string;
  company: string;
  rating?: number;
  review_count?: number;
  services: string[];
  location: string;
  phone?: string;
  email?: string;
  availability?: string;
  hourly_rate?: string;
  description?: string;
  image_url?: string;
  verified?: boolean;
  response_time?: string;
  completed_jobs?: number;
  years_experience?: number;
  certifications?: string[];
  portfolio?: string[];
  is_active?: boolean;
}

export class CleanerService {
  /**
   * Get all cleaners (admin view)
   */
  static async getAllCleaners(): Promise<Cleaner[]> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cleaners:', error);
      throw error;
    }
  }

  /**
   * Get active cleaners (landlord view)
   */
  static async getActiveCleaners(): Promise<Cleaner[]> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active cleaners:', error);
      throw error;
    }
  }

  /**
   * Get cleaner by ID
   */
  static async getCleanerById(id: string): Promise<Cleaner | null> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching cleaner:', error);
      throw error;
    }
  }

  /**
   * Create a new cleaner
   */
  static async createCleaner(cleanerData: CleanerInput): Promise<Cleaner> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('cleaners')
        .insert({
          ...cleanerData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating cleaner:', error);
      throw error;
    }
  }

  /**
   * Update a cleaner
   */
  static async updateCleaner(id: string, cleanerData: Partial<CleanerInput>): Promise<Cleaner> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .update({
          ...cleanerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cleaner:', error);
      throw error;
    }
  }

  /**
   * Delete a cleaner
   */
  static async deleteCleaner(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cleaners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting cleaner:', error);
      throw error;
    }
  }

  /**
   * Toggle cleaner active status
   */
  static async toggleCleanerStatus(id: string, isActive: boolean): Promise<Cleaner> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling cleaner status:', error);
      throw error;
    }
  }

  /**
   * Toggle cleaner verification status
   */
  static async toggleCleanerVerification(id: string, verified: boolean): Promise<Cleaner> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .update({
          verified: verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling cleaner verification:', error);
      throw error;
    }
  }

  /**
   * Search cleaners by name, company, or services
   */
  static async searchCleaners(query: string, isActiveOnly: boolean = true): Promise<Cleaner[]> {
    try {
      let queryBuilder = supabase
        .from('cleaners')
        .select('*');

      if (isActiveOnly) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      const { data, error } = await queryBuilder
        .or(`name.ilike.%${query}%,company.ilike.%${query}%,services.cs.{${query}}`)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching cleaners:', error);
      throw error;
    }
  }

  /**
   * Filter cleaners by service
   */
  static async getCleanersByService(service: string, isActiveOnly: boolean = true): Promise<Cleaner[]> {
    try {
      let queryBuilder = supabase
        .from('cleaners')
        .select('*');

      if (isActiveOnly) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      const { data, error } = await queryBuilder
        .contains('services', [service])
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering cleaners by service:', error);
      throw error;
    }
  }

  /**
   * Get cleaners by location
   */
  static async getCleanersByLocation(location: string, isActiveOnly: boolean = true): Promise<Cleaner[]> {
    try {
      let queryBuilder = supabase
        .from('cleaners')
        .select('*');

      if (isActiveOnly) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      const { data, error } = await queryBuilder
        .ilike('location', `%${location}%`)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering cleaners by location:', error);
      throw error;
    }
  }

  /**
   * Get cleaner statistics
   */
  static async getCleanerStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    averageRating: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('is_active, verified, rating');

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(c => c.is_active).length,
        verified: data.filter(c => c.verified).length,
        averageRating: data.length > 0 
          ? data.reduce((sum, c) => sum + (c.rating || 0), 0) / data.length 
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching cleaner statistics:', error);
      throw error;
    }
  }
}
