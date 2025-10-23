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
  Zap
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

export default function RenovatorsPage() {
  const [renovators, setRenovators] = useState<RenovationPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedRenovator, setSelectedRenovator] = useState<RenovationPartner | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    description: "",
    budget: "",
    timeline: ""
  });

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

  const handleContactRenovator = (renovator: Renovator) => {
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
    toast.success(`Message sent to ${selectedRenovator?.name}! They will respond within ${selectedRenovator?.responseTime.toLowerCase()}.`);
    setSelectedRenovator(null);
  };

  const handleCallRenovator = (phone: string) => {
    toast.info(`Calling ${phone}...`);
    // In a real app, this would initiate a phone call
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRenovators.map((renovator) => (
          <Card key={renovator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Hammer className="h-6 w-6 text-gray-600" />
                  </div>
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
                  <span>{renovator.hourlyRate}</span>
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
                  onClick={() => handleCallRenovator(renovator.phone)}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactRenovator(renovator)}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
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
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact {selectedRenovator?.name}
            </DialogTitle>
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
    </div>
  );
}
