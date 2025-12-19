import { supabase } from '@/integrations/supabase/client';
import { OppositeScheduleFormData } from '@/types/oppositeSchedule';

export async function saveOppositeScheduleProfile(
  userId: string,
  formData: OppositeScheduleFormData
) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('opposite_schedule_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's okay, we'll insert
      throw fetchError;
    }

    const profileData = {
      user_id: userId,
      work_schedule: formData.work_schedule,
      occupation: formData.occupation || null,
      nationality: formData.nationality || null,
      property_type: formData.property_type,
      preferred_schedule: formData.preferred_schedule,
      preferred_nationality: formData.preferred_nationality || null,
      food_restrictions: formData.food_restrictions || null,
      additional_notes: formData.additional_notes || null,
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('opposite_schedule_profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('opposite_schedule_profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving opposite schedule profile:', error);
    throw error;
  }
}

export async function getOppositeScheduleProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('opposite_schedule_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching opposite schedule profile:', error);
    throw error;
  }
}
