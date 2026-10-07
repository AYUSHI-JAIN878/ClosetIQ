import { Link } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  Mail,
  Shirt,
  Sparkles,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } =
    useAuth();

  return (
    <div className="profile-page">
      <header className="simple-page-topbar">
        <Link
          to="/dashboard"
          className="simple-page-brand"
        >
          <span>
            <Sparkles size={16} />
          </span>
          ClosetIQ
        </Link>

        <Link
          to="/dashboard"
          className="simple-page-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </header>

      <main className="profile-main">
        <section className="profile-hero">
          <div className="profile-avatar-large">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || (
              <User size={30} />
            )}
          </div>

          <div>
            <p>
              CLOSETIQ PROFILE
            </p>

            <h1>
              {user?.name || "User"}
            </h1>

            <span>
              Your personal wardrobe space
            </span>
          </div>
        </section>

        <section className="profile-layout">
          <div className="profile-card">
            <div className="profile-card-heading">
              <div>
                <span>
                  <User size={17} />
                </span>

                <div>
                  <h2>
                    Personal information
                  </h2>

                  <p>
                    Your account details
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <span>
                  <User size={16} />
                </span>

                <div>
                  <label>
                    Full name
                  </label>

                  <strong>
                    {user?.name ||
                      "Not available"}
                  </strong>
                </div>
              </div>

              <div className="profile-field">
                <span>
                  <Mail size={16} />
                </span>

                <div>
                  <label>
                    Email address
                  </label>

                  <strong>
                    {user?.email ||
                      "Not available"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-side-card">
            <div className="profile-side-icon">
              <Shirt size={22} />
            </div>

            <h3>
              Your digital wardrobe
            </h3>

            <p>
              Manage your clothes, discover
              AI-powered outfits and plan
              what to wear with ClosetIQ.
            </p>

            <Link to="/closet">
              Open My Closet
            </Link>
          </div>
        </section>

        <section className="profile-logout-card">
          <div>
            <h3>
              Sign out of ClosetIQ
            </h3>

            <p>
              You can log back in anytime
              using your account.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </section>
      </main>
    </div>
  );
}