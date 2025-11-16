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
  Hammer,
  Eye,
  Copy,
  Check
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
  const [viewingCleaner, setViewingCleaner] = useState<Cleaner | null>(null);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [phoneToCall, setPhoneToCall] = useState<string>("");
  const [phoneOwner, setPhoneOwner] = useState<string>("");
  const [copied, setCopied] = useState(false);
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
    
    const responseTime = selectedCleaner?.response_time || "a few hours";
    toast.success(`Message sent to ${selectedCleaner?.name}! They will respond within ${responseTime.toLowerCase()}.`);
    setSelectedCleaner(null);
  };

  const handleCallCleaner = (phone: string, ownerName?: string) => {
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
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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

      {/* Cleaners Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cleaners...</p>
          </div>
        </div>
      ) : filteredCleaners.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cleaners found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCleaners.map((cleaner) => (
              <Card key={cleaner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {cleaner.image_url ? (
                          <img 
                            src={cleaner.image_url} 
                          alt={`${cleaner.name}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                          />
                        ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-6 w-6 text-gray-600" />
                        </div>
                        )}
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
                    <span className="text-sm text-muted-foreground">({cleaner.review_count} reviews)</span>
                  </div>

                  {/* Services */}
                  <div>
                    <p className="text-sm font-medium mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {cleaner.services.slice(0, 3).map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {serviceIcons[service] || <Sparkles className="h-3 w-3" />}
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
                      <span>{cleaner.hourly_rate || "Contact for pricing"}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{cleaner.completed_jobs} jobs</span>
                    </div>
                      <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span>{cleaner.years_experience} years exp.</span>
                      </div>
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
                      onClick={() => setViewingCleaner(cleaner)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCallCleaner(cleaner.phone || "", cleaner.name)}
                      disabled={!cleaner.phone}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                      <Button 
                      variant="outline"
                      size="sm"
                        onClick={() => handleContactCleaner(cleaner)}
                      >
                      <MessageSquare className="h-4 w-4" />
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Contact Dialog */}
      <Dialog open={!!selectedCleaner} onOpenChange={() => setSelectedCleaner(null)}>
        <DialogContent className="max-w-2xl">
                      <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              {selectedCleaner?.image_url ? (
                <img
                  src={selectedCleaner.image_url}
                  alt={selectedCleaner.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact {selectedCleaner?.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{selectedCleaner?.company}</p>
                {selectedCleaner && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">{renderStars(selectedCleaner.rating)}</div>
                    <span className="text-sm font-medium">{selectedCleaner.rating}</span>
                    <span className="text-sm text-muted-foreground">({selectedCleaner.review_count} reviews)</span>
                    {selectedCleaner.verified && (
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
                            <label className="text-sm font-medium">Frequency</label>
                            <select
                              value={contactForm.frequency}
                              onChange={(e) => setContactForm(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select frequency</option>
                              <option value="One-time">One-time</option>
                              <option value="Weekly">Weekly</option>
                              <option value="Bi-weekly">Bi-weekly</option>
                              <option value="Monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                <label className="text-sm font-medium">Budget Range</label>
                            <Input
                              value={contactForm.budget}
                              onChange={(e) => setContactForm(prev => ({ ...prev, budget: e.target.value }))}
                              placeholder="e.g., $100-200"
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

      {/* View Details Dialog */}
      <Dialog open={!!viewingCleaner} onOpenChange={() => setViewingCleaner(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-4 mb-4">
              {viewingCleaner?.image_url ? (
                <img
                  src={viewingCleaner.image_url}
                  alt={viewingCleaner.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-12 w-12 text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {viewingCleaner?.name}
                  {viewingCleaner?.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-lg text-muted-foreground mt-1">{viewingCleaner?.company}</p>
                {viewingCleaner && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">{renderStars(viewingCleaner.rating)}</div>
                    <span className="font-medium">{viewingCleaner.rating}</span>
                    <span className="text-sm text-muted-foreground">({viewingCleaner.review_count} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {viewingCleaner && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                  {viewingCleaner.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{viewingCleaner.location}</span>
                    </div>
                  )}
                  {viewingCleaner.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{viewingCleaner.phone}</span>
                    </div>
                  )}
                  {viewingCleaner.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{viewingCleaner.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Availability & Pricing</h3>
                  {viewingCleaner.availability && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{viewingCleaner.availability}</span>
                    </div>
                  )}
                  {viewingCleaner.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>{viewingCleaner.hourly_rate}</span>
                    </div>
                  )}
                  {viewingCleaner.response_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Response time: {viewingCleaner.response_time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewingCleaner.description && (
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">About</h3>
                  <p className="text-muted-foreground">{viewingCleaner.description}</p>
                </div>
              )}

              {/* Services */}
              {viewingCleaner.services && viewingCleaner.services.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingCleaner.services.map((service) => (
                      <Badge key={service} variant="outline" className="text-sm">
                        {serviceIcons[service] || <Sparkles className="h-3 w-3" />}
                        <span className="ml-1">{service}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-semibold">{viewingCleaner.years_experience} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Jobs Completed</p>
                    <p className="font-semibold">{viewingCleaner.completed_jobs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold">{viewingCleaner.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {viewingCleaner.certifications && viewingCleaner.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingCleaner.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        <Award className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {viewingCleaner.portfolio && viewingCleaner.portfolio.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">Portfolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {viewingCleaner.portfolio.map((item, index) => (
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
                    setViewingCleaner(null);
                    handleContactCleaner(viewingCleaner);
                  }}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                {viewingCleaner.phone && (
                  <Button
                    variant="outline"
                    onClick={() => handleCallCleaner(viewingCleaner.phone || "", viewingCleaner.name)}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={() => setViewingCleaner(null)}
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
              <Phone className="h-5 w-5 text-blue-600" />
              {phoneOwner ? `Call ${phoneOwner}` : "Phone Number"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
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
    </div>
  );
}