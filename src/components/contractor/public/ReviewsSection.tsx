import { Star, Quote } from "lucide-react";
import type { ContractorReview } from "@/types/contractor";

interface ReviewsSectionProps {
  reviews: ContractorReview[];
  onLeaveReview: () => void;
  brandColor: string;
}

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={sz}
          fill={s <= rating ? "#F59E0B" : "none"}
          stroke={s <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ReviewsSection({ reviews, onLeaveReview, brandColor }: ReviewsSectionProps) {
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <section
      id="reviews"
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: "#F8F7FF" }}
    >
      {/* Background accents */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.07]"
        style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]"
        style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(${brandColor} 1.5px, transparent 1.5px)`,
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">

        {/* ── Framed header card ── */}
        <div
          className="relative rounded-3xl overflow-hidden mb-14 p-10 sm:p-14"
          style={{
            background: `linear-gradient(135deg, ${brandColor}0d 0%, ${brandColor}18 60%, ${brandColor}08 100%)`,
            border: `2px solid ${brandColor}2a`,
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}55, transparent)` }}
          />
          {/* Decorative circles */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
          />
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(${brandColor} 1.5px, transparent 1.5px)`,
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            {/* Left: title + rating summary */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: brandColor }} />
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: brandColor }}
                >
                  Testimonials
                </span>
              </div>
              <h2
                className="text-5xl font-black text-gray-900 mb-4"
                style={{ letterSpacing: "-0.03em" }}
              >
                What Clients Say
              </h2>
              {avg !== null ? (
                <div className="flex items-center gap-3">
                  <Stars rating={Math.round(avg)} size="lg" />
                  <span className="font-black text-gray-900 text-2xl">{avg.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                </div>
              ) : (
                <p className="text-gray-400 text-base">No reviews yet — be the first!</p>
              )}
            </div>

            {/* Right: CTA button */}
            <button
              onClick={onLeaveReview}
              className="shrink-0 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none text-white"
              style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)` }}
            >
              + Leave a Review
            </button>
          </div>
        </div>

        {/* ── Review cards ── */}
        {reviews.length === 0 ? (
          <div
            className="text-center py-20 rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${brandColor}08 0%, ${brandColor}12 100%)`,
              border: `1.5px dashed ${brandColor}33`,
            }}
          >
            <div
              className="h-16 w-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}18` }}
            >
              <Star className="h-8 w-8" style={{ color: brandColor }} />
            </div>
            <p className="font-black text-gray-800 text-xl mb-2">No reviews yet</p>
            <p className="text-gray-400 text-sm mb-7">Be the first to share your experience!</p>
            <button
              onClick={onLeaveReview}
              className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all focus:outline-none"
              style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)` }}
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <div
                key={r.id}
                className="group relative bg-white rounded-3xl p-7 flex flex-col gap-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  border: `1.5px solid ${brandColor}1a`,
                  boxShadow: `0 4px 24px ${brandColor}0d`,
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}55, transparent)` }}
                />

                {/* Quote icon */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${brandColor}12` }}
                >
                  <Quote className="h-5 w-5" style={{ color: brandColor }} />
                </div>

                {/* Stars */}
                <Stars rating={r.rating} />

                {/* Comment */}
                <p className="text-gray-600 text-[15px] leading-relaxed flex-1">
                  "{r.comment || "Great work!"}"
                </p>

                {/* Reviewer */}
                <div
                  className="flex items-center gap-3 pt-4"
                  style={{ borderTop: `1px solid ${brandColor}15` }}
                >
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}bb 100%)`,
                    }}
                  >
                    {initials(r.reviewer_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{r.reviewer_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{timeAgo(r.created_at)}</p>
                  </div>
                  {/* Rating number badge */}
                  <div
                    className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow"
                    style={{ backgroundColor: brandColor }}
                  >
                    {r.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
