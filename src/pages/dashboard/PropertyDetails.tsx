import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchPropertyById, Property } from "@/services/propertyService";
import { useRole } from "@/contexts/RoleContext";
import { Calendar, DollarSign, MapPin } from "lucide-react";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useRole();

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
        <h1 className="text-3xl font-bold tracking-tight">{property.listing_title}</h1>
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
                <div className="flex items-center gap-1 font-semibold text-2xl text-primary">
                  <DollarSign className="h-6 w-6" />
                  <span>{property.monthly_rent}</span>
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                {availableDate && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Available {availableDate}
                  </div>
                )}
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
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground whitespace-pre-line">{property.description}</p>
              </article>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
                <Card className="p-4"><div className="text-muted-foreground">Bedrooms</div><div className="font-medium">{property.bedrooms ?? '—'}</div></Card>
                <Card className="p-4"><div className="text-muted-foreground">Bathrooms</div><div className="font-medium">{property.bathrooms ?? '—'}</div></Card>
                <Card className="p-4"><div className="text-muted-foreground">Square Footage</div><div className="font-medium">{property.square_footage ?? '—'}</div></Card>
                <Card className="p-4"><div className="text-muted-foreground">Parking</div><div className="font-medium">{property.parking || '—'}</div></Card>
                <Card className="p-4"><div className="text-muted-foreground">Pet Policy</div><div className="font-medium">{property.pet_policy || '—'}</div></Card>
                <Card className="p-4"><div className="text-muted-foreground">Furnished</div><div className="font-medium">{property.furnished ? 'Yes' : 'No'}</div></Card>
              </div>

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
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              {role === 'landlord' ? 'Back to properties' : 'Back to results'}
            </Button>
          </div>
        </aside>
      </main>
    </>
  );
}
