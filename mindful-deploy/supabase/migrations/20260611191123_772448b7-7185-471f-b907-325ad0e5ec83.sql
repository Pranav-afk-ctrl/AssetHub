
-- 1. Lock down has_role: revoke EXECUTE from clients; still usable inside RLS policies (definer)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- 2. Add WITH CHECK to bookings update policy to prevent ownership transfer / status escalation
DROP POLICY IF EXISTS bookings_update_own_pending ON public.bookings;
CREATE POLICY bookings_update_own_pending ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending'::booking_status)
  WITH CHECK (auth.uid() = user_id AND status = 'pending'::booking_status);

-- 3. Remove direct user INSERT into audit_logs; provide a SECURITY DEFINER RPC instead
DROP POLICY IF EXISTS audit_logs_insert_auth ON public.audit_logs;
REVOKE INSERT ON public.audit_logs FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.log_audit(
  _action text,
  _entity_type text,
  _entity_id uuid,
  _metadata jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, COALESCE(_metadata, '{}'::jsonb));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb) TO authenticated;
