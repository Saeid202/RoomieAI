export interface LandlordAvailability {
  id: string;
  user_id: string;
  property_id: string | null;
  specific_date?: string; // YYYY-MM-DD - specific date for availability
  day_of_week: number; // 0=Sunday, 6=Saturday (kept for backward compatibility)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViewingAppointment {
  id: string;
  property_id: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM format
  number_of_attendees: number;
  additional_message?: string;
  is_custom_request: boolean;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'declined';
  landlord_notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

export interface TimeSlot {
  time: string; // HH:MM format
  label: string; // Display label like "10:00 AM"
  available: boolean;
}

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Property {
  id: string;
  address: string;
  title?: string; // Optional - may not exist in database
  city?: string;
  state?: string;
  status?: string;
}
