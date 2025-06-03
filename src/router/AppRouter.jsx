import { Route, Routes, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import FloodStatus from "../pages/FloodStatus.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [session]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/flood-status"
        element={
          <PrivateRoute>
            <FloodStatus />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
