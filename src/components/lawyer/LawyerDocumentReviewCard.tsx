// =====================================================
// Lawyer Document Review Card Component
// =====================================================
// Purpose: Dashboard card showing document review stats
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getDealsForLawyer } from '@/services/dealLawyerService';

export const LawyerDocumentReviewCard: React.FC = () => {
  const navigate = useNavigate();
  const [dealCount, setDealCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDealCount();
  }, []);

  const loadDealCount = async () => {
    try {
      setLoading(true);

      // Get current user's lawyer profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return;

      // Get assigned deals count
      const deals = await getDealsForLawyer(lawyerProfile.id);
      setDealCount(deals.length);
    } catch (error) {
      console.error('Error loading deal count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
        ) : (
          <div className="text-right">
            <p className="text-3xl font-bold text-purple-900">{dealCount}</p>
            <p className="text-xs text-purple-700 font-medium">Active</p>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Document Reviews
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Properties assigned to you for legal document review
      </p>

      <Button
        onClick={() => navigate('/dashboard/lawyer-document-reviews')}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md transition-all"
      >
        View All Reviews
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

