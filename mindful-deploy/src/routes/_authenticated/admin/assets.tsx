import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Pencil, Trash2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { AssetQrDialog } from "@/components/AssetQrDialog";

export const Route = createFileRoute("/_authenticated/admin/assets")({
  component: AdminAssets,
});

type Asset = {
  id: string; name: string; category: string; description: string | null;
  quantity_total: number; quantity_available: number; status: "active" | "inactive";
};

const empty: Omit<Asset, "id"> = {
  name: "", category: "", description: "", quantity_total: 1, quantity_available: 1, status: "active",
};

function AdminAssets() {
  const [rows, setRows] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState<Omit<Asset, "id">>(empty);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  const load = () => supabase.from("assets").select("*").order("created_at", { ascending: false })
    .then(({ data }) => setRows((data as Asset[]) ?? []));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (a: Asset) => {
    setEditing(a);
    setForm({ name: a.name, category: a.category, description: a.description, quantity_total: a.quantity_total,
      quantity_available: a.quantity_available, status: a.status });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.quantity_available > form.quantity_total) {
      return toast.error("Available cannot exceed total");
    }
    if (editing) {
      const { error } = await supabase.from("assets").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      await logAudit({ action: "asset.updated", entity_type: "asset", entity_id: editing.id, metadata: form });
      toast.success("Asset updated");
    } else {
      const { data, error } = await supabase.from("assets").insert(form).select().single();
      if (error) return toast.error(error.message);
      await logAudit({ action: "asset.created", entity_type: "asset", entity_id: data!.id, metadata: form });
      toast.success("Asset created");
    }
    setOpen(false); load();
  };

  const remove = async (a: Asset) => {
    const { error } = await supabase.from("assets").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "asset.deleted", entity_type: "asset", entity_id: a.id, metadata: { name: a.name } });
    toast.success("Asset deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Assets</h1>
          <p className="text-sm text-muted-foreground">Create, edit and delete assets</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add asset</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All assets</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Avail / Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>{a.quantity_available} / {a.quantity_total}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setQrAsset(a)} title="Generate QR">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete asset?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete "{a.name}" and all its bookings.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(a)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No assets yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssetQrDialog
        asset={qrAsset}
        open={qrAsset !== null}
        onOpenChange={(isOpen) => { if (!isOpen) setQrAsset(null); }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit asset" : "New asset"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity total</Label>
                <Input type="number" min={0} value={form.quantity_total}
                  onChange={(e) => setForm({ ...form, quantity_total: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Quantity available</Label>
                <Input type="number" min={0} value={form.quantity_available}
                  onChange={(e) => setForm({ ...form, quantity_available: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}