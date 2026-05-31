 import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f97316","#10b981","#3b82f6","#ef4444","#f59e0b"];
const defaultForm = { title: "", description: "", category: "", color: "#6366f1" };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCourses = () => API.get("/api/courses/").then(res => setCourses(res.data));
  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.category) return toast.error("Fill all fields");
    try {
      if (editing) {
        await API.put(`/api/courses/${editing}`, form);
        toast.success("Course updated!");
      } else {
        await API.post("/api/courses/", form);
        toast.success("Course added!");
      }
      setShowModal(false);
      setForm(defaultForm);
      setEditing(null);
      fetchCourses();
    } catch { toast.error("Something went wrong"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await API.delete(`/api/courses/${id}`);
    toast.success("Deleted");
    fetchCourses();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <p className="text-gray-500 mt-1">Manage your subjects</p>
          </div>
          <button onClick={() => { setForm(defaultForm); setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow">
            <Plus size={18} /> Add Course
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="h-3 w-full" style={{ backgroundColor: course.color }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: course.color + "22" }}>
                    <BookOpen size={20} style={{ color: course.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{course.title}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setForm({ title: course.title, description: course.description, category: course.category, color: course.color });
                    setEditing(course.id);
                    setShowModal(true);
                  }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(course.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No courses yet. Add your first course!</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">{editing ? "Edit Course" : "New Course"}</h2>
              <div className="space-y-4">
                <input placeholder="Course Title" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <input placeholder="Category (e.g. Science)" value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <textarea placeholder="Description" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={3} />
                <div>
                  <p className="text-sm text-gray-500 mb-2">Pick a color</p>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm({...form, color: c})}
                        className={`w-8 h-8 rounded-full border-4 transition ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                  {editing ? "Update" : "Add Course"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}