-- =====================================================
-- Notifications Table for AI Screening
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_screening_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_screening_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" 
  ON ai_screening_notifications FOR SELECT 
  TO authenticated 
  USING (user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own notifications" 
  ON ai_screening_notifications FOR UPDATE 
  TO authenticated 
  USING (user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert notifications" 
  ON ai_screening_notifications FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_ai_screening_notifications_user ON ai_screening_notifications(user_id);
CREATE INDEX idx_ai_screening_notifications_unread ON ai_screening_notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_ai_screening_notifications_created ON ai_screening_notifications(created_at DESC);

COMMENT ON TABLE ai_screening_notifications IS 'AI screening notifications for landlords and tenants';