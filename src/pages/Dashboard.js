// src/pages/Dashboard.js

import React, { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../utils/api";
import "./Dashboard.css";

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── Format currency ────────────────────────────────────────────────────────────
const fmt = (n) =>
  n === null || n === undefined
    ? "—"
    : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row" style={{ color: p.color }}>
          {p.name}: {p.name.includes("₹") || p.name.toLowerCase().includes("profit") || p.name.toLowerCase().includes("revenue")
            ? fmt(p.value)
            : p.value}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [profitChart, setProfitChart] = useState([]);
  const [ordersChart, setOrdersChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, o] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get(`/dashboard/chart/profit?days=${days}`),
        api.get(`/dashboard/chart/orders?days=${days}`),
      ]);
      setSummary(s.data.data);
      setProfitChart(p.data.data);
      setOrdersChart(o.data.data);
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const profitColor = summary?.totalProfit >= 0 ? "var(--green)" : "var(--red)";

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your profitability at a glance</p>
        </div>
        <select
          className="days-select"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          label="Total Orders"
          value={summary?.totalOrders ?? 0}
          sub={`${summary?.matchedOrders ?? 0} matched · ${summary?.pendingOrders ?? 0} pending`}
        />
        <StatCard
          label="Total Revenue"
          value={fmt(summary?.totalRevenue)}
          sub="Bank settlements"
          color="var(--text)"
        />
        <StatCard
          label="Total Cost"
          value={fmt(summary?.totalCost)}
          sub="Purchase prices"
          color="var(--yellow)"
        />
        <StatCard
          label="Total Profit"
          value={fmt(summary?.totalProfit)}
          sub={`Avg ${fmt(summary?.avgProfit)} per order`}
          color={profitColor}
        />
        <StatCard
          label="Loss Orders"
          value={summary?.lossOrders ?? 0}
          sub="Orders with negative profit"
          color="var(--red)"
        />
        <StatCard
          label="Pending Orders"
          value={summary?.pendingOrders ?? 0}
          sub="Awaiting settlement or pickup"
          color="var(--yellow)"
        />
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">
        {/* Profit over time */}
        <div className="card chart-card">
          <div className="chart-header">
            <div className="chart-title">Profit & Revenue Over Time</div>
          </div>
          {profitChart.length === 0 ? (
            <div className="chart-empty">No matched orders in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={profitChart} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" />
                <XAxis dataKey="date" tickFormatter={fmtDate} stroke="#5a6580" tick={{ fontSize: 11 }} />
                <YAxis stroke="#5a6580" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" fill="url(#profitGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders per day */}
        <div className="card chart-card">
          <div className="chart-header">
            <div className="chart-title">Orders Per Day</div>
          </div>
          {ordersChart.length === 0 ? (
            <div className="chart-empty">No orders in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ordersChart} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" />
                <XAxis dataKey="date" tickFormatter={fmtDate} stroke="#5a6580" tick={{ fontSize: 11 }} />
                <YAxis stroke="#5a6580" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="matched" name="Matched" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
