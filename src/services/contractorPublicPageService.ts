import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/services/notificationService";
import type {
  ContractorPublicProfile,
  ContractorService,
  ContractorProject,
  ContractorReview,
  ContractorLead,
  LeadFormData,
  ReviewFormData,
} from "@/types/contractor";

// ─── Public Read Functions ────────────────────────────────────────────────────

export async function getProfileBySlug(
  slug: string
): Promise<ContractorPublicProfile | null> {
  const { data, error } = await (supabase as any)
    .from("renovation_partners")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile by slug:", error);
    return null;
  }
  return data as ContractorPublicProfile | null;
}

export async function getServices(
  contractorId: string
): Promise<ContractorService[]> {
  const { data, error } = await (supabase as any)
    .from("contractor_services")
    .select("*")
    .eq("contractor_id", contractorId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }
  return (data as ContractorService[]) || [];
}

export async function getProjects(
  contractorId: string
): Promise<ContractorProject[]> {
  const { data, error } = await (supabase as any)
    .from("contractor_projects")
    .select("*")
    .eq("contractor_id", contractorId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return (data as ContractorProject[]) || [];
}

export async function getApprovedReviews(
  contractorId: string
): Promise<ContractorReview[]> {
  const { data, error } = await (supabase as any)
    .from("contractor_reviews")
    .select("*")
    .eq("contractor_id", contractorId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching approved reviews:", error);
    return [];
  }
  return (data as ContractorReview[]) || [];
}

// ─── Public Write Functions ───────────────────────────────────────────────────

export async function submitLead(
  data: LeadFormData & { contractorId: string; sourceSlug: string }
): Promise<ContractorLead> {
  const { data: lead, error } = await (supabase as any)
    .from("contractor_leads")
    .insert([
      {
        contractor_id: data.contractorId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message || null,
        source_slug: data.sourceSlug || null,
        read: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error submitting lead:", error);
    throw new Error(`Failed to submit lead: ${error.message}`);
  }

  // Notify the renovator
  try {
    const { data: partner } = await (supabase as any)
      .from("renovation_partners")
      .select("user_id")
      .eq("id", data.contractorId)
      .single();

    if (partner?.user_id) {
      await createNotification({
        user_id: partner.user_id,
        type: "general",
        title: "New Quote Request",
        message: `You have a new quote request from ${data.name}`,
        link: "/renovator/public-page",
      });
    }
  } catch (notifError) {
    // Non-fatal: log but don't throw
    console.error("Error sending lead notification:", notifError);
  }

  return lead as ContractorLead;
}

export async function submitReview(
  data: ReviewFormData & { contractorId: string }
): Promise<ContractorReview> {
  const { data: review, error } = await (supabase as any)
    .from("contractor_reviews")
    .insert([
      {
        contractor_id: data.contractorId,
        reviewer_name: data.reviewer_name,
        rating: data.rating,
        comment: data.comment || null,
        is_approved: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error submitting review:", error);
    throw new Error(`Failed to submit review: ${error.message}`);
  }

  return review as ContractorReview;
}

// ─── Dashboard Read Functions ─────────────────────────────────────────────────

export async function getDashboardProfile(
  userId: string
): Promise<ContractorPublicProfile | null> {
  const { data, error } = await (supabase as any)
    .from("renovation_partners")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching dashboard profile:", error);
    return null;
  }
  return data as ContractorPublicProfile | null;
}

export async function getLeads(
  contractorId: string
): Promise<ContractorLead[]> {
  const { data, error } = await (supabase as any)
    .from("contractor_leads")
    .select("*")
    .eq("contractor_id", contractorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
  return (data as ContractorLead[]) || [];
}

export async function getPendingReviews(
  contractorId: string
): Promise<ContractorReview[]> {
  const { data, error } = await (supabase as any)
    .from("contractor_reviews")
    .select("*")
    .eq("contractor_id", contractorId)
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending reviews:", error);
    return [];
  }
  return (data as ContractorReview[]) || [];
}

// ─── Dashboard Write Functions ────────────────────────────────────────────────

export async function updateProfile(
  contractorId: string,
  data: Partial<ContractorPublicProfile>
): Promise<void> {
  const payload = { ...data, updated_at: new Date().toISOString() };

  const { error } = await (supabase as any)
    .from("renovation_partners")
    .update(payload)
    .eq("id", contractorId);

  if (error) {
    // If accent_color column doesn't exist yet (migration not run),
    // retry without it so other fields still save successfully.
    if (
      error.message?.includes("accent_color") &&
      error.message?.includes("schema cache")
    ) {
      const { accent_color, ...rest } = payload as any;
      const { error: retryError } = await (supabase as any)
        .from("renovation_partners")
        .update(rest)
        .eq("id", contractorId);

      if (retryError) {
        console.error("Error updating profile (retry):", retryError);
        throw new Error(`Failed to update profile: ${retryError.message}`);
      }
      // Warn but don't throw — accent_color will be saved once migration runs
      console.warn(
        "accent_color column not found — run migration 20260501_add_accent_color.sql in Supabase. Other fields saved successfully."
      );
      return;
    }

    console.error("Error updating profile:", error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function upsertService(
  data: Partial<ContractorService> & { contractor_id: string }
): Promise<ContractorService> {
  const { data: service, error } = await (supabase as any)
    .from("contractor_services")
    .upsert([data])
    .select()
    .single();

  if (error) {
    console.error("Error upserting service:", error);
    throw new Error(`Failed to save service: ${error.message}`);
  }
  return service as ContractorService;
}

export async function deleteService(serviceId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("contractor_services")
    .delete()
    .eq("id", serviceId);

  if (error) {
    console.error("Error deleting service:", error);
    throw new Error(`Failed to delete service: ${error.message}`);
  }
}

export async function upsertProject(
  data: Partial<ContractorProject> & { contractor_id: string }
): Promise<ContractorProject> {
  const { data: project, error } = await (supabase as any)
    .from("contractor_projects")
    .upsert([data])
    .select()
    .single();

  if (error) {
    console.error("Error upserting project:", error);
    throw new Error(`Failed to save project: ${error.message}`);
  }
  return project as ContractorProject;
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("contractor_projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

export async function approveReview(reviewId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("contractor_reviews")
    .update({ is_approved: true })
    .eq("id", reviewId);

  if (error) {
    console.error("Error approving review:", error);
    throw new Error(`Failed to approve review: ${error.message}`);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("contractor_reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    console.error("Error deleting review:", error);
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}

export async function markLeadRead(leadId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from("contractor_leads")
    .update({ read: true })
    .eq("id", leadId);

  if (error) {
    console.error("Error marking lead as read:", error);
    throw new Error(`Failed to mark lead as read: ${error.message}`);
  }
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from("contractor-assets")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("contractor-assets").getPublicUrl(path);

  return publicUrl;
}
