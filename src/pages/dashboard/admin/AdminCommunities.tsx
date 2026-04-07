import { useState, useEffect } from "react";
import { Users2, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EnhancedPageLayout, EnhancedHeader } from "@/components/ui/design-system";
import {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityMemberCount,
} from "@/services/communityService";
import { banUser } from "@/services/communityMembershipService";
import { deletePost, getPostById } from "@/services/communityPostService";
import { deleteComment } from "@/services/communityCommentService";
import { getPendingReports, resolveReport, ignoreReport } from "@/services/communityReportService";
import { getAllCommunitiesAnalytics } from "@/services/communityAnalyticsService";
import type { Community, CommunityReport } from "@/types/community";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommunityRow extends Community {
  member_count: number;
  post_count: number;
}

interface AnalyticsRow {
  community_id: string;
  name: string;
  total_members: number;
  total_posts: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reasonBadgeVariant(reason: string) {
  if (reason === "scam") return "destructive";
  if (reason === "harassment") return "outline";
  return "secondary";
}

function reasonBadgeClass(reason: string) {
  if (reason === "scam") return "bg-red-100 text-red-700 border-red-300";
  if (reason === "harassment") return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-yellow-100 text-yellow-700 border-yellow-300";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminCommunities() {
  // Communities tab state
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  // Create/Edit dialog
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Community | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Community | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reports tab state
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Ban dialog
  const [banReport, setBanReport] = useState<CommunityReport | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);

  // Analytics tab state
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // ── Load data ──────────────────────────────────────────────────────────────

  async function loadCommunities() {
    setLoadingCommunities(true);
    try {
      const list = await getCommunities();
      const rows = await Promise.all(
        list.map(async (c) => {
          const [memberCount, postResult] = await Promise.all([
            getCommunityMemberCount(c.id),
            db.from("community_posts").select("id", { count: "exact", head: true }).eq("community_id", c.id),
          ]);
          return {
            ...c,
            member_count: memberCount,
            post_count: postResult.count || 0,
          };
        })
      );
      setCommunities(rows);
    } catch (e: any) {
      toast.error(e.message || "Failed to load communities");
    } finally {
      setLoadingCommunities(false);
    }
  }

  async function loadReports() {
    setLoadingReports(true);
    try {
      const data = await getPendingReports();
      setReports(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  }

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    try {
      const data = await getAllCommunitiesAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  }

  useEffect(() => {
    loadCommunities();
    loadReports();
    loadAnalytics();
  }, []);

  // ── Community form ─────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null);
    setFormName("");
    setFormDescription("");
    setFormCity("");
    setShowForm(true);
  }

  function openEdit(c: Community) {
    setEditTarget(c);
    setFormName(c.name);
    setFormDescription(c.description || "");
    setFormCity(c.city || "");
    setShowForm(true);
  }

  async function handleFormSave() {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    setFormSaving(true);
    try {
      if (editTarget) {
        await updateCommunity(editTarget.id, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          city: formCity.trim() || undefined,
        });
        toast.success("Community updated");
      } else {
        await createCommunity({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          city: formCity.trim() || undefined,
        });
        toast.success("Community created");
      }
      setShowForm(false);
      loadCommunities();
    } catch (e: any) {
      toast.error(e.message || "Failed to save community");
    } finally {
      setFormSaving(false);
    }
  }

  // ── Delete community ───────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCommunity(deleteTarget.id);
      toast.success("Community deleted");
      setDeleteTarget(null);
      loadCommunities();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete community");
    } finally {
      setDeleting(false);
    }
  }

  // ── Report actions ─────────────────────────────────────────────────────────

  async function handleIgnoreReport(report: CommunityReport) {
    try {
      await ignoreReport(report.id);
      toast.success("Report ignored");
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e: any) {
      toast.error(e.message || "Failed to ignore report");
    }
  }

  async function handleDeleteContent(report: CommunityReport) {
    try {
      if (report.target_type === "post") {
        await deletePost(report.target_id);
      } else {
        await deleteComment(report.target_id);
      }
      await resolveReport(report.id);
      toast.success("Content deleted and report resolved");
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e: any) {
      toast.error(e.message || "Failed to delete content");
    }
  }

  function openBanDialog(report: CommunityReport) {
    setBanReport(report);
    setBanReason("");
  }

  async function handleBanUser() {
    if (!banReport) return;
    if (!banReason.trim()) {
      toast.error("Ban reason is required");
      return;
    }
    setBanning(true);
    try {
      // Fetch the post/comment to get user_id and community_id
      let userId: string | null = null;
      let communityId: string | null = null;

      if (banReport.target_type === "post") {
        const post = await getPostById(banReport.target_id);
        if (!post) throw new Error("Post not found");
        userId = post.user_id;
        communityId = post.community_id;
      } else {
        // comment — fetch from DB
        const { data: comment } = await db
          .from("community_comments")
          .select("user_id, post_id")
          .eq("id", banReport.target_id)
          .single();
        if (!comment) throw new Error("Comment not found");
        userId = comment.user_id;
        // get community_id from the post
        const post = await getPostById(comment.post_id);
        if (!post) throw new Error("Post not found");
        communityId = post.community_id;
      }

      await banUser({ user_id: userId!, community_id: communityId!, reason: banReason.trim() });
      await resolveReport(banReport.id);
      toast.success("User banned and report resolved");
      setBanReport(null);
      setReports((prev) => prev.filter((r) => r.id !== banReport.id));
    } catch (e: any) {
      toast.error(e.message || "Failed to ban user");
    } finally {
      setBanning(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <EnhancedPageLayout>
      <EnhancedHeader
        title="Communities"
        subtitle="Manage seeker communities, moderate posts, and handle reports"
      />

      <Tabs defaultValue="communities">
        <TabsList className="mb-6">
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="reports">
            Reports
            {reports.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ── Communities Tab ── */}
        <TabsContent value="communities">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>

          {loadingCommunities ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : communities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No communities yet.</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">City</th>
                    <th className="text-right px-4 py-3 font-medium">Members</th>
                    <th className="text-right px-4 py-3 font-medium">Posts</th>
                    <th className="text-left px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {communities.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.city || "—"}</td>
                      <td className="px-4 py-3 text-right">{c.member_count}</td>
                      <td className="px-4 py-3 text-right">{c.post_count}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── Reports Tab ── */}
        <TabsContent value="reports">
          {loadingReports ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending reports.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${reasonBadgeClass(r.reason)}`}
                          >
                            {r.reason}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {r.target_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Reporter: {r.reporter_id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                        </div>
                        {r.details && (
                          <p className="text-sm text-muted-foreground">{r.details}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-muted-foreground"
                          onClick={() => handleIgnoreReport(r)}
                        >
                          Ignore
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          onClick={() => handleDeleteContent(r)}
                        >
                          Delete Content
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-red-300 hover:bg-red-50"
                          onClick={() => openBanDialog(r)}
                        >
                          Ban User
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Analytics Tab ── */}
        <TabsContent value="analytics">
          {loadingAnalytics ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : analytics.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.map((a) => (
                <Card key={a.community_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{a.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-semibold">{a.total_members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Posts</span>
                      <span className="font-semibold">{a.total_posts}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Community" : "Create Community"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Toronto Roommate Community"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">City</label>
              <Input
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="e.g. Toronto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleFormSave} disabled={formSaving}>
              {formSaving ? "Saving…" : editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Ban User Dialog ── */}
      <Dialog open={!!banReport} onOpenChange={(open) => !open && setBanReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Enter a reason for banning the author of this {banReport?.target_type}.
            </p>
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ban reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanReport(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={banning}>
              {banning ? "Banning…" : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EnhancedPageLayout>
  );
}
