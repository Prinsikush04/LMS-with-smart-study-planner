 import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/axios";
import toast from "react-hot-toast";
import { Plus, CheckCircle, Clock, Trash2, CalendarCheck, AlertTriangle } from "lucide-react";

const PRIORITIES = ["low", "medium", "high"];
const priorityColor = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700"
};
const defaultForm = {
  title: "", description: "", deadline: "",
  priority: "medium", duration_mins: 60, course_id: ""
};

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchAll = async () => {
    const [t, c] = await Promise.all([
      API.get("/api/tasks/"),
      API.get("/api/courses/")
    ]);
    setTasks(t.data);
    setCourses(c.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.deadline || !form.course_id)
      return toast.error("Fill all required fields");
    try {
      await API.post("/api/tasks/", {
        ...form,
        course_id: parseInt(form.course_id),
        duration_mins: parseInt(form.duration_mins)
      });
      toast.success("Task added to planner!");
      setShowModal(false);
      setForm(defaultForm);
      fetchAll();
    } catch { toast.error("Error adding task"); }
  };

  const completeTask = async (id) => {
    const res = await API.patch(`/api/tasks/${id}/complete`);
    toast.success(`✅ Done! Streak: ${res.data.streak} 🔥`);
    fetchAll();
  };

  const deleteTask = async (id) => {
    await API.delete(`/api/tasks/${id}`);
    toast.success("Deleted");
    fetchAll();
  };

  const filtered = tasks.filter(t => filter === "all" ? true : t.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Study Planner</h1>
            <p className="text-gray-500 mt-1">Organize and track your study tasks</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow">
            <Plus size={18} /> Add Task
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {["all", "pending", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {sorted.map(task => {
            const isOverdue = new Date(task.deadline) < new Date() && task.status === "pending";
            return (
              <div key={task.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border flex items-start gap-4 transition ${
                  task.status === "completed" ? "opacity-60" : ""
                } ${isOverdue ? "border-red-200" : "border-gray-100"}`}>
                <button
                  onClick={() => task.status !== "completed" && completeTask(task.id)}
                  className={`mt-0.5 flex-shrink-0 ${
                    task.status === "completed"
                      ? "text-green-500"
                      : "text-gray-300 hover:text-indigo-500"
                  }`}>
                  <CheckCircle size={24} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-gray-800 ${
                      task.status === "completed" ? "line-through" : ""
                    }`}>{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
                      {task.priority}
                    </span>
                    {isOverdue && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <AlertTriangle size={12} /> Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarCheck size={12} />
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {task.duration_mins} min
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)}
                  className="text-gray-300 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <CalendarCheck size={48} className="mx-auto mb-4 opacity-30" />
              <p>No tasks found. Start adding study tasks!</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">New Study Task</h2>
              <div className="space-y-4">
                <input placeholder="Task Title *" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                <textarea placeholder="Description" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={2} />
                <select value={form.course_id}
                  onChange={e => setForm({...form, course_id: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Select Course *</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)} Priority
                      </option>
                    ))}
                  </select>
                  <input type="number" placeholder="Duration (min)" value={form.duration_mins}
                    onChange={e => setForm({...form, duration_mins: e.target.value})}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <input type="datetime-local" value={form.deadline}
                  onChange={e => setForm({...form, deadline: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}