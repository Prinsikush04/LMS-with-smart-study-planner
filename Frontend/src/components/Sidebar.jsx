import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, BookOpen, CalendarCheck, BarChart2, ShieldCheck, LogOut, Flame } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/planner", label: "Study Planner", icon: CalendarCheck },
  { to: "/progress", label: "Progress", icon: BarChart2 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white flex flex-col p-5 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">📚 StudySmart</h1>
        <p className="text-indigo-300 text-xs mt-1">Learning Platform</p>
      </div>

      <div className="bg-indigo-800/50 rounded-xl p-3 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center font-bold text-lg">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{user?.name}</p>
          <div className="flex items-center gap-1 text-orange-300 text-xs">
            <Flame size={12} /> <span>{user?.streak} day streak</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              location.pathname === to
                ? "bg-white text-indigo-900 shadow-md"
                : "text-indigo-200 hover:bg-indigo-800/60"
            }`}>
            <Icon size={18} /> {label}
          </Link>
        ))}
        {user?.role === "admin" && (
          <Link to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              location.pathname === "/admin" ? "bg-white text-indigo-900 shadow-md" : "text-indigo-200 hover:bg-indigo-800/60"
            }`}>
            <ShieldCheck size={18} /> Admin Panel
          </Link>
        )}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 transition text-sm mt-4">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}