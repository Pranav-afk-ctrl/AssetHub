import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date().toISOString();

    const { data: overdueBookings, error: queryError } = await supabase
      .from("bookings")
      .select("id, asset_id, user_id, end_date")
      .eq("status", "issued")
      .lt("end_date", now);

    if (queryError) {
      throw queryError;
    }

    const bookings = overdueBookings ?? [];
    let insertedCount = 0;

    for (const booking of bookings) {
      const { error: insertError } = await supabase.from("audit_logs").insert({
        booking_id: booking.id,
        asset_id: booking.asset_id,
        action: "overdue_detected",
        details: {
          user_id: booking.user_id,
          end_date: booking.end_date,
          detected_at: now,
        },
      });

      if (insertError) {
        console.error(`Failed to log overdue booking ${booking.id}:`, insertError.message);
        continue;
      }

      insertedCount += 1;
    }

    const result = {
      overdue_count: bookings.length,
      audit_logs_inserted: insertedCount,
      checked_at: now,
    };

    console.log("Overdue detection complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Overdue detection failed:", message);

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
