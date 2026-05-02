import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, User, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  contractor_id: string;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  project_type?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  brandColor: string;
  onLeaveReview: () => void;
}

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// Star Rating Component
function StarRating({ rating, size = 4, interactive = false, onRatingChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange?.(star)}
          className={`transition-all duration-200 ${
            interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          }`}
          style={{ color: star <= rating ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
        >
          <Star 
            size={size * 4} 
            fill={star <= rating ? "#fbbf24" : "none"}
            stroke={star <= rating ? "#fbbf24" : "rgba(255,255,255,0.2)"}
          />
        </button>
      ))}
    </div>
  );
}

// Quick Review Form Component
function QuickReviewForm({ onSubmit, onClose }: {
  onSubmit: (review: { name: string; email: string; rating: number; comment: string }) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", rating: 5, comment: "" });
      onClose();
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="backdrop-blur-xl rounded-2xl p-6 text-center"
           style={{ background: "rgba(30, 41, 59, 0.8)" }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
             style={{
               background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
               boxShadow: "0 8px 24px rgba(251, 191, 36, 0.3)"
             }}>
          <Star className="h-8 w-8" style={{ color: "#1e293b" }} fill="#fbbf24" />
        </div>
        <h3 className="text-white text-xl font-light mb-2">Thank You!</h3>
        <p className="text-white/70 text-sm">Your review has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-xl rounded-2xl p-6"
          style={{ background: "rgba(30, 41, 59, 0.8)" }}>
      <h3 className="text-white text-lg font-light mb-4">Quick Review</h3>
      
      <div className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Your Rating</label>
          <StarRating
            rating={formData.rating}
            size={ 5 }
            interactive={true}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
            placeholder="John Doe"
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
            placeholder="john@example.com"
          />
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="block text-white/70 text-sm mb-2">Your Review *</label>
          <textarea
            required
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all resize-none"
            placeholder="Tell us about your experience..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim() || !formData.comment.trim()}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 focus:outline-none tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
            color: "#1e293b",
            boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

export function ReviewsSection({ reviews, brandColor, onLeaveReview }: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [enlargedReview, setEnlargedReview] = useState<Review | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Demo reviews to ensure cards are always visible
  const demoReviews: Review[] = [
    {
      id: "demo-1",
      contractor_id: "demo",
      reviewer_name: "Sarah Johnson",
      reviewer_email: "sarah@example.com",
      rating: 5,
      comment: "Absolutely fantastic work! They transformed our outdated kitchen into a modern masterpiece. Professional, punctual, and attention to detail was outstanding.",
      is_approved: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      project_type: "Kitchen Renovation"
    },
    {
      id: "demo-2",
      contractor_id: "demo",
      reviewer_name: "Michael Chen", 
      reviewer_email: "michael@example.com",
      rating: 5,
      comment: "Exceptional service from start to finish. Our bathroom remodel was completed on time and within budget. The quality exceeded our expectations.",
      is_approved: true,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      project_type: "Bathroom Remodel"
    },
    {
      id: "demo-3",
      contractor_id: "demo",
      reviewer_name: "Emily Rodriguez",
      reviewer_email: "emily@example.com",
      rating: 4,
      comment: "Great experience overall. The team was professional and the work quality is excellent. Minor delays but communication was always clear.",
      is_approved: true,
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      project_type: "Home Addition"
    },
    {
      id: "demo-4",
      contractor_id: "demo",
      reviewer_name: "David Thompson",
      reviewer_email: "david@example.com",
      rating: 5,
      comment: "Outstanding craftsmanship on our home addition. They seamlessly matched the existing architecture and delivered exactly what was promised.",
      is_approved: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      project_type: "Home Addition"
    },
    {
      id: "demo-5",
      contractor_id: "demo",
      reviewer_name: "Lisa Martinez",
      reviewer_email: "lisa@example.com",
      rating: 5,
      comment: "Professional, reliable, and talented team. Our basement finishing project turned out better than we ever imagined. Highly recommend!",
      is_approved: true,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      project_type: "Basement Finishing"
    }
  ];

  const reviewsToDisplay = reviews.length > 0 ? reviews : demoReviews;

  const handleReviewSubmit = (reviewData: { name: string; email: string; rating: number; comment: string }) => {
    console.log("Review submitted:", reviewData);
    // In a real app, this would submit to an API
  };

  return (
    <>
      <section id="reviews" className="pt-2 pb-8 relative overflow-hidden bg-transparent">
        
        <div className="w-full px-4 sm:px-8 lg:px-16">

          {/* ── Compact Header ── */}
          <div className="text-center mb-8">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: brandColor }}
            >
              Testimonials
            </p>
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 tracking-tight">
              What Clients Say
            </h2>
            <div
              className="mx-auto mt-4 h-px w-16"
              style={{ backgroundColor: brandColor }}
            />
          </div>

          {/* ── Single Horizontal Review Bar ── */}
          <div className="mb-8">
            <div className="rounded-2xl p-6 w-full border border-gray-200 bg-gray-50">
              {/* Review cards in single horizontal row - no scroll */}
              <div className="flex gap-4 flex-wrap justify-center">
                {reviewsToDisplay.map((review) => (
                  <div
                    key={review.id}
                    className="flex-1 rounded-xl p-4 transition-all duration-300 hover:shadow-md border border-gray-200 min-w-[200px] max-w-[280px] cursor-pointer bg-white shadow-sm"
                    onClick={() => {
                      const index = reviewsToDisplay.findIndex(r => r.id === review.id);
                      setCurrentReviewIndex(index);
                      setEnlargedReview(review);
                    }}
                  >
                    {/* Customer Info - Taller Layout */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                               style={{
                                 background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                                 boxShadow: "0 2px 8px rgba(251, 191, 36, 0.3)"
                               }}>
                            <User className="h-4 w-4" style={{ color: "#1e293b" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-gray-900 font-medium text-sm truncate">{review.reviewer_name}</h4>
                            <p className="text-amber-500 text-xs font-light truncate">{review.project_type || "General"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <StarRating rating={review.rating} size={3} />
                          <span className="text-gray-400 text-xs whitespace-nowrap">{timeAgo(review.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 overflow-hidden">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Review Actions ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 focus:outline-none tracking-wide shadow-xl flex items-center gap-2"
              style={{ 
                background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                color: "#1e293b",
                boxShadow: "0 8px 32px rgba(251, 191, 36, 0.4)"
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Write a Review
            </button>
            
            <button
              onClick={onLeaveReview}
              className="px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 focus:outline-none tracking-wide border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
            >
              View All Reviews
            </button>
          </div>
        </div>
      </section>

      {/* Enlarged Review Modal */}
      {enlargedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
             onClick={() => setEnlargedReview(null)}>
          <div className="max-w-2xl w-full"
               onClick={(e) => e.stopPropagation()}>
            <div className="backdrop-blur-xl rounded-2xl p-8 relative"
                 style={{ 
                   background: "rgba(30, 41, 59, 0.9)",
                   boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.2)"
                 }}>
              {/* Close Button */}
              <button
                onClick={() => setEnlargedReview(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                style={{ 
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                ×
              </button>

              {/* Review Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{
                       background: "linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)",
                       boxShadow: "0 4px 16px rgba(251, 191, 36, 0.3)"
                     }}>
                  <User className="h-6 w-6" style={{ color: "#1e293b" }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-light mb-1">{enlargedReview.reviewer_name}</h3>
                  <p className="text-amber-400 text-sm font-light">{enlargedReview.project_type || "General"}</p>
                </div>
                <div className="text-right">
                  <StarRating rating={enlargedReview.rating} size={5} />
                  <p className="text-white/50 text-sm mt-1">{timeAgo(enlargedReview.created_at)}</p>
                </div>
              </div>

              {/* Full Review Text */}
              <div className="mb-6">
                <p className="text-white/90 text-lg leading-relaxed">
                  "{enlargedReview.comment}"
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const prevIndex = (currentReviewIndex - 1 + reviewsToDisplay.length) % reviewsToDisplay.length;
                    setCurrentReviewIndex(prevIndex);
                    setEnlargedReview(reviewsToDisplay[prevIndex]);
                  }}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  style={{ 
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <span className="text-white/50 text-sm">
                  {currentReviewIndex + 1} of {reviewsToDisplay.length}
                </span>

                <button
                  onClick={() => {
                    const nextIndex = (currentReviewIndex + 1) % reviewsToDisplay.length;
                    setCurrentReviewIndex(nextIndex);
                    setEnlargedReview(reviewsToDisplay[nextIndex]);
                  }}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  style={{ 
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
             onClick={() => setShowReviewForm(false)}>
          <div className="max-w-md w-full"
               onClick={(e) => e.stopPropagation()}>
            <QuickReviewForm
              onSubmit={handleReviewSubmit}
              onClose={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
