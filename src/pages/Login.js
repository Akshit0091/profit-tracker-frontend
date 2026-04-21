// Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split fade-in">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-logo">PT</div>
            <div className="auth-brand-name">ProfitTracker</div>
            <div className="auth-brand-tag">Track every rupee.<br/>Know your real profit.</div>
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">📊</div>
              <div className="auth-feature-text">Real-time profit dashboard</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔗</div>
              <div className="auth-feature-text">Auto-match pickup & settlement</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📤</div>
              <div className="auth-feature-text">Upload Flipkart reports instantly</div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">⬇️</div>
              <div className="auth-feature-text">Export profit reports as CSV</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <h1 className="auth-title">Welcome back 👋</h1>
          <p className="auth-sub">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign In →"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
