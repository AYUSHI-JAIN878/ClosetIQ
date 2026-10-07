import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Heart,
  Loader2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import api from "../services/api";

const occasions = [
  "College",
  "Casual",
  "Party",
  "Formal",
];

export default function Outfits() {
  const [occasion, setOccasion] = useState("College");
  const [weather, setWeather] = useState("28°C");

  const [outfit, setOutfit] = useState(null);
  const [savedOutfits, setSavedOutfits] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadSavedOutfits();
  }, []);

  const loadSavedOutfits = async () => {
    try {
      const response = await api.get("/outfits");

      if (response.success) {
        setSavedOutfits(response.outfits || []);
      }
    } catch (error) {
      console.error("Saved outfits error:", error);
    }
  };

  const cleanAIResponse = (text) => {
    if (!text) return null;

    try {
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "AI JSON parsing error:",
        error
      );

      return null;
    }
  };

  const generateOutfit = async () => {
    try {
      setLoading(true);
      setError("");
      setOutfit(null);

      const response = await api.post(
        "/outfits/ai/suggest",
        {
          occasion,
          weather,
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to generate outfit."
        );
      }

      const result = cleanAIResponse(
        response.result
      );

      if (!result) {
        throw new Error(
          "AI returned an unexpected response. Please try again."
        );
      }

      setOutfit(result);
    } catch (error) {
      console.error("Generate outfit error:", error);

      setError(
        error.message ||
          "Unable to generate your outfit."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async () => {
    if (!outfit?.items?.length) return;

    try {
      setSaving(true);
      setError("");

      const response = await api.post(
        "/outfits",
        {
          title:
            outfit.title ||
            `${occasion} Outfit`,
          items: outfit.items.map(
            (item) => item.id
          ),
          occasion,
          reason: outfit.reason || "",
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to save outfit."
        );
      }

      await loadSavedOutfits();
    } catch (error) {
      console.error("Save outfit error:", error);

      setError(
        error.message ||
          "Unable to save outfit."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="outfits-page">
      <header className="outfits-topbar">
        <Link
          to="/dashboard"
          className="outfits-brand"
        >
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>

          <span>ClosetIQ</span>
        </Link>

        <Link
          to="/dashboard"
          className="outfits-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </header>

      <main className="outfits-main">
        <section className="outfits-hero">
          <div>
            <p className="outfits-eyebrow">
              AI STYLE STUDIO
            </p>

            <h1>
              Let AI style
              <br />
              your wardrobe.
            </h1>

            <p>
              Tell ClosetIQ where you're going,
              and we'll create a look using
              clothes you already own.
            </p>
          </div>

          <div className="outfits-hero-icon">
            <WandSparkles size={34} />
          </div>
        </section>

        <section className="outfit-builder">
          <div className="builder-heading">
            <div>
              <span className="builder-icon">
                <Sparkles size={17} />
              </span>

              <div>
                <h2>
                  What are you dressing for?
                </h2>

                <p>
                  Choose an occasion and let AI
                  do the styling.
                </p>
              </div>
            </div>
          </div>

          <div className="occasion-options">
            {occasions.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  occasion === item
                    ? "occasion-button active"
                    : "occasion-button"
                }
                onClick={() =>
                  setOccasion(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

          <div className="weather-row">
            <div className="weather-field">
              <CalendarDays size={17} />

              <div>
                <span>Today's weather</span>

                <input
                  value={weather}
                  onChange={(e) =>
                    setWeather(e.target.value)
                  }
                  placeholder="e.g. 28°C"
                />
              </div>
            </div>

            <button
              type="button"
              className="generate-button"
              onClick={generateOutfit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />
                  Styling...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Suggest My Outfit
                </>
              )}
            </button>
          </div>
        </section>

        {error && (
          <div className="outfits-error">
            {error}
          </div>
        )}

        {outfit && (
          <section className="ai-result">
            <div className="ai-result-header">
              <div>
                <span className="result-label">
                  ✦ AI'S PICK
                </span>

                <h2>
                  {outfit.title ||
                    "Your Perfect Look"}
                </h2>
              </div>

              <div className="result-sparkle">
                <Sparkles size={19} />
              </div>
            </div>

            <div className="ai-items">
              {outfit.items?.map((item) => (
                <div
                  className="ai-item"
                  key={item.id}
                >
                  <div className="ai-item-icon">
                    <Sparkles size={15} />
                  </div>

                  <div>
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.category}
                    </span>
                  </div>

                  <Check
                    size={17}
                    className="item-check"
                  />
                </div>
              ))}
            </div>

            {outfit.reason && (
              <div className="ai-reason">
                <span>Why it works</span>

                <p>{outfit.reason}</p>
              </div>
            )}

            <div className="result-actions">
              <button
                type="button"
                className="save-outfit-button"
                onClick={saveOutfit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart size={17} />
                    Save Outfit
                  </>
                )}
              </button>

              <button
                type="button"
                className="try-again-button"
                onClick={generateOutfit}
                disabled={loading}
              >
                <WandSparkles size={17} />
                Try Another
              </button>
            </div>
          </section>
        )}

        {!outfit && !loading && (
          <section className="outfit-empty">
            <div className="empty-ai-icon">
              <Sparkles size={24} />
            </div>

            <h3>
              Your next outfit is one click away.
            </h3>

            <p>
              ClosetIQ will combine pieces from
              your own wardrobe into a complete
              look.
            </p>
          </section>
        )}

        {savedOutfits.length > 0 && (
          <section className="saved-outfits">
            <div className="saved-heading">
              <div>
                <p>YOUR COLLECTION</p>
                <h2>Saved outfits</h2>
              </div>

              <span>
                {savedOutfits.length} saved
              </span>
            </div>

            <div className="saved-grid">
              {savedOutfits.map((saved) => (
                <article
                  className="saved-card"
                  key={saved._id}
                >
                  <div className="saved-card-top">
                    <span>
                      {saved.occasion ||
                        "Casual"}
                    </span>

                    <Heart
                      size={16}
                      fill="currentColor"
                    />
                  </div>

                  <h3>{saved.title}</h3>

                  <div className="saved-items">
                    {saved.items
                      ?.slice(0, 4)
                      .map((item) => (
                        <span
                          key={item._id}
                        >
                          {item.name}
                        </span>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}