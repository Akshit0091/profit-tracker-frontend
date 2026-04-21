// Layout.js
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import toast from "react-hot-toast";
import "./Layout.css";

const NAV = [
  { to: "/",       label: "Dashboard",      icon: "📊" },
  { to: "/upload", label: "Upload Reports",  icon: "📤" },
  { to: "/orders", label: "Orders",          icon: "📋" },
  { to: "/sku",    label: "SKU Pricing",     icon: "🏷️" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const emailInitial = user?.email?.[0]?.toUpperCase() || "U";
  const emailShort = user?.email?.split("@")[0] || "User";

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-wrap">
            <div className="logo-icon-box">PT</div>
            {!collapsed && <span className="logo-text">Profit<span className="logo-dot">Tracker</span></span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon-wrap">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-card">
              <div className="user-avatar">{emailInitial}</div>
              <div className="user-info-wrap">
                <div className="user-name">{emailShort}</div>
                <div className="user-role">Seller Account</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span>⏻</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
