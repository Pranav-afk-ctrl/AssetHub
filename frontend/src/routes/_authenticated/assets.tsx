import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Search, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/assets")({
  component: AssetsPage,
});

type Asset = {
  id: string; name: string; category: string; description: string | null;
  quantity_total: number; quantity_available: number; status: "active" | "inactive";
};

function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const load = () => {
    supabase.from("assets").select("*").eq("status", "active").order("name")
      .then(({ data }) => setAssets((data as Asset[]) ?? []));
  };
  useEffect(load, []);

  const categories = useMemo(
    () => Array.from(new Set(assets.map((a) => a.category))).sort(),
    [assets],
  );

  const filtered = assets.filter((a) =>
    (category === "all" || a.category === category) &&
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Browse Assets</h1>
        <p className="text-sm text-muted-foreground">Search and request bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <AssetCard key={a.id} asset={a} userId={user?.id ?? ""} onBooked={load} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
            No assets found
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ asset, userId, onBooked }: { asset: Asset; userId: string; onBooked: () => void }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty > asset.quantity_available) {
      toast.error(`Only ${asset.quantity_available} available`);
      return;
    }
    if (!start || !end) return toast.error("Pick dates");
    if (end < start) return toast.error("End date must be after start");
    setBusy(true);
    const { data, error } = await supabase.from("bookings").insert({
      user_id: userId,
      asset_id: asset.id,
      quantity_requested: qty,
      start_date: start,
      end_date: end,
      purpose,
    }).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    await logAudit({
      action: "booking.requested",
      entity_type: "booking",
      entity_id: data!.id,
      metadata: { asset_id: asset.id, quantity: qty },
    });
    toast.success("Booking requested");
    setOpen(false);
    setQty(1); setStart(""); setEnd(""); setPurpose("");
    onBooked();
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{asset.name}</CardTitle>
          <StatusBadge status={asset.status} />
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{asset.category}</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {asset.description && <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>}
        <div className="text-sm">
          <span className="font-semibold">{asset.quantity_available}</span>
          <span className="text-muted-foreground"> / {asset.quantity_total} available</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={asset.quantity_available === 0}>
              {asset.quantity_available === 0 ? "Out of stock" : "Request Booking"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request: {asset.name}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Quantity (max {asset.quantity_available})</Label>
                <Input type="number" min={1} max={asset.quantity_available} value={qty}
                  onChange={(e) => setQty(Number(e.target.value))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Brief description..." />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}