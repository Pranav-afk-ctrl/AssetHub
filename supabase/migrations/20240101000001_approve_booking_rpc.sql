-- Atomic booking approval with inventory consistency check

CREATE OR REPLACE FUNCTION approve_booking(p_booking_id UUID, p_actor_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_asset assets%ROWTYPE;
  v_rows_updated INTEGER;
BEGIN
  -- Lock the booking row to prevent concurrent approvals
  SELECT *
  INTO v_booking
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_booking.status <> 'pending' THEN
    RAISE EXCEPTION 'Booking % is not pending (current status: %)', p_booking_id, v_booking.status
      USING ERRCODE = 'P0001';
  END IF;

  -- Lock the asset row for atomic inventory decrement
  SELECT *
  INTO v_asset
  FROM assets
  WHERE id = v_booking.asset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found for booking: %', p_booking_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_asset.quantity_available < v_booking.quantity_requested THEN
    RAISE EXCEPTION 'Insufficient inventory: available %, requested %',
      v_asset.quantity_available, v_booking.quantity_requested
      USING ERRCODE = 'P0003';
  END IF;

  UPDATE assets
  SET
    quantity_available = quantity_available - v_booking.quantity_requested,
    updated_at = now()
  WHERE id = v_asset.id
    AND quantity_available >= v_booking.quantity_requested;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated <> 1 THEN
    RAISE EXCEPTION 'Inventory check failed at transaction time for asset %', v_asset.id
      USING ERRCODE = 'P0003';
  END IF;

  UPDATE bookings
  SET
    status = 'approved',
    updated_at = now()
  WHERE id = p_booking_id;

  INSERT INTO audit_logs (booking_id, asset_id, action, details)
  VALUES (
    p_booking_id,
    v_asset.id,
    'booking_approved',
    jsonb_build_object(
      'actor_id', p_actor_id,
      'quantity_requested', v_booking.quantity_requested,
      'quantity_available_before', v_asset.quantity_available,
      'quantity_available_after', v_asset.quantity_available - v_booking.quantity_requested
    )
  );

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'asset_id', v_asset.id,
    'status', 'approved',
    'quantity_available', v_asset.quantity_available - v_booking.quantity_requested
  );
END;
$$;

GRANT EXECUTE ON FUNCTION approve_booking(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_booking(UUID, UUID) TO service_role;
