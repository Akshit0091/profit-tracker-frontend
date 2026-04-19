// src/pages/Orders.js

import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./Orders.css";

const fmt = (n) =>
  n === null || n === undefined
    ? "—"
    : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortDir: "desc",
    dateFrom: "",
    dateTo: "",
    page: 1,
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 50 };
      const res = await api.get("/orders", { params });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Debounced search
  const handleSearch = (val) => {
    setFilters((f) => ({ ...f, search: val, page: 1 }));
  };

  const handleSort = (field) => {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      sortDir: f.sortBy === field && f.sortDir === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get("/orders/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profit-report-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{filters.sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="orders-page fade-in">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {pagination.total ?? 0} total records
          </p>
        </div>
        <button
          className="btn-success"
          onClick={handleExport}
          disabled={exporting}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {exporting ? <span className="spinner" /> : "⬇"} Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-bar">
        <input
          type="text"
          placeholder="Search by Order ID, Item ID or SKU..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 2, minWidth: 200 }}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          style={{ flex: 1, minWidth: 140 }}
        >
          <option value="all">All Orders</option>
          <option value="matched">Matched Only</option>
          <option value="pending">Pending Only</option>
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value, page: 1 }))}
          style={{ flex: 1, minWidth: 140 }}
          title="Payment date from"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value, page: 1 }))}
          style={{ flex: 1, minWidth: 140 }}
          title="Payment date to"
        />

        <button
          className="btn-secondary"
          onClick={() => setFilters({ search: "", status: "all", sortBy: "createdAt", sortDir: "desc", dateFrom: "", dateTo: "", page: 1 })}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap mt-4">
        <table>
          <thead>
            <tr>
              <th>Order Item ID</th>
              <th>Order ID</th>
              <th>SKU ID</th>
              <th onClick={() => handleSort("dispatchDate")} className="sortable">
                Dispatch Date <SortIcon field="dispatchDate" />
              </th>
              <th onClick={() => handleSort("paymentDate")} className="sortable">
                Payment Date <SortIcon field="paymentDate" />
              </th>
              <th onClick={() => handleSort("bankSettlement")} className="sortable">
                Settlement <SortIcon field="bankSettlement" />
              </th>
              <th>Purchase Price</th>
              <th onClick={() => handleSort("profit")} className="sortable">
                Profit <SortIcon field="profit" />
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center" style={{ padding: 48 }}>
                  <span className="spinner" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted" style={{ padding: 48 }}>
                  No orders found. Upload reports to get started.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isLoss = order.profit !== null && order.profit < 0;
                const isProfit = order.profit !== null && order.profit > 0;
                return (
                  <tr
                    key={order.id}
                    className={isLoss ? "row-loss" : isProfit ? "row-profit" : ""}
                  >
                    <td><span className="mono truncate" title={order.orderItemId}>{order.orderItemId}</span></td>
                    <td><span className="mono truncate" title={order.orderId}>{order.orderId || "—"}</span></td>
                    <td><span className="mono">{order.skuId || "—"}</span></td>
                    <td>{fmtDate(order.dispatchDate)}</td>
                    <td>{fmtDate(order.paymentDate)}</td>
                    <td className="mono">{fmt(order.bankSettlement)}</td>
                    <td className="mono">{fmt(order.purchasePrice)}</td>
                    <td className={order.profit === null ? "" : order.profit >= 0 ? "profit-positive" : "profit-negative"}>
                      {fmt(order.profit)}
                    </td>
                    <td>
                      {order.isMatched ? (
                        <span className="badge badge-green">Matched</span>
                      ) : order.hasPickup && !order.hasSettlement ? (
                        <span className="badge badge-yellow">No Settlement</span>
                      ) : order.hasSettlement && !order.hasPickup ? (
                        <span className="badge badge-blue">No Pickup</span>
                      ) : (
                        <span className="badge badge-yellow">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={filters.page >= pagination.totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
