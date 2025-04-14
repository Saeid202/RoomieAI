
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HousingPlan {
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

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['housing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('My Future Housing Plan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch housing plans',
          variant: 'destructive',
        });
        throw error;
      }

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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housing-plans'] });
    },
    onError: () => {
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housing-plans'] });
    },
    onError: () => {
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
    createPlan,
    updatePlan
  };
}
