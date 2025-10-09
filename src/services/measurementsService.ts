import { supabase } from '@/integrations/supabase/client';

export interface BodyMeasurements {
  id?: string;
  user_id: string;
  height: number;
  shoulders: number;
  neck: number;
  left_arm: number;
  right_arm: number;
  chest: number;
  waist: number;
  hips: number;
  left_leg: number;
  right_leg: number;
  recommended_top_size: string;
  recommended_bottom_size: string;
  confidence_level: 'low' | 'medium' | 'high';
  measurement_date?: string;
  created_at?: string;
  updated_at?: string;
}

export class MeasurementsService {
  // Save measurements to database
  static async saveMeasurements(measurements: Omit<BodyMeasurements, 'id' | 'created_at' | 'updated_at'>): Promise<BodyMeasurements> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('body_measurements')
      .insert({
        user_id: user.id,
        height: measurements.height,
        shoulders: measurements.shoulders,
        neck: measurements.neck,
        left_arm: measurements.left_arm,
        right_arm: measurements.right_arm,
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        left_leg: measurements.left_leg,
        right_leg: measurements.right_leg,
        recommended_top_size: measurements.recommended_top_size,
        recommended_bottom_size: measurements.recommended_bottom_size,
        confidence_level: measurements.confidence_level,
        measurement_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as BodyMeasurements;
  }

  // Get user's measurements history
  static async getUserMeasurements(): Promise<BodyMeasurements[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false });

    if (error) throw error;
    return (data || []) as BodyMeasurements[];
  }

  // Get latest measurement
  static async getLatestMeasurement(): Promise<BodyMeasurements | null> {
    const measurements = await this.getUserMeasurements();
    return measurements.length > 0 ? measurements[0] : null;
  }

  // Delete measurement
  static async deleteMeasurement(measurementId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', measurementId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
}
