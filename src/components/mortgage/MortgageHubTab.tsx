// =====================================================
// Mortgage Hub Tab Component
// =====================================================
// Purpose: Shows all active lender mortgage rates
//          so buyers can compare and find the best deal
// =====================================================

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Percent, Building2, DollarSign, Calendar, TrendingDown, Shield, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { LOAN_TYPE_LABELS } from "@/types/lender";
import type { LenderRate, LenderProfile } from "@/types/lender";

interface LenderWithRates {
  profile: LenderProfile;
  rates: LenderRate[];
}

export function MortgageHubTab() {
  const [lenders, setLenders] = useState<LenderWithRates[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLender, setExpandedLender] = useState<string | null>(null);
  const [filterLoanType, setFilterLoanType] = useState<string>("all");

  useEffect(() => {
    loadAllRates();
  }, []);

  const loadAllRates = async () => {
    try {
      setLoading(true);

      // Fetch all active AND verified lender profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("lender_profiles" as any)
        .select("*")
        .eq("is_active", true)
        .eq("is_verified", true);

      if (profilesError) throw profilesError;
      if (!profiles?.length) { setLenders([]); return; }

      // Fetch active rates for all lenders
      const { data: rates, error: ratesError } = await supabase
        .from("lender_rates" as any)
        .select("*")
        .eq("is_active", true)
        .in("lender_id", (profiles as any[]).map((p: any) => p.id))
        .order("interest_rate", { ascending: true });

      if (ratesError) throw ratesError;

      // Group rates by lender
      const grouped: LenderWithRates[] = (profiles as any[])
        .map((profile: any) => ({
          profile: profile as LenderProfile,
          rates: ((rates as any[]) || []).filter((r: any) => r.lender_id === profile.id) as LenderRate[],
        }))
        .filter(l => l.rates.length > 0)
        .sort((a, b) => {
          const minA = Math.min(...a.rates.map(r => r.interest_rate));
          const minB = Math.min(...b.rates.map(r => r.interest_rate));
          return minA - minB;
        });

      setLenders(grouped);
    } catch (err) {
      console.error("Error loading mortgage rates:", err);
    } finally {
      setLoading(false);
    }
  };

  const allLoanTypes = Array.from(
    new Set(lenders.flatMap(l => l.rates.map(r => r.loan_type)))
  );

  const filteredLenders = lenders.map(l => ({
    ...l,
    rates: filterLoanType === "all"
      ? l.rates
      : l.rates.filter(r => r.loan_type === filterLoanType),
  })).filter(l => l.rates.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <Percent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Mortgage Hub
            </h1>
            <p className="text-sm text-gray-700 font-medium">
              Compare live mortgage rates from our verified lenders
            </p>
          </div>
        </div>
      </div>

      {/* Filter by loan type */}
      {allLoanTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterLoanType("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filterLoanType === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Types
          </button>
          {allLoanTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterLoanType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filterLoanType === type
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {LOAN_TYPE_LABELS[type as keyof typeof LOAN_TYPE_LABELS] || type}
            </button>
          ))}
        </div>
      )}

      {/* No rates */}
      {filteredLenders.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Percent className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">No rates available yet</p>
          <p className="text-gray-400 text-sm mt-1">Lenders will publish their rates here</p>
        </div>
      )}

      {/* Lender Cards */}
      {filteredLenders.map(({ profile, rates }) => {
        const lowestRate = Math.min(...rates.map(r => r.interest_rate));
        const isExpanded = expandedLender === profile.id;

        return (
          <div
            key={profile.id}
            className="bg-white border-2 border-purple-100 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Lender Header */}
            <button
              className="w-full text-left p-5 flex items-center justify-between gap-4"
              onClick={() => setExpandedLender(isExpanded ? null : profile.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{profile.company_name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm text-gray-500">{rates.length} rate{rates.length !== 1 ? 's' : ''} available</span>
                    {profile.nmls_id && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                        <Shield className="h-3 w-3" />
                        NMLS #{profile.nmls_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">From</p>
                  <p className="text-2xl font-black text-purple-700">{lowestRate}%</p>
                </div>
                {isExpanded
                  ? <ChevronUp className="h-5 w-5 text-gray-400" />
                  : <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </div>
            </button>

            {/* Expanded Rates */}
            {isExpanded && (
              <div className="border-t border-purple-100 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-5">
                {profile.company_description && (
                  <p className="text-sm text-gray-600 mb-4 italic">{profile.company_description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rates.map(rate => (
                    <div
                      key={rate.id}
                      className="bg-white rounded-xl border-2 border-purple-100 p-4 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide bg-purple-50 px-2 py-0.5 rounded-full">
                            {LOAN_TYPE_LABELS[rate.loan_type as keyof typeof LOAN_TYPE_LABELS] || rate.loan_type}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">{rate.term_years}-year term</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900">{rate.interest_rate}%</p>
                          {rate.apr && (
                            <p className="text-xs text-gray-500">APR {rate.apr}%</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm text-gray-600 border-t border-gray-100 pt-3">
                        {(rate.min_loan_amount || rate.max_loan_amount) && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              {rate.min_loan_amount ? `$${rate.min_loan_amount.toLocaleString()}` : 'No min'}
                              {' – '}
                              {rate.max_loan_amount ? `$${rate.max_loan_amount.toLocaleString()}` : 'No max'}
                            </span>
                          </div>
                        )}
                        {rate.min_credit_score && (
                          <div className="flex items-center gap-1.5">
                            <TrendingDown className="h-3.5 w-3.5 text-gray-400" />
                            <span>Min credit score: {rate.min_credit_score}</span>
                          </div>
                        )}
                        {rate.points > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Percent className="h-3.5 w-3.5 text-gray-400" />
                            <span>{rate.points} point{rate.points !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {rate.effective_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>Effective {new Date(rate.effective_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {rate.notes && (
                          <p className="text-xs text-gray-500 italic mt-2">{rate.notes}</p>
                        )}
                      </div>

                      {/* Terms & Conditions */}
                      {rate.terms_and_conditions && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                            <Shield className="h-3 w-3 text-purple-500" />
                            Terms & Conditions
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                            {rate.terms_and_conditions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Contact info */}
                {(profile.contact_email || profile.contact_phone) && (
                  <div className="mt-4 pt-4 border-t border-purple-100 flex flex-wrap gap-4 text-sm text-gray-600">
                    {profile.contact_email && (
                      <a href={`mailto:${profile.contact_email}`} className="text-purple-600 hover:underline font-medium">
                        {profile.contact_email}
                      </a>
                    )}
                    {profile.contact_phone && (
                      <a href={`tel:${profile.contact_phone}`} className="text-purple-600 hover:underline font-medium">
                        {profile.contact_phone}
                      </a>
                    )}
                    {profile.website_url && (
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">
                        Visit website →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
