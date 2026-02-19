import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Hammer,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Award,
  Users,
  Calendar,
  Wrench,
  Paintbrush,
  Home,
  Zap,
  Eye,
  Copy,
  Check,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { RenovationPartnerService, RenovationPartner } from "@/services/renovationPartnerService";
import { MessagingService } from "@/services/messagingService";
import { supabase } from "@/integrations/supabase/client";

interface Renovator {
  id: string;
  name: string;
  company: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  location: string;
  phone: string;
  email: string;
  availability: string;
  hourlyRate: string;
  description: string;
  image: string;
  verified: boolean;
  responseTime: string;
  completedProjects: number;
  yearsExperience: number;
  certifications: string[];
  portfolio: string[];
}

const mockRenovators: Renovator[] = [
  {
    id: "1",
    name: "Mike Johnson",
    company: "Premier Renovations",
    rating: 4.9,
    reviewCount: 127,
    specialties: ["Kitchen Remodeling", "Bathroom Renovation", "Flooring", "Painting"],
    location: "Downtown Toronto",
    phone: "(416) 555-0123",
    email: "mike@premierrenovations.ca",
    availability: "Available this week",
    hourlyRate: "$85/hour",
    description: "Licensed contractor with 15+ years experience in residential renovations. Specializing in kitchen and bathroom remodels with attention to detail and quality craftsmanship.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 2 hours",
    completedProjects: 234,
    yearsExperience: 15,
    certifications: ["Licensed Contractor", "WSIB Certified", "First Aid Certified"],
    portfolio: ["Modern Kitchen Remodel", "Luxury Bathroom", "Hardwood Flooring"]
  },
  {
    id: "2",
    name: "Sarah Chen",
    company: "EcoBuild Solutions",
    rating: 4.8,
    reviewCount: 89,
    specialties: ["Eco-Friendly Renovations", "Energy Efficiency", "Solar Installation", "Insulation"],
    location: "North York",
    phone: "(416) 555-0456",
    email: "sarah@ecobuild.ca",
    availability: "Available next week",
    hourlyRate: "$95/hour",
    description: "Sustainable renovation specialist focused on eco-friendly solutions and energy efficiency improvements. Certified in green building practices.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 4 hours",
    completedProjects: 156,
    yearsExperience: 12,
    certifications: ["LEED Certified", "Green Building Specialist", "Energy Auditor"],
    portfolio: ["Solar Panel Installation", "Eco Kitchen", "Energy Efficient Windows"]
  },
  {
    id: "3",
    name: "David Rodriguez",
    company: "QuickFix Handyman",
    rating: 4.7,
    reviewCount: 203,
    specialties: ["General Repairs", "Plumbing", "Electrical", "Drywall"],
    location: "Scarborough",
    phone: "(416) 555-0789",
    email: "david@quickfix.ca",
    availability: "Available today",
    hourlyRate: "$65/hour",
    description: "Reliable handyman for all your repair and maintenance needs. Quick response times and quality workmanship for both small fixes and larger projects.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 1 hour",
    completedProjects: 445,
    yearsExperience: 8,
    certifications: ["Licensed Handyman", "Electrical Safety", "Plumbing Certified"],
    portfolio: ["Bathroom Repair", "Kitchen Fix", "Electrical Work"]
  },
  {
    id: "4",
    name: "Lisa Thompson",
    company: "Design & Build Studio",
    rating: 4.9,
    reviewCount: 95,
    specialties: ["Interior Design", "Custom Cabinetry", "Flooring", "Lighting"],
    location: "Mississauga",
    phone: "(905) 555-0321",
    email: "lisa@designbuild.ca",
    availability: "Available in 2 weeks",
    hourlyRate: "$110/hour",
    description: "Interior designer and contractor specializing in custom home renovations. From concept to completion, we bring your vision to life.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 6 hours",
    completedProjects: 178,
    yearsExperience: 18,
    certifications: ["Interior Design Diploma", "Custom Cabinetry", "Project Management"],
    portfolio: ["Luxury Kitchen", "Master Suite", "Custom Built-ins"]
  },
  {
    id: "5",
    name: "James Wilson",
    company: "Emergency Repair Services",
    rating: 4.6,
    reviewCount: 167,
    specialties: ["Emergency Repairs", "Water Damage", "Roofing", "HVAC"],
    location: "Etobicoke",
    phone: "(416) 555-0654",
    email: "james@emergencyrepair.ca",
    availability: "24/7 Emergency",
    hourlyRate: "$120/hour",
    description: "Emergency repair specialist available 24/7 for urgent property issues. Quick response for water damage, roofing problems, and HVAC emergencies.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 30 minutes",
    completedProjects: 312,
    yearsExperience: 20,
    certifications: ["Emergency Response", "Water Damage Restoration", "HVAC Certified"],
    portfolio: ["Water Damage Repair", "Emergency Roof Fix", "HVAC Installation"]
  }
];

const specialtyIcons: Record<string, React.ReactNode> = {
  "Kitchen Remodeling": <Home className="h-4 w-4" />,
  "Bathroom Renovation": <Wrench className="h-4 w-4" />,
  "Flooring": <Paintbrush className="h-4 w-4" />,
  "Painting": <Paintbrush className="h-4 w-4" />,
  "Eco-Friendly Renovations": <Zap className="h-4 w-4" />,
  "Energy Efficiency": <Zap className="h-4 w-4" />,
  "Solar Installation": <Zap className="h-4 w-4" />,
  "Insulation": <Home className="h-4 w-4" />,
  "General Repairs": <Wrench className="h-4 w-4" />,
  "Plumbing": <Wrench className="h-4 w-4" />,
  "Electrical": <Zap className="h-4 w-4" />,
  "Drywall": <Paintbrush className="h-4 w-4" />,
  "Interior Design": <Paintbrush className="h-4 w-4" />,
  "Custom Cabinetry": <Home className="h-4 w-4" />,
  "Lighting": <Zap className="h-4 w-4" />,
  "Emergency Repairs": <Wrench className="h-4 w-4" />,
  "Water Damage": <Wrench className="h-4 w-4" />,
  "Roofing": <Home className="h-4 w-4" />,
  "HVAC": <Zap className="h-4 w-4" />
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmergencyMode from "./EmergencyMode";

export default function RenovatorsPage() {
  const renderCount = useRef(0);
  const hasLoadedOnce = useRef(false);
  
  renderCount.current++;
  
  console.log("🔧 RenovatorsPage render #", renderCount.current);
  
  // Prevent infinite renders - stop after 5 renders
  if (renderCount.current > 5) {
    console.error("❌ Too many renders detected! Stopping at render #", renderCount.current);
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Render Loop Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The page rendered {renderCount.current} times. This indicates an infinite loop.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const [renovators, setRenovators] = useState<RenovationPartner[]>([]);
  // ... (keep existing state variables)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRenovator, setSelectedRenovator] = useState<RenovationPartner | null>(null);
  const [viewingRenovator, setViewingRenovator] = useState<RenovationPartner | null>(null);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [phoneToCall, setPhoneToCall] = useState<string>("");
  const [phoneOwner, setPhoneOwner] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    propertyId: "",
    description: "",
    budget: "",
    timeline: ""
  });
  const [userProperties, setUserProperties] = useState<{ id: string; listing_title: string; address: string }[]>([]);

  const [activeTab, setActiveTab] = useState("browse");

  const loadRenovators = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RenovationPartnerService.getActivePartners();
      // Mock one featured partner for demonstration
      if (data.length > 0) {
        data[0].is_featured = true;
      }
      setRenovators(data);
    } catch (error) {
      console.error('Failed to load renovators:', error);
      toast.error('Failed to load renovation partners');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserProperties = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('properties' as any)
        .select('id, listing_title, address')
        .eq('landlord_id', user.id);

      if (data) {
        setUserProperties(data as any);
      }

      // Pre-fill user details
      const { data: profile } = await supabase
        .from('user_profiles' as any)
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (profile) {
        setContactForm(prev => ({
          ...prev,
          name: (profile as any).full_name || "",
          email: (profile as any).email || ""
        }));
      } else if (user.email) {
        setContactForm(prev => ({ ...prev, email: user.email || "" }));
      }
    }
  }, []);

  useEffect(() => {
    loadRenovators();
    loadUserProperties();
  }, [loadRenovators, loadUserProperties]);

  const specialties = useMemo(() => 
    Array.from(new Set(renovators.flatMap(r => r.specialties))),
    [renovators]
  );

  const filteredRenovators = useMemo(() => 
    renovators.filter(renovator => {
      const matchesSearch = renovator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renovator.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renovator.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpecialty = !selectedSpecialty || renovator.specialties.includes(selectedSpecialty);
      return matchesSearch && matchesSpecialty;
    }),
    [renovators, searchTerm, selectedSpecialty]
  );

  const handleContactRenovator = (renovator: RenovationPartner) => {
    setSelectedRenovator(renovator);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      projectType: "",
      propertyId: "",
      description: "",
      budget: "",
      timeline: ""
    });
  };

  const handleSendMessage = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedRenovator) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to send a message");
        return;
      }

      if (!selectedRenovator.user_id) {
        // Fallback for partners without linked accounts
        toast.error("This partner is not set up for in-app messaging. Please contact them by phone.");
        return;
      }

      const conversationId = await MessagingService.getOrCreateConversation(
        contactForm.propertyId || null, // Use selected property or null
        selectedRenovator.user_id, // Renovator acts as "Landlord" (Provider)
        user.id // Seeker acts as "Tenant" (Consumer)
      );

      // Create a formatted message with all the details
      const selectedProperty = userProperties.find(p => p.id === contactForm.propertyId);
      const propertyInfo = selectedProperty
        ? `Property: ${selectedProperty.listing_title || selectedProperty.address}\n`
        : '';

      const messageContent = `New Project Inquiry:
      
${propertyInfo}Project Type: ${contactForm.projectType || 'Not specified'}
Budget: ${contactForm.budget || 'Not specified'}
Timeline: ${contactForm.timeline || 'Not specified'}

Description:
${contactForm.description}

Contact Details:
Name: ${contactForm.name}
Phone: ${contactForm.phone || 'Not provided'}
Email: ${contactForm.email}`;

      await MessagingService.sendMessage(conversationId, messageContent);

      const responseTime = selectedRenovator?.response_time || "a few hours";
      toast.success(`Message sent to ${selectedRenovator?.name}! They will respond within ${responseTime.toLowerCase()}.`);
      setSelectedRenovator(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleCallRenovator = (phone: string, ownerName?: string) => {
    if (!phone) {
      toast.error("Phone number not available");
      return;
    }
    setPhoneToCall(phone);
    setPhoneOwner(ownerName || "");
    setCallDialogOpen(true);
    setCopied(false);
  };

  const handleCopyPhone = async () => {
    if (!phoneToCall) return;
    try {
      await navigator.clipboard.writeText(phoneToCall);
      setCopied(true);
      toast.success("Phone number copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy phone number");
    }
  };

  const handleDialPhone = (phone: string) => {
    // Remove any non-digit characters except + for international numbers
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
      />
    ));
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Hammer className="h-8 w-8 text-orange-600" />
          Renovation Partners
        </h1>
        <p className="text-muted-foreground">
          Connect with trusted renovation professionals for your property repairs and improvements.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="browse">Browse Pros</TabsTrigger>
          <TabsTrigger value="emergency" className="text-red-600 data-[state=active]:text-red-700 data-[state=active]:bg-red-50">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Emergency Mode
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search renovators, companies, or specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-64">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Renovators Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading renovation partners...</p>
              </div>
            </div>
          ) : filteredRenovators.length === 0 ? (
            <div className="text-center py-12">
              <Hammer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No renovation partners found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRenovators.map((renovator) => (
                renovator.is_featured ? (
                  <Card key={renovator.id} className="group relative flex flex-col bg-white rounded-[24px] shadow-[0_10px_30px_rgba(255,191,0,0.1)] hover:shadow-[0_20px_50px_rgba(255,191,0,0.2)] transition-all duration-500 border-none overflow-hidden hover:-translate-y-2 lg:scale-[1.02] border-t-4 border-amber-400">
                    {/* Premium Header Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

                    <div className="p-6 md:p-8 flex flex-col h-full bg-gradient-to-b from-amber-50/20 to-transparent">
                      {/* Premium Badge */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="inline-flex flex-col">
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm mb-1 self-start">
                            <Award className="h-3 w-3 fill-amber-200" /> Roomie Premium Partner
                          </span>
                          <span className="text-[10px] font-bold text-amber-600/70 ml-1">Trusted by Roomie AI</span>
                        </div>
                      </div>

                      {/* Identity Block */}
                      <div className="flex items-start gap-4 mb-6">
                        {renovator.image_url ? (
                          <img
                            src={renovator.image_url}
                            alt={renovator.name}
                            className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                            <Hammer className="h-9 w-9 text-amber-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                            {renovator.name}
                          </h3>
                          <p className="text-sm font-bold text-slate-500 mb-2">{renovator.company}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-wider">
                              <CheckCircle className="h-3.5 w-3.5 fill-emerald-50" /> Verified
                            </span>
                            <span className="text-[10px] font-black text-blue-500 flex items-center gap-1 uppercase tracking-wider">
                              <ShieldCheck className="h-3.5 w-3.5 fill-blue-50" /> Licensed & Insured
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Proof Over Ratings */}
                      <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-amber-100/50 shadow-inner">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-slate-900">
                            <CheckCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-black uppercase tracking-tight">{renovator.completed_projects} completed Roomie projects</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-900">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-black uppercase tracking-tight">{renovator.years_experience}+ years professional experience</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-emerald-600 text-[11px] font-black italic">
                            Frequently hired by landlords & co-owners
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {renovator.specialties.slice(0, 3).map((specialty) => (
                          <div key={specialty} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold shadow-md">
                            {specialtyIcons[specialty] || <Wrench className="h-3 w-3" />}
                            {specialty}
                          </div>
                        ))}
                      </div>

                      {/* Location & Availability */}
                      <div className="flex items-center justify-between mb-8 text-[12px] font-bold text-slate-500 px-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-amber-500" />
                          {renovator.location}
                        </div>
                        {renovator.availability?.toLowerCase().includes('emergency') && (
                          <div className="flex items-center gap-2 text-red-500">
                            <Zap className="h-4 w-4 fill-red-100" />
                            Emergency jobs available
                          </div>
                        )}
                      </div>

                      {/* Primary CTA */}
                      <div className="mt-auto flex gap-3">
                        <Button
                          className="flex-[4] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm h-16 rounded-[20px] shadow-[0_10px_25px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 group/btn uppercase tracking-widest"
                          onClick={() => handleContactRenovator(renovator)}
                        >
                          GET PRIORITY QUOTE
                          <Zap className="h-4 w-4 fill-white" />
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-16 w-16 rounded-[20px] border-2 border-amber-100 text-amber-600 hover:bg-amber-50 transition-all shadow-sm"
                            onClick={() => setViewingRenovator(renovator)}
                          >
                            <MessageSquare className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Endorsement Footer */}
                      <div className="mt-6 pt-4 border-t border-amber-100/30">
                        <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
                          "Recommended by Roomie AI based on reliability, response time, and user outcomes."
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card key={renovator.id} className="group relative flex flex-col bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(110,89,255,0.12)] transition-all duration-500 border-none overflow-hidden hover:-translate-y-2">
                    <div className="p-6 md:p-8 flex flex-col h-full">

                      {/* 1) Identity Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          {renovator.image_url ? (
                            <img
                              src={renovator.image_url}
                              alt={renovator.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-2 border-white shadow-md">
                              <Hammer className="h-7 w-7 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight">
                              {renovator.name}
                            </h3>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-500">{renovator.company}</span>
                              {renovator.verified && (
                                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-wider mt-1">
                                  <CheckCircle className="h-3 w-3 fill-emerald-50" /> Verified Partner
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2) Primary Value Statement (Proof) */}
                      <div className="mb-6">
                        <p className="text-[15px] font-extrabold text-roomie-purple leading-tight uppercase tracking-tight">
                          {renovator.years_experience}+ Years Experience · {renovator.completed_projects} Completed Projects
                        </p>
                      </div>

                      {/* 3) Specialties (Chips) */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {renovator.specialties.slice(0, 3).map((specialty) => (
                          <div key={specialty} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold border border-slate-100/50 underline-offset-2 decoration-roomie-purple/30">
                            {specialtyIcons[specialty] || <Wrench className="h-3 w-3" />}
                            {specialty}
                          </div>
                        ))}
                        {renovator.specialties.length > 3 && (
                          <div className="px-2 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold">
                            +{renovator.specialties.length - 3} more
                          </div>
                        )}
                      </div>

                      {/* 4) Coverage & Pricing */}
                      <div className="flex items-center justify-between py-4 border-t border-slate-50 mb-6">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {renovator.location}
                        </div>
                        <div className="text-[12px] font-black text-slate-900 flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          {renovator.hourly_rate || "Quote required"}
                        </div>
                      </div>

                      {/* 5) Trust Signals */}
                      <div className="space-y-2 mb-8">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                          <Award className="h-3.5 w-3.5 text-roomie-purple/40" />
                          Licensed & Insured Professional
                        </div>
                        {renovator.availability?.toLowerCase().includes('emergency') && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-red-400">
                            <Zap className="h-3.5 w-3.5 fill-red-50" />
                            24/7 Emergency Service Available
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                          <Users className="h-3.5 w-3.5" />
                          Frequently hired by Roomie users
                        </div>
                      </div>

                      {/* 6) CTA Section */}
                      <div className="mt-auto flex gap-3">
                        <Button
                          className="flex-[3] bg-gradient-to-r from-roomie-purple to-indigo-600 hover:from-roomie-purple/90 hover:to-indigo-600/90 text-white font-black text-xs h-14 rounded-2xl shadow-[0_8px_20px_rgba(110,89,255,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                          onClick={() => handleContactRenovator(renovator)}
                        >
                          REQUEST QUOTE
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-14 w-14 rounded-2xl border-2 border-slate-100 text-slate-500 hover:text-roomie-purple hover:border-roomie-purple/30 hover:bg-roomie-purple/5 transition-all shadow-sm"
                          onClick={() => setViewingRenovator(renovator)}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-14 w-14 rounded-2xl border-2 border-slate-100 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all shadow-sm"
                          onClick={() => handleCallRenovator(renovator.phone || "", renovator.name)}
                          disabled={!renovator.phone}
                        >
                          <Phone className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              ))}
            </div>
          )}

          {/* Contact Dialog */}
          <Dialog open={!!selectedRenovator} onOpenChange={() => setSelectedRenovator(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  {selectedRenovator?.image_url ? (
                    <img
                      src={selectedRenovator.image_url}
                      alt={selectedRenovator.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Hammer className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <DialogTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Contact {selectedRenovator?.name}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedRenovator?.company}</p>
                    {selectedRenovator && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex">{renderStars(selectedRenovator.rating)}</div>
                        <span className="text-sm font-medium">{selectedRenovator.rating}</span>
                        <span className="text-sm text-muted-foreground">({selectedRenovator.review_count} reviews)</span>
                        {selectedRenovator.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Your Name *</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Select Property (Optional)</label>
                    <select
                      value={contactForm.propertyId}
                      onChange={(e) => setContactForm(prev => ({ ...prev, propertyId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">General Inquiry (No specific property)</option>
                      {userProperties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.listing_title || property.address}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Project Type</label>
                    <select
                      value={contactForm.projectType}
                      onChange={(e) => setContactForm(prev => ({ ...prev, projectType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select project type</option>
                      {selectedRenovator?.specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Project Description *</label>
                  <Textarea
                    value={contactForm.description}
                    onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project requirements..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Budget Range</label>
                    <select
                      value={contactForm.budget}
                      onChange={(e) => setContactForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-1000">Under $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="10000-25000">$10,000 - $25,000</option>
                      <option value="over-25000">Over $25,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeline</label>
                    <select
                      value={contactForm.timeline}
                      onChange={(e) => setContactForm(prev => ({ ...prev, timeline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP</option>
                      <option value="1-week">Within 1 week</option>
                      <option value="2-weeks">Within 2 weeks</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRenovator(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Details Dialog */}
          <Dialog open={!!viewingRenovator} onOpenChange={() => setViewingRenovator(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start gap-4 mb-4">
                  {viewingRenovator?.image_url ? (
                    <img
                      src={viewingRenovator.image_url}
                      alt={viewingRenovator.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Hammer className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {viewingRenovator?.name}
                      {viewingRenovator?.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </DialogTitle>
                    <p className="text-lg text-muted-foreground mt-1">{viewingRenovator?.company}</p>
                    {viewingRenovator && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex">{renderStars(viewingRenovator.rating)}</div>
                        <span className="font-medium">{viewingRenovator.rating}</span>
                        <span className="text-sm text-muted-foreground">({viewingRenovator.review_count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {viewingRenovator && (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                      {viewingRenovator.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{viewingRenovator.location}</span>
                        </div>
                      )}
                      {viewingRenovator.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{viewingRenovator.phone}</span>
                        </div>
                      )}
                      {viewingRenovator.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{viewingRenovator.email}</span>
                        </div>
                      )}
                      {viewingRenovator.website_url && (
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <a
                            href={viewingRenovator.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {viewingRenovator.website_url}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">Availability & Pricing</h3>
                      {viewingRenovator.availability && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{viewingRenovator.availability}</span>
                        </div>
                      )}
                      {viewingRenovator.hourly_rate && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{viewingRenovator.hourly_rate}</span>
                        </div>
                      )}
                      {viewingRenovator.response_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Response time: {viewingRenovator.response_time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {viewingRenovator.description && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-3">About</h3>
                      <p className="text-muted-foreground">{viewingRenovator.description}</p>
                    </div>
                  )}

                  {/* Specialties */}
                  {viewingRenovator.specialties && viewingRenovator.specialties.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {viewingRenovator.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-sm">
                            {specialtyIcons[specialty]}
                            <span className="ml-1">{specialty}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience & Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-semibold">{viewingRenovator.years_experience} years</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Projects Completed</p>
                        <p className="font-semibold">{viewingRenovator.completed_projects}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="font-semibold">{viewingRenovator.rating.toFixed(1)} / 5.0</p>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {viewingRenovator.certifications && viewingRenovator.certifications.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {viewingRenovator.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio */}
                  {viewingRenovator.portfolio && viewingRenovator.portfolio.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg border-b pb-2 mb-3">Portfolio</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {viewingRenovator.portfolio.map((item, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded border">
                            <p className="text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setViewingRenovator(null);
                        handleContactRenovator(viewingRenovator);
                      }}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    {viewingRenovator.phone && (
                      <Button
                        variant="outline"
                        onClick={() => handleCallRenovator(viewingRenovator.phone || "", viewingRenovator.name)}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                    {viewingRenovator.website_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(viewingRenovator.website_url, '_blank')}
                        className="flex-1"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                    <Button
                      variant="default"
                      onClick={() => setViewingRenovator(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Call Phone Dialog */}
          <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-orange-600" />
                  {phoneOwner ? `Call ${phoneOwner}` : "Phone Number"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {phoneToCall}
                  </div>
                  {phoneOwner && (
                    <p className="text-sm text-muted-foreground">
                      {phoneOwner}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDialPhone(phoneToCall)}
                    className="flex-1"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyPhone}
                    className="flex-1"
                    size="lg"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Click "Call Now" to dial the number, or "Copy" to copy it to your clipboard
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}
