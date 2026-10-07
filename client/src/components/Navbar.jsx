import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">
          <Sparkles size={17} />
        </span>
        <span>ClosetIQ</span>
      </Link>

      <nav className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
      </nav>

      <div className="nav-actions">
        <Link to="/login" className="login-link">
          Login
        </Link>

        <Link to="/register" className="nav-button">
          Get Started
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}