 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, BookOpen } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", form);
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
       backgroundColor: "#eff6ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "440px",
        padding: "40px 40px"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "64px", height: "64px",
            backgroundColor: "#111827",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <BookOpen size={28} color="white" />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Sign in to continue your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              style={{
                width: "100%", padding: "12px 16px",
                backgroundColor: "#f9fafb",
                border: "1.5px solid #e5e7eb",
                borderRadius: "10px", fontSize: "14px",
                color: "#111827", outline: "none",
                boxSizing: "border-box"
              }}
              placeholder="student@example.com"
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                Password
              </label>
              <span style={{ fontSize: "13px", color: "#9ca3af", cursor: "pointer" }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                style={{
                  width: "100%", padding: "12px 44px 12px 16px",
                  backgroundColor: "#f9fafb",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "10px", fontSize: "14px",
                  color: "#111827", outline: "none",
                  boxSizing: "border-box"
                }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "14px",
                  top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none",
                  cursor: "pointer", color: "#9ca3af"
                }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              backgroundColor: loading ? "#6b7280" : "#111827",
              color: "white", border: "none",
              borderRadius: "10px", fontSize: "15px",
              fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #f3f4f6", margin: "20px 0" }} />

        {/* Register */}
        <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#111827", fontWeight: "700", textDecoration: "none" }}>
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}