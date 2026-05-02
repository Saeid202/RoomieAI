import { useState } from "react";
import { Loader2, Globe, LayoutDashboard, Palette, Wrench, Image, Inbox, Star, ExternalLink } from "lucide-react";
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
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Globe className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Public Page</h1>
            <p className="text-sm text-gray-500">Manage your contractor profile</p>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 bg-gray-50">
          <Globe className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-medium mb-2 text-gray-700">No profile found</p>
          <p className="text-sm text-gray-400">
            Please complete your renovator profile first before setting up your public page.
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

  const tabs = [
    { value: "overview", label: "Overview", icon: LayoutDashboard },
    { value: "branding", label: "Branding", icon: Palette },
    { value: "services", label: "Services", icon: Wrench },
    { value: "portfolio", label: "Portfolio", icon: Image },
    { value: "leads", label: "Leads", icon: Inbox, badge: unreadLeads > 0 ? unreadLeads : null, badgeColor: "bg-blue-500" },
    { value: "reviews", label: "Reviews", icon: Star, badge: pendingReviews.length > 0 ? pendingReviews.length : null, badgeColor: "bg-amber-500" },
  ];

  return (
    <div className="w-full bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-md">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Public Page</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {profile.is_published ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                    Live at{" "}
                    <a
                      href={`/pro/${profile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      /pro/{profile.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
                    Not published yet
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab bar — scrollable on narrow screens */}
          <div className="overflow-x-auto">
            <TabsList className="h-auto bg-transparent p-0 gap-0 border-0 min-w-max justify-start px-6">
              {tabs.map(({ value, label, icon: Icon, badge, badgeColor }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`
                    relative flex items-center gap-2 px-5 py-4 text-sm font-medium rounded-none border-b-2 transition-all duration-200
                    data-[state=active]:border-violet-600 data-[state=active]:text-violet-700 data-[state=active]:bg-transparent
                    data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:border-gray-300
                    focus-visible:outline-none focus-visible:ring-0
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge !== null && badge !== undefined && (
                    <span className={`ml-1 ${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none`}>
                      {badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content — full width, no overflow */}
          <div className="w-full py-6 px-6">
            <TabsContent value="overview" className="space-y-4 mt-0">
              <PageStatusCard
                profile={profile}
                unreadLeads={unreadLeads}
                onTogglePublish={handleTogglePublish}
              />
              <SlugEditor profile={profile} onSave={handleSaveSlug} />
            </TabsContent>

            <TabsContent value="branding" className="mt-0">
              <BrandingSection profile={profile} onSave={updateProfile} />
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              <ServicesEditor
                services={services}
                contractorId={profile.id}
                onRefresh={refresh}
              />
            </TabsContent>

            <TabsContent value="portfolio" className="mt-0">
              <PortfolioEditor
                projects={projects}
                contractorId={profile.id}
                services={services}
                onRefresh={refresh}
              />
            </TabsContent>

            <TabsContent value="leads" className="mt-0">
              <LeadsInbox leads={leads} onMarkRead={markLeadRead} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <ReviewsManager
                reviews={pendingReviews}
                onApprove={approveReview}
                onReject={deleteReview}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
