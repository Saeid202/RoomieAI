import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LenderProfile } from "@/types/lender";
import { Building2, Mail, Phone, Globe, MapPin, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface LenderProfileCardProps {
  profile: LenderProfile;
  showRatesLink?: boolean;
  compact?: boolean;
}

export function LenderProfileCard({ profile, showRatesLink = true, compact = false }: LenderProfileCardProps) {
  if (compact) {
    return (
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {profile.company_name?.[0] || 'L'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{profile.company_name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {profile.is_verified && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
            {profile.company_logo_url ? (
              <img src={profile.company_logo_url} alt={profile.company_name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              profile.company_name?.[0] || 'L'
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 truncate">{profile.company_name}</h3>
              {profile.is_verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            {profile.company_description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{profile.company_description}</p>
            )}

            <div className="space-y-1 text-sm">
              <a
                href={`mailto:${profile.contact_email}`}
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <Mail className="h-4 w-4 text-emerald-500" />
                <span className="truncate">{profile.contact_email}</span>
              </a>

              {profile.contact_phone && (
                <a
                  href={`tel:${profile.contact_phone}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span>{profile.contact_phone}</span>
                </a>
              )}

              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <span className="truncate">{profile.website_url.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {(profile.company_address || profile.company_city) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">
                    {[profile.company_address, profile.company_city, profile.company_province, profile.company_postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* License Info */}
        {(profile.license_number || profile.nmls_id) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-3 text-sm">
              {profile.license_number && (
                <div className="px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-gray-500">License: </span>
                  <span className="font-medium text-gray-700">{profile.license_number}</span>
                  {profile.license_state && (
                    <span className="text-gray-400"> ({profile.license_state})</span>
                  )}
                </div>
              )}
              {profile.nmls_id && (
                <div className="px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-gray-500">NMLS: </span>
                  <span className="font-medium text-gray-700">{profile.nmls_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showRatesLink && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold">
              <Link to="/dashboard/lender/rates">
                <Building2 className="h-4 w-4 mr-2" />
                View Rates
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LenderProfileCardHorizontalProps {
  profile: LenderProfile;
  rateCount?: number;
  onClick?: () => void;
}

export function LenderProfileCardHorizontal({ profile, rateCount, onClick }: LenderProfileCardHorizontalProps) {
  return (
    <Card
      className="border-2 border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {profile.company_logo_url ? (
              <img src={profile.company_logo_url} alt={profile.company_name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              profile.company_name?.[0] || 'L'
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{profile.company_name}</h3>
              {profile.is_verified && (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{profile.contact_email}</p>
          </div>

          {/* Rate Count */}
          {rateCount !== undefined && (
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-emerald-600">{rateCount}</p>
              <p className="text-xs text-gray-500">Active Rates</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}