 import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/axios";
import toast from "react-hot-toast";
import { BookOpen, CheckSquare, Clock, LogOut, PlayCircle, GraduationCap, Plus, Trash2, BarChart2, Flame, Trophy, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitText, setSubmitText] = useState("");
  const [mySubmissions, setMySubmissions] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskForm, setTaskForm] = useState({
    title: "", description: "", deadline: "",
    priority: "medium", duration_mins: 60, subject: ""
  });

   const fetchData = async () => {
  try {
    const [all, enrolled, assign, sub, t, prog] = await Promise.all([
      API.get("/api/courses/all"),
      API.get("/api/courses/enrolled"),
      API.get("/api/assignments/student"),
      API.get("/api/assignments/my-submissions"),
      API.get("/api/planner/tasks"),
      API.get("/api/planner/progress")
    ]);
    setAllCourses(all.data);
    setEnrolledCourses(enrolled.data);
    setAssignments(assign.data);
    setMySubmissions(sub.data);
    setTasks(t.data);
    setProgress(prog.data);
  } catch (err) { console.log(err); }
};
  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const enrollCourse = async (courseId) => {
    try {
      await API.post(`/api/courses/${courseId}/enroll`);
      toast.success("Enrolled successfully! 🎉");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error enrolling");
    }
  };

  const submitAssignment = async () => {
    if (!submitText.trim()) return toast.error("Please write something!");
    try {
      await API.post("/api/assignments/submit", {
        assignment_id: submitModal.id,
        content: submitText
      });
      toast.success("Assignment submitted! ✅");
      setSubmitModal(null);
      setSubmitText("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Already submitted");
    }
  };

  const createTask = async () => {
    if (!taskForm.title || !taskForm.subject || !taskForm.deadline)
      return toast.error("Fill all required fields!");
    try {
      await API.post("/api/planner/tasks", taskForm);
      toast.success("Task added! 📝");
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", deadline: "", priority: "medium", duration_mins: 60, subject: "" });
      fetchData();
    } catch { toast.error("Error adding task"); }
  };

  const completeTask = async (id) => {
    const res = await API.patch(`/api/planner/tasks/${id}/complete`);
    toast.success(`Task done! 🔥 Streak: ${res.data.streak}`);
    fetchData();
  };

  const deleteTask = async (id) => {
    await API.delete(`/api/planner/tasks/${id}`);
    toast.success("Task deleted");
    fetchData();
  };

  const enrolledCourseIds = enrolledCourses.map(e => e.course_id);

  const filteredTasks = tasks.filter(t =>
    taskFilter === "all" ? true : t.status === taskFilter
  ).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });

  const priorityColor = {
    high: { bg: "#fef2f2", color: "#ef4444" },
    medium: { bg: "#fff7ed", color: "#f97316" },
    low: { bg: "#f0fdf4", color: "#22c55e" }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    backgroundColor: "#f9fafb", border: "1.5px solid #e5e7eb",
    borderRadius: "10px", fontSize: "14px", color: "#111827",
    outline: "none", boxSizing: "border-box"
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: GraduationCap },
    { key: "courses", label: "Browse Courses", icon: BookOpen },
    { key: "my-courses", label: "My Courses", icon: PlayCircle },
    { key: "planner", label: "Study Planner", icon: Clock },
    { key: "assignments", label: "Assignments", icon: CheckSquare },
    { key: "progress", label: "Progress", icon: BarChart2 },
  ];

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
          <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Student Portal</p>
        </div>

        <div style={{ backgroundColor: "#1f2937", borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "white", margin: "0 0 2px" }}>{user?.name}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Flame size={12} color="#f97316" />
            <p style={{ fontSize: "11px", color: "#f97316", margin: 0 }}>{progress?.streak || 0} day streak</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSelectedCourse(null); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", border: "none",
                backgroundColor: activeTab === item.key ? "#3b82f6" : "transparent",
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
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>
              Here's your learning overview
            </p>

            {/* Streak Card */}
            <div style={{ display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Flame size={22} color="#f97316" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px" }}>Current Streak</p>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>{progress?.streak || 0} Days 🔥</p>
                </div>
              </div>
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trophy size={22} color="#7c3aed" />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px" }}>Longest Streak</p>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>{progress?.longest_streak || 0} Days</p>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
              {[
                { label: "Enrolled Courses", value: enrolledCourses.length, icon: BookOpen, bg: "#eff6ff", color: "#3b82f6" },
                { label: "Total Tasks", value: progress?.total || 0, icon: Clock, bg: "#fff7ed", color: "#f97316" },
                { label: "Completed", value: progress?.completed || 0, icon: CheckSquare, bg: "#f0fdf4", color: "#22c55e" },
                { label: "Productivity", value: `${progress?.productivity || 0}%`, icon: BarChart2, bg: "#faf5ff", color: "#7c3aed" },
              ].map((card, i) => (
                <div key={i} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{card.label}</p>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <card.icon size={15} color={card.color} />
                    </div>
                  </div>
                  <p style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: 0 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Deadlines */}
            {progress?.upcoming_deadlines?.length > 0 && (
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 16px" }}>⏰ Upcoming Deadlines</h2>
                {progress.upcoming_deadlines.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < progress.upcoming_deadlines.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", backgroundColor: priorityColor[t.priority]?.bg, color: priorityColor[t.priority]?.color }}>
                        {t.priority}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{t.title}</span>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>— {t.subject}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      📅 {new Date(t.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Badges */}
            {progress?.badges?.length > 0 && (
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 14px" }}>🏅 My Badges</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {progress.badges.map((badge, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#fefce8", border: "1px solid #fde68a", color: "#92400e", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
                      <Trophy size={14} /> {badge}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Browse Courses</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>Explore and enroll in available courses</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {allCourses.map(course => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                return (
                  <div key={course.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ height: "6px", backgroundColor: course.color || "#3b82f6" }} />
                    <div style={{ padding: "20px" }}>
                      <span style={{ fontSize: "11px", backgroundColor: "#eff6ff", color: "#3b82f6", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>{course.category}</span>
                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "10px 0 6px" }}>{course.title}</h3>
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px", lineHeight: "1.5" }}>{course.description}</p>
                      {isEnrolled ? (
                        <button onClick={() => { setSelectedCourse(course); setActiveTab("course-detail"); }}
                          style={{ width: "100%", padding: "9px", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                          ✅ Continue Learning
                        </button>
                      ) : (
                        <button onClick={() => enrollCourse(course.id)}
                          style={{ width: "100%", padding: "9px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {allCourses.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px", gridColumn: "span 3" }}>No courses available yet.</p>}
            </div>
          </div>
        )}

        {/* ── MY COURSES TAB ── */}
        {activeTab === "my-courses" && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>My Courses</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>Continue where you left off</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {enrolledCourses.map(enrollment => (
                <div key={enrollment.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ height: "6px", backgroundColor: enrollment.course.color || "#3b82f6" }} />
                  <div style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>{enrollment.course.title}</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 12px" }}>{enrollment.course.category}</p>
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>Progress</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>{enrollment.progress}%</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", backgroundColor: "#f3f4f6", borderRadius: "10px" }}>
                        <div style={{ height: "100%", width: `${enrollment.progress}%`, backgroundColor: enrollment.course.color || "#3b82f6", borderRadius: "10px" }} />
                      </div>
                    </div>
                    <button onClick={() => { setSelectedCourse(enrollment.course); setActiveTab("course-detail"); }}
                      style={{ width: "100%", padding: "9px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <PlayCircle size={14} /> Open Course
                    </button>
                  </div>
                </div>
              ))}
              {enrolledCourses.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No courses enrolled yet!</p>}
            </div>
          </div>
        )}

        {/* ── COURSE DETAIL TAB ── */}
        {activeTab === "course-detail" && selectedCourse && (
          <div>
            <button onClick={() => setActiveTab("my-courses")}
              style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>
              ← Back
            </button>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>{selectedCourse.title}</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>{selectedCourse.description}</p>
            <CourseDetailView courseId={selectedCourse.id} />
          </div>
        )}

        {/* ── STUDY PLANNER TAB ── */}
        {activeTab === "planner" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Study Planner</h1>
                <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Organize your study tasks</p>
              </div>
              <button onClick={() => setShowTaskModal(true)}
                style={{ padding: "10px 16px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={15} /> Add Task
              </button>
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {["all", "pending", "completed"].map(f => (
                <button key={f} onClick={() => setTaskFilter(f)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid", fontSize: "13px", fontWeight: "600", cursor: "pointer", backgroundColor: taskFilter === f ? "#111827" : "white", color: taskFilter === f ? "white" : "#6b7280", borderColor: taskFilter === f ? "#111827" : "#e5e7eb" }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredTasks.map(task => {
                const isOverdue = new Date(task.deadline) < new Date() && task.status === "pending";
                return (
                  <div key={task.id} style={{ backgroundColor: "white", border: `1.5px solid ${isOverdue ? "#fecaca" : "#e5e7eb"}`, borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px", opacity: task.status === "completed" ? 0.7 : 1 }}>
                    <button onClick={() => task.status !== "completed" && completeTask(task.id)}
                      style={{ background: "none", border: "none", cursor: task.status === "completed" ? "default" : "pointer", color: task.status === "completed" ? "#22c55e" : "#d1d5db", flexShrink: 0 }}>
                      <CheckSquare size={22} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827", textDecoration: task.status === "completed" ? "line-through" : "none" }}>{task.title}</span>
                        <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", backgroundColor: priorityColor[task.priority]?.bg, color: priorityColor[task.priority]?.color }}>
                          {task.priority}
                        </span>
                        <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", backgroundColor: "#eff6ff", color: "#3b82f6" }}>
                          {task.subject}
                        </span>
                        {isOverdue && (
                          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>
                            <AlertTriangle size={11} /> Overdue
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                        📅 {new Date(task.deadline).toLocaleDateString()} · ⏱ {task.duration_mins} min
                      </p>
                    </div>
                    <button onClick={() => deleteTask(task.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", flexShrink: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                  <Clock size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
                  <p style={{ fontSize: "14px" }}>No tasks found. Add your first study task!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
       
          {activeTab === "assignments" && (
  <div>
    <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Assignments</h1>
    <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>Your assignments and submission status</p>
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {assignments.map(assignment => {
        const submission = mySubmissions.find(s => s.assignment_id === assignment.id);
        const isSubmitted = !!submission;
        const isGraded = submission?.status === "graded";
        const isOverdue = new Date(assignment.deadline) < new Date() && !isSubmitted;

        return (
          <div key={assignment.id} style={{
            backgroundColor: "white",
            border: `1.5px solid ${isGraded ? "#bbf7d0" : isSubmitted ? "#bfdbfe" : isOverdue ? "#fecaca" : "#e5e7eb"}`,
            borderRadius: "12px", padding: "20px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>
                    {assignment.title}
                  </h3>
                  {isGraded && (
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                      ✅ Graded
                    </span>
                  )}
                  {isSubmitted && !isGraded && (
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "#eff6ff", color: "#3b82f6" }}>
                      📤 Submitted
                    </span>
                  )}
                  {!isSubmitted && isOverdue && (
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "#fef2f2", color: "#ef4444" }}>
                      ⚠️ Overdue
                    </span>
                  )}
                  {!isSubmitted && !isOverdue && (
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "#fff7ed", color: "#f97316" }}>
                      ⏳ Pending
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 8px" }}>{assignment.description}</p>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#9ca3af", flexWrap: "wrap" }}>
                  <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  <span>💯 Total Marks: {assignment.total_marks}</span>
                  {isSubmitted && (
                    <span>📝 Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Marks Card */}
                {isGraded && (
                  <div style={{
                    marginTop: "12px",
                    backgroundColor: "#f0fdf4",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a", margin: 0 }}>
                        {submission.marks_obtained}
                      </p>
                      <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        out of {assignment.total_marks}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ width: "100%", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "10px", overflow: "hidden", marginBottom: "4px" }}>
                        <div style={{
                          height: "100%",
                          width: `${(submission.marks_obtained / assignment.total_marks) * 100}%`,
                          backgroundColor: submission.marks_obtained / assignment.total_marks >= 0.7 ? "#22c55e" : submission.marks_obtained / assignment.total_marks >= 0.4 ? "#f97316" : "#ef4444",
                          borderRadius: "10px"
                        }} />
                      </div>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                        Score: {Math.round((submission.marks_obtained / assignment.total_marks) * 100)}%
                        {submission.marks_obtained / assignment.total_marks >= 0.7 ? " 🌟 Excellent!" :
                         submission.marks_obtained / assignment.total_marks >= 0.4 ? " 👍 Good" : " 📚 Needs Improvement"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submitted Answer */}
                {isSubmitted && (
                  <div style={{ marginTop: "10px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px" }}>YOUR ANSWER:</p>
                    <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: "1.5" }}>{submission.content}</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {!isSubmitted && (
                <button onClick={() => setSubmitModal(assignment)}
                  style={{ padding: "9px 18px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  Submit
                </button>
              )}
            </div>
          </div>
        );
      })}
      {assignments.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
          <CheckSquare size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
          <p style={{ fontSize: "14px" }}>No assignments yet!</p>
        </div>
      )}
    </div>
  </div>
)}
        {/* ── PROGRESS TAB ── */}
        {activeTab === "progress" && progress && (
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Progress & Analytics</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>Track your learning performance</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Productivity Score */}
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>Productivity Score</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative", width: "160px", height: "160px" }}>
                    <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12"
                        strokeDasharray={`${progress.productivity * 2.51} ${251 - progress.productivity * 2.51}`}
                        strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "28px", fontWeight: "800", color: "#3b82f6" }}>{progress.productivity}%</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>Completed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Distribution */}
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>Task Distribution</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={[
                      { name: "Completed", value: progress.completed, color: "#3b82f6" },
                      { name: "Pending", value: progress.pending, color: "#e5e7eb" }
                    ]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {[{ color: "#3b82f6" }, { color: "#e5e7eb" }].map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject wise Progress */}
            {progress.subject_stats.length > 0 && (
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>📊 Subject-wise Progress</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={progress.subject_stats} barSize={32}>
                    <XAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip formatter={(val) => `${val}%`} contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px" }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {progress.subject_stats.map((entry, i) => (
                        <Cell key={i} fill={entry.weak ? "#ef4444" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Weak Subjects */}
                {progress.subject_stats.some(s => s.weak) && (
                  <div style={{ marginTop: "16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626", margin: "0 0 4px" }}>⚠️ Weak Subjects Detected</p>
                    <p style={{ fontSize: "13px", color: "#ef4444", margin: 0 }}>
                      {progress.subject_stats.filter(s => s.weak).map(s => s.subject).join(", ")} — Work on it!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Subject Stats Table */}
            <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>Subject Details</h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Subject", "Total Tasks", "Completed", "Score", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "#6b7280", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progress.subject_stats.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 20px", fontWeight: "600", color: "#111827" }}>{s.subject}</td>
                      <td style={{ padding: "10px 20px", color: "#6b7280" }}>{s.total}</td>
                      <td style={{ padding: "10px 20px", color: "#6b7280" }}>{s.completed}</td>
                      <td style={{ padding: "10px 20px", fontWeight: "700", color: s.weak ? "#ef4444" : "#22c55e" }}>{s.score}%</td>
                      <td style={{ padding: "10px 20px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: s.weak ? "#fef2f2" : "#f0fdf4", color: s.weak ? "#ef4444" : "#16a34a" }}>
                          {s.weak ? "⚠️ Needs Work" : "✅ Good"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Badges */}
            {progress.badges?.length > 0 && (
              <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 14px" }}>🏅 Earned Badges</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {progress.badges.map((badge, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#fefce8", border: "1px solid #fde68a", color: "#92400e", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" }}>
                      <Trophy size={14} /> {badge}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>New Study Task</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="Task Title *" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} style={inputStyle} />
              <input placeholder="Subject * (e.g. Mathematics)" value={taskForm.subject} onChange={e => setTaskForm({...taskForm, subject: e.target.value})} style={inputStyle} />
              <textarea placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} style={{...inputStyle, resize: "vertical"}} rows={2} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} style={inputStyle}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input type="number" placeholder="Duration (mins)" value={taskForm.duration_mins} onChange={e => setTaskForm({...taskForm, duration_mins: parseInt(e.target.value)})} style={inputStyle} min={1} />
              </div>
              <input type="datetime-local" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowTaskModal(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: "8px", backgroundColor: "white", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={createTask} style={{ flex: 1, padding: "11px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {submitModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>Submit Assignment</h2>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px" }}>{submitModal.title}</p>
            <textarea value={submitText} onChange={e => setSubmitText(e.target.value)} placeholder="Write your answer here..." rows={6}
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", color: "#111827", outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setSubmitModal(null)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: "8px", backgroundColor: "white", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={submitAssignment} style={{ flex: 1, padding: "11px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseDetailView({ courseId }) {
  const [course, setCourse] = useState(null);
  useEffect(() => {
    API.get(`/api/courses/${courseId}/detail`).then(res => setCourse(res.data));
  }, [courseId]);
  if (!course) return <p style={{ color: "#9ca3af" }}>Loading...</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {course.lessons?.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No lessons added yet.</p>}
      {course.lessons?.sort((a, b) => a.order - b.order).map((lesson, i) => (
        <div key={lesson.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#3b82f6" }}>{i + 1}</div>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>{lesson.title}</h3>
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px" }}>{lesson.description}</p>
          {lesson.video_url && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#374151", margin: "0 0 8px" }}>📹 Video</p>
              {lesson.video_url.includes("youtube") || lesson.video_url.includes("youtu.be") ? (
                <iframe
                  src={(() => {
                    let url = lesson.video_url;
                    if (url.includes("youtube.com/watch?v=")) {
                      const videoId = url.split("watch?v=")[1].split("&")[0];
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                    if (url.includes("youtu.be/")) {
                      const videoId = url.split("youtu.be/")[1].split("?")[0];
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                    return url;
                  })()}
                  style={{ width: "100%", height: "280px", borderRadius: "10px", border: "none" }}
                  allowFullScreen
                />
              ) : (
                <video controls style={{ width: "100%", borderRadius: "10px", maxHeight: "280px" }}>
                  <source src={lesson.video_url} />
                </video>
              )}
            </div>
          )}
          {lesson.file_url && (
            <a href={lesson.file_url} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#374151", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              📄 Download File
            </a>
          )}
        </div>
      ))}
    </div>
  );
}