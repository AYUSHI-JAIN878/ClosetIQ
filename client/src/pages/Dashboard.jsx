import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Shirt,
  Heart,
  CalendarDays,
  Plus,
  ArrowRight,
  CloudSun,
  Package,
  ChevronRight,
  MoreHorizontal,
  LogOut,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userName = user?.name || "User";
  const firstName = userName.split(" ")[0];

  return (
    <div className="dashboard-page">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand">
          <span className="brand-icon">
            <Sparkles size={17} />
          </span>

          <span>ClosetIQ</span>
        </Link>

        <div className="sidebar-section">
          <p className="sidebar-label">MENU</p>

          <Link
            to="/dashboard"
            className="sidebar-link active"
          >
            <Sparkles size={18} />
            Dashboard
          </Link>

          <Link
            to="/closet"
            className="sidebar-link"
          >
            <Shirt size={18} />
            My Closet
          </Link>

          <Link
            to="/outfits"
            className="sidebar-link"
          >
            <Sparkles size={18} />
            Outfit Ideas
          </Link>

          <Link
            to="/favorites"
            className="sidebar-link"
          >
            <Heart size={18} />
            Favorites
          </Link>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">PLAN</p>

          <Link
            to="/calendar"
            className="sidebar-link"
          >
            <CalendarDays size={18} />
            Outfit Calendar
          </Link>

          <Link
            to="/packing"
            className="sidebar-link"
          >
            <Package size={18} />
            Packing Planner
          </Link>
        </div>

        {/* SIDEBAR PROFILE */}
        <div className="sidebar-bottom">
          <Link
            to="/profile"
            className="sidebar-profile"
          >
            <div className="profile-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-profile-info">
              <strong>{userName}</strong>
              <span>My Profile</span>
            </div>

            <ChevronRight size={16} />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              YOUR PERSONAL WARDROBE
            </p>

            <h1>
              Good morning, <span>{firstName}.</span>
            </h1>

            <p className="dashboard-subtitle">
              Let's find something you'll love wearing today.
            </p>
          </div>

          <div className="dashboard-header-actions">
            {/* PROFILE */}
            <Link
              to="/profile"
              className="dashboard-profile-button"
              title="My Profile"
            >
              <User size={17} />
              <span>{firstName}</span>
            </Link>

            {/* TOP LOGOUT */}
            <button
              type="button"
              className="dashboard-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>

            <button
              type="button"
              className="notification-button"
              aria-label="ClosetIQ assistant"
            >
              <Sparkles size={17} />
            </button>

            <Link
              to="/add-clothing"
              className="dashboard-add-button"
            >
              <Plus size={17} />
              Add clothing
            </Link>
          </div>
        </header>

        {/* WEATHER + AI */}
        <section className="dashboard-highlight-grid">
          <div className="weather-card">
            <div className="weather-top">
              <div>
                <p>Today's weather</p>

                <h2>28°</h2>

                <span>Partly cloudy</span>
              </div>

              <div className="weather-icon">
                <CloudSun size={34} />
              </div>
            </div>

            <div className="weather-bottom">
              <span>
                Comfortable for light layers
              </span>

              <span>Gwalior</span>
            </div>
          </div>

          <div className="ai-dashboard-card">
            <div className="ai-dashboard-icon">
              <Sparkles size={20} />
            </div>

            <div className="ai-dashboard-content">
              <p className="dashboard-card-label">
                AI STYLE ASSISTANT
              </p>

              <h2>
                What should I wear today?
              </h2>

              <p>
                Tell ClosetIQ your occasion and we'll
                create an outfit using pieces already
                in your wardrobe.
              </p>

              <Link
                to="/outfits"
                className="ai-action"
              >
                Get outfit suggestion
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="stat-card-icon purple">
              <Shirt size={19} />
            </div>

            <div>
              <span>Total clothing</span>
              <strong>0</strong>
            </div>

            <MoreHorizontal size={17} />
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-icon pink">
              <Sparkles size={19} />
            </div>

            <div>
              <span>Outfit ideas</span>
              <strong>0</strong>
            </div>

            <MoreHorizontal size={17} />
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-icon rose">
              <Heart size={19} />
            </div>

            <div>
              <span>Favorites</span>
              <strong>0</strong>
            </div>

            <MoreHorizontal size={17} />
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-card-icon lavender">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>Planned outfits</span>
              <strong>0</strong>
            </div>

            <MoreHorizontal size={17} />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">
                GET STARTED
              </p>

              <h2>
                Build your digital closet
              </h2>
            </div>

            <Link
              to="/closet"
              className="section-link"
            >
              View closet
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="quick-actions-grid">
            <Link
              to="/add-clothing"
              className="quick-action-card"
            >
              <div className="quick-action-icon purple-bg">
                <Plus size={21} />
              </div>

              <div>
                <h3>
                  Add your first clothing
                </h3>

                <p>
                  Upload a piece and start building
                  your wardrobe.
                </p>
              </div>

              <ArrowRight size={17} />
            </Link>

            <Link
              to="/outfits"
              className="quick-action-card"
            >
              <div className="quick-action-icon pink-bg">
                <Sparkles size={21} />
              </div>

              <div>
                <h3>
                  Create an outfit
                </h3>

                <p>
                  Mix and match your wardrobe with
                  smart suggestions.
                </p>
              </div>

              <ArrowRight size={17} />
            </Link>

            <Link
              to="/calendar"
              className="quick-action-card"
            >
              <div className="quick-action-icon rose-bg">
                <CalendarDays size={21} />
              </div>

              <div>
                <h3>
                  Plan your week
                </h3>

                <p>
                  Organize your looks before the week
                  begins.
                </p>
              </div>

              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* EMPTY CLOSET */}
        <section className="dashboard-empty-section">
          <div className="empty-wardrobe-visual">
            <div className="empty-shirt">
              <Shirt
                size={43}
                strokeWidth={1.3}
              />
            </div>

            <div className="empty-sparkle sparkle-one">
              ✦
            </div>

            <div className="empty-sparkle sparkle-two">
              ✦
            </div>
          </div>

          <div className="empty-wardrobe-content">
            <p className="dashboard-eyebrow">
              YOUR CLOSET
            </p>

            <h2>
              Your wardrobe is still empty.
            </h2>

            <p>
              Add your clothes to let ClosetIQ
              understand your style and create
              personalized outfit combinations from
              pieces you already own.
            </p>

            <Link
              to="/add-clothing"
              className="primary-button"
            >
              Add clothing
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}