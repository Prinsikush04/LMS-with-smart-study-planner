import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Smart LMS</h1>

      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/planner">Planner</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

 