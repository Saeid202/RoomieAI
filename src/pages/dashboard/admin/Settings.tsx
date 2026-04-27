
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getFeatureFlag, setFeatureFlag } from "@/services/featureFlagsService";
import { getSiteSetting, setSiteSetting, uploadHeroBanner, removeHeroBanner } from "@/services/siteSettingsService";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Homie AI",
    siteDescription: "Find your perfect roommate with AI matching",
    adminEmail: "admin@roomieai.com",
    showLandlordFeatures: true,
    showDeveloperFeatures: true,
  });

  const [communityEnabled, setCommunityEnabled] = useState(true);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityUpdating, setCommunityUpdating] = useState(false);

  // Hero banner state
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [heroMode, setHeroMode] = useState<'default' | 'banner'>('default');
  const [heroModeUpdating, setHeroModeUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFeatureFlag('community_enabled', true)
      .then(setCommunityEnabled)
      .finally(() => setCommunityLoading(false));

    Promise.all([
      getSiteSetting('hero_banner_url'),
      getSiteSetting('hero_mode'),
    ]).then(([url, mode]) => {
      setBannerUrl(url);
      setHeroMode((mode as 'default' | 'banner') || 'default');
    }).finally(() => setBannerLoading(false));
  }, []);

  const handleHeroModeChange = async (mode: 'default' | 'banner') => {
    setHeroModeUpdating(true);
    try {
      await setSiteSetting('hero_mode', mode);
      setHeroMode(mode);
      toast({
        title: mode === 'banner' ? 'Banner mode active' : 'Default mode active',
        description: mode === 'banner'
          ? 'The hero will now show your uploaded banner.'
          : 'The hero will now show the default platform diagram.',
      });
    } catch (err: any) {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    } finally {
      setHeroModeUpdating(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadHeroBanner(file);
      setBannerUrl(url);
      toast({ title: "Banner uploaded", description: "The hero banner has been updated." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setBannerUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerRemove = async () => {
    setBannerUploading(true);
    try {
      await removeHeroBanner();
      setBannerUrl(null);
      toast({ title: "Banner removed", description: "The hero banner has been cleared." });
    } catch (err: any) {
      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
    } finally {
      setBannerUploading(false);
    }
  };

  const handleCommunityToggle = async (checked: boolean) => {
    setCommunityUpdating(true);
    try {
      await setFeatureFlag('community_enabled', checked);
      setCommunityEnabled(checked);
      toast({
        title: checked ? "Community enabled" : "Community disabled",
        description: checked
          ? "The Community section is now visible to users."
          : "The Community section is now hidden from users.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setCommunityUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure website settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic website configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea 
                  id="siteDescription" 
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input 
                  id="adminEmail" 
                  type="email"
                  value={generalSettings.adminEmail}
                  onChange={(e) => setGeneralSettings({...generalSettings, adminEmail: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="showLandlordFeatures"
                  checked={generalSettings.showLandlordFeatures}
                  onCheckedChange={(checked) => 
                    setGeneralSettings({...generalSettings, showLandlordFeatures: checked})
                  }
                />
                <Label htmlFor="showLandlordFeatures">Enable Landlord Features</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="showDeveloperFeatures"
                  checked={generalSettings.showDeveloperFeatures}
                  onCheckedChange={(checked) => 
                    setGeneralSettings({...generalSettings, showDeveloperFeatures: checked})
                  }
                />
                <Label htmlFor="showDeveloperFeatures">Enable Developer Features</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          {/* Community Feature Toggle */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Control whether the Community section is visible to users across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Community Section</Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, the Communities page and nav link will be hidden from all users.
                  </p>
                </div>
                {communityLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Switch
                    id="communityEnabled"
                    checked={communityEnabled}
                    onCheckedChange={handleCommunityToggle}
                    disabled={communityUpdating}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hero Banner Upload */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Hero Section Mode</CardTitle>
              <CardDescription>
                Choose what displays in the landing page hero. Switch between the default platform diagram or your uploaded banner image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode selector */}
              {bannerLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleHeroModeChange('default')}
                    disabled={heroModeUpdating}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      heroMode === 'default'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40 text-muted-foreground'
                    }`}
                  >
                    <div className="w-full h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                      Platform Diagram
                    </div>
                    <span className="text-sm font-semibold">Default Mode</span>
                    {heroMode === 'default' && <span className="text-xs text-primary font-medium">● Active</span>}
                  </button>

                  <button
                    onClick={() => handleHeroModeChange('banner')}
                    disabled={heroModeUpdating || !bannerUrl}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      heroMode === 'banner'
                        ? 'border-primary bg-primary/5 text-primary'
                        : !bannerUrl
                        ? 'border-border opacity-50 cursor-not-allowed text-muted-foreground'
                        : 'border-border hover:border-primary/40 text-muted-foreground'
                    }`}
                  >
                    <div className="w-full h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {bannerUrl
                        ? <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                        : <span className="text-xs text-muted-foreground">No banner uploaded</span>
                      }
                    </div>
                    <span className="text-sm font-semibold">Banner Mode</span>
                    {heroMode === 'banner' && <span className="text-xs text-primary font-medium">● Active</span>}
                    {!bannerUrl && <span className="text-xs text-muted-foreground">Upload a banner first</span>}
                  </button>
                </div>
              )}

              {/* Upload section */}
              <div className="border-t pt-4 space-y-3">
                <Label className="text-sm font-semibold">Banner Image</Label>
                <p className="text-xs text-muted-foreground">Recommended size: 1920×600px. JPG, PNG, or WebP.</p>

                {bannerUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-border aspect-[16/5] bg-muted">
                    <img src={bannerUrl} alt="Hero banner" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={bannerUploading}
                    className="gap-2"
                  >
                    {bannerUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {bannerUrl ? 'Replace Banner' : 'Upload Banner'}
                  </Button>
                  {bannerUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBannerRemove}
                      disabled={bannerUploading}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Appearance settings will be available in the next update
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced configuration options for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced settings will be available in the next update
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
