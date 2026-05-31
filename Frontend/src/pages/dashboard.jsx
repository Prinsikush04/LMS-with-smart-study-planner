
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import API from "../services/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Flame, Trophy, TrendingUp, CheckCircle2, Clock, BookOpen } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/api/progress/stats").then(res => setStats(res.data));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
            Good day, {user?.name} 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            Here's your learning overview
          </p>
        </div>

        {/* Streak Card */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "12px",
          backgroundColor: "white", border: "1.5px solid #e5e7eb",
          borderRadius: "14px", padding: "14px 24px",
          marginBottom: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            backgroundColor: "#fff7ed", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <Flame size={20} color="#f97316" />
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px" }}>Current Streak</p>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>
              {user?.streak} Days 🔥
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        {stats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "28px"
          }}>
            {[
              { label: "Productivity", value: `${stats.productivity}%`, icon: TrendingUp, bg: "#eff6ff", iconColor: "#3b82f6" },
              { label: "Completed Tasks", value: stats.completed, icon: CheckCircle2, bg: "#f0fdf4", iconColor: "#22c55e" },
              { label: "Pending Tasks", value: stats.pending, icon: Clock, bg: "#fff7ed", iconColor: "#f97316" },
              { label: "Courses", value: stats.course_stats?.length, icon: BookOpen, bg: "#faf5ff", iconColor: "#a855f7" },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: "white",
                border: "1.5px solid #e5e7eb",
                borderRadius: "14px",
                padding: "20px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{card.label}</p>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "9px",
                    backgroundColor: card.bg,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <card.icon size={18} color={card.iconColor} />
                  </div>
                </div>
                <p style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Course Progress */}
        {stats?.course_stats?.length > 0 && (
          <div style={{
            backgroundColor: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 20px" }}>
              📊 Course Progress
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.course_stats} barSize={36}>
                <XAxis dataKey="course" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val) => `${val}%`}
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {stats.course_stats.map((entry, i) => (
                    <Cell key={i} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Weak Subject */}
            {stats.course_stats.some(c => c.score < 50 && c.total > 0) && (
              <div style={{
                marginTop: "16px", backgroundColor: "#fef2f2",
                border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px"
              }}>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#dc2626", margin: "0 0 4px" }}>
                  ⚠️ Weak Subjects Detected
                </p>
                <p style={{ fontSize: "13px", color: "#ef4444", margin: 0 }}>
                  {stats.course_stats.filter(c => c.score < 50 && c.total > 0).map(c => c.course).join(", ")} — needs more attention!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        {stats?.badges?.filter(Boolean).length > 0 && (
          <div style={{
            backgroundColor: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 16px" }}>
              🏅 Earned Badges
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {stats.badges.filter(Boolean).map((badge, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  backgroundColor: "#fefce8", border: "1px solid #fde68a",
                  color: "#92400e", padding: "8px 14px",
                  borderRadius: "10px", fontSize: "13px", fontWeight: "600"
                }}>
                  <Trophy size={14} /> {badge}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}