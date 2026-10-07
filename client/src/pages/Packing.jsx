import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Loader2,
  MapPin,
  Sparkles,
  CalendarDays,
  Shirt,
  X,
} from "lucide-react";

import api from "../services/api";

const occasions = [
  "Mixed",
  "College",
  "Casual",
  "Party",
  "Formal",
];

/* -----------------------------
   CLEAN AI TEXT
----------------------------- */

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
};

/* -----------------------------
   CLEAN AI JSON
----------------------------- */

const parseAIResponse = (value) => {
  if (!value) {
    throw new Error("AI returned an empty packing plan.");
  }

  if (typeof value === "object") {
    return value;
  }

  let cleaned = String(value)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Remove accidental HTML surrounding the JSON
  cleaned = cleaned
    .replace(/^<[^>]+>/, "")
    .replace(/<\/[^>]+>$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid AI JSON:", cleaned);
    throw new Error(
      "AI returned an invalid packing plan. Please try again."
    );
  }
};

export default function Packing() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [occasion, setOccasion] = useState("Mixed");

  const [packingPlan, setPackingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [savedItems, setSavedItems] = useState([]);

  /* -----------------------------
     GENERATE PACKING PLAN
  ----------------------------- */

  const generatePackingPlan = async () => {
    if (!destination.trim()) {
      setError("Please enter your destination.");
      return;
    }

    if (!days || Number(days) < 1) {
      setError("Please enter a valid number of days.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPackingPlan(null);
      setSavedItems([]);

      const response = await api.post("/outfits/ai/packing", {
        destination: destination.trim(),
        days: Number(days),
        occasion,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to create packing plan."
        );
      }

      const result = parseAIResponse(response.result);

      /* -----------------------------
         NORMALIZE AI RESPONSE
      ----------------------------- */

      const normalizedPlan = {
        title: cleanText(
          result.title || "Your trip wardrobe"
        ),

        reason: cleanText(
          result.reason || ""
        ),

        items: Array.isArray(result.items)
          ? result.items.map((item, index) => ({
              id:
                item.id ||
                item._id ||
                item.clothingId ||
                index,

              name: cleanText(
                item.name ||
                  item.itemName ||
                  item.title ||
                  "Wardrobe item"
              ),

              category: cleanText(
                item.category ||
                  item.type ||
                  "Clothing"
              ),

              quantity:
                Number(item.quantity) > 0
                  ? Number(item.quantity)
                  : 1,
            }))
          : [],
      };

      setPackingPlan(normalizedPlan);
    } catch (error) {
      console.error("Packing planner error:", error);

      setError(
        error?.message ||
          "Unable to create packing plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     TOGGLE ITEM
  ----------------------------- */

  const toggleItem = (itemId) => {
    setSavedItems((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId]
    );
  };

  /* -----------------------------
     CLEAR PLAN
  ----------------------------- */

  const clearPlan = () => {
    setPackingPlan(null);
    setSavedItems([]);
    setError("");
  };

  /* -----------------------------
     TOTAL ITEMS
  ----------------------------- */

  const totalItems =
    packingPlan?.items?.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    ) || 0;

  return (
    <div className="packing-page">
      {/* =========================
          TOP BAR
      ========================== */}

      <header className="packing-topbar">
        <Link
          to="/dashboard"
          className="packing-brand"
        >
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>

          <span>ClosetIQ</span>
        </Link>

        <Link
          to="/dashboard"
          className="packing-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </header>

      <main className="packing-main">
        {/* =========================
            HERO
        ========================== */}

        <section className="packing-hero">
          <div>
            <p className="packing-eyebrow">
              SMART PACKING
            </p>

            <h1>
              Pack less.
              <br />
              <span>Style more.</span>
            </h1>

            <p className="packing-description">
              Tell ClosetIQ where you're going
              and for how long. AI will create
              a practical packing list using
              clothes already in your closet.
            </p>
          </div>

          <div className="packing-hero-icon">
            <BriefcaseBusiness size={42} />
          </div>
        </section>

        {/* =========================
            FORM + VISUAL
        ========================== */}

        <div className="packing-layout">
          {/* FORM */}

          <section className="packing-form-card">
            <div className="packing-card-heading">
              <div className="packing-heading-icon">
                <MapPin size={19} />
              </div>

              <div>
                <p>TRIP DETAILS</p>
                <h2>Where are you going?</h2>
              </div>
            </div>

            {/* Destination */}

            <div className="packing-field">
              <label>Destination</label>

              <div className="packing-input-wrap">
                <MapPin size={17} />

                <input
                  type="text"
                  value={destination}
                  onChange={(e) =>
                    setDestination(e.target.value)
                  }
                  placeholder="e.g. Mumbai, Goa, Delhi..."
                />
              </div>
            </div>

            {/* Days */}

            <div className="packing-field">
              <label>How many days?</label>

              <div className="days-input-wrap">
                <CalendarDays size={17} />

                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) =>
                    setDays(e.target.value)
                  }
                />

                <span>days</span>
              </div>
            </div>

            {/* Occasion */}

            <div className="packing-field">
              <label>Trip type</label>

              <div className="packing-occasions">
                {occasions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      occasion === item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setOccasion(item)
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}

            <button
              type="button"
              className="packing-generate-button"
              onClick={generatePackingPlan}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  Creating packing list...
                </>
              ) : (
                <>
                  <Sparkles size={18} />

                  Create AI Packing Plan
                </>
              )}
            </button>

            {/* Error */}

            {error && (
              <div className="packing-error">
                {cleanText(error)}
              </div>
            )}

            {/* Tip */}

            <div className="packing-tip">
              <Sparkles size={16} />

              <p>
                ClosetIQ only recommends
                clothing that you've already
                added to your wardrobe.
              </p>
            </div>
          </section>

          {/* =========================
              VISUAL
          ========================== */}

          <section className="packing-visual-card">
            <div className="visual-circle visual-one"></div>
            <div className="visual-circle visual-two"></div>

            <div className="suitcase">
              <div className="suitcase-handle"></div>

              <div className="suitcase-body">
                <div className="suitcase-line"></div>

                <div className="mini-shirt">
                  <span></span>
                </div>

                <div className="mini-pants">
                  <span></span>
                </div>

                <div className="mini-shoe">
                  <span></span>
                </div>
              </div>
            </div>

            <div className="visual-label">
              <Sparkles size={15} />

              <span>
                AI-powered packing
              </span>
            </div>
          </section>
        </div>

        {/* =========================
            RESULT
        ========================== */}

        {packingPlan && (
          <section className="packing-result">
            {/* Result Header */}

            <div className="packing-result-header">
              <div>
                <p>✦ YOUR AI PACKING PLAN</p>

                <h2>
                  {cleanText(
                    packingPlan.title ||
                      "Your trip wardrobe"
                  )}
                </h2>

                <span>
                  {cleanText(destination)} ·{" "}
                  {cleanText(days)} days
                </span>
              </div>

              <button
                type="button"
                onClick={clearPlan}
                className="clear-plan-button"
                aria-label="Clear packing plan"
              >
                <X size={17} />
              </button>
            </div>

            {/* Summary */}

            <div className="packing-summary">
              <div className="summary-box">
                <Shirt size={18} />

                <div>
                  <strong>{totalItems}</strong>

                  <span>pieces</span>
                </div>
              </div>

              <div className="summary-box">
                <BriefcaseBusiness size={18} />

                <div>
                  <strong>{days}</strong>

                  <span>days</span>
                </div>
              </div>

              <div className="summary-box">
                <Sparkles size={18} />

                <div>
                  <strong>AI</strong>

                  <span>planned</span>
                </div>
              </div>
            </div>

            {/* Items */}

            <div className="packing-items">
              {packingPlan.items?.length > 0 ? (
                packingPlan.items.map(
                  (item, index) => {
                    const itemId =
                      item.id || index;

                    const selected =
                      savedItems.includes(
                        itemId
                      );

                    return (
                      <div
                        key={itemId}
                        className={`packing-item ${
                          selected
                            ? "checked"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="packing-check"
                          onClick={() =>
                            toggleItem(
                              itemId
                            )
                          }
                          aria-label={
                            selected
                              ? "Uncheck item"
                              : "Check item"
                          }
                        >
                          {selected && (
                            <Check size={15} />
                          )}
                        </button>

                        <div className="packing-item-icon">
                          <Shirt size={20} />
                        </div>

                        <div className="packing-item-info">
                          <strong>
                            {cleanText(
                              item.name
                            )}
                          </strong>

                          <span>
                            {cleanText(
                              item.category
                            )}
                          </span>
                        </div>

                        <div className="packing-quantity">
                          ×{" "}
                          {item.quantity || 1}
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="packing-no-items">
                  <Shirt size={22} />

                  <p>
                    No wardrobe items were
                    suggested for this trip.
                  </p>
                </div>
              )}
            </div>

            {/* Reason */}

            {packingPlan.reason && (
              <div className="packing-reason">
                <div className="reason-icon">
                  <Sparkles size={17} />
                </div>

                <div>
                  <span>
                    Why this packing plan?
                  </span>

                  <p>
                    {cleanText(
                      packingPlan.reason
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}

            <div className="packing-result-footer">
              <div>
                <Check size={16} />

                <span>
                  Everything is from your
                  ClosetIQ wardrobe
                </span>
              </div>

              <Link
                to="/closet"
                className="view-closet-button"
              >
                View My Closet
              </Link>
            </div>
          </section>
        )}

        {/* =========================
            EMPTY STATE
        ========================== */}

        {!packingPlan && !loading && (
          <section className="packing-empty">
            <div className="empty-sparkle">
              <Sparkles size={22} />
            </div>

            <h2>
              Your packing plan will
              appear here
            </h2>

            <p>
              Enter your trip details above
              and let AI build a wardrobe
              just for your journey.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}