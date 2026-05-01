import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitReview } from "@/services/contractorPublicPageService";
import { Star, CheckCircle, Loader2 } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractorId: string;
}

interface FormErrors {
  reviewer_name?: string;
  rating?: string;
}

export function ReviewModal({ open, onOpenChange, contractorId }: ReviewModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    reviewer_name: "",
    rating: 0,
    comment: "",
  });

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.reviewer_name.trim()) newErrors.reviewer_name = "Name is required";
    if (form.rating < 1 || form.rating > 5) newErrors.rating = "Please select a rating";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitReview({ ...form, contractorId });
      setSuccess(true);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: err.message || "Could not submit your review. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      setSuccess(false);
      setForm({ reviewer_name: "", rating: 0, comment: "" });
      setErrors({});
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-14 w-14 text-green-500" />
            <p className="text-lg font-semibold text-gray-900">Thank you!</p>
            <p className="text-sm text-gray-500">
              Your review will appear after approval.
            </p>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="review-name">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="review-name"
                value={form.reviewer_name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, reviewer_name: e.target.value }));
                  if (errors.reviewer_name)
                    setErrors((prev) => ({ ...prev, reviewer_name: undefined }));
                }}
                placeholder="Your name"
                className={errors.reviewer_name ? "border-red-400" : ""}
              />
              {errors.reviewer_name && (
                <p className="text-xs text-red-500">{errors.reviewer_name}</p>
              )}
            </div>

            {/* Star Rating */}
            <div className="space-y-1">
              <Label>
                Rating <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, rating: star }));
                      if (errors.rating)
                        setErrors((prev) => ({ ...prev, rating: undefined }));
                    }}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className="h-7 w-7 transition-colors"
                      fill={star <= form.rating ? "#f59e0b" : "none"}
                      stroke={star <= form.rating ? "#f59e0b" : "#d1d5db"}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-xs text-red-500">{errors.rating}</p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <Label htmlFor="review-comment">Comment (optional)</Label>
              <Textarea
                id="review-comment"
                value={form.comment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Share your experience…"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
              style={{ backgroundColor: "var(--brand)" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
