-- =====================================================
-- Lawyer Document Room Access System
-- =====================================================
-- Purpose: Enable buyers to assign platform lawyers to
--          review property documents in Secure Document Room
-- =====================================================

-- Create deal_lawyers table
CREATE TABLE IF NOT EXISTS deal_lawyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL, -- References property_id (sales_listings or properties)
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT DEFAULT 'buyer_lawyer',
  status TEXT DEFAULT 'active', -- active, removed
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, lawyer_id, role)
);

-- Create lawyer_notifications table
CREATE TABLE IF NOT EXISTS lawyer_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID NOT NULL, -- References property_id
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT DEFAULT 'document_review_request',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE deal_lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_lawyers
CREATE POLICY "Buyers can view their assigned lawyers"
  ON deal_lawyers FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can assign lawyers"
  ON deal_lawyers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can remove lawyers"
  ON deal_lawyers FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Lawyers can view their assignments"
  ON deal_lawyers FOR SELECT
  USING (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for lawyer_notifications
CREATE POLICY "Lawyers can view their notifications"
  ON lawyer_notifications FOR SELECT
  USING (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Lawyers can update their notifications"
  ON lawyer_notifications FOR UPDATE
  USING (
    lawyer_id IN (
      SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications"
  ON lawyer_notifications FOR INSERT
  WITH CHECK (true);

-- Update property_documents RLS to allow lawyers to view assigned deal documents
CREATE POLICY "Lawyers can view assigned deal documents"
  ON property_documents FOR SELECT
  USING (
    property_id IN (
      SELECT deal_id FROM deal_lawyers 
      WHERE lawyer_id IN (
        SELECT id FROM lawyer_profiles WHERE user_id = auth.uid()
      )
      AND status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_lawyers_deal_id ON deal_lawyers(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_lawyers_lawyer_id ON deal_lawyers(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_deal_lawyers_buyer_id ON deal_lawyers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deal_lawyers_status ON deal_lawyers(status);

CREATE INDEX IF NOT EXISTS idx_lawyer_notifications_lawyer_id ON lawyer_notifications(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_notifications_deal_id ON lawyer_notifications(deal_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_notifications_read ON lawyer_notifications(read);

-- Create function to get lawyer's assigned deals
CREATE OR REPLACE FUNCTION get_lawyer_assigned_deals(p_lawyer_id UUID)
RETURNS TABLE (
  deal_id UUID,
  buyer_id UUID,
  assigned_at TIMESTAMPTZ,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.deal_id,
    dl.buyer_id,
    dl.assigned_at,
    dl.status
  FROM deal_lawyers dl
  WHERE dl.lawyer_id = p_lawyer_id
    AND dl.status = 'active'
  ORDER BY dl.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if lawyer is assigned to deal
CREATE OR REPLACE FUNCTION is_lawyer_assigned_to_deal(
  p_deal_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM deal_lawyers dl
    JOIN lawyer_profiles lp ON dl.lawyer_id = lp.id
    WHERE dl.deal_id = p_deal_id
      AND lp.user_id = p_user_id
      AND dl.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count for lawyer
CREATE OR REPLACE FUNCTION get_lawyer_unread_notification_count(p_lawyer_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM lawyer_notifications
    WHERE lawyer_id = p_lawyer_id
      AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

