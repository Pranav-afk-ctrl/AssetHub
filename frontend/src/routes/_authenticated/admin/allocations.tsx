import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { daysOverdue, isBookingOverdue, todayDateString } from "@/lib/bookings";

export const Route = createFileRoute("/_authenticated/admin/allocations")({
  component: Allocations,
});

type Row = {
  id: string; status: string; quantity_requested: number; start_date: string; end_date: string;
  asset_id: string; user_id: string;
  assets: { name: string; quantity_available: number } | null;
};

function Allocations() {
  const [rows, setRows] = useState<Row[]>([]);
  const today = todayDateString();

  const load = () => supabase.from("bookings")
    .select("id,status,quantity_requested,start_date,end_date,asset_id,user_id,assets(name,quantity_available)")
    .in("status", ["approved", "issued"])
    .order("end_date", { ascending: true })
    .then(({ data }) => setRows((data as unknown as Row[]) ?? []));
  useEffect(() => { load(); }, []);

  const markIssued = async (r: Row) => {
    const { error } = await supabase.from("bookings").update({ status: "issued" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "booking.issued", entity_type: "booking", entity_id: r.id });
    toast.success("Marked as issued");
    load();
  };

  const markReturned = async (r: Row) => {
    if (!r.assets) return;
    const newQty = r.assets.quantity_available + r.quantity_requested;
    const { error: e1 } = await supabase.from("assets").update({ quantity_available: newQty }).eq("id", r.asset_id);
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("bookings").update({ status: "returned" }).eq("id", r.id);
    if (e2) return toast.error(e2.message);
    await logAudit({ action: "booking.returned", entity_type: "booking", entity_id: r.id, metadata: { qty: r.quantity_requested } });
    toast.success("Marked as returned");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Allocations</h1>
        <p className="text-sm text-muted-foreground">Issue and return approved bookings</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Approved & issued</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const overdue = isBookingOverdue(r.status, r.end_date, today);
                return (
                  <TableRow
                    key={r.id}
                    className={cn(
                      overdue && "bg-red-500/10 border-l-2 border-l-red-500",
                    )}
                  >
                    <TableCell className={cn("font-medium", overdue && "text-red-600 dark:text-red-400")}>
                      {r.assets?.name ?? "—"}
                      {overdue && (
                        <span className="ml-2 text-xs font-semibold text-red-500">
                          OVERDUE ({daysOverdue(r.end_date, today)}d)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={cn(overdue && "text-red-600 dark:text-red-400")}>
                      {r.quantity_requested}
                    </TableCell>
                    <TableCell className={cn(overdue && "text-red-600 dark:text-red-400")}>
                      {r.start_date}
                    </TableCell>
                    <TableCell className={cn(overdue && "font-semibold text-red-500")}>
                      {r.end_date}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status} />
                        {overdue && (
                          <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                            Overdue
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {r.status === "approved" && <Button size="sm" onClick={() => markIssued(r)}>Mark Issued</Button>}
                      {r.status === "issued" && <Button size="sm" variant="outline" onClick={() => markReturned(r)}>Mark Returned</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active allocations</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
