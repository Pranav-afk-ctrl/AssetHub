import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type AssetQrTarget = {
  id: string;
  name: string;
  category: string;
};

export function AssetQrDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: AssetQrTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!asset) return null;

  const payload = JSON.stringify({
    id: asset.id,
    name: asset.name,
    category: asset.category,
  });

  const downloadPng = async () => {
    if (!qrRef.current) return;
    try {
      const dataUrl = await toPng(qrRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${asset.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Failed to generate PNG");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5" aria-hidden="true" />
            Asset QR Code
          </DialogTitle>
          <DialogDescription>
            Scan to view asset id, name, and category as JSON.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={qrRef}
          className="mx-auto flex flex-col items-center gap-3 rounded-lg border bg-card p-6"
        >
          <QRCodeSVG value={payload} size={200} level="M" includeMargin />
          <div className="text-center">
            <p className="font-medium">{asset.name}</p>
            <p className="text-sm text-muted-foreground">{asset.category}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={downloadPng}>
            <Download className="mr-2 size-4" aria-hidden="true" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
