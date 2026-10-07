import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Closet from "./pages/Closet";
import AddClothing from "./pages/AddClothing";
import Outfits from "./pages/Outfits";
import Favorites from "./pages/Favorites";
import Calendar from "./pages/Calendar";
import Packing from "./pages/Packing";
import Laundry from "./pages/Laundry";
import Profile from "./pages/Profile";

import { useAuth } from "./context/AuthContext";

import "./App.css";

function LoadingScreen() {
  return (
    <div className="route-loading">
      <div className="route-loading-spinner"></div>
      <p>Loading ClosetIQ...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Landing Page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Closet */}
        <Route
          path="/closet"
          element={
            <ProtectedRoute>
              <Closet />
            </ProtectedRoute>
          }
        />

        {/* Add Clothing */}
        <Route
          path="/add-clothing"
          element={
            <ProtectedRoute>
              <AddClothing />
            </ProtectedRoute>
          }
        />

        {/* AI Outfits */}
        <Route
          path="/outfits"
          element={
            <ProtectedRoute>
              <Outfits />
            </ProtectedRoute>
          }
        />

        {/* Favorites */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        {/* Calendar */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        {/* Packing Planner */}
        <Route
          path="/packing"
          element={
            <ProtectedRoute>
              <Packing />
            </ProtectedRoute>
          }
        />

        {/* Laundry */}
        <Route
          path="/laundry"
          element={
            <ProtectedRoute>
              <Laundry />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}