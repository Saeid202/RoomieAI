
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  console.log('useHousingPlans hook initialized with auth state:', { 
    isAuthenticated: !!user,
    userId: user?.id 
  });

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['housing-plans'],
    queryFn: async () => {
      console.log('Fetching housing plans for user:', user?.id);
      
      if (!user) {
        console.log('No authenticated user found, returning empty plans array');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('My Future Housing Plan')
          .select('*')
          .eq('user_id', user.id)  // Ensure we're fetching only the current user's plans
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

        console.log('Housing plans data fetched successfully:', data);
        if (!data || data.length === 0) {
          console.log('No housing plans found for user');
          return [];
        }
        
        return data.map(plan => ({
          ...plan,
          id: plan.id.toString()
        })) as HousingPlan[];
      } catch (fetchError) {
        console.error('Exception in fetchHousingPlans:', fetchError);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while fetching housing plans',
          variant: 'destructive',
        });
        throw fetchError;
      }
    },
    enabled: !!user,
  });

  const createPlan = useMutation({
    mutationFn: async (plan: Omit<HousingPlan, 'id' | 'created_at' | 'user_id'>) => {
      console.log('Creating housing plan:', plan);
      
      if (!user) {
        console.error('No authenticated user');
        throw new Error('You must be logged in to create a housing plan');
      }

      const newPlan = {
        ...plan,
        user_id: user.id
      };
      
      console.log('Submitting plan with user_id:', newPlan);

      const { data, error } = await supabase
        .from('My Future Housing Plan')
        .insert(newPlan)
        .select()
        .single();

      if (error) {
        console.error('Error creating housing plan:', error);
        throw error;
      }
      
      console.log('Housing plan created successfully:', data);
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
        description: 'Failed to create housing plan: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...plan }: Partial<HousingPlan> & { id: string }) => {
      console.log('Updating housing plan:', id, plan);
      
      if (!user) {
        console.error('No authenticated user');
        throw new Error('You must be logged in to update a housing plan');
      }

      const updatedPlan = {
        ...plan,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('My Future Housing Plan')
        .update(updatedPlan)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating housing plan:', error);
        throw error;
      }
      
      console.log('Housing plan updated successfully:', data);
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
        description: 'Failed to update housing plan: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    },
  });

  return {
    plans: plans || [],
    isLoading,
    error,
    createPlan,
    updatePlan
  };
}
