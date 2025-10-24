import { useState, useEffect } from "react";
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
import { CleanerService, Cleaner } from "@/services/cleanerService";

const serviceIcons: Record<string, React.ReactNode> = {
  "Residential Cleaning": <Home className="h-4 w-4" />,
  "Office Cleaning": <Building className="h-4 w-4" />,
  "Deep Cleaning": <Sparkles className="h-4 w-4" />,
  "Move-in/Move-out": <Car className="h-4 w-4" />,
  "Commercial Cleaning": <Building className="h-4 w-4" />,
  "Post-Construction": <Hammer className="h-4 w-4" />,
  "Carpet Cleaning": <Wind className="h-4 w-4" />,
  "Window Cleaning": <Droplets className="h-4 w-4" />,
  "Eco-Friendly Cleaning": <Shield className="h-4 w-4" />,
  "Green Cleaning": <Shield className="h-4 w-4" />,
  "Allergen-Free Cleaning": <Shield className="h-4 w-4" />,
  "Pet-Friendly Cleaning": <Shield className="h-4 w-4" />,
  "Luxury Cleaning": <Sparkles className="h-4 w-4" />,
  "Same-Day Cleaning": <Clock className="h-4 w-4" />,
  "Emergency Cleaning": <Zap className="h-4 w-4" />,
  "One-Time Cleanups": <Trash2 className="h-4 w-4" />,
  "Building Maintenance": <Building className="h-4 w-4" />,
  "Floor Care": <Wind className="h-4 w-4" />,
  "Restroom Sanitization": <Droplets className="h-4 w-4" />
};

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCleaners();
  }, []);

  const loadCleaners = async () => {
    try {
      setLoading(true);
      const data = await CleanerService.getActiveCleaners();
      setCleaners(data);
    } catch (error) {
      console.error('Failed to load cleaners:', error);
      toast.error('Failed to load cleaners');
    } finally {
      setLoading(false);
    }
  };

  const services = Array.from(new Set(cleaners.flatMap(c => c.services)));

  const filteredCleaners = cleaners.filter(cleaner => {
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
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Message sent successfully! The cleaner will contact you soon.");
    setSelectedCleaner(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Professional Cleaners
          </h1>
          <p className="text-muted-foreground mt-1">
            Find trusted cleaning professionals for your property
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Perfect Cleaner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, company, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading cleaners...</div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCleaners.length} cleaner{filteredCleaners.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Cleaners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCleaners.map((cleaner) => (
              <Card key={cleaner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {cleaner.image_url ? (
                          <img 
                            src={cleaner.image_url} 
                            alt={cleaner.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Sparkles className="h-6 w-6 text-blue-600" />
                        )}
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
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(cleaner.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{cleaner.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({cleaner.review_count} reviews)</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {cleaner.location}
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {cleaner.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {serviceIcons[service] || <Sparkles className="h-3 w-3 mr-1" />}
                          {service}
                        </Badge>
                      ))}
                      {cleaner.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cleaner.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {cleaner.hourly_rate && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>{cleaner.hourly_rate}</span>
                      </div>
                    )}
                    {cleaner.availability && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{cleaner.availability}</span>
                      </div>
                    )}
                    {cleaner.response_time && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <span>Responds {cleaner.response_time}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {cleaner.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cleaner.description}
                    </p>
                  )}

                  {/* Contact Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => handleContactCleaner(cleaner)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Cleaner
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Contact {cleaner.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Your Name *</label>
                            <Input
                              value={contactForm.name}
                              onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email *</label>
                            <Input
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone *</label>
                          <Input
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Your phone number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Service Type</label>
                          <select
                            value={contactForm.serviceType}
                            onChange={(e) => setContactForm(prev => ({ ...prev, serviceType: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                          >
                            <option value="">Select service type</option>
                            {cleaner.services.map(service => (
                              <option key={service} value={service}>{service}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Property Type</label>
                          <select
                            value={contactForm.propertyType}
                            onChange={(e) => setContactForm(prev => ({ ...prev, propertyType: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                          >
                            <option value="">Select property type</option>
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Condo">Condo</option>
                            <option value="Office">Office</option>
                            <option value="Commercial">Commercial</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Project Description</label>
                          <Textarea
                            value={contactForm.description}
                            onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your cleaning needs..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Frequency</label>
                            <select
                              value={contactForm.frequency}
                              onChange={(e) => setContactForm(prev => ({ ...prev, frequency: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-md bg-background"
                            >
                              <option value="">Select frequency</option>
                              <option value="One-time">One-time</option>
                              <option value="Weekly">Weekly</option>
                              <option value="Bi-weekly">Bi-weekly</option>
                              <option value="Monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Budget</label>
                            <Input
                              value={contactForm.budget}
                              onChange={(e) => setContactForm(prev => ({ ...prev, budget: e.target.value }))}
                              placeholder="e.g., $100-200"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Preferred Date</label>
                          <Input
                            type="date"
                            value={contactForm.preferredDate}
                            onChange={(e) => setContactForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleSendMessage} className="w-full">
                          Send Message
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredCleaners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No cleaners found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or check back later for new cleaners.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}