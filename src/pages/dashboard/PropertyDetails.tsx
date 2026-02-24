import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, Property, updateProperty, fetchInvestorOffers, submitInvestorOffer, InvestorOffer, deleteInvestorOffer, updateInvestorOffer } from "@/services/propertyService";
import { useRole } from "@/contexts/RoleContext";
import { Calendar, DollarSign, MapPin, Volume2, Play, Square, Box, ChevronLeft, ChevronRight, User, Users, Pencil, Trash2, Check, X, MessageSquare, Reply, Zap } from "lucide-react";
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
import { checkProfileCompleteness, getTenantProfileForApplication } from "@/utils/profileCompleteness";
import { submitQuickApplication, hasUserApplied } from "@/services/quickApplyService";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
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
  const [leaseDraft, setLeaseDraft] = useState<string>("");
  const [availableDraft, setAvailableDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [editingFacts, setEditingFacts] = useState(false);
  const [bedroomsDraft, setBedroomsDraft] = useState<string>("");
  const [bathroomsDraft, setBathroomsDraft] = useState<string>("");
  const [sqftDraft, setSqftDraft] = useState<string>("");
  const [parkingDraft, setParkingDraft] = useState<string>("");
  const [petPolicyDraft, setPetPolicyDraft] = useState<string>("");
  const [furnishedDraft, setFurnishedDraft] = useState<string>("");

  // Quick Apply states
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isSubmittingQuickApply, setIsSubmittingQuickApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isPlayingLocalAudio, setIsPlayingLocalAudio] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Co-buy interest states
  const [contributionAmount, setContributionAmount] = useState("");
  const [intendedUse, setIntendedUse] = useState("Live-In");
  const [flexibility, setFlexibility] = useState("Flexible");
  const [occupancyPlan, setOccupancyPlan] = useState("Single");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [offers, setOffers] = useState<InvestorOffer[]>([]);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editingOfferDraft, setEditingOfferDraft] = useState<Partial<InvestorOffer>>({});

  console.log("PropertyDetailsPage rendering", { id, loading, property, role, user });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        console.log("🔍 Loading property data for id:", id);
        if (!id) {
          console.error("❌ Missing property id");
          throw new Error("Missing property id");
        }

        // All properties (rental, sale, co-ownership) are in properties table
        console.log("📦 Fetching from properties table...");
        const data = await fetchPropertyById(id);
        console.log("✅ Property data loaded:", data);
        
        if (mounted) setProperty(data as any);

        // Load investor offers for sale/co-ownership properties
        const isSaleProperty = data.listing_category === 'sale' || data.listing_category === 'co-ownership';
        if (isSaleProperty && id) {
          console.log("📊 Loading investor offers...");
          const offersData = await fetchInvestorOffers(id);
          if (mounted) setOffers(offersData);
          console.log("✅ Investor offers loaded:", offersData.length);
        }
      } catch (e: any) {
        console.error("❌ Failed to load property", e);
        const errorMessage = e?.message || "Failed to load property";
        // Provide a more user-friendly error message
        if (errorMessage.includes("NOT_FOUND") || errorMessage.includes("PGRST116")) {
          if (mounted) setError("This property listing is no longer available. It may have been removed or the link is invalid.");
        } else {
          if (mounted) setError(errorMessage);
        }
      } finally {
        if (mounted) {
          console.log("🏁 Loading complete, setting loading=false");
          setLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (property) {
      setTitleDraft(property.listing_title || "");
      setDescDraft(property.description || "");
      const isSale = !!(property as any).sales_price;
      setPriceDraft(String(isSale ? (property as any).sales_price : property.monthly_rent ?? ""));
      setSecurityDraft(property.security_deposit != null ? String(property.security_deposit) : "");
      setLeaseDraft(property.lease_terms || "");
      setAvailableDraft(property.available_date || "");

      setBedroomsDraft(property.bedrooms != null ? String(property.bedrooms) : "");
      setBathroomsDraft(property.bathrooms != null ? String(property.bathrooms) : "");
      setSqftDraft(property.square_footage != null ? String(property.square_footage) : "");
      setParkingDraft(property.parking || "");
      setPetPolicyDraft(property.pet_policy || "");
      setFurnishedDraft(property.furnished ? 'Yes' : 'No');
    }
  }, [property]);

  const savePartial = async (updates: any) => {
    if (!property) return;
    try {
      setSaving(true);
      const clean: any = { ...updates };
      if (clean.monthly_rent != null) {
        clean.monthly_rent = parseFloat(String(clean.monthly_rent).replace(/[^0-9.]/g, ''));
        if (isNaN(clean.monthly_rent)) delete clean.monthly_rent;
      }
      if (clean.security_deposit != null) {
        clean.security_deposit = parseFloat(String(clean.security_deposit).replace(/[^0-9.]/g, ''));
        if (isNaN(clean.security_deposit)) delete clean.security_deposit;
      }
      if (clean.bedrooms != null) {
        clean.bedrooms = parseInt(String(clean.bedrooms).replace(/[^0-9]/g, ''));
        if (isNaN(clean.bedrooms)) delete clean.bedrooms;
      }
      if (clean.bathrooms != null) {
        clean.bathrooms = parseInt(String(clean.bathrooms).replace(/[^0-9]/g, ''));
        if (isNaN(clean.bathrooms)) delete clean.bathrooms;
      }
      if (clean.square_footage != null) {
        clean.square_footage = parseInt(String(clean.square_footage).replace(/[^0-9]/g, ''));
        if (isNaN(clean.square_footage)) delete clean.square_footage;
      }
      if (clean.furnished != null && typeof clean.furnished === 'string') {
        const v = String(clean.furnished).toLowerCase();
        clean.furnished = ['yes', 'true', '1'].includes(v);
      }
      const updated = await updateProperty(property.id, clean);
      setProperty(updated as Property);
      toast.success("Changes saved");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // SEO: title, meta description, canonical
  useEffect(() => {
    const title = property ? `${property.listing_title} – ${isSale ? 'Property' : 'Rental Property'} Details` : "Property Details";
    document.title = title;

    const descText = property?.description || `${property?.listing_title || "Property"} in ${property?.city || ""} ${property?.state || ""}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descText.slice(0, 155));

    // Determine the correct route based on property type
    const routePrefix = isSale ? 'buy' : 'rental-options';
    const canonicalHref = `${window.location.origin}/dashboard/${routePrefix}/${id || ''}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);

    // Structured data (basic)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Apartment',
      name: property?.listing_title,
      description: property?.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property?.address,
        addressLocality: property?.city,
        addressRegion: property?.state,
        postalCode: property?.zip_code,
      },
      numberOfRooms: property?.bedrooms,
      numberOfBathroomsTotal: property?.bathrooms,
      floorSize: property?.square_footage ? {
        '@type': 'QuantitativeValue',
        value: property?.square_footage,
        unitCode: 'FTK'
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: (property as any)?.sales_price || property?.monthly_rent,
        priceCurrency: 'USD',
        availabilityStarts: property?.available_date || undefined
      }
    };

    const scriptId = 'property-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(jsonLd);
  }, [property, id]);

  const availableDate = useMemo(() => {
    if (!property?.available_date) return null;
    const d = new Date(property.available_date);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
  }, [property?.available_date]);

  // Quick Apply Handlers
  const handleQuickApplyClick = async () => {
    if (!user) {
      toast.error("Please log in to apply");
      return;
    }

    // Check if already applied
    const applied = await hasUserApplied(user.id, id!);
    if (applied) {
      toast.error("You have already applied to this property");
      setHasApplied(true);
      return;
    }

    // Check profile completeness
    const completeness = await checkProfileCompleteness(user.id);

    if (!completeness.isComplete) {
      const missing = [
        ...completeness.missingFields,
        ...completeness.missingDocuments
      ];

      toast.error(
        `Please complete your profile first. Missing: ${missing.join(', ')}`,
        { duration: 5000 }
      );

      // Redirect to profile page
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 2000);
      return;
    }

    // Load profile data
    const data = await getTenantProfileForApplication(user.id);
    if (!data) {
      toast.error("Could not load profile data");
      return;
    }

    setProfileData(data);
    setShowQuickApplyModal(true);
  };

  const handleQuickApplyConfirm = async (message: string) => {
    if (!user || !property) return;

    setIsSubmittingQuickApply(true);

    try {
      console.log("Starting quick application submission...");
      const applicationId = await submitQuickApplication({
        user_id: user.id,
        property_id: property.id,
        message,
      });

      if (!applicationId) {
        throw new Error("Failed to submit application - no ID returned");
      }

      console.log("Application submitted successfully with ID:", applicationId);
      toast.success("Application submitted successfully!");
      setShowQuickApplyModal(false);
      setHasApplied(true);

      // Optionally navigate to applications page
      setTimeout(() => {
        navigate('/dashboard/applications');
      }, 1500);
    } catch (error) {
      console.error("Error submitting quick application:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to submit application: ${errorMessage}`);
    } finally {
      setIsSubmittingQuickApply(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Property Details</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Property Details</h1>
        </div>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-3xl">🏠</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Property Not Available</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || 'This property listing is no longer available. It may have been removed or the link is invalid.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button onClick={() => navigate('/dashboard/rental-options')}>
                Browse Properties
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <header className="mb-6">
        <div className="flex items-center gap-3">
          {!isOwner || !editingTitle ? (
            <h1 className="text-3xl font-bold tracking-tight">{property.listing_title}</h1>
          ) : (
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="max-w-lg text-3xl font-bold tracking-tight"
            />
          )}
          {isOwner && (
            !editingTitle ? (
              <Button variant="outline" size="sm" onClick={() => setEditingTitle(true)}>Edit</Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" disabled={saving} onClick={async () => { await savePartial({ listing_title: titleDraft || property.listing_title }); setEditingTitle(false); }}>Save</Button>
                <Button variant="outline" size="sm" onClick={() => { setTitleDraft(property.listing_title || ""); setEditingTitle(false); }}>Cancel</Button>
              </div>
            )
          )}
        </div>
        <p className="text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin className="h-4 w-4" /> {property.city}, {property.state}
        </p>
      </header>

      <main className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card>
            <div className="relative w-full aspect-video bg-black rounded-t-lg overflow-hidden group">
              {(() => {
                const showVideo = property.video_enabled !== false && property.images && property.images.length > 0;
                const totalSlides = (showVideo ? 1 : 0) + (property.images?.length || 0);

                const SlideContent = () => {
                  // Video Slide
                  if (showVideo && activeSlideIndex === 0) {
                    return (
                      <PropertyVideoPlayer
                        images={property.images || []}
                        audioUrl={property.audio_enabled !== false ? property.description_audio_url : undefined}
                        script={property.audio_enabled !== false ? property.video_script : undefined}
                        musicUrl={property.audio_enabled !== false ? property.background_music_url : undefined}
                        address={property.address}
                        price={String(property.monthly_rent)}
                        amenities={property.amenities || []}
                        autoPlay={false}
                      />
                    );
                  }

                  // Image Slide
                  const imageIndex = showVideo ? activeSlideIndex - 1 : activeSlideIndex;
                  const imageUrl = property.images?.[imageIndex];

                  if (imageUrl) {
                    return (
                      <img
                        src={imageUrl}
                        alt={`${property.listing_title} - view ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl text-gray-300">🏠</span>
                    </div>
                  );
                };

                return (
                  <>
                    <SlideContent />

                    {/* Navigation Controls */}
                    {totalSlides > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
                          }}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex((prev) => (prev + 1) % totalSlides);
                          }}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>

                        {/* Slide Counter */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm z-10">
                          {activeSlideIndex + 1} / {totalSlides}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
            <CardContent className="p-6">
              {/* Sales Voice Agent Player - Top Position */}
              {(property.description_audio_url || property.description) && (
                <div className="mb-6">
                  {property.description_audio_url ? (
                    <div className="bg-slate-50 border rounded-xl p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Volume2 className="h-3 w-3" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Audio Tour</h3>
                        </div>
                      </div>
                      <audio controls className="w-full h-8">
                        <source src={property.description_audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Volume2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Audio Tour</h3>
                          <p className="text-xs text-gray-500">Touch to listen highlights</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isPlayingLocalAudio ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200"
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(property.description);
                              const voices = window.speechSynthesis.getVoices();
                              const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
                              if (preferredVoice) utterance.voice = preferredVoice;

                              utterance.onend = () => setIsPlayingLocalAudio(false);
                              window.speechSynthesis.cancel();
                              window.speechSynthesis.speak(utterance);
                              setIsPlayingLocalAudio(true);
                            }}
                          >
                            <Play className="mr-2 h-3 w-3 fill-current" />
                            Play
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-red-50 text-red-600 border-red-200"
                            onClick={() => {
                              window.speechSynthesis.cancel();
                              setIsPlayingLocalAudio(false);
                            }}
                          >
                            <Square className="mr-2 h-3 w-3 fill-current" />
                            Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Co-buy Interest Section - Below Audio Tour */}
              {isSale && (
                <div className="mt-10 space-y-8 animate-fadeIn">
                  {/* Sales listing - no co-buy section */}
                </div>
              )}

              {/* 3D Model Viewer - Removed for debugging */}



              {/* Image Gallery */}







            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Price and Availability Block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!isOwner || !editingPrice ? (
                      <div className="flex items-center gap-1 font-semibold text-2xl text-primary">
                        <DollarSign className="h-6 w-6" />
                        <span>{isSale ? (property as any).sales_price : property.monthly_rent}</span>
                        {!isSale && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} placeholder="Monthly rent" className="w-24" />
                        <Input value={securityDraft} onChange={(e) => setSecurityDraft(e.target.value)} placeholder="Security" className="w-24" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isOwner || !editingPrice ? (
                      availableDate && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" /> Available {availableDate}
                        </div>
                      )
                    ) : (
                      <Input type="date" value={availableDraft} onChange={(e) => setAvailableDraft(e.target.value)} className="w-32" />
                    )}
                    {isOwner && (
                      !editingPrice ? (
                        <Button variant="outline" size="sm" onClick={() => setEditingPrice(true)}>Edit</Button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button size="sm" className="h-8 px-2" disabled={saving} onClick={async () => {
                            await savePartial({
                              monthly_rent: isSale ? undefined : priceDraft,
                              sales_price: isSale ? priceDraft : undefined,
                              security_deposit: securityDraft || null,
                              lease_terms: leaseDraft || null,
                              available_date: availableDraft || null,
                            });
                            setEditingPrice(false);
                          }}>Save</Button>
                          <Button variant="outline" className="h-8 px-2" size="sm" onClick={() => {
                            setPriceDraft(String(property.monthly_rent ?? ""));
                            setSecurityDraft(property.security_deposit != null ? String(property.security_deposit) : "");
                            setLeaseDraft(property.lease_terms || "");
                            setAvailableDraft(property.available_date || "");
                            setEditingPrice(false);
                          }}>Cancel</Button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Type/Address/Nearby Block */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground font-medium">Type:</span>
                    <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                      {property.property_type || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-gray-700 font-medium">
                      {property.address}, {property.city}, {property.state} {property.zip_code}
                    </span>
                  </div>

                  {property.nearby_amenities && property.nearby_amenities.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nearby:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {property.nearby_amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded text-[10px] font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.nearby_amenities.length > 4 && (
                          <span className="bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded text-[10px]">
                            +{property.nearby_amenities.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description Block */}
              <article className="prose prose-sm max-w-none">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-base">About this place</h3>
                  {isOwner && (
                    !editingDesc ? (
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingDesc(true)}>Edit</Button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button size="sm" className="h-6 text-xs" disabled={saving} onClick={async () => { await savePartial({ description: descDraft }); setEditingDesc(false); }}>Save</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setDescDraft(property.description || ""); setEditingDesc(false); }}>Cancel</Button>
                      </div>
                    )
                  )}
                </div>
                {!isOwner || !editingDesc ? (
                  <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{property.description}</p>
                ) : (
                  <Textarea className="w-full text-sm" value={descDraft} onChange={(e) => setDescDraft(e.target.value)} />
                )}
              </article>

              <Separator />

              {/* Key Facts Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">Key Details</h3>
                  {isOwner && !editingFacts && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingFacts(true)}>Edit</Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Bedrooms */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-muted-foreground text-xs">Bedrooms</div>
                    {!isOwner || !editingFacts ? (
                      <div className="font-medium">{property.bedrooms ?? '—'}</div>
                    ) : (
                      <Input value={bedroomsDraft} onChange={(e) => setBedroomsDraft(e.target.value)} className="h-7 text-xs" />
                    )}
                  </div>
                  {/* Bathrooms */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-muted-foreground text-xs">Bathrooms</div>
                    {!isOwner || !editingFacts ? (
                      <div className="font-medium">{property.bathrooms ?? '—'}</div>
                    ) : (
                      <Input value={bathroomsDraft} onChange={(e) => setBathroomsDraft(e.target.value)} className="h-7 text-xs" />
                    )}
                  </div>
                  {/* Sqft */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-muted-foreground text-xs">Sqft</div>
                    {!isOwner || !editingFacts ? (
                      <div className="font-medium">{property.square_footage ?? '—'}</div>
                    ) : (
                      <Input value={sqftDraft} onChange={(e) => setSqftDraft(e.target.value)} className="h-7 text-xs" />
                    )}
                  </div>
                  {/* Parking */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-muted-foreground text-xs">Parking</div>
                    {!isOwner || !editingFacts ? (
                      <div className="font-medium truncate" title={property.parking}>{property.parking || '—'}</div>
                    ) : (
                      <Input value={parkingDraft} onChange={(e) => setParkingDraft(e.target.value)} className="h-7 text-xs" />
                    )}
                  </div>
                  {/* Pet Policy */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-muted-foreground text-xs">Pet Policy</div>
                    {!isOwner || !editingFacts ? (
                      <div className="font-medium truncate" title={property.pet_policy}>{property.pet_policy || '—'}</div>
                    ) : (
                      <Input value={petPolicyDraft} onChange={(e) => setPetPolicyDraft(e.target.value)} className="h-7 text-xs" />
                    )}
                  </div>
                  {/* Furnished */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-muted-foreground text-xs">Furnished</div>
                    {!isOwner || !editingFacts ? (
                      <div className="font-medium">{property.furnished ? 'Yes' : 'No'}</div>
                    ) : (
                      <Input value={furnishedDraft} onChange={(e) => setFurnishedDraft(e.target.value)} className="h-7 text-xs" />
                    )}
                  </div>
                </div>

                {isOwner && editingFacts && (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="sm" className="h-7 text-xs" disabled={saving} onClick={async () => {
                      await savePartial({
                        bedrooms: bedroomsDraft,
                        bathrooms: bathroomsDraft,
                        square_footage: sqftDraft,
                        parking: parkingDraft || null as any,
                        pet_policy: petPolicyDraft || null as any,
                        furnished: furnishedDraft,
                      });
                      setEditingFacts(false);
                    }}>Save</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                      setBedroomsDraft(property.bedrooms != null ? String(property.bedrooms) : "");
                      setBathroomsDraft(property.bathrooms != null ? String(property.bathrooms) : "");
                      setSqftDraft(property.square_footage != null ? String(property.square_footage) : "");
                      setParkingDraft(property.parking || "");
                      setPetPolicyDraft(property.pet_policy || "");
                      setFurnishedDraft(property.furnished ? 'Yes' : 'No');
                      setEditingFacts(false);
                    }}>Cancel</Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Utilities & Amenities */}
              <div className="space-y-4">
                {Array.isArray(property.utilities_included) && property.utilities_included.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Utilities Included</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {property.utilities_included.map((u) => (
                        <Badge key={u} variant="secondary" className="font-normal text-xs">{u}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Amenities</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {property.amenities.map((a) => (
                        <Badge key={a} variant="outline" className="font-normal text-xs bg-white">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Location Details */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Location Details</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  {property.neighborhood && <div><span className="font-medium">Neighborhood:</span> {property.neighborhood}</div>}
                  {property.public_transport_access && (
                    <div><span className="font-medium">Transit:</span> {property.public_transport_access}</div>
                  )}
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Property Documents (for sales listings, non-owners) */}
          {(() => {
            const shouldShow = isSale && !isOwner;
            return shouldShow ? (
              <PropertyDocumentViewer
                propertyId={property.id}
                propertyAddress={`${property.address}, ${property.city}, ${property.state}`}
              />
            ) : null;
          })()}

          <div className="space-y-2">
            {role !== 'landlord' && !isSale && !hasApplied && (
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 shadow-lg shadow-purple-200"
                onClick={handleQuickApplyClick}
              >
                <Zap className="h-4 w-4 mr-2" />
                Quick Apply
              </Button>
            )}
            {hasApplied && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-semibold">✓ Application Submitted</p>
                <p className="text-green-600 text-sm mt-1">The landlord will review your application</p>
              </div>
            )}
            {role !== 'landlord' && property && (
              <MessageButton
                propertyId={!isSale ? property.id : undefined}
                salesListingId={isSale ? property.id : undefined}
                landlordId={property.user_id}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-200"
              >
                {isCoOwnership ? "Join Co-Ownership Group" : "Message"}
              </MessageButton>
            )}
            <Button variant="outline" className="w-full border-2 border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold" onClick={() => navigate(-1)}>
              {role === 'landlord' ? 'Back to properties' : (isSale ? 'Back to opportunities' : 'Back to results')}
            </Button>
          </div>
        </aside>
      </main>

      {/* Quick Apply Modal */}
      {showQuickApplyModal && profileData && property && (
        <QuickApplyModal
          open={showQuickApplyModal}
          onOpenChange={setShowQuickApplyModal}
          property={property}
          profileData={profileData}
          onConfirm={handleQuickApplyConfirm}
          isSubmitting={isSubmittingQuickApply}
        />
      )}
    </>
  );
}

