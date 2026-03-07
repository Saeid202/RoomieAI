import { supabase } from '@/integrations/supabase/client';
import type { LandlordAvailability, ViewingAppointment, TimeSlot, Property } from '@/types/viewingAppointment';

export const viewingAppointmentService = {
  // Get landlord availability for a property
  async getPropertyAvailability(propertyId: string, landlordId?: string): Promise<LandlordAvailability[]> {
    console.log("-----------------------------------------");
    console.log("🔍 [AVAILABILITY SERVICE] Fetching for:", { propertyId, landlordId });

    if (!propertyId) {
      console.error("❌ [AVAILABILITY SERVICE] propertyId is missing!");
      return [];
    }

    try {
      // 1. Check session for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log("👤 [AVAILABILITY SERVICE] User logged in:", !!session);

      // 2. Build query to get availability for this specific property
      // We want slots that are either:
      // - Specifically for this property (property_id matches)
      // - Global slots for this landlord (property_id is null AND user_id matches)
      
      let query = (supabase as any)
        .from('landlord_availability')
        .select('*')
        .eq('is_active', true);

      // Strategy: Use .or() to get property-specific OR global slots in one query
      if (landlordId) {
        console.log("🔍 [AVAILABILITY SERVICE] Filtering by landlordId:", landlordId);
        // Get slots where:
        // (property_id = propertyId AND user_id = landlordId) OR (property_id IS NULL AND user_id = landlordId)
        query = query
          .eq('user_id', landlordId)
          .or(`property_id.eq.${propertyId},property_id.is.null`);
      } else {
        // If no landlordId provided, just get slots specifically for this property
        console.log("🔍 [AVAILABILITY SERVICE] NO landlordId! Filtering by property_id only:", propertyId);
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error("❌ [AVAILABILITY SERVICE] Supabase Error:", error.message, error.details);
        throw error;
      }

      console.log(`📊 [AVAILABILITY SERVICE] Query returned ${data?.length || 0} rows`);
      if (data && data.length > 0) {
        console.log("🔍 [AVAILABILITY SERVICE] First 3 rows:");
        data.slice(0, 3).forEach((slot: any, idx: number) => {
          console.log(`  [${idx + 1}] property_id: ${slot.property_id || 'NULL'}, day: ${slot.day_of_week}, time: ${slot.start_time}-${slot.end_time}`);
        });
      } else {
        console.warn("⚠️ [AVAILABILITY SERVICE] No availability found! Check:");
        console.warn("  - Is availability saved in database?");
        console.warn("  - Is is_active = true?");
        console.warn("  - Does user_id match landlordId?");
        console.warn("  - Does property_id match or is NULL?");
      }

      console.log(`✅ [AVAILABILITY SERVICE] Returning ${data?.length || 0} slots`);
      console.log("-----------------------------------------");
      return data || [];
    } catch (err) {
      console.error("❌ [AVAILABILITY SERVICE] Fatal exception:", err);
      return [];
    }
  },

  // Generate available time slots for a specific date
  generateTimeSlots(
    date: Date,
    availability: LandlordAvailability[],
    bookedAppointments: ViewingAppointment[]
  ): TimeSlot[] {
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);

    if (dayAvailability.length === 0) return [];

    // Use a Map to prevent duplicate time slots
    const slotsMap = new Map<string, TimeSlot>();
    const bookedTimes = new Set(
      bookedAppointments
        .filter(apt => (apt as any).requested_date === date.toISOString().split('T')[0])
        .map(apt => (apt as any).requested_time_slot)
    );

    dayAvailability.forEach(avail => {
      const [startHour, startMin] = avail.start_time.split(':').map(Number);
      const [endHour, endMin] = avail.end_time.split(':').map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        
        // Only add if not already in map (prevents duplicates)
        if (!slotsMap.has(timeStr)) {
          const hour12 = currentHour % 12 || 12;
          const ampm = currentHour < 12 ? 'AM' : 'PM';
          const label = `${hour12}:${String(currentMin).padStart(2, '0')} ${ampm}`;

          slotsMap.set(timeStr, {
            time: timeStr,
            label,
            available: !bookedTimes.has(timeStr)
          });
        }

        // Increment by 30 minutes
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour += 1;
        }
      }
    });

    // Convert Map to array and sort by time
    return Array.from(slotsMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  },

  // Create a viewing appointment
  async createAppointment(appointment: Omit<ViewingAppointment, 'id' | 'created_at' | 'updated_at' | 'status'> & { landlord_id?: string }): Promise<ViewingAppointment> {
    // Get landlord_id from property if not provided
    let landlordId = appointment.landlord_id;
    
    if (!landlordId) {
      const { data: property, error: propError } = await (supabase as any)
        .from('properties')
        .select('user_id')
        .eq('id', appointment.property_id)
        .single();
      
      if (propError) {
        console.error('Error fetching property owner:', propError);
        throw new Error('Could not find property owner');
      }
      
      landlordId = property.user_id;
    }

    // Map new field names to old database schema
    const dbRecord = {
      property_id: appointment.property_id,
      requester_id: appointment.requester_id,
      landlord_id: landlordId,
      requester_name: appointment.requester_name,
      requester_email: appointment.requester_email,
      requester_phone: appointment.requester_phone,
      requested_date: (appointment as any).appointment_date,
      requested_time_slot: (appointment as any).appointment_time,
      number_of_attendees: appointment.number_of_attendees,
      message: (appointment as any).additional_message,
      is_custom_request: appointment.is_custom_request,
      status: 'pending'
    };

    const { data, error } = await (supabase as any)
      .from('property_viewing_appointments')
      .insert(dbRecord)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get appointments for a property
  async getPropertyAppointments(propertyId: string): Promise<ViewingAppointment[]> {
    const { data, error} = await (supabase as any)
      .from('property_viewing_appointments')
      .select('*')
      .eq('property_id', propertyId)
      .order('requested_date', { ascending: true })
      .order('requested_time_slot', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get user's appointments
  async getUserAppointments(userId: string): Promise<ViewingAppointment[]> {
    const { data, error } = await (supabase as any)
      .from('property_viewing_appointments')
      .select('*')
      .eq('requester_id', userId)
      .order('requested_date', { ascending: true })
      .order('requested_time_slot', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Update appointment status (landlord)
  async updateAppointmentStatus(
    appointmentId: string,
    status: ViewingAppointment['status'],
    landlordNotes?: string
  ): Promise<ViewingAppointment> {
    const updates: any = { status, landlord_notes: landlordNotes };

    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('property_viewing_appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all appointments for a landlord's properties
  async getLandlordAppointments(userId: string): Promise<any[]> {
    const { data, error } = await (supabase as any)
      .from('property_viewing_appointments')
      .select('*, properties!inner(address, listing_title, city, listing_category, user_id)')
      .eq('properties.user_id', userId)
      .order('requested_date', { ascending: true })
      .order('requested_time_slot', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Cancel appointment (tenant)
  async cancelAppointment(appointmentId: string): Promise<ViewingAppointment> {
    const { data, error } = await supabase
      .from('property_viewing_appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Landlord availability management
  async setAvailability(availability: Omit<LandlordAvailability, 'id' | 'created_at' | 'updated_at'>): Promise<LandlordAvailability> {
    const { data, error } = await supabase
      .from('landlord_availability')
      .insert(availability)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAvailability(id: string, updates: Partial<LandlordAvailability>): Promise<LandlordAvailability> {
    const { data, error } = await supabase
      .from('landlord_availability')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAvailability(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('landlord_availability')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getUserAvailability(userId: string): Promise<LandlordAvailability[]> {
    const { data, error } = await supabase
      .from('landlord_availability')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get landlord's properties (all non-archived)
  async getLandlordProperties(userId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, address, city, state, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching properties:', error);
        throw error;
      }

      // Filter out archived properties in JavaScript to be more flexible
      const filtered = (data || []).filter(p => p.status !== 'archived');
      console.log('Fetched properties for user:', userId, 'Count:', filtered.length, 'Data:', filtered);
      return filtered;
    } catch (err) {
      console.error('Exception in getLandlordProperties:', err);
      throw err;
    }
  },

  // Get availability filtered by property
  async getAvailabilityByProperty(
    userId: string,
    propertyId: string | null
  ): Promise<LandlordAvailability[]> {
    let query = (supabase as any)
      .from('landlord_availability')
      .select('*')
      .eq('user_id', userId);

    if (propertyId !== null) {
      query = query.or(`property_id.eq.${propertyId},property_id.is.null`);
    }

    const { data, error } = await query
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get availability by date range (for monthly calendar view)
  async getAvailabilityByDateRange(
    userId: string,
    propertyId: string | null,
    startDate: string,
    endDate: string
  ): Promise<LandlordAvailability[]> {
    let query = (supabase as any)
      .from('landlord_availability')
      .select('*')
      .eq('user_id', userId)
      .gte('specific_date', startDate)
      .lte('specific_date', endDate);

    if (propertyId !== null) {
      query = query.or(`property_id.eq.${propertyId},property_id.is.null`);
    }

    const { data, error } = await query
      .order('specific_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
