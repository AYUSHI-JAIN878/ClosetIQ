import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    /* =========================
       VALIDATION
    ========================= */

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
        AuthContext handles:
        - API request
        - token storage
        - user storage
        - setUser()
      */

      const response = await login(
        email,
        password
      );

      /*
        Login is successful if AuthContext
        returns a token and user.
      */

      if (
        response?.token &&
        response?.user
      ) {
        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      /*
        Some backend responses may use
        success: true.
      */

      if (response?.success) {
        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      setError(
        response?.message ||
          "Invalid email or password."
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}

      <div className="auth-background auth-background-one"></div>

      <div className="auth-background auth-background-two"></div>

      {/* Brand */}

      <Link
        to="/"
        className="auth-brand"
      >
        <span className="brand-icon">
          <Sparkles size={16} />
        </span>

        <span>ClosetIQ</span>
      </Link>

      {/* Main */}

      <div className="auth-container">
        <div className="auth-card">

          {/* Heading */}

          <div className="auth-heading">
            <div className="auth-icon">
              <Sparkles size={20} />
            </div>

            <p className="auth-eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Good to see you.
            </h1>

            <p>
              Sign in to your digital wardrobe
              and discover what you can wear
              today.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* Email */}

            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}

            <div className="form-group">

              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password reset will be available soon."
                    )
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="spin"
                  />

                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight
                    size={17}
                  />
                </>
              )}
            </button>

          </form>

          {/* Divider */}

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Register */}

          <p className="auth-switch">
            Don't have a ClosetIQ account?{" "}

            <Link to="/register">
              Create one
            </Link>
          </p>

        </div>

        <p className="auth-footer-text">
          Your wardrobe. Smarter. ✦
        </p>
      </div>
    </div>
  );
}