export interface Community {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CommunityMembership {
  id: string;
  community_id: string;
  user_id: string;
  joined_at: string;
  status: 'active' | 'banned';
}

export type PostType = 'casual' | 'looking_for_roommate' | 'offering_room';

export interface StructuredPostData {
  budget?: number | null;
  move_in_date?: string | null;
  gender_preference?: 'any' | 'male' | 'female' | 'non_binary' | null;
  pets?: boolean | null;
  room_type?: 'private' | 'shared' | null;
  lease_duration?: 'month_to_month' | '6_months' | '1_year' | 'flexible' | null;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  structured_data: StructuredPostData | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CommunityPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export type ReportReason = 'scam' | 'harassment' | 'spam';
export type ReportStatus = 'pending' | 'resolved' | 'ignored';
export type ReportTargetType = 'post' | 'comment';

export interface CommunityReport {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface CommunityBan {
  id: string;
  user_id: string;
  community_id: string;
  reason: string;
  moderator_id: string | null;
  created_at: string;
}

export interface CommunityAnalytics {
  community_id: string;
  total_members: number;
  total_posts: number;
  posts_today: number;
  structured_posts: number;
  casual_posts: number;
  most_active_users: Array<{ user_id: string; post_count: number }>;
}

export interface CreateCommunityInput {
  name: string;
  description?: string;
  city?: string;
}

export interface UpdateCommunityInput {
  name?: string;
  description?: string;
  city?: string;
}

export interface CreatePostInput {
  community_id: string;
  content: string;
  post_type: PostType;
  structured_data?: StructuredPostData;
}

export interface UpdatePostInput {
  content?: string;
  structured_data?: StructuredPostData;
}

export interface CreateCommentInput {
  post_id: string;
  content: string;
}

export interface CreateReportInput {
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details?: string;
}

export interface BanUserInput {
  user_id: string;
  community_id: string;
  reason: string;
}
