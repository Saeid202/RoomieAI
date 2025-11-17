import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Sparkles,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Users,
  DollarSign
} from "lucide-react";

import { toast } from "sonner";
import { CleanerService, Cleaner, CleanerInput } from "@/services/cleanerService";
import { ImageUploadService } from "@/services/imageUploadService";

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<Cleaner | null>(null);
  const [formData, setFormData] = useState<CleanerInput>({
    name: "",
    company: "",
    rating: 0,
    review_count: 0,
    services: [],
    location: "",
    phone: "",
    email: "",
    availability: "",
    hourly_rate: "",
    description: "",
    image_url: "",
    verified: false,
    response_time: "",
    completed_jobs: 0,
    years_experience: 0,
    certifications: [],
    portfolio: [],
    is_active: true
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    averageRating: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewingCleaner, setViewingCleaner] = useState<Cleaner | null>(null);

  useEffect(() => {
    loadCleaners();
    loadStats();
  }, []);

  const loadCleaners = async () => {
    try {
      setLoading(true);
      const data = await CleanerService.getAllCleaners();
      setCleaners(data);
    } catch (error) {
      console.error('Failed to load cleaners:', error);
      toast.error('Failed to load cleaners');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await CleanerService.getCleanerStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filteredCleaners = cleaners.filter(cleaner => {
    const matchesSearch = cleaner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleaner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleaner.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && cleaner.is_active) ||
      (statusFilter === "inactive" && !cleaner.is_active);
    
    const matchesVerification = verificationFilter === "all" ||
      (verificationFilter === "verified" && cleaner.verified) ||
      (verificationFilter === "unverified" && !cleaner.verified);
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleAddCleaner = () => {
    setEditingCleaner(null);
    setFormData({
      name: "",
      company: "",
      rating: 0,
      review_count: 0,
      services: [],
      location: "",
      phone: "",
      email: "",
      availability: "",
      hourly_rate: "",
      description: "",
      image_url: "",
      verified: false,
      response_time: "",
      completed_jobs: 0,
      years_experience: 0,
      certifications: [],
      portfolio: [],
      is_active: true
    });
    setImageFile(null);
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleEditCleaner = (cleaner: Cleaner) => {
    setEditingCleaner(cleaner);
    setFormData({
      name: cleaner.name,
      company: cleaner.company,
      rating: cleaner.rating,
      review_count: cleaner.review_count,
      services: cleaner.services,
      location: cleaner.location,
      phone: cleaner.phone || "",
      email: cleaner.email || "",
      availability: cleaner.availability || "",
      hourly_rate: cleaner.hourly_rate || "",
      description: cleaner.description || "",
      image_url: cleaner.image_url || "",
      verified: cleaner.verified,
      response_time: cleaner.response_time || "",
      completed_jobs: cleaner.completed_jobs,
      years_experience: cleaner.years_experience,
      certifications: cleaner.certifications,
      portfolio: cleaner.portfolio,
      is_active: cleaner.is_active
    });
    setImageFile(null);
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleSaveCleaner = async () => {
    try {
      if (!formData.name.trim() || !formData.company.trim()) {
        toast.error("Name and company are required");
        return;
      }

      let finalFormData = { ...formData };

      // Handle image upload if there's a new image
      if (imageFile) {
        setUploadingImage(true);
        const uploadResult = await ImageUploadService.uploadImage(imageFile);
        
        if (!uploadResult.success) {
          toast.error(uploadResult.error || 'Failed to upload image');
          setUploadingImage(false);
          return;
        }

        finalFormData.image_url = uploadResult.url || "";
        setUploadingImage(false);
      }

      if (editingCleaner) {
        await CleanerService.updateCleaner(editingCleaner.id, finalFormData);
        toast.success("Cleaner updated successfully");
      } else {
        await CleanerService.createCleaner(finalFormData);
        toast.success("Cleaner created successfully");
      }

      // Reset form
      setImageFile(null);
      setImagePreview("");
      setIsDialogOpen(false);
      loadCleaners();
      loadStats();
    } catch (error) {
      console.error('Failed to save cleaner:', error);
      toast.error('Failed to save cleaner');
      setUploadingImage(false);
    }
  };

  const handleDeleteCleaner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cleaner?')) return;

    try {
      await CleanerService.deleteCleaner(id);
      toast.success("Cleaner deleted successfully");
      loadCleaners();
      loadStats();
    } catch (error) {
      console.error('Failed to delete cleaner:', error);
      toast.error('Failed to delete cleaner');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await CleanerService.toggleCleanerStatus(id, isActive);
      toast.success(`Cleaner ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadCleaners();
      loadStats();
    } catch (error) {
      console.error('Failed to toggle cleaner status:', error);
      toast.error('Failed to update cleaner status');
    }
  };

  const handleToggleVerification = async (id: string, verified: boolean) => {
    try {
      await CleanerService.toggleCleanerVerification(id, verified);
      toast.success(`Cleaner ${verified ? 'verified' : 'unverified'} successfully`);
      loadCleaners();
      loadStats();
    } catch (error) {
      console.error('Failed to toggle cleaner verification:', error);
      toast.error('Failed to update cleaner verification');
    }
  };

  const handleServiceChange = (value: string) => {
    const services = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, services }));
  };

  const handleCertificationChange = (value: string) => {
    const certifications = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, certifications }));
  };

  const handlePortfolioChange = (value: string) => {
    const portfolio = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, portfolio }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate image
      const validation = ImageUploadService.validateImage(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid image file');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Cleaners
          </h1>
          <p className="text-muted-foreground mt-1">Manage cleaning service providers</p>
        </div>
        <Button onClick={handleAddCleaner} className="flex items-center gap-2">
          <Plus size={18} />
          Add New Cleaner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cleaners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All cleaning service providers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cleaners</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Verified cleaners</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search cleaners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={verificationFilter} onValueChange={(value: "all" | "verified" | "unverified") => setVerificationFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cleaners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaners ({filteredCleaners.length})</CardTitle>
          <CardDescription>
            Manage your cleaning service providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading cleaners...</div>
            </div>
          ) : filteredCleaners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-muted-foreground text-center">
                <p className="text-lg font-medium">No cleaners found</p>
                <p className="text-sm">Get started by adding your first cleaner</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCleaners.map((cleaner) => (
                    <TableRow key={cleaner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {cleaner.image_url && (
                            <img 
                              src={cleaner.image_url} 
                              alt={cleaner.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{cleaner.name}</div>
                            {cleaner.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {cleaner.phone}
                              </div>
                            )}
                            {cleaner.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {cleaner.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{cleaner.company}</div>
                        {cleaner.hourly_rate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            {cleaner.hourly_rate}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{cleaner.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({cleaner.review_count})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cleaner.services.slice(0, 2).map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {cleaner.services.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{cleaner.services.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {cleaner.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={cleaner.is_active ? "default" : "secondary"}>
                            {cleaner.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {cleaner.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingCleaner(cleaner)}
                            title="View Cleaner"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCleaner(cleaner)}
                            title="Edit Cleaner"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(cleaner.id, !cleaner.is_active)}
                          >
                            {cleaner.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVerification(cleaner.id, !cleaner.verified)}
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCleaner(cleaner.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Cleaner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCleaner ? "Edit Cleaner" : "Add New Cleaner"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Cleaner name"
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Province"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>

            <div>
              <Label htmlFor="image_upload">Cleaner Photo</Label>
              <div className="space-y-4">
                {/* Image Preview */}
                {(imagePreview || formData.image_url) && (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Cleaner preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* File Upload Input */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="image_upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image_upload"
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </label>
                  {uploadingImage && (
                    <div className="text-sm text-blue-600">Uploading...</div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Upload a photo (JPEG, PNG, WebP, or GIF. Max 5MB)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="services">Services (comma-separated)</Label>
              <Input
                id="services"
                value={formData.services.join(', ')}
                onChange={(e) => handleServiceChange(e.target.value)}
                placeholder="Residential Cleaning, Office Cleaning, Deep Cleaning"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="review_count">Review Count</Label>
                <Input
                  id="review_count"
                  type="number"
                  min="0"
                  value={formData.review_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, review_count: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <Input
                  id="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="$35/hour"
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="Available this week"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="response_time">Response Time</Label>
              <Input
                id="response_time"
                value={formData.response_time}
                onChange={(e) => setFormData(prev => ({ ...prev, response_time: e.target.value }))}
                placeholder="Within 2 hours"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Cleaner description and experience..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="years_experience">Years Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="completed_jobs">Completed Jobs</Label>
                <Input
                  id="completed_jobs"
                  type="number"
                  min="0"
                  value={formData.completed_jobs}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed_jobs: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="certifications">Certifications (comma-separated)</Label>
              <Input
                id="certifications"
                value={formData.certifications.join(', ')}
                onChange={(e) => handleCertificationChange(e.target.value)}
                placeholder="Green Cleaning Certified, Bonded & Insured, COVID-19 Safety Trained"
              />
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio (comma-separated)</Label>
              <Input
                id="portfolio"
                value={formData.portfolio.join(', ')}
                onChange={(e) => handlePortfolioChange(e.target.value)}
                placeholder="Luxury Condo Cleaning, Office Deep Clean, Move-out Service"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                />
                <Label htmlFor="verified">Verified</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCleaner}>
              {editingCleaner ? "Update Cleaner" : "Add Cleaner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Cleaner Dialog */}
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
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-12 w-12 text-blue-600" />
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
                    <span className="font-medium">{viewingCleaner.rating.toFixed(1)}</span>
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
                        <Sparkles className="h-3 w-3 mr-1" />
                        {service}
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

              {/* Status Information */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={viewingCleaner.is_active ? "default" : "secondary"}>
                    {viewingCleaner.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {viewingCleaner.verified && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Verification:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingCleaner(null);
                    handleEditCleaner(viewingCleaner);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Cleaner
                </Button>
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
    </div>
  );
}
