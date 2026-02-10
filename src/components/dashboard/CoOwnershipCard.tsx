import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageButton } from "@/components/MessageButton";
import { 
  MapPin, 
  Clock, 
  Home, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Edit3,
  MessageSquare,
  Shield,
  Calendar,
  Building,
  User
} from "lucide-react";
import { CoOwnershipSignal } from "@/services/propertyService";

interface CoOwnershipCardProps {
  signal: CoOwnershipSignal;
  currentUserId?: string;
  onEdit?: (signal: CoOwnershipSignal) => void;
  isOwner?: boolean;
}

export function CoOwnershipCard({ 
  signal, 
  currentUserId, 
  onEdit, 
  isOwner = false 
}: CoOwnershipCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: string) => {
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getIntendedUseIcon = (use: string) => {
    switch (use) {
      case 'Live-in':
        return <Home className="h-4 w-4" />;
      case 'Investment':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getIntendedUseColor = (use: string) => {
    switch (use) {
      case 'Live-in':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Investment':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const displayName = signal.creator_name && signal.creator_name !== "Unknown User" 
    ? signal.creator_name 
    : "Anonymous Member";

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-purple-200 shadow-md bg-white hover:border-purple-300">
      <CardContent className="p-6 space-y-6">
        {/* Header Section - Person Name First */}
        <div className="flex items-start justify-between pb-4 border-b border-purple-100">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-900 font-sans">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-purple-600 font-sans">
                  <span>Co-ownership Partner</span>
                  {signal.creator_name === 'Mehdi' && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs font-sans">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-sans border-purple-200 text-purple-500">
              ID: {signal.id.substring(0, 6)}
            </Badge>
          </div>
          
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(signal)}
              className="opacity-0 group-hover:opacity-100 transition-opacity border-purple-200"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Household Type */}
        <div className="text-center pb-6 border-b-4 border-purple-300">
          <h3 className="text-2xl font-bold text-purple-900 font-sans tracking-tight">
            {signal.household_type}
          </h3>
          <div className="mt-4 pt-4 border-t-4 border-purple-300">
            <p className="text-sm text-purple-600 font-sans bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border-2 border-purple-200 shadow-sm">
              Seeking partnership opportunity
            </p>
          </div>
        </div>

        {/* Investment Section - Professional Purple/Pink Gradient */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide font-sans">
              Available Capital
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-800 font-sans">
            {formatCurrency(signal.capital_available)}
          </div>
          <p className="text-sm text-purple-600 mt-2 font-sans">
            Ready for immediate partnership
          </p>
        </div>

        {/* Requirements Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${getIntendedUseColor(signal.intended_use)}`}>
              {getIntendedUseIcon(signal.intended_use)}
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-purple-700 uppercase tracking-wide font-sans block">
                {signal.intended_use}
              </span>
              <p className="text-sm text-purple-500 font-sans">
                {signal.intended_use === 'Live-in' 
                  ? "Looking for co-buyer for primary residence"
                  : signal.intended_use === 'Investment'
                  ? "Seeking investment partner"
                  : "Mixed use partnership opportunity"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 border-2 border-amber-200 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-purple-700 uppercase tracking-wide font-sans block">
                Time Horizon
              </span>
              <p className="text-sm text-purple-500 font-sans">{signal.time_horizon}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-purple-700 uppercase tracking-wide font-sans block">
                Location
              </span>
              <p className="text-sm text-purple-500 font-sans">Flexible - Open to discussion</p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {signal.notes && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-700 mb-2 font-sans">Additional Information</h4>
            <p className="text-sm text-purple-600 leading-relaxed font-sans">
              {isExpanded ? signal.notes : `${signal.notes.substring(0, 120)}${signal.notes.length > 120 ? '...' : ''}`}
            </p>
            {signal.notes.length > 120 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto text-xs text-purple-600 hover:text-purple-800 font-sans"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>
        )}

        {/* Action Section */}
        <div className="flex gap-3 pt-4 border-t border-purple-200">
          {isOwner ? (
            <Button
              variant="outline"
              onClick={() => onEdit?.(signal)}
              className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 font-sans"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Listing
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/user/${signal.user_id}`)}
                className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 font-sans"
              >
                <Users className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <MessageButton
                salesListingId={null}
                landlordId={signal.user_id}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-sans"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </MessageButton>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-200 text-xs text-purple-500 font-sans">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Verified Partner</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Active</span>
            </div>
          </div>
          <span>Signal: {signal.id.substring(0, 8)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
