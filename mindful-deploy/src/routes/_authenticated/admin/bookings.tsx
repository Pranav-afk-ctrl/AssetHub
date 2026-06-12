import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

type Row = {
  id: string; status: string; quantity_requested: number; start_date: string; end_date: string;
  purpose: string | null; admin_note: string | null; asset_id: string; user_id: string;
  assets: { name: string; quantity_available: number } | null;
  profiles: { name: string | null; email: string } | null;
};

function AdminBookings() {
  const [rows, setRows] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => supabase.from("bookings")
    .select("id,status,quantity_requested,start_date,end_date,purpose,admin_note,asset_id,user_id,assets(name,quantity_available),profiles!bookings_user_id_fkey(name,email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        // fallback: separate fetch if FK alias not found
        supabase.from("bookings")
          .select("id,status,quantity_requested,start_date,end_date,purpose,admin_note,asset_id,user_id,assets(name,quantity_available)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .then(({ data: d2 }) => setRows((d2 as unknown as Row[]) ?? []));
      } else {
        setRows((data as unknown as Row[]) ?? []);
      }
    });
  useEffect(() => { load(); }, []);

  const approve = async (r: Row) => {
    const { error } = await supabase.rpc("approve_booking", {
      _booking_id: r.id,
      _admin_note: notes[r.id] || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Approved");
    load();
  };

  const reject = async (r: Row) => {
    const { error } = await supabase.from("bookings")
      .update({ status: "rejected", admin_note: notes[r.id] || null }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "booking.rejected", entity_type: "booking", entity_id: r.id, metadata: { note: notes[r.id] } });
    toast.success("Rejected");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and decide on booking requests</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Pending requests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Admin note</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="text-sm font-medium">{r.profiles?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                  </TableCell>
                  <TableCell>{r.assets?.name ?? "—"}</TableCell>
                  <TableCell>{r.quantity_requested}</TableCell>
                  <TableCell className="text-xs">{r.start_date}<br />{r.end_date}</TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">{r.purpose ?? "—"}</TableCell>
                  <TableCell>
                    <Input className="w-40" placeholder="optional note" value={notes[r.id] ?? ""}
                      onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => approve(r)}><Check className="h-4 w-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(r)}><X className="h-4 w-4 mr-1" />Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No pending requests</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}