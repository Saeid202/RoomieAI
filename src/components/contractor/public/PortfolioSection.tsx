import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images, Expand, ArrowRight } from "lucide-react";
import type { ContractorProject } from "@/types/contractor";

interface PortfolioSectionProps {
  projects: ContractorProject[];
  brandColor: string;
}

function Lightbox({
  project,
  onClose,
  brandColor,
}: {
  project: ContractorProject;
  onClose: () => void;
  brandColor: string;
}) {
  const [idx, setIdx] = useState(0);
  const imgs = project.images.filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}66)` }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow transition-colors focus:outline-none"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>

        <div className="relative aspect-video bg-gray-100">
          {imgs[idx] ? (
            <img src={imgs[idx]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}11` }}
            >
              <Images className="h-16 w-16 opacity-20" style={{ color: brandColor }} />
            </div>
          )}

          {imgs.length > 1 && (
            <>
              <button
                onClick={() => setIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors focus:outline-none"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setIdx((i) => (i + 1) % imgs.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors focus:outline-none"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold tracking-wide">
                {idx + 1} / {imgs.length}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-black text-gray-900 text-xl mb-1">{project.title}</h3>
          {project.description && (
            <p className="text-gray-500 text-sm leading-relaxed">{project.description}</p>
          )}
          {imgs.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {imgs.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setIdx(i)}
                  className="shrink-0 h-16 w-24 rounded-xl overflow-hidden focus:outline-none ring-2 transition-all"
                  style={{
                    opacity: i === idx ? 1 : 0.45,
                    ringColor: i === idx ? brandColor : "transparent",
                  }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PortfolioSection({ projects, brandColor }: PortfolioSectionProps) {
  const [selected, setSelected] = useState<ContractorProject | null>(null);

  return (
    <section id="portfolio" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background accents */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
      />

      {/* Full-width container */}
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

          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: brandColor }} />
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: brandColor }}
                >
                  Portfolio
                </span>
              </div>
              <h2
                className="text-5xl font-black text-gray-900 mb-3"
                style={{ letterSpacing: "-0.03em" }}
              >
                Our Work
              </h2>
              <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
                A selection of projects we're proud of — crafted with precision and care.
              </p>
            </div>

            {/* Project count badge */}
            <div
              className="shrink-0 flex flex-col items-center justify-center h-24 w-24 rounded-2xl shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
              }}
            >
              <span className="text-4xl font-black text-white leading-none">
                {String(projects.length).padStart(2, "0")}
              </span>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                Projects
              </span>
            </div>
          </div>
        </div>

        {/* ── Project cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, i) => {
            const thumb = project.images?.find(Boolean);
            const isWide = i % 5 === 0;

            return (
              <div
                key={project.id}
                className={`group cursor-pointer rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  isWide ? "xl:col-span-2" : ""
                }`}
                style={{
                  border: `1.5px solid ${brandColor}22`,
                  boxShadow: `0 4px 24px ${brandColor}10`,
                }}
                onClick={() => setSelected(project)}
              >
                {/* Image area */}
                <div
                  className="relative overflow-hidden bg-gray-100"
                  style={{ height: isWide ? 320 : 240 }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-3"
                      style={{ backgroundColor: `${brandColor}0d` }}
                    >
                      <Images className="h-12 w-12 opacity-25" style={{ color: brandColor }} />
                      <span className="text-xs font-semibold text-gray-400">No photos yet</span>
                    </div>
                  )}

                  {/* Gradient overlay always visible at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}e0` }}
                  >
                    <div className="text-white text-center">
                      <Expand className="h-8 w-8 mx-auto mb-2 opacity-90" />
                      <p className="font-bold text-sm">View Project</p>
                      {(project.images?.length ?? 0) > 1 && (
                        <p className="text-white/70 text-xs mt-1">
                          {project.images.length} photos
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Photo count badge */}
                  {(project.images?.length ?? 0) > 1 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                      <Images className="h-3 w-3" />
                      {project.images.length}
                    </div>
                  )}

                  {/* Project number bottom-left */}
                  <div className="absolute bottom-3 left-4 text-white/60 text-xs font-bold tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 bg-white flex flex-col flex-1">
                  <h3 className="font-black text-gray-900 text-lg mb-1.5 capitalize">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
                      {project.description}
                    </p>
                  )}
                  <div
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5"
                    style={{ color: brandColor }}
                  >
                    View project <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <Lightbox
          project={selected}
          onClose={() => setSelected(null)}
          brandColor={brandColor}
        />
      )}
    </section>
  );
}
