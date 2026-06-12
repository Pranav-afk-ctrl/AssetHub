import { useEffect, useState } from "react";
import { QrCodeModal } from "../../components/QrCodeModal";
import { supabase, type Asset } from "../../lib/supabase";

export function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  useEffect(() => {
    async function loadAssets() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("assets")
        .select("id, name, category, quantity_available")
        .order("name");

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAssets(data ?? []);
      }

      setLoading(false);
    }

    loadAssets();
  }, []);

  if (loading) {
    return <p className="status">Loading assets…</p>;
  }

  if (error) {
    return <p className="status error">{error}</p>;
  }

  return (
    <section>
      <h1>Assets</h1>
      <p className="subtitle">Manage inventory and generate QR codes for physical labeling.</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>{asset.category}</td>
                <td>{asset.quantity_available}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setQrAsset(asset)}
                  >
                    Generate QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {qrAsset && <QrCodeModal asset={qrAsset} onClose={() => setQrAsset(null)} />}
    </section>
  );
}
