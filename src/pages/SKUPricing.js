// src/pages/SKUPricing.js

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

  const loadSKUs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sku");
      setSkus(res.data.data);
    } catch {
      toast.error("Failed to load SKUs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSKUs(); }, []);

  // Add new SKU
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.skuId.trim()) return toast.error("SKU ID required");
    const price = parseFloat(form.purchasePrice);
    if (isNaN(price) || price < 0) return toast.error("Enter a valid price");

    setSaving(true);
    try {
      await api.post("/sku", { skuId: form.skuId.trim(), purchasePrice: price });
      toast.success("SKU saved");
      setForm({ skuId: "", purchasePrice: "" });
      loadSKUs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save SKU");
    } finally {
      setSaving(false);
    }
  };

  // Inline edit save
  const handleEditSave = async (id) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) return toast.error("Invalid price");
    try {
      await api.put(`/sku/${id}`, { purchasePrice: price });
      toast.success("SKU updated");
      setEditId(null);
      loadSKUs();
    } catch {
      toast.error("Update failed");
    }
  };

  // Delete
  const handleDelete = async (id, skuId) => {
    if (!window.confirm(`Delete SKU "${skuId}"?`)) return;
    try {
      await api.delete(`/sku/${id}`);
      toast.success("SKU deleted");
      loadSKUs();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Bulk upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/sku/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      loadSKUs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk upload failed");
    }
    e.target.value = "";
  };

  const filtered = skus.filter(
    (s) => s.skuId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sku-page fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">SKU Pricing</h1>
          <p className="page-subtitle">
            Set purchase prices for your SKUs — used to calculate profit per order
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={() => bulkRef.current?.click()}
            title="Bulk upload via CSV with columns: SKU_ID, Purchase_Price"
          >
            ⬆ Bulk Upload CSV
          </button>
          <input
            ref={bulkRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleBulkUpload}
          />
        </div>
      </div>

      {/* Bulk upload hint */}
      <div className="bulk-hint">
        💡 Bulk CSV format: two columns — <code>SKU_ID</code> and <code>Purchase_Price</code>
      </div>

      {/* Add form */}
      <div className="card add-form-card">
        <h3 className="form-title">Add / Update SKU</h3>
        <form onSubmit={handleAdd} className="add-form">
          <div className="field" style={{ flex: 2 }}>
            <label>SKU ID</label>
            <input
              type="text"
              placeholder="e.g. 0803cbc27"
              value={form.skuId}
              onChange={(e) => setForm({ ...form, skuId: e.target.value })}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Purchase Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 250"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            />
          </div>
          <div className="field" style={{ alignSelf: "flex-end" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
            >
              {saving ? <span className="spinner" /> : null}
              Save SKU
            </button>
          </div>
        </form>
      </div>

      {/* Search & Table */}
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search SKU ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>SKU ID</th>
                <th>Purchase Price (₹)</th>
                <th>Added On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: 40 }}>
                    <span className="spinner" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: 40 }}>
                    {search ? "No matching SKUs" : "No SKUs yet. Add your first SKU above."}
                  </td>
                </tr>
              ) : (
                filtered.map((sku, i) => (
                  <tr key={sku.id}>
                    <td className="text-muted text-sm">{i + 1}</td>
                    <td><span className="mono">{sku.skuId}</span></td>
                    <td>
                      {editId === sku.id ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            style={{ width: 120, padding: "6px 10px" }}
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                          <button className="btn-success" onClick={() => handleEditSave(sku.id)}>
                            ✓ Save
                          </button>
                          <button className="btn-secondary" onClick={() => setEditId(null)}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="mono price-val">
                          ₹{Number(sku.purchasePrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(sku.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => { setEditId(sku.id); setEditPrice(String(sku.purchasePrice)); }}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(sku.id, sku.skuId)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
