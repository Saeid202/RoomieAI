// =====================================================
// Assign Lawyer Modal Component
// =====================================================
// Purpose: Modal for buyers to assign platform lawyer
//          to review property documents
// =====================================================

import React, { useState, useEffect } from 'react';
import { X, Scale, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlatformLawyer, assignLawyerToDeal } from '@/services/dealLawyerService';
import type { PlatformLawyer } from '@/types/dealLawyer';
import { supabase } from '@/integrations/supabase/client';

interface AssignLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess: () => void;
}

export const AssignLawyerModal: React.FC<AssignLawyerModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}) => {
  const [lawyer, setLawyer] = useState<PlatformLawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlatformLawyer();
    }
  }, [isOpen]);

  const loadPlatformLawyer = async () => {
    try {
      setLoading(true);
      setError(null);
      const platformLawyer = await getPlatformLawyer();
      if (!platformLawyer) {
        setError('No platform lawyer available. Please contact support.');
      }
      setLawyer(platformLawyer);
    } catch (err) {
      console.error('Error loading platform lawyer:', err);
      setError('Failed to load lawyer information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLawyer = async () => {
    if (!lawyer) return;

    try {
      setAssigning(true);
      setError(null);

      // Get current user (buyer)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Assign lawyer to deal
      await assignLawyerToDeal(propertyId, lawyer.id, user.id);

      setSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error assigning lawyer:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign lawyer');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={assigning}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Assign Lawyer
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-gray-900">Lawyer Assigned!</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
          </div>
        )}

        {/* Lawyer Info */}
        {!loading && !success && lawyer && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
              <p className="text-sm font-semibold text-purple-900 mb-4">
                Homie AI Partner Lawyer
              </p>

              {/* Lawyer Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {lawyer.full_name?.charAt(0) || 'L'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {lawyer.full_name || 'Platform Lawyer'}
                  </h3>
                  <p className="text-sm text-gray-600">Real Estate Lawyer</p>
                  <p className="text-sm font-medium text-purple-700 mt-1">
                    {lawyer.law_firm_name || 'Homie AI Legal Partners'}
                  </p>
                </div>
              </div>

              {/* Lawyer Details */}
              {lawyer.years_of_experience && (
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Experience:</span> {lawyer.years_of_experience} years
                </div>
              )}
              {lawyer.practice_areas && lawyer.practice_areas.length > 0 && (
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Practice Areas:</span> {lawyer.practice_areas.join(', ')}
                </div>
              )}
              {lawyer.city && lawyer.province && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Location:</span> {lawyer.city}, {lawyer.province}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                What happens next?
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Lawyer will be notified of your request</li>
                <li>• They can access and review all property documents</li>
                <li>• You'll be able to see their status in the document room</li>
              </ul>
            </div>

            {/* Assign Button */}
            <Button
              onClick={handleAssignLawyer}
              disabled={assigning}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning Lawyer...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4 mr-2" />
                  Assign Lawyer
                </>
              )}
            </Button>
          </div>
        )}

        {/* No Lawyer Available */}
        {!loading && !lawyer && !error && (
          <div className="text-center py-8">
            <p className="text-gray-600">No platform lawyer available at this time.</p>
            <Button
              onClick={onClose}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

