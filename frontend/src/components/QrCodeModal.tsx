import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import type { Asset } from "../lib/supabase";

type QrCodeModalProps = {
  asset: Asset;
  onClose: () => void;
};

export function QrCodeModal({ asset, onClose }: QrCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const payload = JSON.stringify({
    asset_id: asset.id,
    asset_name: asset.name,
    category: asset.category,
  });

  const handleDownload = async () => {
    if (!qrRef.current) return;

    const dataUrl = await toPng(qrRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.download = `${asset.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>QR Code — {asset.name}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <div ref={qrRef} className="qr-export-area">
          <QRCodeSVG value={payload} size={256} level="M" includeMargin />
          <p className="qr-label">{asset.name}</p>
          <p className="qr-meta">{asset.category}</p>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={handleDownload}>
            Download PNG
          </button>
        </footer>
      </div>
    </div>
  );
}
