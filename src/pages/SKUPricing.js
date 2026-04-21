// SKUPricing.js
import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./SKUPricing.css";

export default function SKUPricing() {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ skuId: "", purchasePrice: "" });
  const [editId, setEditId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const bulkRef = useRef();

  const load = async () => {
    setLoading(true);
    try { const res = await api.get("/sku"); setSkus(res.data.data); }
    catch { toast.error("Failed to load SKUs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.skuId.trim()) return toast.error("SKU ID required");
    const price = parseFloat(form.purchasePrice);
    if (isNaN(price) || price < 0) return toast.error("Enter a valid price");
    setSaving(true);
    try {
      await api.post("/sku", { skuId: form.skuId.trim(), purchasePrice: price });
      toast.success("SKU saved"); setForm({ skuId: "", purchasePrice: "" }); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleEditSave = async (id) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) return toast.error("Invalid price");
    try { await api.put(`/sku/${id}`, { purchasePrice: price }); toast.success("Updated"); setEditId(null); load(); }
    catch { toast.error("Update failed"); }
  };

  const handleDelete = async (id, skuId) => {
    if (!window.confirm(`Delete SKU "${skuId}"?`)) return;
    try { await api.delete(`/sku/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  const handleBulk = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await api.post("/sku/bulk", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(res.data.message); load();
    } catch (err) { toast.error(err.response?.data?.message || "Bulk upload failed"); }
    e.target.value = "";
  };

  const filtered = skus.filter((s) => s.skuId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="sku-page fade-in">
      <div className="sku-top">
        <div>
          <h1 className="page-title">SKU Pricing</h1>
          <p className="page-subtitle">Set purchase prices used to calculate profit per order</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={() => bulkRef.current?.click()} title="CSV: SKU_ID, Purchase_Price">
            ⬆ Bulk Upload CSV
          </button>
          <input ref={bulkRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleBulk} />
        </div>
      </div>

      <div className="bulk-hint">
        💡 Bulk CSV format: <code>SKU_ID</code> and <code>Purchase_Price</code> columns
      </div>

      {/* Add Form */}
      <div className="card add-form-card">
        <div className="form-title">Add / Update SKU Price</div>
        <form onSubmit={handleAdd} className="add-form">
          <div className="field" style={{ flex: 2 }}>
            <label>SKU ID</label>
            <input type="text" placeholder="e.g. 0803cbc27" value={form.skuId} onChange={(e) => setForm({ ...form, skuId: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Purchase Price (₹)</label>
            <input type="number" placeholder="e.g. 250" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
          </div>
          <div className="field">
            <button type="submit" className="btn-primary" disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", height: 42 }}>
              {saving ? <span className="spinner" /> : null} Save SKU
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <input type="text" placeholder="Search SKU ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <span className="sku-count">{filtered.length} SKUs</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>SKU ID</th>
              <th>Purchase Price</th>
              <th>Added On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center" style={{ padding: 40 }}><span className="spinner" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 40 }}>
                {search ? "No matching SKUs" : "No SKUs yet. Add your first SKU above."}
              </td></tr>
            ) : filtered.map((sku, i) => (
              <tr key={sku.id}>
                <td className="text-muted text-sm">{i + 1}</td>
                <td>
                  <span style={{ background: "var(--bg2)", padding: "3px 10px", borderRadius: 6, fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600 }}>
                    {sku.skuId}
                  </span>
                </td>
                <td>
                  {editId === sku.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                        style={{ width: 120, padding: "6px 10px" }} min="0" step="0.01" autoFocus />
                      <button className="btn-success" onClick={() => handleEditSave(sku.id)} style={{ padding: "6px 12px" }}>✓</button>
                      <button className="btn-secondary" onClick={() => setEditId(null)} style={{ padding: "6px 12px" }}>✕</button>
                    </div>
                  ) : (
                    <span className="price-chip">₹{Number(sku.purchasePrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  )}
                </td>
                <td style={{ color: "var(--text2)", fontSize: 13 }}>
                  {new Date(sku.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}
                      onClick={() => { setEditId(sku.id); setEditPrice(String(sku.purchasePrice)); }}>
                      ✏ Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(sku.id, sku.skuId)}>
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
