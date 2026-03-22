import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client-simple";
import { FileText, User, Mail, Phone, DollarSign, Calendar, Eye } from "lucide-react";

interface MortgageProfileWithUser {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  purchase_price_range: string | null;
  desired_location: string | null;
  mortgage_purpose: string | null;
  employment_status: string | null;
  annual_income: number | null;
  credit_score_range: string | null;
  down_payment_amount: number | null;
  lender_access_consent: boolean | null;
  consent_granted_at: string | null;
  created_at: string;
}

export default function LenderRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MortgageProfileWithUser[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MortgageProfileWithUser | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in to continue"); return; }
      const { data, error } = await supabase
        .from('mortgage_profiles')
        .select('*')
        .eq('lender_access_consent', true)
        .order('consent_granted_at', { ascending: false });
      if (error) { console.error("Error fetching requests:", error); toast.error("Failed to load requests"); return; }
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 space-y-6 pb-10">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Mortgage Requests
            </h1>
            <p className="text-sm text-gray-700 font-medium">View borrowers who granted you access</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{requests.length}</p>
                <p className="text-sm text-gray-600">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">
                  {requests.filter(r => r.lender_access_consent).length}
                </p>
                <p className="text-sm text-gray-600">With Consent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-500/20 to-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-pink-600">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">
                  {requests.filter(r => {
                    if (!r.consent_granted_at) return false;
                    const d = new Date(r.consent_granted_at);
                    const now = new Date();
                    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">New This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Borrower Profile
                </h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>Close</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRequest.full_name && (
                  <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                    <User className="h-4 w-4 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.full_name}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.email && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.email}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.phone_number && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.phone_number}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.annual_income && (
                  <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Annual Income</p>
                      <p className="font-semibold text-gray-900">${selectedRequest.annual_income.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.purchase_price_range && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500">Purchase Price Range</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.purchase_price_range}</p>
                  </div>
                )}
                {selectedRequest.credit_score_range && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-gray-500">Credit Score Range</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.credit_score_range}</p>
                  </div>
                )}
                {selectedRequest.down_payment_amount && (
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="text-xs text-gray-500">Down Payment</p>
                    <p className="font-semibold text-gray-900">${selectedRequest.down_payment_amount.toLocaleString()}</p>
                  </div>
                )}
                {selectedRequest.employment_status && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500">Employment Status</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.employment_status}</p>
                  </div>
                )}
                {selectedRequest.mortgage_purpose && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-gray-500">Mortgage Purpose</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.mortgage_purpose}</p>
                  </div>
                )}
                {selectedRequest.desired_location && (
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="text-xs text-gray-500">Desired Location</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.desired_location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
          <CardContent className="p-12 text-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Requests Yet</h3>
            <p className="text-gray-500 text-sm">Borrowers who grant lender access to their mortgage profile will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 cursor-pointer group"
              onClick={() => setSelectedRequest(request)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {request.full_name || 'Anonymous Borrower'}
                    </span>
                  </div>
                  <Eye className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <div className="space-y-1.5 text-sm">
                  {request.purchase_price_range && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-3.5 w-3.5 text-pink-500" />
                      <span>{request.purchase_price_range}</span>
                    </div>
                  )}
                  {request.credit_score_range && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs font-semibold text-purple-600">Credit:</span>
                      <span>{request.credit_score_range}</span>
                    </div>
                  )}
                  {request.desired_location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs font-semibold text-indigo-600">Location:</span>
                      <span className="truncate">{request.desired_location}</span>
                    </div>
                  )}
                </div>
                {request.consent_granted_at && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <Calendar className="h-3 w-3" />
                    <span>Consented {new Date(request.consent_granted_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
