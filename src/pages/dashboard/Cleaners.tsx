import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Sparkles, 
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
  Shield,
  Home,
  Zap,
  Droplets,
  Wind,
  Scissors,
  Trash2,
  Car,
  Building,
  Hammer
} from "lucide-react";
import { toast } from "sonner";

interface Cleaner {
  id: string;
  name: string;
  company: string;
  rating: number;
  reviewCount: number;
  services: string[];
  location: string;
  phone: string;
  email: string;
  availability: string;
  hourlyRate: string;
  description: string;
  image: string;
  verified: boolean;
  responseTime: string;
  completedJobs: number;
  yearsExperience: number;
  certifications: string[];
  specialties: string[];
  equipment: string[];
  insurance: boolean;
  bonding: boolean;
}

const mockCleaners: Cleaner[] = [
  {
    id: "1",
    name: "Maria Rodriguez",
    company: "Sparkle Clean Services",
    rating: 4.9,
    reviewCount: 156,
    services: ["Residential Cleaning", "Move-in/Move-out", "Deep Cleaning", "Regular Maintenance"],
    location: "Downtown Toronto",
    phone: "(416) 555-0123",
    email: "maria@sparkleclean.ca",
    availability: "Available this week",
    hourlyRate: "$35/hour",
    description: "Professional cleaning services with eco-friendly products. Specializing in residential properties with attention to detail and customer satisfaction.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 2 hours",
    completedJobs: 342,
    yearsExperience: 8,
    certifications: ["Green Cleaning Certified", "Health & Safety", "Customer Service"],
    specialties: ["Eco-Friendly Cleaning", "Move-in/Move-out", "Post-Construction"],
    equipment: ["Professional Vacuums", "Steam Cleaners", "Eco-Friendly Products"],
    insurance: true,
    bonding: true
  },
  {
    id: "2",
    name: "James Chen",
    company: "Crystal Clear Cleaning",
    rating: 4.8,
    reviewCount: 203,
    services: ["Office Cleaning", "Commercial Spaces", "Carpet Cleaning", "Window Cleaning"],
    location: "North York",
    phone: "(416) 555-0456",
    email: "james@crystalclear.ca",
    availability: "Available next week",
    hourlyRate: "$40/hour",
    description: "Commercial and residential cleaning specialist with advanced equipment and trained staff. Focus on efficiency and quality results.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 4 hours",
    completedJobs: 567,
    yearsExperience: 12,
    certifications: ["Commercial Cleaning", "Carpet Cleaning", "Window Cleaning"],
    specialties: ["Commercial Cleaning", "Carpet Restoration", "Window Cleaning"],
    equipment: ["Commercial Vacuums", "Carpet Cleaners", "Window Cleaning Tools"],
    insurance: true,
    bonding: true
  },
  {
    id: "3",
    name: "Sarah Johnson",
    company: "Green Clean Solutions",
    rating: 4.7,
    reviewCount: 134,
    services: ["Eco-Friendly Cleaning", "Allergen-Free", "Pet-Friendly", "Regular Maintenance"],
    location: "Scarborough",
    phone: "(416) 555-0789",
    email: "sarah@greenclean.ca",
    availability: "Available today",
    hourlyRate: "$38/hour",
    description: "Environmentally conscious cleaning services using only green products. Perfect for families with allergies or pets.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 1 hour",
    completedJobs: 289,
    yearsExperience: 6,
    certifications: ["Green Cleaning", "Allergen Control", "Pet-Safe Products"],
    specialties: ["Eco-Friendly", "Allergen-Free", "Pet-Friendly"],
    equipment: ["HEPA Vacuums", "Green Products", "Microfiber Cloths"],
    insurance: true,
    bonding: false
  },
  {
    id: "4",
    name: "David Kim",
    company: "Premium Property Care",
    rating: 4.9,
    reviewCount: 98,
    services: ["Luxury Cleaning", "Post-Construction", "Move-in/Move-out", "Deep Cleaning"],
    location: "Mississauga",
    phone: "(905) 555-0321",
    email: "david@premiumcare.ca",
    availability: "Available in 3 days",
    hourlyRate: "$55/hour",
    description: "High-end cleaning services for luxury properties. Specialized in post-construction cleanup and move-in/move-out services.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 6 hours",
    completedJobs: 178,
    yearsExperience: 15,
    certifications: ["Luxury Cleaning", "Post-Construction", "Property Management"],
    specialties: ["Luxury Properties", "Post-Construction", "Move Services"],
    equipment: ["Professional Grade", "Specialized Tools", "Luxury Products"],
    insurance: true,
    bonding: true
  },
  {
    id: "5",
    name: "Lisa Thompson",
    company: "Quick Clean Express",
    rating: 4.6,
    reviewCount: 245,
    services: ["Same-Day Cleaning", "Emergency Cleaning", "Regular Maintenance", "One-Time Cleanups"],
    location: "Etobicoke",
    phone: "(416) 555-0654",
    email: "lisa@quickclean.ca",
    availability: "Available today",
    hourlyRate: "$32/hour",
    description: "Fast and reliable cleaning services with same-day availability. Perfect for urgent cleaning needs and regular maintenance.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 30 minutes",
    completedJobs: 423,
    yearsExperience: 10,
    certifications: ["Quick Service", "Emergency Response", "Customer Satisfaction"],
    specialties: ["Same-Day Service", "Emergency Cleaning", "Quick Turnaround"],
    equipment: ["Portable Equipment", "Quick-Dry Products", "Efficient Tools"],
    insurance: true,
    bonding: true
  },
  {
    id: "6",
    name: "Michael Brown",
    company: "Corporate Clean Pro",
    rating: 4.8,
    reviewCount: 167,
    services: ["Office Cleaning", "Building Maintenance", "Floor Care", "Restroom Sanitization"],
    location: "Markham",
    phone: "(905) 555-0987",
    email: "michael@corporateclean.ca",
    availability: "Available next week",
    hourlyRate: "$45/hour",
    description: "Professional commercial cleaning services for offices and buildings. Specialized in maintaining clean, healthy work environments.",
    image: "/api/placeholder/150/150",
    verified: true,
    responseTime: "Within 3 hours",
    completedJobs: 312,
    yearsExperience: 18,
    certifications: ["Commercial Cleaning", "Building Maintenance", "Health & Safety"],
    specialties: ["Office Cleaning", "Building Maintenance", "Floor Care"],
    equipment: ["Commercial Equipment", "Floor Machines", "Sanitization Tools"],
    insurance: true,
    bonding: true
  }
];

const serviceIcons: Record<string, React.ReactNode> = {
  "Residential Cleaning": <Home className="h-4 w-4" />,
  "Move-in/Move-out": <Car className="h-4 w-4" />,
  "Deep Cleaning": <Droplets className="h-4 w-4" />,
  "Regular Maintenance": <Clock className="h-4 w-4" />,
  "Office Cleaning": <Building className="h-4 w-4" />,
  "Commercial Spaces": <Building className="h-4 w-4" />,
  "Carpet Cleaning": <Wind className="h-4 w-4" />,
  "Window Cleaning": <Zap className="h-4 w-4" />,
  "Eco-Friendly Cleaning": <Shield className="h-4 w-4" />,
  "Allergen-Free": <Shield className="h-4 w-4" />,
  "Pet-Friendly": <Shield className="h-4 w-4" />,
  "Luxury Cleaning": <Sparkles className="h-4 w-4" />,
  "Post-Construction": <Hammer className="h-4 w-4" />,
  "Same-Day Cleaning": <Clock className="h-4 w-4" />,
  "Emergency Cleaning": <Zap className="h-4 w-4" />,
  "One-Time Cleanups": <Trash2 className="h-4 w-4" />,
  "Building Maintenance": <Building className="h-4 w-4" />,
  "Floor Care": <Wind className="h-4 w-4" />,
  "Restroom Sanitization": <Droplets className="h-4 w-4" />
};

export default function CleanersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    propertyType: "",
    description: "",
    frequency: "",
    budget: "",
    preferredDate: ""
  });

  const services = Array.from(new Set(mockCleaners.flatMap(c => c.services)));

  const filteredCleaners = mockCleaners.filter(cleaner => {
    const matchesSearch = cleaner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cleaner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cleaner.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = !selectedService || cleaner.services.includes(selectedService);
    return matchesSearch && matchesService;
  });

  const handleContactCleaner = (cleaner: Cleaner) => {
    setSelectedCleaner(cleaner);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      serviceType: "",
      propertyType: "",
      description: "",
      frequency: "",
      budget: "",
      preferredDate: ""
    });
  };

  const handleSendMessage = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate sending message
    toast.success(`Message sent to ${selectedCleaner?.name}! They will respond within ${selectedCleaner?.responseTime.toLowerCase()}.`);
    setSelectedCleaner(null);
  };

  const handleCallCleaner = (phone: string) => {
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
          <Sparkles className="h-8 w-8 text-blue-600" />
          Cleaning Partners
        </h1>
        <p className="text-muted-foreground">
          Connect with professional cleaning companies for your property maintenance and cleaning needs.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search cleaners, companies, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-64">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cleaners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCleaners.map((cleaner) => (
          <Card key={cleaner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{cleaner.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{cleaner.company}</p>
                  </div>
                </div>
                {cleaner.verified && (
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
                <div className="flex">{renderStars(cleaner.rating)}</div>
                <span className="text-sm font-medium">{cleaner.rating}</span>
                <span className="text-sm text-muted-foreground">({cleaner.reviewCount} reviews)</span>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {cleaner.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {serviceIcons[service]}
                      <span className="ml-1">{service}</span>
                    </Badge>
                  ))}
                  {cleaner.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{cleaner.services.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Location and Availability */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{cleaner.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{cleaner.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>{cleaner.hourlyRate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{cleaner.completedJobs} jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>{cleaner.yearsExperience} years exp.</span>
                </div>
              </div>

              {/* Insurance & Bonding */}
              <div className="flex gap-2">
                {cleaner.insurance && (
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    <Shield className="h-3 w-3 mr-1" />
                    Insured
                  </Badge>
                )}
                {cleaner.bonding && (
                  <Badge variant="outline" className="text-xs bg-green-50">
                    <Shield className="h-3 w-3 mr-1" />
                    Bonded
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {cleaner.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCallCleaner(cleaner.phone)}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactCleaner(cleaner)}
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

      {/* Contact Dialog */}
      <Dialog open={!!selectedCleaner} onOpenChange={() => setSelectedCleaner(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact {selectedCleaner?.name}
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
                <label className="text-sm font-medium">Service Type</label>
                <select
                  value={contactForm.serviceType}
                  onChange={(e) => setContactForm(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select service type</option>
                  {selectedCleaner?.services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Property Type</label>
                <select
                  value={contactForm.propertyType}
                  onChange={(e) => setContactForm(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select property type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="office">Office</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={contactForm.frequency}
                  onChange={(e) => setContactForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select frequency</option>
                  <option value="one-time">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as-needed">As needed</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Service Description *</label>
              <Textarea
                value={contactForm.description}
                onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your cleaning needs..."
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
                  <option value="under-100">Under $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200-400">$200 - $400</option>
                  <option value="400-600">$400 - $600</option>
                  <option value="over-600">Over $600</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Preferred Date</label>
                <Input
                  type="date"
                  value={contactForm.preferredDate}
                  onChange={(e) => setContactForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedCleaner(null)}
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
