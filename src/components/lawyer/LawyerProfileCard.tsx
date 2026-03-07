import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LawyerProfile } from "@/types/lawyer";
import { MapPin, Briefcase, DollarSign, MessageCircle, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LawyerProfileCardProps {
  lawyer: LawyerProfile;
  onStartConversation: (lawyer: LawyerProfile) => void;
}

export function LawyerProfileCard({ lawyer, onStartConversation }: LawyerProfileCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "L";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 h-24"></div>
      
      <CardContent className="p-6 -mt-12">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
              {getInitials(lawyer.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 mt-12">
            <h2 className="text-2xl font-black text-gray-900">{lawyer.full_name}</h2>
            {lawyer.law_firm_name && (
              <p className="text-lg text-purple-600 font-semibold">{lawyer.law_firm_name}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-6">
          {lawyer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{lawyer.email}</span>
            </div>
          )}
          {lawyer.phone_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{lawyer.phone_number}</span>
            </div>
          )}
          {lawyer.city && lawyer.province && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{lawyer.city}, {lawyer.province}</span>
            </div>
          )}
        </div>

        {/* Professional Info */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          {lawyer.years_of_experience && (
            <div className="flex items-center gap-2 text-gray-700">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span className="font-semibold">{lawyer.years_of_experience} years</span>
            </div>
          )}
          {lawyer.hourly_rate && (
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="font-semibold">${lawyer.hourly_rate}/hour</span>
            </div>
          )}
        </div>

        {/* Legal Services */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Our Legal Services:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">📄</span>
              <span>Contract Review (Sales & Rental)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">💼</span>
              <span>Legal Consultation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">🏛️</span>
              <span>Real Estate Law</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-lg">✍️</span>
              <span>Document Notarization</span>
            </div>
          </div>
        </div>

        {/* Practice Areas */}
        {lawyer.practice_areas && lawyer.practice_areas.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Practice Areas:</h3>
            <div className="flex flex-wrap gap-2">
              {lawyer.practice_areas.map((area) => (
                <Badge key={area} variant="secondary" className="bg-purple-100 text-purple-700">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {lawyer.bio && (
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">{lawyer.bio}</p>
          </div>
        )}

        {/* Consultation Fee */}
        {lawyer.consultation_fee && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Initial Consultation:</span> ${lawyer.consultation_fee}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onStartConversation(lawyer)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  );
}
