import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { session, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto relative">
        <button
          onClick={signOut}
          className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Sign Out
        </button>
        <div className="bg-white shadow rounded-lg p-8 mt-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to FloodSafe
          </h1>
          <p className="text-lg text-gray-600">
            You are logged in as:{" "}
            <span className="font-semibold">{session?.user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
