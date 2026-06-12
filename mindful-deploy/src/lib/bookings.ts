import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BookingRow = Tables<"bookings">;

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Whether an issued booking is past its due date. */
export function isBookingOverdue(
  status: string,
  endDate: string,
  today = todayDateString(),
): boolean {
  return status === "issued" && endDate < today;
}

export function daysOverdue(endDate: string, today = todayDateString()): number {
  const due = new Date(endDate);
  due.setHours(0, 0, 0, 0);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now.getTime() - due.getTime()) / 86_400_000));
}

/** Fetch all issued bookings whose end_date is before today. */
export async function fetchOverdueBookings() {
  const today = todayDateString();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, assets(name), profiles!bookings_user_id_fkey(name, email)")
    .eq("status", "issued")
    .lt("end_date", today)
    .order("end_date", { ascending: true });

  if (error) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("bookings")
      .select("*, assets(name)")
      .eq("status", "issued")
      .lt("end_date", today)
      .order("end_date", { ascending: true });

    if (fallbackError) throw fallbackError;
    return fallback ?? [];
  }

  return data ?? [];
}
