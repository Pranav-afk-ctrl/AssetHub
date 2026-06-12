import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  component: MyBookings,
});

type B = {
  id: string; status: string; start_date: string; end_date: string;
  quantity_requested: number; admin_note: string | null;
  assets: { name: string } | null;
};

function MyBookings() {
  const { user } = useAuth();
  const [rows, setRows] = useState<B[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bookings")
      .select("id,status,start_date,end_date,quantity_requested,admin_note,assets(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as unknown as B[]) ?? []));
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <p className="text-sm text-muted-foreground">All requests you've submitted</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Bookings</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.assets?.name ?? "—"}</TableCell>
                  <TableCell>{b.quantity_requested}</TableCell>
                  <TableCell>{b.start_date}</TableCell>
                  <TableCell>{b.end_date}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{b.admin_note ?? "—"}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}