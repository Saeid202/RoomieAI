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
  Hammer,
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
import { RenovationPartnerService, RenovationPartner, RenovationPartnerInput } from "@/services/renovationPartnerService";
import { toast } from "sonner";

export default function RenovationPartnersPage() {
  const [partners, setPartners] = useState<RenovationPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<RenovationPartner | null>(null);
  const [formData, setFormData] = useState<RenovationPartnerInput>({
    name: "",
    company: "",
    rating: 0,
    review_count: 0,
    specialties: [],
    location: "",
    phone: "",
    email: "",
    availability: "",
    hourly_rate: "",
    description: "",
    image_url: "",
    verified: false,
    response_time: "",
    completed_projects: 0,
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

  useEffect(() => {
    loadPartners();
    loadStats();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await RenovationPartnerService.getAllPartners();
      setPartners(data);
    } catch (error) {
      console.error('Failed to load partners:', error);
      toast.error('Failed to load renovation partners');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await RenovationPartnerService.getPartnerStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchTerm || 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && partner.is_active) ||
      (statusFilter === "inactive" && !partner.is_active);
    
    const matchesVerification = verificationFilter === "all" ||
      (verificationFilter === "verified" && partner.verified) ||
      (verificationFilter === "unverified" && !partner.verified);
    
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleAddPartner = () => {
    setEditingPartner(null);
    setFormData({
      name: "",
      company: "",
      rating: 0,
      review_count: 0,
      specialties: [],
      location: "",
      phone: "",
      email: "",
      availability: "",
      hourly_rate: "",
      description: "",
      image_url: "",
      verified: false,
      response_time: "",
      completed_projects: 0,
      years_experience: 0,
      certifications: [],
      portfolio: [],
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEditPartner = (partner: RenovationPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      company: partner.company,
      rating: partner.rating,
      review_count: partner.review_count,
      specialties: partner.specialties,
      location: partner.location,
      phone: partner.phone || "",
      email: partner.email || "",
      availability: partner.availability || "",
      hourly_rate: partner.hourly_rate || "",
      description: partner.description || "",
      image_url: partner.image_url || "",
      verified: partner.verified,
      response_time: partner.response_time || "",
      completed_projects: partner.completed_projects,
      years_experience: partner.years_experience,
      certifications: partner.certifications,
      portfolio: partner.portfolio,
      is_active: partner.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSavePartner = async () => {
    try {
      if (!formData.name.trim() || !formData.company.trim()) {
        toast.error("Name and company are required");
        return;
      }

      if (editingPartner) {
        await RenovationPartnerService.updatePartner(editingPartner.id, formData);
        toast.success("Partner updated successfully");
      } else {
        await RenovationPartnerService.createPartner(formData);
        toast.success("Partner created successfully");
      }

      setIsDialogOpen(false);
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Failed to save partner:', error);
      toast.error('Failed to save partner');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      await RenovationPartnerService.deletePartner(id);
      toast.success("Partner deleted successfully");
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Failed to delete partner:', error);
      toast.error('Failed to delete partner');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await RenovationPartnerService.togglePartnerStatus(id, isActive);
      toast.success(`Partner ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Failed to toggle partner status:', error);
      toast.error('Failed to update partner status');
    }
  };

  const handleToggleVerification = async (id: string, verified: boolean) => {
    try {
      await RenovationPartnerService.togglePartnerVerification(id, verified);
      toast.success(`Partner ${verified ? 'verified' : 'unverified'} successfully`);
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Failed to toggle partner verification:', error);
      toast.error('Failed to update partner verification');
    }
  };

  const handleSpecialtyChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, specialties }));
  };

  const handleCertificationChange = (value: string) => {
    const certifications = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, certifications }));
  };

  const handlePortfolioChange = (value: string) => {
    const portfolio = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, portfolio }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Hammer className="h-8 w-8 text-orange-600" />
            Renovation Partners
          </h1>
          <p className="text-muted-foreground mt-1">Manage renovation partners and service providers</p>
        </div>
        <Button onClick={handleAddPartner} className="flex items-center gap-2">
          <Plus size={18} />
          Add New Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All renovation partners</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
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
            <p className="text-xs text-muted-foreground">Verified partners</p>
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search partners, companies, or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={(value: any) => setVerificationFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renovation Partners ({filteredPartners.length})</CardTitle>
          <CardDescription>Manage all renovation partners in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading partners...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Hammer className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {partner.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{partner.company}</div>
                        {partner.email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {partner.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{partner.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({partner.review_count})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {partner.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {partner.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.specialties.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{partner.location}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={partner.is_active ? "default" : "secondary"}>
                            {partner.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {partner.verified && (
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
                            onClick={() => handleEditPartner(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(partner.id, !partner.is_active)}
                          >
                            {partner.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVerification(partner.id, !partner.verified)}
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePartner(partner.id)}
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

      {/* Add/Edit Partner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? "Edit Partner" : "Add New Partner"}
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
                  placeholder="Partner name"
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
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input
                id="specialties"
                value={formData.specialties.join(', ')}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                placeholder="Kitchen Remodeling, Bathroom Renovation, Flooring"
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
                  placeholder="$85/hour"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Partner description and experience..."
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
                <Label htmlFor="completed_projects">Completed Projects</Label>
                <Input
                  id="completed_projects"
                  type="number"
                  min="0"
                  value={formData.completed_projects}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed_projects: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="certifications">Certifications (comma-separated)</Label>
              <Input
                id="certifications"
                value={formData.certifications.join(', ')}
                onChange={(e) => handleCertificationChange(e.target.value)}
                placeholder="Licensed Contractor, WSIB Certified, First Aid Certified"
              />
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio (comma-separated)</Label>
              <Input
                id="portfolio"
                value={formData.portfolio.join(', ')}
                onChange={(e) => handlePortfolioChange(e.target.value)}
                placeholder="Modern Kitchen Remodel, Luxury Bathroom, Hardwood Flooring"
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
            <Button onClick={handleSavePartner}>
              {editingPartner ? "Update Partner" : "Add Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
