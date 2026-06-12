import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarCheck, Clock, Archive } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type B = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  quantity_requested: number;
  assets: { name: string } | null;
};

function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<B[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select("id,status,start_date,end_date,quantity_requested,assets(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings((data as unknown as B[]) ?? []));
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const active = bookings.filter((b) => b.status === "issued" && b.end_date >= today).length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const past = bookings.filter((b) => ["returned", "rejected"].includes(b.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your bookings at a glance</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Active Bookings" value={active} icon={<CalendarCheck className="h-4 w-4" />} />
        <StatCard title="Pending Requests" value={pending} icon={<Clock className="h-4 w-4" />} />
        <StatCard title="Past Bookings" value={past} icon={<Archive className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.slice(0, 10).map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.assets?.name ?? "—"}</TableCell>
                  <TableCell>{b.quantity_requested}</TableCell>
                  <TableCell>{b.start_date}</TableCell>
                  <TableCell>{b.end_date}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No bookings yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}