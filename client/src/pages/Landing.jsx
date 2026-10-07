import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  CalendarDays,
  CloudSun,
  Heart,
  WandSparkles,
  Check,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Shirt,
      title: "Digital Closet",
      text: "Keep all your clothes organized in one beautiful digital wardrobe.",
    },
    {
      icon: WandSparkles,
      title: "AI Outfit Ideas",
      text: "Get outfit combinations based on the clothes you already own.",
    },
    {
      icon: CloudSun,
      title: "Weather Ready",
      text: "Plan outfits that match the weather and your day's plans.",
    },
    {
      icon: CalendarDays,
      title: "Outfit Calendar",
      text: "Plan your looks ahead and keep track of what you wear.",
    },
    {
      icon: Heart,
      title: "Favourite Looks",
      text: "Save your favourite combinations and find them whenever you need.",
    },
    {
      icon: Sparkles,
      title: "Smart Suggestions",
      text: "Tell ClosetIQ the occasion and let it help you decide what to wear.",
    },
  ];

  return (
    <div className="landing-page">
      <Navbar />

      {/* HERO */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={15} />
            Your wardrobe, reimagined
          </div>

          <h1>
            Dress smarter.
            <br />
            <span>Feel effortless.</span>
          </h1>

          <p className="hero-description">
            ClosetIQ turns your everyday wardrobe into a smart digital closet.
            Organize your clothes, discover new combinations and get
            personalized outfit ideas in seconds.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-button">
              Build My Closet
              <ArrowRight size={18} />
            </Link>

            <a href="#how-it-works" className="secondary-button">
              Explore ClosetIQ
            </a>
          </div>

          <div className="hero-note">
            <Check size={15} />
            <span>Designed around the clothes you already own</span>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">
          <div className="glow glow-one"></div>
          <div className="glow glow-two"></div>

          <div className="wardrobe-card">
            <div className="card-top">
              <div>
                <p className="small-label">MY WARDROBE</p>
                <h3>Today's possibilities</h3>
              </div>

              <div className="mini-sparkle">
                <Sparkles size={16} />
              </div>
            </div>

            <div className="clothing-grid">
              <div className="clothing-item item-one">
                <span>TOP</span>
                <div className="shirt-shape"></div>
              </div>

              <div className="clothing-item item-two">
                <span>BOTTOM</span>
                <div className="pants-shape"></div>
              </div>

              <div className="clothing-item item-three">
                <span>SHOES</span>
                <div className="shoe-shape"></div>
              </div>

              <div className="clothing-item item-four">
                <span>ACCESSORY</span>
                <div className="bag-shape"></div>
              </div>
            </div>

            <div className="suggestion-card">
              <div className="suggestion-icon">
                <WandSparkles size={17} />
              </div>

              <div>
                <p>AI suggestion</p>
                <strong>Perfect for college</strong>
              </div>

              <ArrowRight size={17} />
            </div>
          </div>

          <div className="floating-card floating-weather">
            <CloudSun size={18} />
            <div>
              <strong>24°</strong>
              <span>Comfortable</span>
            </div>
          </div>

          <div className="floating-card floating-look">
            <Heart size={17} fill="currentColor" />
            <span>12 favourite looks</span>
          </div>
        </div>
      </main>

      {/* STATS */}
      <section className="stats-section">
        <div>
          <strong>01</strong>
          <span>Digital wardrobe</span>
        </div>

        <div>
          <strong>∞</strong>
          <span>Outfit combinations</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>Style assistant</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <div className="eyebrow">
            <Sparkles size={15} />
            Everything in one place
          </div>

          <h2>
            Your wardrobe has
            <br />
            <span>more possibilities.</span>
          </h2>

          <p>
            ClosetIQ helps you organize, discover and plan without making your
            wardrobe complicated.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div className="feature-card" key={feature.title}>
                <div className="feature-number">
                  0{index + 1}
                </div>

                <div className="feature-icon">
                  <Icon size={21} />
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="how-visual">
          <div className="how-card">
            <span className="how-label">YOUR CLOSET</span>

            <div className="mini-clothes">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div className="ai-bubble">
              <Sparkles size={16} />
              <span>Creating your look...</span>
            </div>
          </div>
        </div>

        <div className="how-content">
          <div className="eyebrow">
            <Sparkles size={15} />
            Simple by design
          </div>

          <h2>
            From clothes
            <br />
            <span>to complete looks.</span>
          </h2>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <div>
                <h3>Upload your clothes</h3>
                <p>
                  Add photos of your tops, bottoms, dresses, shoes and
                  accessories.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <div>
                <h3>Build your closet</h3>
                <p>
                  ClosetIQ organizes everything so your wardrobe becomes easy
                  to explore.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <div>
                <h3>Discover your look</h3>
                <p>
                  Choose an occasion and let ClosetIQ suggest combinations
                  using your own clothes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <Sparkles size={25} />

          <h2>
            Your closet is full
            <br />
            <span>of possibilities.</span>
          </h2>

          <p>
            Start building your digital wardrobe and make getting dressed a
            little easier.
          </p>

          <Link to="/register" className="primary-button">
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-icon">
              <Sparkles size={16} />
            </span>
            ClosetIQ
          </div>

          <p>Your wardrobe. Smarter.</p>
        </div>

        <div className="footer-right">
          © 2026 ClosetIQ. Built with curiosity & creativity.
        </div>
      </footer>
    </div>
  );
}