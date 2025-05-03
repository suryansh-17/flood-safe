// src/pages/Landing.jsx

import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-start px-4 relative">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-gradient-to-br from-blue-100 to-blue-300 z-50">
        <div className="max-w-6xl mx-auto flex justify-between py-6 px-4">
          <h1 className="text-3xl font-bold justify-end text-blue-800">FloodSafe</h1>
          <nav className="space-x-6">
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Login
            </Link>
            <Link to="/signup" className="text-white bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center mt-40 mx-4">
  <h2 className="text-5xl font-extrabold text-blue-800 mb-6 px-4">
    Stay Safe from Floods with FloodSafe
  </h2>
  <p className="text-lg text-blue-700 mb-10 px-4">
    Report floods, seek help instantly, and access live updates and SOS alerts.
  </p>
  <Link
    to="/signup"
    className="bg-blue-700 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-800 transition"
  >
    Get Started
  </Link>
</main>


      {/* Footer */}
      <footer className="absolute bottom-4 text-blue-700 text-sm">
        © {new Date().getFullYear()} FloodSafe. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
