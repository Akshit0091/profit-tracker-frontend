// src/components/layout/Layout.js

import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import toast from "react-hot-toast";
import "./Layout.css";

const NAV_ITEMS = [
  { to: "/",       label: "Dashboard",     icon: "⬛" },
  { to: "/upload", label: "Upload Reports", icon: "⬆" },
  { to: "/orders", label: "Orders",         icon: "📋" },
  { to: "/sku",    label: "SKU Pricing",    icon: "🏷" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            {!collapsed && <span className="logo-text">ProfitTracker</span>}
            {collapsed && <span className="logo-icon">PT</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-info">
              <div className="user-avatar">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="user-email">{user?.email}</div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span>⏻</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
