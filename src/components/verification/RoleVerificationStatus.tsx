import React from 'react';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { useRoleBasedVerification } from '@/hooks/useRoleBasedVerification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface RoleVerificationStatusProps {
  className?: string;
}

export function RoleVerificationStatus({ className }: RoleVerificationStatusProps) {
  const { role } = useRole();
  const { isVerified, loading, kycStatus, getRequiredActions } = useRoleBasedVerification();

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent animate-spin rounded-full"></div>
        <span className="ml-2 text-sm text-purple-600">Loading...</span>
      </div>
    );
  }

  const requiredActions = getRequiredActions();
  const getRoleDisplayName = (userRole: UserRole) => {
    switch (userRole) {
      case 'seeker': return 'Tenant';
      case 'landlord': return 'Landlord';
      default: return userRole;
    }
  };

  const getActionDisplayName = (action: string) => {
    switch (action) {
      case 'pay_rent': return 'Pay Rent';
      case 'credit_reporting': return 'Credit Reporting';
      case 'publish_listing': return 'Publish Listings';
      case 'receive_payout': return 'Receive Payouts';
      default: return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'pay_rent': return 'Required before first rent payment';
      case 'credit_reporting': return 'Required for credit reporting features';
      case 'publish_listing': return 'Required before publishing listings';
      case 'receive_payout': return 'Required before receiving payouts';
      default: return 'Verification required for this action';
    }
  };

  return (
    <Card className={`border-0 shadow-xl bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-purple-900">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          {getRoleDisplayName(role)} Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="font-semibold text-slate-700">Verification Status</span>
          </div>
          <Badge className={`${isVerified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} px-3 py-1`}>
            {isVerified ? 'Verified' : 'Not Verified'}
          </Badge>
        </div>

        {/* Role-specific requirements */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Required Actions
          </h4>
          
          {requiredActions.length > 0 ? (
            <div className="space-y-2">
              {requiredActions.map((action) => (
                <div key={action} className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-purple-900">
                      {getActionDisplayName(action)}
                    </div>
                    <div className="text-sm text-purple-700">
                      {getActionDescription(action)}
                    </div>
                  </div>
                  {!isVerified && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">
                No verification requirements for your role
              </p>
            </div>
          )}
        </div>

        {/* Status message */}
        {!isVerified && requiredActions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Complete Verification</h4>
                <p className="text-sm text-blue-700">
                  Complete identity verification to unlock all {getRoleDisplayName(role)} features.
                </p>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Fully Verified</h4>
                <p className="text-sm text-green-700">
                  You have access to all {getRoleDisplayName(role)} features.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
