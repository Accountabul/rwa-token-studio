-- ============================================================================
-- ENTERPRISE NOTIFICATION SYSTEM
-- Phase 1: Core tables for notifications, preferences, and subscriptions
-- ============================================================================

-- Table 1: notifications (per-recipient notification state)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event reference
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  
  -- Actor info (who triggered)
  actor_user_id UUID NOT NULL,
  actor_name TEXT NOT NULL,
  
  -- Recipient targeting (one of these must be set)
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_role app_role,
  
  -- Routing reason
  routing_reason TEXT NOT NULL, -- 'ASSIGNED', 'DEPARTMENT_LEAD', 'WATCHER', 'MENTIONED', 'ORG_ADMIN'
  
  -- State
  channel TEXT NOT NULL DEFAULT 'in_app',
  status TEXT NOT NULL DEFAULT 'unread', -- 'unread', 'read', 'archived'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  
  -- Safe payload (no PII, just references)
  title TEXT NOT NULL,
  summary TEXT,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  -- Constraint: at least one recipient type must be set
  CONSTRAINT notifications_recipient_check CHECK (
    recipient_user_id IS NOT NULL OR recipient_role IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_notifications_recipient_user ON public.notifications(recipient_user_id, status, created_at DESC);
CREATE INDEX idx_notifications_recipient_role ON public.notifications(recipient_role, status, created_at DESC);
CREATE INDEX idx_notifications_entity ON public.notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_event_type ON public.notifications(event_type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Table 2: notification_preferences (user control)
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT DEFAULT 'none', -- 'none', 'daily', 'weekly'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, event_type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Table 3: entity_subscriptions (watchers - for "following" entities)
CREATE TABLE public.entity_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, entity_type, entity_id)
);

ALTER TABLE public.entity_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Notifications: Users can view their own (by user_id) or by role
CREATE POLICY "Users can view own notifications by user_id"
ON public.notifications FOR SELECT
USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can view notifications by role"
ON public.notifications FOR SELECT
USING (
  recipient_role IS NOT NULL 
  AND public.has_role(auth.uid(), recipient_role)
);

-- Users can update own notifications (mark read/archived)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (recipient_user_id = auth.uid());

-- System/service role can insert notifications
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE
USING (public.is_admin(auth.uid()));

-- Preferences: Users manage their own
CREATE POLICY "Users can view own preferences"
ON public.notification_preferences FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
ON public.notification_preferences FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own preferences"
ON public.notification_preferences FOR DELETE
USING (user_id = auth.uid());

-- Subscriptions: Users manage their own
CREATE POLICY "Users can view own subscriptions"
ON public.entity_subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
ON public.entity_subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own subscriptions"
ON public.entity_subscriptions FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.notifications
  WHERE (
    recipient_user_id = _user_id
    OR (
      recipient_role IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id 
        AND role = recipient_role
        AND (expires_at IS NULL OR expires_at > now())
      )
    )
  )
  AND status = 'unread'
$$;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(_notification_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET status = 'read', read_at = now()
  WHERE id = ANY(_notification_ids)
  AND recipient_user_id = auth.uid()
  AND status = 'unread';
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET status = 'read', read_at = now()
  WHERE recipient_user_id = auth.uid()
  AND status = 'unread';
END;
$$;

-- Trigger to update notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();