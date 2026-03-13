import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, Property, updateProperty, fetchInvestorOffers, submitInvestorOffer, InvestorOffer, deleteInvestorOffer, updateInvestorOffer } from "@/services/propertyService";
import { useRole } from "@/contexts/RoleContext";
import { Calendar, DollarSign, MapPin, Volume2, Play, Square, Box, ChevronLeft, ChevronRight, User, Users, Pencil, Trash2, Check, X, MessageSquare, Reply, Zap, CalendarCheck, Link as LinkIcon, Bookmark } from "lucide-react";
import { PropertyVideoPlayer } from "@/components/property/PropertyVideoPlayer";
import { PropertyDocumentViewer } from "@/components/property/PropertyDocumentViewerSimplified";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MessageButton } from "@/components/MessageButton";
import { QuickApplyModal } from "@/components/application/QuickApplyModal";
import { ScheduleViewingModal } from "@/components/property/ScheduleViewingModal";
import { MakeOfferModal, OfferData } from "@/components/property/MakeOfferModal";
import { checkProfileCompleteness, getTenantProfileForApplication } from "@/utils/profileCompleteness";
import { submitQuickApplication, hasUserApplied } from "@/services/quickApplyService";
import { fetchMLSListingById, MLSListing } from "@/services/repliersService";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [property, setProperty] = useState<Property | null>(null);
  const [mlsListing, setMlsListing] = useState<MLSListing | null>(null);
  const [isMLS, setIsMLS] = useState(false);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useRole();
  const { user } = useAuth();

  const isOwner = !!(role === 'landlord' && user && property && user.id === property.user_id);
  const isSale = property ? !!(property as any).sales_price : false;
  const isCoOwnership = property ? !!(property as any).is_co_ownership : false;

  // Inline edit states
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState<string>("");
  const [securityDraft, setSecurityDraft] = useState<string>("");
