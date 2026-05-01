import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as contractorPublicPageService from "@/services/contractorPublicPageService";
import type {
  ContractorPublicProfile,
  ContractorService,
  ContractorProject,
  ContractorLead,
  ContractorReview,
} from "@/types/contractor";

interface PublicPageDashboardState {
  profile: ContractorPublicProfile | null;
  services: ContractorService[];
  projects: ContractorProject[];
  leads: ContractorLead[];
  pendingReviews: ContractorReview[];
  loading: boolean;
}

interface PublicPageDashboardActions {
  refresh: () => void;
  refreshLeads: () => void;
  refreshReviews: () => void;
  updateProfile: (data: Partial<ContractorPublicProfile>) => Promise<void>;
  upsertService: (data: Partial<ContractorService> & { contractor_id: string }) => Promise<ContractorService>;
  deleteService: (id: string) => Promise<void>;
  upsertProject: (data: Partial<ContractorProject> & { contractor_id: string }) => Promise<ContractorProject>;
  deleteProject: (id: string) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  markLeadRead: (id: string) => Promise<void>;
  uploadImage: (file: File, path: string) => Promise<string>;
}

export function usePublicPageDashboard(): PublicPageDashboardState & PublicPageDashboardActions {
  const [state, setState] = useState<PublicPageDashboardState>({
    profile: null,
    services: [],
    projects: [],
    leads: [],
    pendingReviews: [],
    loading: true,
  });

  const loadAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const profile = await contractorPublicPageService.getDashboardProfile(
      session.user.id
    );

    if (!profile) {
      setState((s) => ({ ...s, profile: null, loading: false }));
      return;
    }

    const [services, projects, leads, pendingReviews] = await Promise.all([
      contractorPublicPageService.getServices(profile.id),
      contractorPublicPageService.getProjects(profile.id),
      contractorPublicPageService.getLeads(profile.id),
      contractorPublicPageService.getPendingReviews(profile.id),
    ]);

    setState({
      profile,
      services,
      projects,
      leads,
      pendingReviews,
      loading: false,
    });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshLeads = useCallback(async () => {
    if (!state.profile) return;
    const leads = await contractorPublicPageService.getLeads(state.profile.id);
    setState((s) => ({ ...s, leads }));
  }, [state.profile]);

  const refreshReviews = useCallback(async () => {
    if (!state.profile) return;
    const pendingReviews = await contractorPublicPageService.getPendingReviews(
      state.profile.id
    );
    setState((s) => ({ ...s, pendingReviews }));
  }, [state.profile]);

  const updateProfile = useCallback(
    async (data: Partial<ContractorPublicProfile>) => {
      if (!state.profile) return;
      await contractorPublicPageService.updateProfile(state.profile.id, data);
      setState((s) => ({
        ...s,
        profile: s.profile ? { ...s.profile, ...data } : null,
      }));
    },
    [state.profile]
  );

  const upsertService = useCallback(
    async (data: Partial<ContractorService> & { contractor_id: string }) => {
      const service = await contractorPublicPageService.upsertService(data);
      await loadAll();
      return service;
    },
    [loadAll]
  );

  const deleteService = useCallback(
    async (id: string) => {
      await contractorPublicPageService.deleteService(id);
      setState((s) => ({
        ...s,
        services: s.services.filter((svc) => svc.id !== id),
      }));
    },
    []
  );

  const upsertProject = useCallback(
    async (data: Partial<ContractorProject> & { contractor_id: string }) => {
      const project = await contractorPublicPageService.upsertProject(data);
      await loadAll();
      return project;
    },
    [loadAll]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await contractorPublicPageService.deleteProject(id);
      setState((s) => ({
        ...s,
        projects: s.projects.filter((p) => p.id !== id),
      }));
    },
    []
  );

  const approveReview = useCallback(
    async (id: string) => {
      await contractorPublicPageService.approveReview(id);
      setState((s) => ({
        ...s,
        pendingReviews: s.pendingReviews.filter((r) => r.id !== id),
      }));
    },
    []
  );

  const deleteReview = useCallback(
    async (id: string) => {
      await contractorPublicPageService.deleteReview(id);
      setState((s) => ({
        ...s,
        pendingReviews: s.pendingReviews.filter((r) => r.id !== id),
      }));
    },
    []
  );

  const markLeadRead = useCallback(async (id: string) => {
    await contractorPublicPageService.markLeadRead(id);
    setState((s) => ({
      ...s,
      leads: s.leads.map((l) => (l.id === id ? { ...l, read: true } : l)),
    }));
  }, []);

  const uploadImage = useCallback(
    async (file: File, path: string) => {
      return contractorPublicPageService.uploadImage(file, path);
    },
    []
  );

  return {
    ...state,
    refresh: loadAll,
    refreshLeads,
    refreshReviews,
    updateProfile,
    upsertService,
    deleteService,
    upsertProject,
    deleteProject,
    approveReview,
    deleteReview,
    markLeadRead,
    uploadImage,
  };
}
