 import { useEffect, useState } from "react";
import API from "../services/axios";
import toast from "react-hot-toast";
import { Users, BookOpen, CheckSquare, Trash2, GraduationCap, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [u, s, c] = await Promise.all([
        API.get("/api/admin/users"),
        API.get("/api/admin/stats"),
        API.get("/api/admin/courses"),
      ]);
      setUsers(u.data);
      setAdminStats(s.data);
      setCourses(c.data);
    } catch { toast.error("Failed to load data"); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await API.delete(`/api/admin/users/${id}`);
    toast.success("User deleted");
    fetchData();
  };

  const updateRole = async (id, role) => {
    await API.patch(`/api/admin/users/${id}/role`, { role });
    toast.success("Role updated!");
    fetchData();
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await API.delete(`/api/admin/courses/${id}`);
    toast.success("Course deleted");
    fetchData();
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    const res = await API.get(`/api/assignments/${assignment.id}/submissions`);
    setSubmissions(res.data);
    setActiveTab("submissions");
  };

  const students = users.filter(u => u.role === "student");
  const teachers = users.filter(u => u.role === "teacher");

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "users", label: "All Users", icon: Users },
    { key: "students", label: "Students", icon: GraduationCap },
    { key: "teachers", label: "Teachers", icon: BookOpen },
    { key: "courses", label: "Courses", icon: BookOpen },
    { key: "assignments", label: "Assignments", icon: CheckSquare },
  ];

  const inputStyle = {
    padding: "6px 10px", borderRadius: "8px",
    border: "1.5px solid #e5e7eb", fontSize: "12px",
    color: "#111827", cursor: "pointer", outline: "none"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>

      {/* Sidebar */}
      <aside style={{
        width: "220px", backgroundColor: "#111827", color: "white",
        display: "flex", flexDirection: "column", padding: "24px 16px",
        minHeight: "100vh", position: "fixed"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "800", color: "white", margin: "0 0 4px" }}>📚 StudySmart</h1>
          <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Admin Panel</p>
        </div>

        <div style={{ backgroundColor: "#1f2937", borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
            A
          </div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "white", margin: "0 0 2px" }}>Admin</p>
          <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>System Administrator</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", border: "none",
                backgroundColor: activeTab === item.key ? "#7c3aed" : "transparent",
                color: activeTab === item.key ? "white" : "#9ca3af",
                fontSize: "13px", fontWeight: "500", cursor: "pointer",
                marginBottom: "4px", textAlign: "left"
              }}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          width: "100%", padding: "10px", backgroundColor: "#dc2626",
          color: "white", border: "none", borderRadius: "8px",
          fontSize: "13px", fontWeight: "600", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "8px", justifyContent: "center"
        }}>
          <LogOut size={14} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: "220px", padding: "32px 36px", overflowY: "auto" }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Admin Dashboard</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 28px" }}>Platform overview</p>

            {adminStats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
                {[
                  { label: "Total Users", value: adminStats.total_users, icon: Users, bg: "#eff6ff", color: "#3b82f6" },
                  { label: "Students", value: adminStats.total_students, icon: GraduationCap, bg: "#f0fdf4", color: "#22c55e" },
                  { label: "Teachers", value: adminStats.total_teachers, icon: BookOpen, bg: "#fff7ed", color: "#f97316" },
                  { label: "Courses", value: adminStats.total_courses, icon: BookOpen, bg: "#faf5ff", color: "#7c3aed" },
                  { label: "Assignments", value: adminStats.total_assignments, icon: CheckSquare, bg: "#fef2f2", color: "#ef4444" },
                  { label: "Submissions", value: adminStats.total_submissions, icon: CheckSquare, bg: "#f0fdf4", color: "#22c55e" },
                  { label: "Enrollments", value: adminStats.total_enrollments, icon: Users, bg: "#eff6ff", color: "#3b82f6" },
                ].map((card, i) => (
                  <div key={i} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{card.label}</p>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <card.icon size={16} color={card.color} />
                      </div>
                    </div>
                    <p style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: 0 }}>{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {[
                { label: "Manage Users", desc: "View all users, change roles", tab: "users", color: "#3b82f6", bg: "#eff6ff" },
                { label: "Manage Courses", desc: "View and delete courses", tab: "courses", color: "#7c3aed", bg: "#faf5ff" },
                { label: "View Assignments", desc: "All assignments & submissions", tab: "assignments", color: "#f97316", bg: "#fff7ed" },
              ].map((action, i) => (
                <button key={i} onClick={() => setActiveTab(action.tab)}
                  style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "20px", textAlign: "left", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: action.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                    <ChevronRight size={18} color={action.color} />
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>{action.label}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ALL USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>All Users</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>{users.length} total users</p>
            <UserTable users={users} onDelete={deleteUser} onRoleChange={updateRole} />
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {activeTab === "students" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Students</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>{students.length} students registered</p>
            <UserTable users={students} onDelete={deleteUser} onRoleChange={updateRole} />
          </div>
        )}

        {/* ── TEACHERS TAB ── */}
        {activeTab === "teachers" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Teachers</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>{teachers.length} teachers registered</p>
            <UserTable users={teachers} onDelete={deleteUser} onRoleChange={updateRole} />
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>All Courses</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>{courses.length} courses on platform</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {courses.map(course => (
                <div key={course.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ height: "6px", backgroundColor: course.color || "#7c3aed" }} />
                  <div style={{ padding: "18px" }}>
                    <span style={{ fontSize: "11px", backgroundColor: "#faf5ff", color: "#7c3aed", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                      {course.category}
                    </span>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "10px 0 6px" }}>{course.title}</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px", lineHeight: "1.5" }}>{course.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        ID: #{course.id} | Teacher: #{course.teacher_id}
                      </span>
                      <button onClick={() => deleteCourse(course.id)}
                        style={{ padding: "6px 10px", backgroundColor: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No courses yet!</p>}
            </div>
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {activeTab === "assignments" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>All Assignments</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>View all assignments and submissions</p>
            <AssignmentsList onViewSubmissions={openSubmissions} />
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {activeTab === "submissions" && (
          <div>
            <button onClick={() => setActiveTab("assignments")}
              style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>
              ← Back to Assignments
            </button>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              Submissions — {selectedAssignment?.title}
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>{submissions.length} submissions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 2px" }}>{sub.student.name}</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{sub.student.email}</p>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: sub.status === "graded" ? "#f0fdf4" : "#fff7ed", color: sub.status === "graded" ? "#16a34a" : "#f97316" }}>
                      {sub.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#374151", backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px", margin: "0 0 10px", lineHeight: "1.6" }}>
                    {sub.content}
                  </p>
                  <div style={{ display: "flex", gap: "10px", fontSize: "13px", color: "#6b7280" }}>
                    <span>💯 Marks: {sub.marks_obtained} / {selectedAssignment?.total_marks}</span>
                    <span>📅 {new Date(sub.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No submissions yet!</p>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Reusable UserTable Component ──
function UserTable({ users, onDelete, onRoleChange }) {
  return (
    <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["ID", "Name", "Email", "Role", "Joined", "Change Role", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#6b7280", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 20px", color: "#9ca3af" }}>#{user.id}</td>
                <td style={{ padding: "12px 20px", fontWeight: "600", color: "#111827" }}>{user.name}</td>
                <td style={{ padding: "12px 20px", color: "#6b7280" }}>{user.email}</td>
                <td style={{ padding: "12px 20px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: user.role === "admin" ? "#faf5ff" : user.role === "teacher" ? "#fff7ed" : "#eff6ff", color: user.role === "admin" ? "#7c3aed" : user.role === "teacher" ? "#ea580c" : "#2563eb" }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", color: "#9ca3af" }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <select value={user.role} onChange={e => onRoleChange(user.id, e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "12px", color: "#111827", cursor: "pointer", outline: "none" }}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <button onClick={() => onDelete(user.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Assignments List Component ──
function AssignmentsList({ onViewSubmissions }) {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get("/api/admin/courses"),
    ]).then(([c]) => {
      setCourses(c.data);
    });
  }, []);

  // Get assignments from all courses
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await API.get("/api/assignments/my");
        setAssignments(res.data);
      } catch {
        // If teacher endpoint fails, try getting from courses
        const allAssigns = [];
        for (const course of courses) {
          try {
            const res = await API.get(`/api/courses/${course.id}/detail`);
            if (res.data.assignments) allAssigns.push(...res.data.assignments);
          } catch {}
        }
        setAssignments(allAssigns);
      }
    };
    fetchAssignments();
  }, [courses]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {assignments.map(assignment => (
        <div key={assignment.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>{assignment.title}</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 6px" }}>{assignment.description}</p>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#9ca3af" }}>
              <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
              <span>💯 Marks: {assignment.total_marks}</span>
              <span>📚 Course ID: #{assignment.course_id}</span>
            </div>
          </div>
          <button onClick={() => onViewSubmissions(assignment)}
            style={{ padding: "9px 18px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
            View Submissions
          </button>
        </div>
      ))}
      {assignments.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No assignments found!</p>}
    </div>
  );
}