import { useState, useEffect } from "react";
import * as contractorPublicPageService from "@/services/contractorPublicPageService";
import type {
  ContractorPublicProfile,
  ContractorService,
  ContractorProject,
  ContractorReview,
} from "@/types/contractor";

interface ContractorPublicPageState {
  profile: ContractorPublicProfile | null;
  services: ContractorService[];
  projects: ContractorProject[];
  reviews: ContractorReview[];
  loading: boolean;
  notFound: boolean;
}

export function useContractorPublicPage(slug: string): ContractorPublicPageState {
  const [state, setState] = useState<ContractorPublicPageState>({
    profile: null,
    services: [],
    projects: [],
    reviews: [],
    loading: true,
    notFound: false,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, notFound: false }));

      const profile = await contractorPublicPageService.getProfileBySlug(slug);

      if (cancelled) return;

      if (!profile) {
        setState((s) => ({ ...s, loading: false, notFound: true }));
        return;
      }

      const [services, projects, reviews] = await Promise.all([
        contractorPublicPageService.getServices(profile.id),
        contractorPublicPageService.getProjects(profile.id),
        contractorPublicPageService.getApprovedReviews(profile.id),
      ]);

      if (cancelled) return;

      setState({
        profile,
        services,
        projects,
        reviews,
        loading: false,
        notFound: false,
      });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
