 import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Trophy, Flame } from "lucide-react";

export default function Profile() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/api/progress/stats").then(res => setStats(res.data));
  }, []);

  if (!stats) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-indigo-500 text-xl">
        Loading...
      </div>
    </div>
  );

  const pieData = [
    { name: "Completed", value: stats.completed, color: "#6366f1" },
    { name: "Pending", value: stats.pending, color: "#e5e7eb" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Progress & Analytics</h1>
        <p className="text-gray-500 mb-8">Track your learning performance</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Productivity Score */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Productivity Score</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="#e5e7eb" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="#6366f1" strokeWidth="12"
                    strokeDasharray={`${stats.productivity * 2.51} ${251 - stats.productivity * 2.51}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-indigo-600">
                    {stats.productivity}%
                  </span>
                  <span className="text-gray-400 text-sm">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Task Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course wise Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-5">Course-wise Progress</h2>
          <div className="space-y-4">
            {stats.course_stats.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{c.course}</span>
                  <span className="text-gray-400">
                    {c.completed}/{c.total} tasks · {c.score}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${c.score}%`, backgroundColor: c.color }} />
                </div>
                {c.score < 50 && c.total > 0 && (
                  <p className="text-xs text-red-400 mt-1">⚠️ Needs more attention</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Study Streak</h2>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-2xl px-6 py-4 flex items-center gap-3">
              <Flame size={28} />
              <div>
                <p className="text-sm opacity-80">Current Streak</p>
                <p className="text-3xl font-bold">{stats.streak} Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {stats.badges?.filter(Boolean).length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">🏅 Earned Badges</h2>
            <div className="flex flex-wrap gap-3">
              {stats.badges.filter(Boolean).map((badge, i) => (
                <div key={i}
                  className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-xl font-semibold">
                  <Trophy size={16} /> {badge}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}