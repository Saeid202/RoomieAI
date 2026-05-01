import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/services/contractorPublicPageService";
import { Loader2, X, Palette, Image, Layout, Plus, Trash2, ImagePlus, Monitor } from "lucide-react";
import type { ContractorPublicProfile, NavLink } from "@/types/contractor";

interface BrandingSectionProps {
  profile: ContractorPublicProfile;
  onSave: (data: Partial<ContractorPublicProfile>) => Promise<void>;
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

export function BrandingSection({ profile, onSave }: BrandingSectionProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Branding state
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || "");
  const [coverImages, setCoverImages] = useState<string[]>(profile.cover_images || []);
  const [primaryColor, setPrimaryColor] = useState(profile.primary_color || "#7C3AED");
  const [accentColor, setAccentColor] = useState(profile.accent_color || "#F59E0B");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Header state
  const [tagline, setTagline] = useState(profile.tagline || "");
  const [navLinks, setNavLinks] = useState<NavLink[]>(
    profile.nav_links && profile.nav_links.length > 0
      ? profile.nav_links
      : DEFAULT_NAV_LINKS
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── Logo upload ──────────────────────────────────────────────────────────
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const path = `${profile.id}/logo_${Date.now()}.${file.name.split(".").pop()}`;
      const url = await uploadImage(file, path);
      setLogoUrl(url);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploadingLogo(false);
    }
  }

  // ── Cover images upload ──────────────────────────────────────────────────
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (coverImages.length + files.length > 10) {
      toast({ variant: "destructive", title: "Too many images", description: "You can upload up to 10 cover images." });
      return;
    }
    setUploadingCover(true);
    try {
      const urls = await Promise.all(
        files.map((file) => {
          const path = `${profile.id}/cover_${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
          return uploadImage(file, path);
        })
      );
      setCoverImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploadingCover(false);
    }
  }

  function removeCoverImage(index: number) {
    setCoverImages((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Nav link helpers ─────────────────────────────────────────────────────
  function updateNavLink(index: number, field: keyof NavLink, value: string) {
    setNavLinks((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  }

  function addNavLink() {
    setNavLinks((prev) => [...prev, { label: "New Link", href: "#section" }]);
  }

  function removeNavLink(index: number) {
    setNavLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveNavLink(index: number, dir: -1 | 1) {
    const next = [...navLinks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setNavLinks(next);
  }

  function resetToDefaults() {
    setNavLinks(DEFAULT_NAV_LINKS);
  }

  // ── Save all ─────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        logo_url: logoUrl || null,
        cover_images: coverImages,
        primary_color: primaryColor,
        accent_color: accentColor,
        tagline: tagline || null,
        nav_links: navLinks,
      });
      toast({ title: "Branding saved", description: "Your header and branding have been updated." });    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* ── HERO / SLIDER PICTURES ── */}
      <Card className="border-2 border-violet-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4 text-violet-600" />
            Header Slider Pictures
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            These photos appear in the hero slider at the top of your public page. Upload up to 10 images.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Drop zone / upload area */}
          <div
            onClick={() => !uploadingCover && coverInputRef.current?.click()}
            className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer group
              ${uploadingCover ? "border-violet-300 bg-violet-50 cursor-wait" : "border-gray-200 hover:border-violet-400 hover:bg-violet-50/40"}`}
            style={{ minHeight: 160 }}
          >
            {/* Preview of first image as background */}
            {coverImages[0] && (
              <img
                src={coverImages[0]}
                alt="Hero preview"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30"
              />
            )}
            <div className="relative z-10 flex flex-col items-center justify-center py-10 gap-3">
              {uploadingCover ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                  <p className="text-sm font-semibold text-violet-600">Uploading…</p>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                    <ImagePlus className="h-7 w-7 text-violet-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">
                      {coverImages.length === 0 ? "Upload header pictures" : "Add more pictures"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Click to browse · JPG, PNG, WebP · Max 10 MB each
                    </p>
                  </div>
                  {coverImages.length === 0 && (
                    <p className="text-xs text-violet-500 font-semibold">
                      Recommended size: 1400 × 500 px
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleCoverUpload}
          />

          {/* Uploaded thumbnails */}
          {coverImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {coverImages.length} / 10 uploaded
                </p>
                <p className="text-xs text-gray-400">Hover a photo to remove it</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {coverImages.map((url, i) => (
                  <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={url}
                      alt={`Slide ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCoverImage(i); }}
                        className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none"
                        aria-label={`Remove slide ${i + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Slide number badge */}
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {i + 1}
                    </div>
                  </div>
                ))}
                {/* Add more tile */}
                {coverImages.length < 10 && (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors focus:outline-none"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-semibold">Add</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── HEADER CONFIGURATION ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layout className="h-4 w-4 text-violet-600" />
            Header Configuration
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your public page navigation bar — logo, tagline, and nav links.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                  <Image className="h-6 w-6" />
                </div>
              )}
              <div className="space-y-1">
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                  {uploadingLogo && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
                <p className="text-xs text-gray-400">Recommended: square image, min 200×200px</p>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Trusted Renovations Since 2010"
              maxLength={80}
            />
            <p className="text-xs text-gray-400">Appears below your company name in the header</p>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Navigation Links</Label>
              <button onClick={resetToDefaults} className="text-xs text-violet-600 hover:underline focus:outline-none">
                Reset to defaults
              </button>
            </div>

            {/* Live preview strip */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-1 flex-wrap">
              <div className="flex items-center gap-2 mr-auto">
                {logoUrl
                  ? <img src={logoUrl} alt="logo" className="h-7 w-7 rounded-full object-cover" />
                  : <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: primaryColor }}>{(profile.company || "C").charAt(0)}</div>
                }
                <span className="text-xs font-black text-gray-800 truncate max-w-[100px]">{profile.company}</span>
              </div>
              {navLinks.map((l) => (
                <span key={l.label} className="text-[11px] font-semibold text-gray-500 px-2 py-0.5 rounded-md hover:bg-white transition-colors cursor-default">{l.label}</span>
              ))}
              <span className="ml-auto text-[11px] font-bold text-white px-3 py-1 rounded-full" style={{ backgroundColor: primaryColor }}>Get a Quote</span>
            </div>
            <p className="text-xs text-gray-400">↑ Live preview of your header</p>

            {/* Link editor */}
            <div className="space-y-2">
              {navLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveNavLink(i, -1)} disabled={i === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 focus:outline-none" aria-label="Move up">▲</button>
                    <button onClick={() => moveNavLink(i, 1)} disabled={i === navLinks.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 focus:outline-none" aria-label="Move down">▼</button>
                  </div>
                  <Input
                    value={link.label}
                    onChange={(e) => updateNavLink(i, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={link.href}
                    onChange={(e) => updateNavLink(i, "href", e.target.value)}
                    placeholder="#section or https://..."
                    className="flex-1 h-8 text-sm font-mono"
                  />
                  <button
                    onClick={() => removeNavLink(i)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors focus:outline-none rounded"
                    aria-label="Remove link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={addNavLink} className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50">
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── BRANDING ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4 text-violet-600" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="brand-color">Brand Color</Label>
            <p className="text-xs text-gray-400">Used for the navbar, header card, icon backgrounds, and CTA buttons</p>
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 rounded cursor-pointer border border-gray-200"
              />
              <span className="text-sm font-mono text-gray-600">{primaryColor}</span>
              <button
                onClick={() => setPrimaryColor("#7C3AED")}
                className="text-xs text-violet-600 hover:underline focus:outline-none"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <p className="text-xs text-gray-400">Used for the services card border, "WHAT WE OFFER" pill, and "HOW IT WORKS" labels</p>
            <div className="flex items-center gap-3">
              <input
                id="accent-color"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-16 rounded cursor-pointer border border-gray-200"
              />
              <span className="text-sm font-mono text-gray-600">{accentColor}</span>
              <button
                onClick={() => setAccentColor("#F59E0B")}
                className="text-xs text-violet-600 hover:underline focus:outline-none"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <Label>Color Preview</Label>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="h-10 w-10 rounded-lg shrink-0" style={{ backgroundColor: primaryColor }} />
              <div className="text-xs text-gray-500 font-semibold">Brand</div>
              <div className="h-10 w-10 rounded-lg shrink-0 border-2" style={{ backgroundColor: "white", borderColor: accentColor }} />
              <div className="text-xs text-gray-500 font-semibold">Accent (card border)</div>
              <div className="h-6 px-3 rounded-full flex items-center" style={{ backgroundColor: accentColor }}>
                <span className="text-[10px] font-black text-white uppercase tracking-wide">What We Offer</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Save button ── */}
      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save All Changes"}
      </Button>
    </div>
  );
}
