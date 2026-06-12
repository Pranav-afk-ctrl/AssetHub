import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminDashboard,
  type AdminDashboardProps,
} from "@/components/dashboard/admin-dashboard";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: AdminDashboardPage,
});

type BookingWithAsset = {
  id: string;
  status: string;
  created_at: string;
  assets: { name: string } | null;
};

type OverdueRow = {
  quantity_requested: number;
  end_date: string;
  assets: { name: string } | null;
  profiles: { name: string | null; email: string } | null;
};

function monthRange(offsetMonths: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function daysBetween(from: string, to: Date): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

async function loadDashboardData(): Promise<AdminDashboardProps> {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const trendStart = thirtyDaysAgo.toISOString().slice(0, 10);

  const [
    { count: assetsCount },
    { data: activeBookings },
    { count: pendingCount },
    { count: overdueCount },
    { data: allBookings },
    { data: overdueRaw },
    { count: assetsThisMonth },
    { count: assetsLastMonth },
    { count: issuedThisMonth },
    { count: issuedLastMonth },
    { count: pendingThisMonth },
    { count: pendingLastMonth },
    { count: overdueThisMonth },
    { count: overdueLastMonth },
  ] = await Promise.all([
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("id").eq("status", "issued"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "issued")
      .lt("end_date", today),
    supabase.from("bookings").select("id,status,created_at,assets(name)"),
    supabase
      .from("bookings")
      .select(
        "quantity_requested,end_date,assets(name),profiles!bookings_user_id_fkey(name,email)",
      )
      .eq("status", "issued")
      .lt("end_date", today)
      .order("end_date", { ascending: true }),
    supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thisMonth.start)
      .lte("created_at", thisMonth.end),
    supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", lastMonth.start)
      .lte("created_at", lastMonth.end),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "issued")
      .gte("created_at", thisMonth.start)
      .lte("created_at", thisMonth.end),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "issued")
      .gte("created_at", lastMonth.start)
      .lte("created_at", lastMonth.end),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("created_at", thisMonth.start)
      .lte("created_at", thisMonth.end),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("created_at", lastMonth.start)
      .lte("created_at", lastMonth.end),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "issued")
      .gte("end_date", thisMonth.start.slice(0, 10))
      .lt("end_date", today),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "issued")
      .gte("end_date", lastMonth.start.slice(0, 10))
      .lte("end_date", lastMonth.end.slice(0, 10)),
  ]);

  let overdueRows = (overdueRaw as unknown as OverdueRow[]) ?? [];
  if (overdueRows.length === 0 && (overdueCount ?? 0) > 0) {
    const { data: fallback } = await supabase
      .from("bookings")
      .select("quantity_requested,end_date,assets(name)")
      .eq("status", "issued")
      .lt("end_date", today)
      .order("end_date", { ascending: true });
    overdueRows = (fallback as unknown as OverdueRow[]) ?? [];
  }

  const bookings = (allBookings as unknown as BookingWithAsset[]) ?? [];

  const byAsset = new Map<string, number>();
  for (const b of bookings) {
    const name = b.assets?.name ?? "Unknown";
    byAsset.set(name, (byAsset.get(name) ?? 0) + 1);
  }
  const topAssets = [...byAsset.entries()]
    .map(([name, bookings]) => ({ name, bookings }))
    .sort((a, b) => b.bookings - a.bookings);

  const statusCounts = {
    pending: 0,
    approved: 0,
    issued: 0,
    returned: 0,
    rejected: 0,
  };
  for (const b of bookings) {
    const key = b.status as keyof typeof statusCounts;
    if (key in statusCounts) statusCounts[key]++;
  }

  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days[d.toISOString().slice(0, 10)] = 0;
  }
  for (const b of bookings) {
    const d = b.created_at.slice(0, 10);
    if (d >= trendStart && d in days) days[d]++;
  }
  const bookingTrend = Object.entries(days).map(([date, bookings]) => ({ date, bookings }));

  const now = new Date();
  const overdue = overdueRows.map((row) => ({
    assetName: row.assets?.name ?? "Unknown",
    borrower: row.profiles?.name ?? row.profiles?.email ?? "Unknown",
    quantity: row.quantity_requested,
    dueDate: row.end_date,
    daysOverdue: daysBetween(row.end_date, now),
  }));

  return {
    stats: {
      totalAssets: {
        label: "Total Assets",
        value: assetsCount ?? 0,
        trend: pctChange(assetsThisMonth ?? 0, assetsLastMonth ?? 0),
      },
      activeBookings: {
        label: "Active Bookings",
        value: activeBookings?.length ?? 0,
        trend: pctChange(issuedThisMonth ?? 0, issuedLastMonth ?? 0),
      },
      pendingApprovals: {
        label: "Pending Approvals",
        value: pendingCount ?? 0,
        trend: pctChange(pendingThisMonth ?? 0, pendingLastMonth ?? 0),
      },
      overdueReturns: {
        label: "Overdue Returns",
        value: overdueCount ?? 0,
        trend: pctChange(overdueThisMonth ?? 0, overdueLastMonth ?? 0),
      },
    },
    topAssets,
    bookingStatus: statusCounts,
    bookingTrend,
    overdue,
  };
}

function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData()
      .then(setData)
      .catch((err: unknown) => {
        console.error("[AdminDashboard]", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  if (error || !data) {
    return <div className="text-destructive">{error ?? "Failed to load dashboard data"}</div>;
  }

  return <AdminDashboard {...data} />;
}
