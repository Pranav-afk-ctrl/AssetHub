import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Asset = {
  id: string;
  name: string;
  category: string;
  quantity_available: number;
};

export type Booking = {
  id: string;
  asset_id: string;
  user_id: string;
  quantity_requested: number;
  status: string;
  start_date: string;
  end_date: string;
  assets?: Pick<Asset, "name" | "category">;
};

export async function approveBooking(bookingId: string, actorId?: string) {
  const { data, error } = await supabase.rpc("approve_booking", {
    p_booking_id: bookingId,
    p_actor_id: actorId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
