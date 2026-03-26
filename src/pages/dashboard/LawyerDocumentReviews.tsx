// =====================================================
// Lawyer Document Reviews Page
// =====================================================
// Purpose: Shows all properties assigned to lawyer for
//          document review
// =====================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Search, Eye, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getDealsForLawyer } from '@/services/dealLawyerService';
import type { AssignedDeal } from '@/types/dealLawyer';

interface DealWithDetails extends AssignedDeal {
  property?: {
    address: string;
    city: string;
    province: string;
    property_type?: string;
  };
  buyer?: {
    full_name: string;
    email: string;
  };
  document_count?: number;
}

const LawyerDocumentReviews: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lawyerProfileId, setLawyerProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadAssignedDeals();
  }, []);

  const loadAssignedDeals = async () => {
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

      setLawyerProfileId(lawyerProfile.id);

      // Get assigned deals
      const assignedDeals = await getDealsForLawyer(lawyerProfile.id);

      // Enrich with property and buyer details
      const enrichedDeals = await Promise.all(
        assignedDeals.map(async (deal) => {
          // Get property details
          const { data: property } = await supabase
            .from('properties')
            .select('address, city, province, property_type')
            .eq('id', deal.deal_id)
            .single();

          // Get buyer details
          const { data: buyer } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', deal.buyer_id)
            .single();

          // Get document count
          const { count } = await supabase
            .from('property_documents' as any)
            .select('*', { count: 'exact', head: true })
            .eq('property_id', deal.deal_id)
            .is('deleted_at', null);

          return {
            ...deal,
            property: property || undefined,
            buyer: buyer || undefined,
            document_count: count || 0,
          } as DealWithDetails;
        })
      );

      setDeals(enrichedDeals);
    } catch (error) {
      console.error('Error loading assigned deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      deal.property?.address?.toLowerCase().includes(searchLower) ||
      deal.property?.city?.toLowerCase().includes(searchLower) ||
      deal.buyer?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleReviewDocuments = (dealId: string) => {
    navigate(`/dashboard/property-documents/${dealId}`);
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Document Review Requests
        </h1>
        <p className="text-gray-600 mt-2">
          Properties assigned to you for legal document review
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-900">{deals.length}</p>
            <p className="text-sm text-purple-700 font-medium">Active Document Review Requests</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {deals.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property address, city, or buyer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No matching properties' : 'No document reviews assigned'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'You will see properties here when buyers assign you for document review'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDeals.map((deal) => (
            <div
              key={deal.deal_id}
              className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Property Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {deal.property?.address || 'Property Address'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Assigned: {new Date(deal.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>
                        Buyer: {deal.buyer?.full_name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>
                        {deal.document_count || 0} document{deal.document_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleReviewDocuments(deal.deal_id)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all whitespace-nowrap"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review Documents
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LawyerDocumentReviews;

