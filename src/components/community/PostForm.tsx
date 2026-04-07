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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="text-3xl font-bold text-gray-900">Create Post</DialogTitle>
          <p className="text-gray-600 text-base mt-2">Share your thoughts with the community</p>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Post type */}
          <div className="space-y-4">
            <Label className="text-lg font-bold text-gray-900">Post Type</Label>
            <div className="flex gap-3 flex-wrap">
              {POST_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPostType(value)}
                  className={`px-6 py-3 rounded-xl text-base font-semibold border-2 transition-all ${
                    postType === value
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-600 shadow-lg'
                      : 'border-gray-300 text-gray-700 hover:border-violet-400 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <Label htmlFor="post-content" className="text-lg font-bold text-gray-900">What's on your mind? *</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or describe what you're looking for..."
              className="min-h-[200px] resize-none text-base p-4 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
            <p className="text-sm text-gray-500">{content.length} characters</p>
          </div>

          {/* Structured fields */}
          {isStructured && (
            <div className="space-y-6 border-2 border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-white">
              <p className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                Listing Details
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="budget" className="text-base font-semibold text-gray-900">Budget ($/mo)</Label>
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
                    className="h-12 text-base border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="move-in-date" className="text-base font-semibold text-gray-900">Move-in Date</Label>
                  <Input
                    id="move-in-date"
                    type="date"
                    value={structured.move_in_date ?? ''}
                    onChange={e =>
                      setStructured(prev => ({ ...prev, move_in_date: e.target.value || null }))
                    }
                    className="h-12 text-base border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Gender Preference</Label>
                  <Select
                    value={structured.gender_preference ?? ''}
                    onValueChange={v =>
                      setStructured(prev => ({ ...prev, gender_preference: v as any || null }))
                    }
                  >
                    <SelectTrigger className="h-12 text-base border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Room Type</Label>
                  <Select
                    value={structured.room_type ?? ''}
                    onValueChange={v =>
                      setStructured(prev => ({ ...prev, room_type: v as any || null }))
                    }
                  >
                    <SelectTrigger className="h-12 text-base border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
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

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Lease Duration</Label>
                <Select
                  value={structured.lease_duration ?? ''}
                  onValueChange={v =>
                    setStructured(prev => ({ ...prev, lease_duration: v as any || null }))
                  }
                >
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 rounded-lg focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEASE_DURATION_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="pets"
                  checked={structured.pets ?? false}
                  onCheckedChange={checked =>
                    setStructured(prev => ({ ...prev, pets: checked === true }))
                  }
                  className="w-5 h-5"
                />
                <Label htmlFor="pets" className="cursor-pointer text-base font-medium text-gray-900">Pets allowed</Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={submitting}
              className="px-8 py-3 text-base font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !content.trim()}
              className="px-8 py-3 text-base font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
