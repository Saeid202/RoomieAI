import { supabase } from '@/integrations/supabase/client';

export interface RenovationPartner {
  id: string;
  user_id?: string;
  name: string;
  company: string;
  rating: number;
  review_count: number;
  specialties: string[];
  location: string;
  phone?: string;
  email?: string;
  availability?: string;
  hourly_rate?: string;
  description?: string;
  image_url?: string;
  website_url?: string;
  verified: boolean;
  response_time?: string;
  completed_projects: number;
  years_experience: number;
  certifications: string[];
  portfolio: string[];
  is_featured: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RenovationPartnerInput {
  name: string;
  company: string;
  rating?: number;
  review_count?: number;
  specialties: string[];
  location: string;
  phone?: string;
  email?: string;
  availability?: string;
  hourly_rate?: string;
  description?: string;
  image_url?: string;
  website_url?: string;
  verified?: boolean;
  response_time?: string;
  completed_projects?: number;
  years_experience?: number;
  certifications?: string[];
  portfolio?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

export class RenovationPartnerService {
  /**
   * Get all renovation partners (admin view)
   */
  static async getAllPartners(): Promise<RenovationPartner[]> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .select('*') as any)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching renovation partners:', error);
      throw error;
    }
  }

  /**
   * Get active renovation partners (landlord view)
   */
  static async getActivePartners(): Promise<RenovationPartner[]> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .select('*')
        .eq('is_active', true) as any)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active renovation partners:', error);
      throw error;
    }
  }

  /**
   * Get renovation partner by ID
   */
  static async getPartnerById(id: string): Promise<RenovationPartner | null> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .select('*')
        .eq('id', id) as any)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching renovation partner:', error);
      throw error;
    }
  }

  /**
   * Create a new renovation partner
   */
  static async createPartner(partnerData: RenovationPartnerInput): Promise<RenovationPartner> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .insert({
          ...partnerData,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select() as any)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating renovation partner:', error);
      throw error;
    }
  }

  /**
   * Update a renovation partner
   */
  static async updatePartner(id: string, partnerData: Partial<RenovationPartnerInput>): Promise<RenovationPartner> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .update({
          ...partnerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select() as any)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating renovation partner:', error);
      throw error;
    }
  }

  /**
   * Delete a renovation partner
   */
  static async deletePartner(id: string): Promise<void> {
    try {
      const { error } = await (supabase
        .from('renovation_partners' as any)
        .delete() as any)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting renovation partner:', error);
      throw error;
    }
  }

  /**
   * Toggle partner active status
   */
  static async togglePartnerStatus(id: string, isActive: boolean): Promise<RenovationPartner> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select() as any)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling partner status:', error);
      throw error;
    }
  }

  /**
   * Toggle partner verification status
   */
  static async togglePartnerVerification(id: string, verified: boolean): Promise<RenovationPartner> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .update({
          verified: verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select() as any)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling partner verification:', error);
      throw error;
    }
  }

  /**
   * Search partners by name, company, or specialties
   */
  static async searchPartners(query: string, isActiveOnly: boolean = true): Promise<RenovationPartner[]> {
    try {
      let queryBuilder = (supabase as any)
        .from('renovation_partners' as any)
        .select('*');

      if (isActiveOnly) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      const { data, error } = await (queryBuilder
        .or(`name.ilike.%${query}%,company.ilike.%${query}%,specialties.cs.{${query}}`) as any)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching renovation partners:', error);
      throw error;
    }
  }

  /**
   * Filter partners by specialty
   */
  static async getPartnersBySpecialty(specialty: string, isActiveOnly: boolean = true): Promise<RenovationPartner[]> {
    try {
      let queryBuilder = (supabase as any)
        .from('renovation_partners' as any)
        .select('*');

      if (isActiveOnly) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      const { data, error } = await (queryBuilder
        .contains('specialties', [specialty]) as any)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering partners by specialty:', error);
      throw error;
    }
  }

  /**
   * Get partners by location
   */
  static async getPartnersByLocation(location: string, isActiveOnly: boolean = true): Promise<RenovationPartner[]> {
    try {
      let queryBuilder = (supabase as any)
        .from('renovation_partners' as any)
        .select('*');

      if (isActiveOnly) {
        queryBuilder = queryBuilder.eq('is_active', true);
      }

      const { data, error } = await (queryBuilder
        .ilike('location', `%${location}%`) as any)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering partners by location:', error);
      throw error;
    }
  }

  /**
   * Get partner statistics
   */
  static async getPartnerStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    averageRating: number;
  }> {
    try {
      const { data, error } = await (supabase
        .from('renovation_partners' as any)
        .select('is_active, verified, rating') as any);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(p => p.is_active).length,
        verified: data.filter(p => p.verified).length,
        averageRating: data.length > 0
          ? data.reduce((sum, p) => sum + (p.rating || 0), 0) / data.length
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching partner statistics:', error);
      throw error;
    }
  }
}
