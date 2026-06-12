-- Atomic booking approval: inventory check, decrement, status update, audit log
CREATE OR REPLACE FUNCTION public.approve_booking(
  _booking_id uuid,
  _admin_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking public.bookings%ROWTYPE;
  _asset public.assets%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  SELECT * INTO _booking
  FROM public.bookings
  WHERE id = _booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF _booking.status <> 'pending'::public.booking_status THEN
    RAISE EXCEPTION 'Booking is not pending';
  END IF;

  SELECT * INTO _asset
  FROM public.assets
  WHERE id = _booking.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  IF _asset.quantity_available < _booking.quantity_requested THEN
    RAISE EXCEPTION 'Insufficient quantity available. Only % available, % requested',
      _asset.quantity_available, _booking.quantity_requested;
  END IF;

  UPDATE public.assets
  SET quantity_available = quantity_available - _booking.quantity_requested
  WHERE id = _booking.asset_id;

  UPDATE public.bookings
  SET status = 'approved'::public.booking_status,
      admin_note = _admin_note
  WHERE id = _booking_id;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'booking.approved',
    'booking',
    _booking_id,
    jsonb_build_object(
      'note', _admin_note,
      'quantity_requested', _booking.quantity_requested,
      'asset_id', _booking.asset_id
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_booking(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_booking(uuid, text) TO authenticated;
