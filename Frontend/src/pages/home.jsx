import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />

      <section className="bg-blue-100 min-h-screen flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-5xl font-bold text-blue-700 mb-6">
          Learn Smarter with Smart Study Planner
        </h1>

        <p className="text-xl text-gray-700 max-w-2xl">
          Manage your courses, track progress, and generate personalized
          study plans.
        </p>

        <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
          Start Learning
        </button>
      </section>
 <section className="py-20 px-10 grid md:grid-cols-3 gap-8">
        <div className="shadow-lg p-8 rounded-xl bg-white">
          <h2 className="text-2xl font-bold mb-4">Smart Planner</h2>
          <p>Create automatic study schedules.</p>
        </div>

        <div className="shadow-lg p-8 rounded-xl bg-white">
          <h2 className="text-2xl font-bold mb-4">Track Progress</h2>
          <p>Monitor daily learning performance.</p>
        </div>

        <div className="shadow-lg p-8 rounded-xl bg-white">
          <h2 className="text-2xl font-bold mb-4">Online Courses</h2>
          <p>Access premium learning materials.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}