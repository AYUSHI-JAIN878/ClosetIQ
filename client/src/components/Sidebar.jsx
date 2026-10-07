import {
  CalendarDays,
  ChevronRight,
  Heart,
  Home,
  LogOut,
  Package,
  Shirt,
  Sparkles,
  User,
  WashingMachine,
  WandSparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "My Closet",
    path: "/closet",
    icon: Shirt,
  },
  {
    label: "AI Outfits",
    path: "/outfits",
    icon: WandSparkles,
  },
  {
    label: "Favorites",
    path: "/favorites",
    icon: Heart,
  },
];

const planning = [
  {
    label: "Outfit Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Packing Planner",
    path: "/packing",
    icon: Package,
  },
  {
    label: "Laundry",
    path: "/laundry",
    icon: WashingMachine,
  },
];

export default function Sidebar() {
  const { user, logout } =
    useAuth();

  return (
    <aside className="app-sidebar">
      {/* BRAND */}
      <NavLink
        to="/dashboard"
        className="sidebar-brand"
      >
        <span className="sidebar-brand-icon">
          <Sparkles size={17} />
        </span>

        <span>ClosetIQ</span>
      </NavLink>

      {/* USER */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.name
            ?.charAt(0)
            ?.toUpperCase() || (
            <User size={17} />
          )}
        </div>

        <div className="sidebar-user-info">
          <strong>
            {user?.name || "User"}
          </strong>

          <span>
            My wardrobe
          </span>
        </div>

        <ChevronRight size={15} />
      </div>

      {/* MAIN NAV */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">
          WORKSPACE
        </p>

        <nav className="sidebar-nav">
          {navigation.map(
            (item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>
      </div>

      {/* PLANNING */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">
          PLAN & ORGANIZE
        </p>

        <nav className="sidebar-nav">
          {planning.map(
            (item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>
      </div>

      {/* AI CARD */}
      <div className="sidebar-ai-card">
        <div className="sidebar-ai-icon">
          <Sparkles size={16} />
        </div>

        <div>
          <strong>
            AI Stylist
          </strong>

          <p>
            Create a look from
            your closet.
          </p>
        </div>

        <NavLink
          to="/outfits"
          className="sidebar-ai-link"
        >
          Try it
        </NavLink>
      </div>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <NavLink
          to="/profile"
          className="sidebar-link"
        >
          <User size={18} />

          <span>
            Profile
          </span>
        </NavLink>

      </div>
    </aside>
  );
}