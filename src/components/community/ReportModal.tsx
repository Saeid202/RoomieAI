import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { createReport } from '@/services/communityReportService';
import type { ReportReason, ReportTargetType } from '@/types/community';

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'scam', label: 'Scam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
];

export function ReportModal({ targetType, targetId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await createReport({ target_type: targetType, target_id: targetId, reason, details: details.trim() || undefined });
      toast.success('Report submitted. Our team will review it.');
      setDetails('');
      setReason('spam');
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Reason</p>
            {REASONS.map(r => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="accent-primary"
                />
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Add more details (optional)</label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe the issue..."
              className="resize-none min-h-[80px] text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
