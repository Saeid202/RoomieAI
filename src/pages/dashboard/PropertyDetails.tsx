import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, Property, updateProperty } from "@/services/propertyService";
import { useRole } from "@/contexts/RoleContext";
import { Calendar, DollarSign, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageButton } from "@/components/MessageButton";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useRole();
  const { user } = useAuth();

  const isOwner = !!(role === 'landlord' && user && property && user.id === property.user_id);

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!id) throw new Error("Missing property id");
        const data = await fetchPropertyById(id);
        if (mounted) setProperty(data as Property);
      } catch (e: any) {
        console.error("Failed to load property", e);
        if (mounted) setError(e?.message || "Failed to load property");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (property) {
      setTitleDraft(property.listing_title || "");
      setDescDraft(property.description || "");
      setPriceDraft(String(property.monthly_rent ?? ""));
      setSecurityDraft(property.security_deposit != null ? String(property.security_deposit) : "");
      setLeaseDraft(property.lease_duration || "");
      setAvailableDraft(property.available_date || "");

      setBedroomsDraft(property.bedrooms != null ? String(property.bedrooms) : "");
      setBathroomsDraft(property.bathrooms != null ? String(property.bathrooms) : "");
      setSqftDraft(property.square_footage != null ? String(property.square_footage) : "");
      setParkingDraft(property.parking || "");
      setPetPolicyDraft(property.pet_policy || "");
      setFurnishedDraft(property.furnished ? 'Yes' : 'No');
    }
  }, [property]);

  const savePartial = async (updates: Partial<Property>) => {
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
        clean.furnished = ['yes','true','1'].includes(v);
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
    const title = property ? `${property.listing_title} – Rental Property Details` : "Property Details";
    document.title = title;

    const descText = property?.description || `${property?.listing_title || "Property"} in ${property?.city || ""} ${property?.state || ""}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descText.slice(0, 155));

    const canonicalHref = `${window.location.origin}/dashboard/rental-options/${id || ''}`;
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
        price: property?.monthly_rent,
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
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{error || 'Property not found'}</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>Back</Button>
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
                <Button size="sm" disabled={saving} onClick={async () => { await savePartial({ listing_title: titleDraft || property.listing_title }); setEditingTitle(false);} }>Save</Button>
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
            <div className="relative h-64 rounded-t-lg overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={`${property.listing_title} photo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ${property.images && property.images.length > 0 ? 'hidden' : ''}`}>
                <span className="text-7xl" aria-hidden>🏠</span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isOwner || !editingPrice ? (
                    <div className="flex items-center gap-1 font-semibold text-2xl text-primary">
                      <DollarSign className="h-6 w-6" />
                      <span>{property.monthly_rent}</span>
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} placeholder="Monthly rent" className="w-32" />
                      <Input value={securityDraft} onChange={(e) => setSecurityDraft(e.target.value)} placeholder="Security" className="w-28" />
                      <Input value={leaseDraft} onChange={(e) => setLeaseDraft(e.target.value)} placeholder="Lease duration" className="w-36" />
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
                    <Input type="date" value={availableDraft} onChange={(e) => setAvailableDraft(e.target.value)} className="w-44" />
                  )}
                  {isOwner && (
                    !editingPrice ? (
                      <Button variant="outline" size="sm" onClick={() => setEditingPrice(true)}>Edit</Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="sm" disabled={saving} onClick={async () => {
                          await savePartial({
                            monthly_rent: priceDraft,
                            security_deposit: securityDraft || null as any,
                            lease_duration: leaseDraft || null as any,
                            available_date: availableDraft || null as any,
                          });
                          setEditingPrice(false);
                        }}>Save</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setPriceDraft(String(property.monthly_rent ?? ""));
                          setSecurityDraft(property.security_deposit != null ? String(property.security_deposit) : "");
                          setLeaseDraft(property.lease_duration || "");
                          setAvailableDraft(property.available_date || "");
                          setEditingPrice(false);
                        }}>Cancel</Button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Image Gallery */}
              {property.images && property.images.length > 1 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">More Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.slice(1).map((imageUrl, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img 
                          src={imageUrl} 
                          alt={`${property.listing_title} photo ${index + 2}`}
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <article className="prose max-w-none">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Description</h2>
                  {isOwner && (
                    !editingDesc ? (
                      <Button variant="outline" size="sm" onClick={() => setEditingDesc(true)}>Edit</Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="sm" disabled={saving} onClick={async () => { await savePartial({ description: descDraft }); setEditingDesc(false);} }>Save</Button>
                        <Button variant="outline" size="sm" onClick={() => { setDescDraft(property.description || ""); setEditingDesc(false); }}>Cancel</Button>
                      </div>
                    )
                  )}
                </div>
                {!isOwner || !editingDesc ? (
                  <p className="mt-2 text-muted-foreground whitespace-pre-line">{property.description}</p>
                ) : (
                  <Textarea className="mt-2" value={descDraft} onChange={(e) => setDescDraft(e.target.value)} />
                )}
              </article>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                <Card className="p-4">
                  <div className="text-muted-foreground">Bedrooms</div>
                  {!isOwner || !editingFacts ? (
                    <div className="font-medium">{property.bedrooms ?? '—'}</div>
                  ) : (
                    <Input value={bedroomsDraft} onChange={(e) => setBedroomsDraft(e.target.value)} placeholder="e.g., 2" />
                  )}
                </Card>
                <Card className="p-4">
                  <div className="text-muted-foreground">Bathrooms</div>
                  {!isOwner || !editingFacts ? (
                    <div className="font-medium">{property.bathrooms ?? '—'}</div>
                  ) : (
                    <Input value={bathroomsDraft} onChange={(e) => setBathroomsDraft(e.target.value)} placeholder="e.g., 1" />
                  )}
                </Card>
                <Card className="p-4">
                  <div className="text-muted-foreground">Square Footage</div>
                  {!isOwner || !editingFacts ? (
                    <div className="font-medium">{property.square_footage ?? '—'}</div>
                  ) : (
                    <Input value={sqftDraft} onChange={(e) => setSqftDraft(e.target.value)} placeholder="e.g., 850" />
                  )}
                </Card>
                <Card className="p-4">
                  <div className="text-muted-foreground">Parking</div>
                  {!isOwner || !editingFacts ? (
                    <div className="font-medium">{property.parking || '—'}</div>
                  ) : (
                    <Input value={parkingDraft} onChange={(e) => setParkingDraft(e.target.value)} placeholder="e.g., driveway" />
                  )}
                </Card>
                <Card className="p-4">
                  <div className="text-muted-foreground">Pet Policy</div>
                  {!isOwner || !editingFacts ? (
                    <div className="font-medium">{property.pet_policy || '—'}</div>
                  ) : (
                    <Input value={petPolicyDraft} onChange={(e) => setPetPolicyDraft(e.target.value)} placeholder="e.g., cats-dogs" />
                  )}
                </Card>
                <Card className="p-4">
                  <div className="text-muted-foreground">Furnished</div>
                  {!isOwner || !editingFacts ? (
                    <div className="font-medium">{property.furnished ? 'Yes' : 'No'}</div>
                  ) : (
                    <Input value={furnishedDraft} onChange={(e) => setFurnishedDraft(e.target.value)} placeholder="Yes/No" />
                  )}
                </Card>
              </div>

              {isOwner && (
                <div className="mt-3 flex justify-end gap-2">
                  {!editingFacts ? (
                    <Button variant="outline" size="sm" onClick={() => setEditingFacts(true)}>Edit Key Facts</Button>
                  ) : (
                    <>
                      <Button size="sm" disabled={saving} onClick={async () => {
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
                      <Button variant="outline" size="sm" onClick={() => {
                        setBedroomsDraft(property.bedrooms != null ? String(property.bedrooms) : "");
                        setBathroomsDraft(property.bathrooms != null ? String(property.bathrooms) : "");
                        setSqftDraft(property.square_footage != null ? String(property.square_footage) : "");
                        setParkingDraft(property.parking || "");
                        setPetPolicyDraft(property.pet_policy || "");
                        setFurnishedDraft(property.furnished ? 'Yes' : 'No');
                        setEditingFacts(false);
                      }}>Cancel</Button>
                    </>
                  )}
                </div>
              )}

              {Array.isArray(property.utilities_included) && property.utilities_included.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold">Utilities Included</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {property.utilities_included.map((u) => (
                      <Badge key={u} variant="secondary">{u}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold">Amenities</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {property.amenities.map((a) => (
                      <Badge key={a} variant="outline">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>{property.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div>{property.city}, {property.state} {property.zip_code}</div>
                {property.neighborhood && <div>Neighborhood: {property.neighborhood}</div>}
                {property.public_transport_access && (
                  <div className="mt-2">Transit: {property.public_transport_access}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {role !== 'landlord' && (
              <Button variant="default" className="w-full" onClick={() => navigate(`/dashboard/rental-application/${id}`)}>
                Apply to Rent
              </Button>
            )}
            {role !== 'landlord' && property && (
              <MessageButton
                propertyId={property.id}
                landlordId={property.user_id}
                className="w-full"
              />
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              {role === 'landlord' ? 'Back to properties' : 'Back to results'}
            </Button>
          </div>
        </aside>
      </main>
    </>
  );
}
