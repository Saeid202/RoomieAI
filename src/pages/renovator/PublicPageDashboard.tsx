import { useState } from "react";
import { Loader2, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePublicPageDashboard } from "@/hooks/usePublicPageDashboard";
import { PageStatusCard } from "@/components/contractor/dashboard/PageStatusCard";
import { SlugEditor } from "@/components/contractor/dashboard/SlugEditor";
import { BrandingSection } from "@/components/contractor/dashboard/BrandingSection";
import { ServicesEditor } from "@/components/contractor/dashboard/ServicesEditor";
import { PortfolioEditor } from "@/components/contractor/dashboard/PortfolioEditor";
import { LeadsInbox } from "@/components/contractor/dashboard/LeadsInbox";
import { ReviewsManager } from "@/components/contractor/dashboard/ReviewsManager";

export default function PublicPageDashboard() {
  const {
    profile,
    services,
    projects,
    leads,
    pendingReviews,
    loading,
    refresh,
    updateProfile,
    upsertService,
    deleteService,
    upsertProject,
    deleteProject,
    approveReview,
    deleteReview,
    markLeadRead,
    uploadImage,
  } = usePublicPageDashboard();

  const unreadLeads = leads.filter((l) => !l.read).length;
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-violet-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Public Page</h1>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No profile found</p>
          <p className="text-sm">
            Please complete your renovator profile first before setting up your
            public page.
          </p>
        </div>
      </div>
    );
  }

  async function handleTogglePublish() {
    await updateProfile({ is_published: !profile!.is_published });
  }

  async function handleSaveSlug(slug: string) {
    await updateProfile({ slug });
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-violet-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Public Page</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="leads" className="relative">
            Leads
            {unreadLeads > 0 && (
              <Badge className="ml-1.5 bg-blue-500 text-white text-[10px] px-1.5 py-0 h-4">
                {unreadLeads}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="relative">
            Reviews
            {pendingReviews.length > 0 && (
              <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4">
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <PageStatusCard
            profile={profile}
            unreadLeads={unreadLeads}
            onTogglePublish={handleTogglePublish}
          />
          <SlugEditor profile={profile} onSave={handleSaveSlug} />
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="mt-4">
          <BrandingSection
            profile={profile}
            onSave={updateProfile}
          />
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="mt-4">
          <ServicesEditor
            services={services}
            contractorId={profile.id}
            onRefresh={refresh}
          />
        </TabsContent>

        {/* Portfolio */}
        <TabsContent value="portfolio" className="mt-4">
          <PortfolioEditor
            projects={projects}
            contractorId={profile.id}
            services={services}
            onRefresh={refresh}
          />
        </TabsContent>

        {/* Leads */}
        <TabsContent value="leads" className="mt-4">
          <LeadsInbox leads={leads} onMarkRead={markLeadRead} />
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-4">
          <ReviewsManager
            reviews={pendingReviews}
            onApprove={approveReview}
            onReject={deleteReview}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
