// src/App.js - Main app with routing

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Orders from "./pages/Orders";
import SKUPricing from "./pages/SKUPricing";
import "./index.css";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Public route - redirect to dashboard if logged in
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e2535",
              color: "#e8edf5",
              border: "1px solid #2a3347",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#1e2535" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1e2535" } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected - wrapped in sidebar layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="orders" element={<Orders />} />
            <Route path="sku" element={<SKUPricing />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
