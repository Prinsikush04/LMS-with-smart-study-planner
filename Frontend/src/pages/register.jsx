 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, BookOpen } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match!");
    setLoading(true);
    try {
      const res = await API.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      login(res.data.access_token, res.data.user);
      toast.success("Account created! Welcome 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    backgroundColor: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px", fontSize: "14px",
    color: "#111827", outline: "none",
    boxSizing: "border-box"
  };

  const labelStyle = {
    fontSize: "13px", fontWeight: "600",
    color: "#374151", display: "block", marginBottom: "5px"
  };

  return (
    <div style={{
      height: "100vh", backgroundColor: "#eff6ff",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px"
    }}>
      <div style={{
        backgroundColor: "white", borderRadius: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        width: "100%", maxWidth: "420px", padding: "32px 36px"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", backgroundColor: "#111827",
            borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 12px"
          }}>
            <BookOpen size={24} color="white" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
            Create Account
          </h2>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
            Join us and start learning today
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Role Selection */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Register As</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["student", "teacher"].map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setForm({...form, role: r})}
                  style={{
                    flex: 1, padding: "10px",
                    borderRadius: "10px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer",
                    border: form.role === r ? "2px solid #111827" : "2px solid #e5e7eb",
                    backgroundColor: form.role === r ? "#111827" : "white",
                    color: form.role === r ? "white" : "#6b7280",
                    transition: "all 0.2s"
                  }}>
                  {r === "student" ? "🎓 Student" : "👨‍🏫 Teacher"}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              style={inputStyle} placeholder="John Doe" required />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              style={inputStyle} placeholder="student@example.com" required />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                style={{...inputStyle, paddingRight: "40px"}}
                placeholder="Create a password" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                style={{...inputStyle, paddingRight: "40px"}}
                placeholder="Confirm your password" required />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px",
              backgroundColor: loading ? "#6b7280" : "#111827",
              color: "white", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? "Creating..." : `Create ${form.role === "student" ? "Student" : "Teacher"} Account`}
          </button>

        </form>

        <div style={{ borderTop: "1px solid #f3f4f6", margin: "16px 0" }} />

        <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#111827", fontWeight: "700", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}