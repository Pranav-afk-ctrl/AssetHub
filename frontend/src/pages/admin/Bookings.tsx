import { useEffect, useState } from "react";
import { approveBooking, supabase, type Booking } from "../../lib/supabase";

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select("id, asset_id, user_id, quantity_requested, status, start_date, end_date, assets(name, category)")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setBookings((data as Booking[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleApprove(bookingId: string) {
    setApprovingId(bookingId);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const actorId = sessionData.session?.user.id;

      await approveBooking(bookingId, actorId);
      await loadBookings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Approval failed";
      setError(message);
    } finally {
      setApprovingId(null);
    }
  }

  if (loading) {
    return <p className="status">Loading bookings…</p>;
  }

  return (
    <section>
      <h1>Bookings</h1>
      <p className="subtitle">Approve pending requests via atomic inventory RPC.</p>

      {error && <p className="status error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Qty</th>
              <th>Status</th>
              <th>End date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.assets?.name ?? booking.asset_id}</td>
                <td>{booking.quantity_requested}</td>
                <td>
                  <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                </td>
                <td>{new Date(booking.end_date).toLocaleDateString()}</td>
                <td>
                  {booking.status === "pending" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={approvingId === booking.id}
                      onClick={() => handleApprove(booking.id)}
                    >
                      {approvingId === booking.id ? "Approving…" : "Approve"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
