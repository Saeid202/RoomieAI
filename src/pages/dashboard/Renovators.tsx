import { useState, useEffect } from "react";
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
  Check
} from "lucide-react";
import { toast } from "sonner";
import { RenovationPartnerService, RenovationPartner } from "@/services/renovationPartnerService";

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
    description: "",
    budget: "",
    timeline: ""
  });
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    loadRenovators();
  }, []);

  const loadRenovators = async () => {
    try {
      setLoading(true);
      const data = await RenovationPartnerService.getActivePartners();
      setRenovators(data);
    } catch (error) {
      console.error('Failed to load renovators:', error);
      toast.error('Failed to load renovation partners');
    } finally {
      setLoading(false);
    }
  };

  const specialties = Array.from(new Set(renovators.flatMap(r => r.specialties)));

  const filteredRenovators = renovators.filter(renovator => {
    const matchesSearch = renovator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renovator.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renovator.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || renovator.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleContactRenovator = (renovator: RenovationPartner) => {
    setSelectedRenovator(renovator);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      projectType: "",
      description: "",
      budget: "",
      timeline: ""
    });
  };

  const handleSendMessage = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate sending message
    const responseTime = selectedRenovator?.response_time || "a few hours";
    toast.success(`Message sent to ${selectedRenovator?.name}! They will respond within ${responseTime.toLowerCase()}.`);
    setSelectedRenovator(null);
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
          {/* ...existing code... */}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRenovators.map((renovator) => (
                <Card key={renovator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {renovator.image_url ? (
                          <img
                            src={renovator.image_url}
                            alt={`${renovator.name}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Hammer className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{renovator.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{renovator.company}</p>
                        </div>
                      </div>
                      {renovator.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(renovator.rating)}</div>
                      <span className="text-sm font-medium">{renovator.rating}</span>
                      <span className="text-sm text-muted-foreground">({renovator.review_count} reviews)</span>
                    </div>

                    {/* Specialties */}
                    <div>
                      <p className="text-sm font-medium mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {renovator.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialtyIcons[specialty]}
                            <span className="ml-1">{specialty}</span>
                          </Badge>
                        ))}
                        {renovator.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{renovator.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Location and Availability */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{renovator.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{renovator.availability}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{renovator.hourly_rate || "Contact for pricing"}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{renovator.completed_projects} projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span>{renovator.years_experience} years exp.</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {renovator.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingRenovator(renovator)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallRenovator(renovator.phone || "", renovator.name)}
                        disabled={!renovator.phone}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactRenovator(renovator)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
