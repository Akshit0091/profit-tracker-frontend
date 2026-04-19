// src/pages/Upload.js

import React, { useState, useRef } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./Upload.css";

// ── Single upload zone component ───────────────────────────────────────────────
function UploadZone({ title, subtitle, accept, endpoint, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Only CSV and Excel files accepted");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file first");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
      toast.success(res.data.message);
      onSuccess?.();
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-zone-wrapper card">
      <div className="upload-zone-header">
        <h2 className="upload-zone-title">{title}</h2>
        <p className="upload-zone-sub">{subtitle}</p>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="file-selected">
            <div className="file-icon">📄</div>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        ) : (
          <div className="drop-hint">
            <div className="drop-icon">⬆</div>
            <div className="drop-text">Drop file here or click to browse</div>
            <div className="drop-sub">CSV or Excel (.xlsx)</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="upload-actions">
        {file && (
          <button
            className="btn-secondary"
            onClick={() => { setFile(null); setResult(null); }}
          >
            Clear
          </button>
        )}
        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}
        >
          {loading ? <><span className="spinner" /> Processing...</> : "Upload & Process"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="upload-result fade-in">
          <div className="result-row">
            <span className="result-label">Total records</span>
            <span className="result-value">{result.totalRecords}</span>
          </div>
          <div className="result-row">
            <span className="result-label">New entries</span>
            <span className="result-value" style={{ color: "var(--green)" }}>{result.created}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Updated</span>
            <span className="result-value" style={{ color: "var(--accent)" }}>{result.updated}</span>
          </div>
          {result.errors?.length > 0 && (
            <div className="result-errors">
              <div className="error-title">⚠ Skipped rows ({result.errors.length})</div>
              {result.errors.slice(0, 5).map((e, i) => (
                <div key={i} className="error-row">{e}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Upload Page ───────────────────────────────────────────────────────────
export default function Upload() {
  return (
    <div className="upload-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Upload Reports</h1>
        <p className="page-subtitle">
          Upload your Pickup and Settlement reports. Orders are matched automatically by Order Item ID.
        </p>
      </div>

      {/* Instructions */}
      <div className="card instructions-card">
        <h3 className="inst-title">📋 How it works</h3>
        <div className="inst-steps">
          <div className="inst-step">
            <span className="step-num">1</span>
            <span>Upload your <strong>Pickup Report</strong> (CSV with columns: ORDER ITEM ID, Order Id, SKU, Dispatch by date)</span>
          </div>
          <div className="inst-step">
            <span className="step-num">2</span>
            <span>Upload your <strong>Settlement Report</strong> (Flipkart Excel — reads the Orders sheet automatically)</span>
          </div>
          <div className="inst-step">
            <span className="step-num">3</span>
            <span>System <strong>auto-matches</strong> records by Order Item ID and calculates profit using your SKU prices</span>
          </div>
          <div className="inst-step">
            <span className="step-num">4</span>
            <span>Re-uploading the same file is <strong>safe</strong> — duplicates are updated, not doubled</span>
          </div>
        </div>
      </div>

      {/* Upload zones */}
      <div className="upload-grid">
        <UploadZone
          title="Pickup Report"
          subtitle="CSV file exported from your order management system"
          accept=".csv,.xlsx,.xls"
          endpoint="/upload/pickup"
        />
        <UploadZone
          title="Payment Settlement Report"
          subtitle="Flipkart Excel settlement file (multi-sheet — Orders sheet is read automatically)"
          accept=".xlsx,.xls"
          endpoint="/upload/settlement"
        />
      </div>
    </div>
  );
}
