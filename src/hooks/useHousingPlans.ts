
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HousingPlan {
  id: string;
  moving_date: string;
  desired_location: string;
  budget: number;
  housing_type: string;
  additional_requirements?: string;
  created_at: string;
  user_id: string;
}

export function useHousingPlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['housing-plans'],
    queryFn: async () => {
      console.log('Fetching housing plans');
      const { data, error } = await supabase
        .from('My Future Housing Plan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching housing plans:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch housing plans: ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }

      console.log('Housing plans data:', data);
      return data as HousingPlan[];
    },
  });

  const createPlan = useMutation({
    mutationFn: async (plan: Omit<HousingPlan, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('My Future Housing Plan')
        .insert(plan)
        .select()
        .single();

      if (error) {
        console.error('Error creating housing plan:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housing-plans'] });
      toast({
        title: 'Success',
        description: 'Housing plan created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating housing plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create housing plan',
        variant: 'destructive',
      });
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...plan }: Partial<HousingPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('My Future Housing Plan')
        .update(plan)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating housing plan:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housing-plans'] });
      toast({
        title: 'Success',
        description: 'Housing plan updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating housing plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update housing plan',
        variant: 'destructive',
      });
    },
  });

  return {
    plans,
    isLoading,
    error,
    createPlan,
    updatePlan
  };
}
