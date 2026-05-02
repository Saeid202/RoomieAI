import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Home, Bath, Hammer, Trees, Zap, PaintBucket } from "lucide-react";

interface Project {
  id: string;
  contractor_id: string;
  title: string;
  description: string | null;
  images: string[];
  sort_order: number;
  category?: string;
}

interface PortfolioSectionProps {
  projects: Project[];
  brandColor: string;
}

// Icon mapping for different project categories
const categoryIcons: Record<string, any> = {
  "Kitchen": Home,
  "Bathroom": Bath,
  "Addition": Hammer,
  "Outdoor": Trees,
  "Electrical": Zap,
  "Painting": PaintBucket,
  "Other": Hammer
};

// Lightbox Component
function Lightbox({ project, isOpen, onClose, onNext, onPrev, hasNext, hasPrev }: {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
         onClick={onClose}>
      <div className="relative max-w-6xl mx-4 max-h-[90vh] overflow-hidden rounded-3xl"
           onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Navigation buttons */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Project content */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image */}
          <div className="lg:w-2/3 bg-gray-900 flex items-center justify-center">
            {project.images && project.images.length > 0 ? (
              <img 
                src={project.images[0]} 
                alt={project.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="w-full h-64 lg:h-96 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-600" />
              </div>
            )}
          </div>

          {/* Project details */}
          <div className="lg:w-1/3 bg-gray-800 p-8 flex flex-col">
            <h3 className="text-2xl font-light text-white mb-4">{project.title}</h3>
            {project.category && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-light mb-4"
                   style={{
                     background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                     color: "#1e293b"
                   }}>
                {(() => {
                  const IconComponent = categoryIcons[project.category || "Other"];
                  return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                })()}
                {project.category}
              </div>
            )}
            <p className="text-gray-300 leading-relaxed flex-1">
              {project.description || "Professional renovation project completed with attention to detail and quality craftsmanship."}
            </p>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Interested in a similar project?</p>
              <button className="mt-3 w-full px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 focus:outline-none tracking-wide"
                      style={{
                        background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                        color: "#1e293b",
                        boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
                      }}>
                Get Quote for Similar Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioSection({ projects, brandColor }: PortfolioSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxProject, setLightboxProject] = useState<Project | null>(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Demo projects to ensure cards are always visible
  const demoProjects: Project[] = [
    {
      id: "demo-1",
      contractor_id: "demo",
      title: "Modern Kitchen Transformation",
      description: "Complete kitchen renovation with custom cabinetry, quartz countertops, and professional-grade appliances. This project transformed an outdated kitchen into a modern culinary space.",
      images: [],
      sort_order: 1,
      category: "Kitchen"
    },
    {
      id: "demo-2",
      contractor_id: "demo",
      title: "Luxury Bathroom Remodel",
      description: "Spa-like bathroom renovation featuring walk-in shower, double vanity, and premium fixtures. Created a relaxing retreat with modern amenities and elegant finishes.",
      images: [],
      sort_order: 2,
      category: "Bathroom"
    },
    {
      id: "demo-3",
      contractor_id: "demo",
      title: "Home Addition Expansion",
      description: "Seamless home addition adding 400 sq ft of living space. Perfect blend with existing architecture while providing modern functionality and natural light.",
      images: [],
      sort_order: 3,
      category: "Addition"
    },
    {
      id: "demo-4",
      contractor_id: "demo",
      title: "Outdoor Living Space",
      description: "Complete backyard transformation with deck, patio, and landscaping. Created an outdoor entertainment area perfect for gatherings and relaxation.",
      images: [],
      sort_order: 4,
      category: "Outdoor"
    },
    {
      id: "demo-5",
      contractor_id: "demo",
      title: "Electrical System Upgrade",
      description: "Full electrical panel upgrade and rewiring throughout the home. Enhanced safety, capacity, and efficiency with modern electrical solutions.",
      images: [],
      sort_order: 5,
      category: "Electrical"
    },
    {
      id: "demo-6",
      contractor_id: "demo",
      title: "Interior Painting Project",
      description: "Complete interior painting with premium finishes and detailed preparation. Transformed the entire home with a fresh, modern color palette.",
      images: [],
      sort_order: 6,
      category: "Painting"
    }
  ];

  const allProjects = projects.length > 0 ? projects : demoProjects;
  
  // Get unique categories
  const categories = ["All", ...Array.from(new Set(allProjects.map(p => p.category || "").filter(Boolean)))];
  
  // Filter projects by category
  const filteredProjects = selectedCategory === "All" 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedCategory);
  
  // Show max 6 projects (2 rows × 3 columns)
  const displayProjects = filteredProjects.slice(0, 6);

  const openLightbox = (project: Project, index: number) => {
    setLightboxProject(project);
    setCurrentProjectIndex(index);
  };

  const closeLightbox = () => {
    setLightboxProject(null);
  };

  const nextProject = () => {
    const nextIndex = (currentProjectIndex + 1) % displayProjects.length;
    setLightboxProject(displayProjects[nextIndex]);
    setCurrentProjectIndex(nextIndex);
  };

  const prevProject = () => {
    const prevIndex = (currentProjectIndex - 1 + displayProjects.length) % displayProjects.length;
    setLightboxProject(displayProjects[prevIndex]);
    setCurrentProjectIndex(prevIndex);
  };

  return (
    <>
      <section id="portfolio" className="pt-2 pb-2 bg-transparent">
        
        <div className="w-full px-4 sm:px-8 lg:px-16">

          {/* ── Section header ── */}
          <div className="text-center mb-4">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: brandColor }}
            >
              Our Work
            </p>
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
              Portfolio
            </h2>
            <div
              className="mx-auto mt-4 h-px w-16"
              style={{ backgroundColor: brandColor }}
            />
          </div>

          {/* ── Project Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
            {displayProjects.map((project, index) => (
              <article
                key={project.id}
                className="group flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => openLightbox(project, index)}
              >
                {/* ── Full image, no cropping ── */}
                <div className="w-full overflow-hidden bg-gray-50">
                  {project.images && project.images.length > 0 ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-auto block"
                      style={{ maxHeight: "400px", objectFit: "contain", background: "#f9fafb" }}
                    />
                  ) : (
                    <div
                      className="w-full flex items-center justify-center"
                      style={{
                        height: "220px",
                        background: `linear-gradient(135deg, ${brandColor}22 0%, ${brandColor}55 100%)`,
                      }}
                    >
                      {(() => {
                        const IconComponent = project.category ? categoryIcons[project.category] : null;
                        return IconComponent
                          ? <IconComponent className="h-12 w-12" style={{ color: brandColor, opacity: 0.35 }} />
                          : <span className="text-5xl font-bold select-none" style={{ color: brandColor, opacity: 0.35 }}>{project.title.charAt(0).toUpperCase()}</span>;
                      })()}
                    </div>
                  )}
                </div>

                {/* ── Divider ── */}
                <div className="h-px w-full bg-gray-200" />

                {/* ── Text content ── */}
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-gray-900 font-semibold text-xl mb-2 leading-snug">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  <div
                    className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium"
                    style={{ color: brandColor }}
                  >
                    View Project <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Show more projects indicator */}
          {filteredProjects.length > 6 && (
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Showing 6 of {filteredProjects.length} projects in {selectedCategory.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        project={lightboxProject}
        isOpen={!!lightboxProject}
        onClose={closeLightbox}
        onNext={nextProject}
        onPrev={prevProject}
        hasNext={currentProjectIndex < displayProjects.length - 1}
        hasPrev={currentProjectIndex > 0}
      />
    </>
  );
}
