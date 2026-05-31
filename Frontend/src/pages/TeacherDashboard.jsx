 import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/axios";
import toast from "react-hot-toast";
import { BookOpen, Users, CheckSquare, LogOut, Plus, Trash2, PlayCircle, FileText } from "lucide-react";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courseLessons, setCourseLessons] = useState([]);
const [selectedLessonCourse, setSelectedLessonCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const [courseForm, setCourseForm] = useState({ title: "", description: "", category: "", color: "#3b82f6" });
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", video_url: "", file_url: "", order: 1, course_id: "" });
  const [assignForm, setAssignForm] = useState({ title: "", description: "", deadline: "", total_marks: 100, course_id: "" });

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#ef4444", "#f59e0b"];

  const fetchData = async () => {
    try {
      const [c, a] = await Promise.all([
        API.get("/api/courses/my"),
        API.get("/api/assignments/my")
      ]);
      setCourses(c.data);
      setAssignments(a.data);
      // Count total unique students across all courses
let studentCount = 0;
for (const course of c.data) {
  try {
    const res = await API.get(`/api/courses/${course.id}/students`);
    studentCount += res.data.length;
  } catch {}
}
setTotalStudents(studentCount);
    } catch (err) { console.log(err); }
  };
const openCourseLessons = async (course) => {
  setSelectedLessonCourse(course);
  const res = await API.get(`/api/courses/${course.id}/detail`);
  setCourseLessons(res.data.lessons || []);
  setActiveTab("lessons");
};

const deleteLesson = async (lessonId) => {
  if (!window.confirm("Delete this lesson?")) return;
  await API.delete(`/api/courses/lessons/${lessonId}`);
  toast.success("Lesson deleted!");
  const res = await API.get(`/api/courses/${selectedLessonCourse.id}/detail`);
  setCourseLessons(res.data.lessons || []);
};
  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const saveCourse = async () => {
    if (!courseForm.title || !courseForm.category) return toast.error("Fill all fields");
    try {
      if (editCourse) {
        await API.put(`/api/courses/${editCourse.id}`, courseForm);
        toast.success("Course updated!");
      } else {
        await API.post("/api/courses/", courseForm);
        toast.success("Course created!");
      }
      setShowCourseModal(false);
      setCourseForm({ title: "", description: "", category: "", color: "#3b82f6" });
      setEditCourse(null);
      fetchData();
    } catch { toast.error("Error saving course"); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await API.delete(`/api/courses/${id}`);
    toast.success("Course deleted");
    fetchData();
  };

  const addLesson = async () => {
    if (!lessonForm.title || !lessonForm.course_id) return toast.error("Fill required fields");
    try {
      await API.post(`/api/courses/${lessonForm.course_id}/lessons`, lessonForm);
      toast.success("Lesson added!");
      setShowLessonModal(false);
      setLessonForm({ title: "", description: "", video_url: "", file_url: "", order: 1, course_id: "" });
    } catch { toast.error("Error adding lesson"); }
  };

  const addAssignment = async () => {
    if (!assignForm.title || !assignForm.course_id || !assignForm.deadline) return toast.error("Fill all fields");
    try {
      await API.post("/api/assignments/", {
        ...assignForm,
        course_id: parseInt(assignForm.course_id),
        total_marks: parseInt(assignForm.total_marks)
      });
      toast.success("Assignment created!");
      setShowAssignModal(false);
      setAssignForm({ title: "", description: "", deadline: "", total_marks: 100, course_id: "" });
      fetchData();
    } catch { toast.error("Error creating assignment"); }
  };

  const openCourseStudents = async (course) => {
    setSelectedCourse(course);
    const res = await API.get(`/api/courses/${course.id}/students`);
    setCourseStudents(res.data);
    setActiveTab("students");
  };

  const openSubmissions = async (assignment) => {
    setSelectedCourse(assignment);
    const res = await API.get(`/api/assignments/${assignment.id}/submissions`);
    setSubmissions(res.data);
    setActiveTab("submissions");
  };

  const gradeSubmission = async (submissionId, marks) => {
    await API.patch(`/api/assignments/submissions/${submissionId}/grade`, { marks_obtained: parseInt(marks) });
    toast.success("Graded!");
    const res = await API.get(`/api/assignments/${selectedCourse.id}/submissions`);
    setSubmissions(res.data);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    backgroundColor: "#f9fafb", border: "1.5px solid #e5e7eb",
    borderRadius: "10px", fontSize: "14px", color: "#111827",
    outline: "none", boxSizing: "border-box"
  };

   const navItems = [
  { key: "dashboard", label: "Dashboard", icon: BookOpen },
  { key: "courses", label: "My Courses", icon: BookOpen },
  { key: "assignments", label: "Assignments", icon: CheckSquare },
  { key: "lessons", label: "Lessons", icon: PlayCircle },
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
          <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Teacher Portal</p>
        </div>

        <div style={{ backgroundColor: "#1f2937", borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "white", margin: "0 0 2px" }}>{user?.name}</p>
          <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Teacher</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", border: "none",
                backgroundColor: activeTab === item.key ? "#f97316" : "transparent",
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
      <main style={{ flex: 1, marginLeft: "220px", padding: "32px 36px" }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              Welcome, {user?.name}! 👨‍🏫
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 28px" }}>
              Manage your courses and students
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
              {[
                { label: "My Courses", value: courses.length, icon: BookOpen, bg: "#fff7ed", color: "#f97316" },
                { label: "Assignments", value: assignments.length, icon: CheckSquare, bg: "#eff6ff", color: "#3b82f6" },
                { label: "Total Students", value: totalStudents, icon: Users, bg: "#f0fdf4", color: "#22c55e" },
              ].map((card, i) => (
                <div key={i} style={{
                  backgroundColor: "white", border: "1.5px solid #e5e7eb",
                  borderRadius: "12px", padding: "20px 24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{card.label}</p>
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <card.icon size={16} color={card.color} />
                    </div>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Courses */}
            <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 16px" }}>Recent Courses</h2>
              {courses.slice(0, 3).map(course => (
                <div key={course.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: course.color }} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>{course.title}</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{course.category}</p>
                    </div>
                  </div>
                  <button onClick={() => openCourseStudents(course)}
                    style={{ padding: "6px 12px", backgroundColor: "#eff6ff", color: "#3b82f6", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                    View Students
                  </button>
                </div>
              ))}
              {courses.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No courses yet. Create your first course!</p>}
            </div>
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === "courses" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>My Courses</h1>
                <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Create and manage your courses</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowLessonModal(true)}
                  style={{ padding: "10px 16px", backgroundColor: "#eff6ff", color: "#3b82f6", border: "1.5px solid #bfdbfe", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <PlayCircle size={15} /> Add Lesson
                </button>
                <button onClick={() => { setShowCourseModal(true); setEditCourse(null); setCourseForm({ title: "", description: "", category: "", color: "#3b82f6" }); }}
                  style={{ padding: "10px 16px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Plus size={15} /> New Course
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {courses.map(course => (
                <div key={course.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ height: "6px", backgroundColor: course.color }} />
                  <div style={{ padding: "20px" }}>
                    <span style={{ fontSize: "11px", backgroundColor: "#fff7ed", color: "#f97316", padding: "3px 10px", borderRadius: "20px", fontWeight: "600" }}>
                      {course.category}
                    </span>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "10px 0 6px" }}>{course.title}</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px", lineHeight: "1.5" }}>{course.description}</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openCourseLessons(course)}
  style={{ flex: 1, padding: "8px", backgroundColor: "#faf5ff", color: "#7c3aed", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
  📚 Lessons
</button>
                      <button onClick={() => openCourseStudents(course)}
                        style={{ flex: 1, padding: "8px", backgroundColor: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                        👥 Students
                      </button>
                      <button onClick={() => { setEditCourse(course); setCourseForm({ title: course.title, description: course.description, category: course.category, color: course.color }); setShowCourseModal(true); }}
                        style={{ flex: 1, padding: "8px", backgroundColor: "#eff6ff", color: "#3b82f6", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => deleteCourse(course.id)}
                        style={{ padding: "8px 12px", backgroundColor: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                        <Trash2 size={14} />
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Assignments</h1>
                <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>Create and grade assignments</p>
              </div>
              <button onClick={() => setShowAssignModal(true)}
                style={{ padding: "10px 16px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={15} /> New Assignment
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {assignments.map(assignment => (
                <div key={assignment.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>{assignment.title}</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 6px" }}>{assignment.description}</p>
                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#9ca3af" }}>
                      <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                      <span>💯 Total Marks: {assignment.total_marks}</span>
                    </div>
                  </div>
                  <button onClick={() => openSubmissions(assignment)}
                    style={{ padding: "9px 18px", backgroundColor: "#f97316", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
                    View Submissions
                  </button>
                </div>
              ))}
              {assignments.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No assignments yet!</p>}
            </div>
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {activeTab === "students" && (
          <div>
            <button onClick={() => setActiveTab("courses")}
              style={{ background: "none", border: "none", color: "#f97316", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>
              ← Back to Courses
            </button>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              Students — {selectedCourse?.title}
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>
              {courseStudents.length} students enrolled
            </p>
            <div style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Name", "Email", "Progress", "Enrolled"].map(h => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#6b7280", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 20px", fontWeight: "600", color: "#111827" }}>{s.student_name}</td>
                      <td style={{ padding: "12px 20px", color: "#6b7280" }}>{s.student_email}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "#f3f4f6", borderRadius: "10px" }}>
                            <div style={{ height: "100%", width: `${s.progress}%`, backgroundColor: "#f97316", borderRadius: "10px" }} />
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>{s.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px", color: "#9ca3af" }}>{new Date(s.enrolled_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courseStudents.length === 0 && <p style={{ padding: "20px", color: "#9ca3af", fontSize: "14px" }}>No students enrolled yet!</p>}
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {activeTab === "submissions" && (
          <div>
            <button onClick={() => setActiveTab("assignments")}
              style={{ background: "none", border: "none", color: "#f97316", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>
              ← Back to Assignments
            </button>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
              Submissions — {selectedCourse?.title}
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 24px" }}>
              {submissions.length} submissions received
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ backgroundColor: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>{sub.student.name}</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{sub.student.email}</p>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: sub.status === "graded" ? "#f0fdf4" : "#fff7ed", color: sub.status === "graded" ? "#16a34a" : "#f97316" }}>
                      {sub.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#374151", margin: "0 0 16px", backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px", lineHeight: "1.6" }}>
                    {sub.content}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="number"
                      defaultValue={sub.marks_obtained}
                      min="0"
                      max={selectedCourse?.total_marks || 100}
                      id={`marks-${sub.id}`}
                      style={{ width: "80px", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                    />
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>/ {selectedCourse?.total_marks || 100} marks</span>
                    <button onClick={() => gradeSubmission(sub.id, document.getElementById(`marks-${sub.id}`).value)}
                      style={{ padding: "8px 16px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                      Save Grade
                    </button>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px" }}>No submissions yet!</p>}
            </div>
          </div>
        )}

{/* ── LESSONS TAB ── */}
{activeTab === "lessons" && (
  <div>
    <button onClick={() => setActiveTab("courses")}
      style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>
      ← Back to Courses
    </button>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>
          Lessons — {selectedLessonCourse?.title}
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
          {courseLessons.length} lessons added
        </p>
      </div>
      <button onClick={() => { setLessonForm({...lessonForm, course_id: selectedLessonCourse?.id}); setShowLessonModal(true); }}
        style={{ padding: "10px 16px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
        <Plus size={15} /> Add Lesson
      </button>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {courseLessons.sort((a, b) => a.order - b.order).map((lesson, i) => (
        <div key={lesson.id} style={{
          backgroundColor: "white", border: "1.5px solid #e5e7eb",
          borderRadius: "14px", padding: "20px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#7c3aed" }}>
                {lesson.order}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>{lesson.title}</h3>
            </div>
            <button onClick={() => deleteLesson(lesson.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
              <Trash2 size={16} />
            </button>
          </div>

          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px", paddingLeft: "42px" }}>
            {lesson.description}
          </p>

          {/* Video Player */}
          {lesson.video_url && (
            <div style={{ paddingLeft: "42px", marginBottom: "12px" }}>
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
                  style={{ width: "100%", height: "260px", borderRadius: "10px", border: "none" }}
                  allowFullScreen
                />
              ) : (
                <video controls style={{ width: "100%", borderRadius: "10px", maxHeight: "260px" }}>
                  <source src={lesson.video_url} />
                  Your browser does not support video.
                </video>
              )}
            </div>
          )}

          {/* File Link */}
          {lesson.file_url && (
            <div style={{ paddingLeft: "42px" }}>
              <a href={lesson.file_url} target="_blank" rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", backgroundColor: "#f8fafc",
                  border: "1.5px solid #e5e7eb", borderRadius: "8px",
                  color: "#374151", fontSize: "13px", fontWeight: "600",
                  textDecoration: "none"
                }}>
                📄 View / Download File
              </a>
            </div>
          )}
        </div>
      ))}
      {courseLessons.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
          <PlayCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: "14px" }}>No lessons yet. Add your first lesson!</p>
        </div>
      )}
    </div>
  </div>
)}


      </main>

      {/* Course Modal */}
      {showCourseModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>
              {editCourse ? "Edit Course" : "New Course"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="Course Title *" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} style={inputStyle} />
              <input placeholder="Category (e.g. Mathematics)" value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} style={inputStyle} />
              <textarea placeholder="Description" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} style={{...inputStyle, resize: "vertical"}} rows={3} />
              <div>
                <p style={{ fontSize: "13px", color: "#374151", marginBottom: "8px", fontWeight: "600" }}>Color</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setCourseForm({...courseForm, color: c})}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: c, border: courseForm.color === c ? "3px solid #111827" : "3px solid transparent", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowCourseModal(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: "8px", backgroundColor: "white", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveCourse} style={{ flex: 1, padding: "11px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                {editCourse ? "Update" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>Add Lesson</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <select value={lessonForm.course_id} onChange={e => setLessonForm({...lessonForm, course_id: e.target.value})} style={inputStyle}>
                <option value="">Select Course *</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input placeholder="Lesson Title *" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} style={inputStyle} />
              <textarea placeholder="Description" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} style={{...inputStyle, resize: "vertical"}} rows={2} />
              <input placeholder="🎥 YouTube/Video URL (optional)" value={lessonForm.video_url} onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} style={inputStyle} />
              <input placeholder="📄 File/Document URL (optional)" value={lessonForm.file_url} onChange={e => setLessonForm({...lessonForm, file_url: e.target.value})} style={inputStyle} />
              <input type="number" placeholder="Order (1, 2, 3...)" value={lessonForm.order} onChange={e => setLessonForm({...lessonForm, order: parseInt(e.target.value)})} style={inputStyle} min={1} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowLessonModal(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: "8px", backgroundColor: "white", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={addLesson} style={{ flex: 1, padding: "11px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Add Lesson</button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>New Assignment</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <select value={assignForm.course_id} onChange={e => setAssignForm({...assignForm, course_id: e.target.value})} style={inputStyle}>
                <option value="">Select Course *</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input placeholder="Assignment Title *" value={assignForm.title} onChange={e => setAssignForm({...assignForm, title: e.target.value})} style={inputStyle} />
              <textarea placeholder="Description" value={assignForm.description} onChange={e => setAssignForm({...assignForm, description: e.target.value})} style={{...inputStyle, resize: "vertical"}} rows={2} />
              <input type="datetime-local" value={assignForm.deadline} onChange={e => setAssignForm({...assignForm, deadline: e.target.value})} style={inputStyle} />
              <input type="number" placeholder="Total Marks" value={assignForm.total_marks} onChange={e => setAssignForm({...assignForm, total_marks: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowAssignModal(false)} style={{ flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: "8px", backgroundColor: "white", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={addAssignment} style={{ flex: 1, padding: "11px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Create Assignment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}