 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/login";
import Register from "./pages/register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminPanel from "./pages/AdminPanel";

function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "18px", color: "#3b82f6" }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "18px", color: "#3b82f6" }}>
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (user.role === "student") return <Navigate to="/student/dashboard" />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" />;
  if (user.role === "admin") return <Navigate to="/admin" />;
  return <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <RoleRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </RoleRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <RoleRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </RoleRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </RoleRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}