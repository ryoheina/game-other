-- Enhance notifications table with rich event data
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS type_detail TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS browser TEXT,
  ADD COLUMN IF NOT EXISTS device TEXT,
  ADD COLUMN IF NOT EXISTS filename TEXT,
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS notifications_session_id_idx ON public.notifications(session_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_read_idx ON public.notifications(created_at DESC, read);

-- Update RLS policy to allow authenticated users to read their own notifications
DROP POLICY IF EXISTS "admins read notifications" ON public.notifications;
CREATE POLICY "admins read notifications" ON public.notifications 
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to update notifications (mark as read, delete)
CREATE POLICY "admins manage notifications" ON public.notifications 
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete notifications" ON public.notifications 
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
