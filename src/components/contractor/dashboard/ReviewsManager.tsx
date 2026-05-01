import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import type { ContractorReview } from "@/types/contractor";

interface ReviewsManagerProps {
  reviews: ContractorReview[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="h-3.5 w-3.5"
          fill={star <= rating ? "#f59e0b" : "none"}
          stroke={star <= rating ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

export function ReviewsManager({
  reviews,
  onApprove,
  onReject,
}: ReviewsManagerProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-600" />
          Pending Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No pending reviews.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {review.reviewer_name}
                    </p>
                    <StarRating rating={review.rating} />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(review.id)}
                    disabled={processingId === review.id}
                  >
                    {processingId === review.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(review.id)}
                    disabled={processingId === review.id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
