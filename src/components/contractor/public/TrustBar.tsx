import { Star } from "lucide-react";
import type { ContractorPublicProfile } from "@/types/contractor";

interface TrustBarProps {
  profile: ContractorPublicProfile;
  reviewCount: number;
  avgRating: number | null;
  projectCount: number;
}

export function TrustBar({
  profile,
  reviewCount,
  avgRating,
  projectCount,
}: TrustBarProps) {
  const truncatedDesc = profile.description
    ? profile.description.length > 160
      ? profile.description.slice(0, 160) + "…"
      : profile.description
    : null;

  return (
    <div className="bg-gray-50 border-y border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          {/* Rating */}
          <div className="flex flex-col items-center gap-1">
            {avgRating !== null ? (
              <>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5"
                      fill={star <= Math.round(avgRating) ? "var(--brand)" : "none"}
                      stroke={star <= Math.round(avgRating) ? "var(--brand)" : "#d1d5db"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {avgRating.toFixed(1)} ({reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400 italic">No reviews yet</span>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-10 w-px bg-gray-200" />

          {/* Projects */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-gray-900">
              {projectCount}
            </span>
            <span className="text-sm text-gray-500">
              {projectCount === 1 ? "Project" : "Projects"}
            </span>
          </div>

          {/* Divider */}
          {truncatedDesc && (
            <div className="hidden sm:block h-10 w-px bg-gray-200" />
          )}

          {/* Description */}
          {truncatedDesc && (
            <p className="text-sm text-gray-600 max-w-sm text-left sm:text-center">
              {truncatedDesc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
