import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPost } from '@/services/communityPostService';
import type { CommunityPost, PostType, StructuredPostData } from '@/types/community';

interface PostFormProps {
  communityId: string;
  open: boolean;
  onClose: () => void;
  onPostCreated: (post: CommunityPost) => void;
}

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'casual', label: 'General Chat' },
  { value: 'looking_for_roommate', label: 'Looking for Roommate' },
  { value: 'offering_room', label: 'Offering Room' },
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
];

const ROOM_TYPE_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'shared', label: 'Shared' },
];

const LEASE_DURATION_OPTIONS = [
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: '1 year' },
  { value: 'flexible', label: 'Flexible' },
];

export function PostForm({ communityId, open, onClose, onPostCreated }: PostFormProps) {
  const [postType, setPostType] = useState<PostType>('casual');
  const [content, setContent] = useState('');
  const [structured, setStructured] = useState<StructuredPostData>({});
  const [submitting, setSubmitting] = useState(false);

  const isStructured = postType !== 'casual';

  function handleClose() {
    setPostType('casual');
    setContent('');
    setStructured({});
    onClose();
  }

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    setSubmitting(true);
    try {
      const post = await createPost({
        community_id: communityId,
        content: content.trim(),
        post_type: postType,
        structured_data: isStructured ? structured : undefined,
      });
      onPostCreated(post);
      toast.success('Post created');
      handleClose();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Post type */}
          <div className="space-y-1.5">
            <Label>Post Type</Label>
            <div className="flex gap-2 flex-wrap">
              {POST_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPostType(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    postType === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="post-content">Content *</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Structured fields */}
          {isStructured && (
            <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Listing Details
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="budget">Budget ($/mo)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g. 1200"
                    value={structured.budget ?? ''}
                    onChange={e =>
                      setStructured(prev => ({
                        ...prev,
                        budget: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="move-in-date">Move-in Date</Label>
                  <Input
                    id="move-in-date"
                    type="date"
                    value={structured.move_in_date ?? ''}
                    onChange={e =>
                      setStructured(prev => ({ ...prev, move_in_date: e.target.value || null }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Gender Preference</Label>
                  <Select
                    value={structured.gender_preference ?? ''}
                    onValueChange={v =>
                      setStructured(prev => ({ ...prev, gender_preference: v as any || null }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Room Type</Label>
                  <Select
                    value={structured.room_type ?? ''}
                    onValueChange={v =>
                      setStructured(prev => ({ ...prev, room_type: v as any || null }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Lease Duration</Label>
                <Select
                  value={structured.lease_duration ?? ''}
                  onValueChange={v =>
                    setStructured(prev => ({ ...prev, lease_duration: v as any || null }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEASE_DURATION_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="pets"
                  checked={structured.pets ?? false}
                  onCheckedChange={checked =>
                    setStructured(prev => ({ ...prev, pets: checked === true }))
                  }
                />
                <Label htmlFor="pets" className="cursor-pointer">Pets allowed</Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
