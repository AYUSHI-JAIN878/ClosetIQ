import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Heart,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";

import api from "../services/api";

const categories = [
  "All",
  "Tops",
  "Jeans",
  "Dresses",
  "Shoes",
  "Accessories",
];

const occasions = [
  "College",
  "Casual",
  "Party",
  "Formal",
];

export default function Closet() {
  const [clothing, setClothing] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [selectedItem, setSelectedItem] = useState(null);

  const [aiItem, setAiItem] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [occasion, setOccasion] = useState("College");
  const [weather, setWeather] = useState("28°C");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  /* -----------------------------------------
     FETCH CLOTHING
  ----------------------------------------- */

  const fetchClothing = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clothing");

      setClothing(response.clothing || []);
    } catch (err) {
      setError(
        err?.message || "Unable to load your closet."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothing();
  }, []);

  /* -----------------------------------------
     FILTER CLOTHING
  ----------------------------------------- */

  const filteredClothing = useMemo(() => {
    return clothing.filter((item) => {
      const matchesCategory =
        category === "All" ||
        item.category === category;

      const text =
        `${item.name || ""} ${item.color || ""} ${
          item.category || ""
        }`.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      return matchesCategory && matchesSearch;
    });
  }, [clothing, category, search]);

  /* -----------------------------------------
     SUCCESS MESSAGE
  ----------------------------------------- */

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  /* -----------------------------------------
     FAVORITE
  ----------------------------------------- */

  const toggleFavorite = async (item, event) => {
    event?.stopPropagation();

    try {
      const response = await api.patch(
        `/clothing/${item._id}/favorite`
      );

      setClothing((previous) =>
        previous.map((current) =>
          current._id === item._id
            ? response.clothing
            : current
        )
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update favorite."
      );
    }
  };

  /* -----------------------------------------
     DELETE CLOTHING
  ----------------------------------------- */

  const deleteItem = async (item, event) => {
    event?.stopPropagation();

    const confirmed = window.confirm(
      `Remove "${item.name}" from your closet?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);

      await api.delete(`/clothing/${item._id}`);

      setClothing((previous) =>
        previous.filter(
          (current) =>
            current._id !== item._id
        )
      );

      setSelectedItem(null);

      showSuccess(
        "Clothing removed successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete clothing."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* -----------------------------------------
     OPEN AI STYLER
  ----------------------------------------- */

  const openAiStyler = (item) => {
    setSelectedItem(null);

    setAiItem(item);
    setAiSuggestion(null);
    setAiError("");

    setOccasion(
      item?.occasion || "College"
    );
  };

  /* -----------------------------------------
     CLOSE AI STYLER
  ----------------------------------------- */

  const closeAiStyler = () => {
    if (aiLoading) return;

    setAiItem(null);
    setAiSuggestion(null);
    setAiError("");
  };

  /* -----------------------------------------
     GENERATE AI STYLE
  ----------------------------------------- */

  const generateAiStyle = async () => {
    if (!aiItem || aiLoading) return;

    try {
      setAiLoading(true);
      setAiError("");
      setAiSuggestion(null);

      const response = await api.post(
        "/outfits/ai/style-item",
        {
          clothingId: aiItem._id,
          occasion,
          weather,
        }
      );

      console.log(
        "AI styling response:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to style this item."
        );
      }

      let raw = response.result;

      console.log(
        "AI raw result:",
        raw
      );

      /* Already parsed JSON */

      if (
        raw &&
        typeof raw === "object"
      ) {
        if (
          !Array.isArray(
            raw.suggestions
          )
        ) {
          throw new Error(
            "AI returned an invalid suggestion."
          );
        }

        setAiSuggestion(raw);
        return;
      }

      /* Empty response */

      if (
        typeof raw !== "string" ||
        !raw.trim()
      ) {
        throw new Error(
          "AI returned an empty response. Please try again."
        );
      }

      /* Remove markdown code fences */

      raw = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let result;

      /* Direct JSON parsing */

      try {
        result = JSON.parse(raw);
      } catch (parseError) {
        console.error(
          "JSON parse error:",
          parseError
        );

        /* Extract JSON object */

        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");

        if (
          start === -1 ||
          end === -1 ||
          end <= start
        ) {
          throw new Error(
            "AI returned an invalid response. Please try again."
          );
        }

        const jsonString = raw.slice(
          start,
          end + 1
        );

        try {
          result = JSON.parse(jsonString);
        } catch {
          throw new Error(
            "AI response could not be processed. Please try again."
          );
        }
      }

      /* Validate response */

      if (
        !result ||
        !Array.isArray(
          result.suggestions
        )
      ) {
        throw new Error(
          "AI could not generate outfit suggestions. Please try again."
        );
      }

      setAiSuggestion(result);
    } catch (err) {
      console.error(
        "AI styling error:",
        err
      );

      setAiError(
        err?.message ||
          "Unable to generate styling suggestions."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* -----------------------------------------
     SAVE AI OUTFIT
  ----------------------------------------- */

  const saveAiOutfit = async () => {
    if (
      !aiItem ||
      !aiSuggestion?.suggestions?.length
    ) {
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");

      const ids = [
        aiItem._id,
        ...aiSuggestion.suggestions
          .map((item) => item.id)
          .filter(Boolean),
      ];

      const uniqueIds = [
        ...new Set(ids),
      ];

      const response = await api.post(
        "/outfits",
        {
          title:
            aiSuggestion.title ||
            `${aiItem.name} Styled Look`,
          items: uniqueIds,
          occasion,
          reason:
            aiSuggestion.reason || "",
        }
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to save outfit."
        );
      }

      showSuccess(
        "AI outfit saved successfully."
      );

      closeAiStyler();
    } catch (err) {
      setAiError(
        err?.message ||
          "Unable to save outfit."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="closet-page">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <header className="closet-topbar">
        <Link
          to="/dashboard"
          className="closet-brand"
        >
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>

          <span>ClosetIQ</span>
        </Link>

        <Link
          to="/dashboard"
          className="closet-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </header>

      <main className="closet-main">

        {/* =====================================
            HEADING
        ===================================== */}

        <section className="closet-heading">
          <div>
            <p className="closet-eyebrow">
              MY DIGITAL CLOSET
            </p>

            <h1>
              Everything you own,
              <br />
              <span>
                beautifully organized.
              </span>
            </h1>

            <p>
              Browse your wardrobe and let
              AI create looks from pieces
              you already own.
            </p>
          </div>

          <Link
            to="/add-clothing"
            className="add-clothing-button"
          >
            <Plus size={18} />
            Add Clothing
          </Link>
        </section>

        {/* =====================================
            TOOLBAR
        ===================================== */}

        <section className="closet-toolbar">
          <div className="closet-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search your wardrobe..."
            />
          </div>

          <div className="closet-filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="closet-error">
            {error}
          </div>
        )}

        {/* =====================================
            SUCCESS
        ===================================== */}

        {success && (
          <div className="closet-success">
            <Check size={16} />
            {success}
          </div>
        )}

        {/* =====================================
            LOADING
        ===================================== */}

        {loading && (
          <div className="closet-loading">
            <Loader2
              size={30}
              className="spin"
            />

            <p>
              Loading your wardrobe...
            </p>
          </div>
        )}

        {/* =====================================
            EMPTY
        ===================================== */}

        {!loading &&
          filteredClothing.length === 0 && (
            <div className="closet-empty">
              <div className="closet-empty-icon">
                <Sparkles size={25} />
              </div>

              <h2>
                {clothing.length === 0
                  ? "Your closet is empty"
                  : "No items found"}
              </h2>

              <p>
                {clothing.length === 0
                  ? "Start adding your clothes and build your digital wardrobe."
                  : "Try another search or category."}
              </p>

              {clothing.length === 0 && (
                <Link
                  to="/add-clothing"
                  className="empty-add-button"
                >
                  <Plus size={17} />
                  Add Your First Item
                </Link>
              )}
            </div>
          )}

        {/* =====================================
            CLOTHING GRID
        ===================================== */}

        {!loading &&
          filteredClothing.length > 0 && (
            <section className="closet-grid">
              {filteredClothing.map(
                (item) => (
                  <article
                    key={item._id}
                    className="clothing-card"
                    onClick={() =>
                      setSelectedItem(item)
                    }
                  >
                    <div className="clothing-image-wrap">

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="clothing-image"
                      />

                      {/* Favorite */}

                      <button
                        type="button"
                        className={`favorite-button ${
                          item.favorite
                            ? "active"
                            : ""
                        }`}
                        onClick={(event) =>
                          toggleFavorite(
                            item,
                            event
                          )
                        }
                      >
                        <Heart
                          size={17}
                          fill={
                            item.favorite
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      {/* AI */}

                      <button
                        type="button"
                        className="ai-style-overlay"
                        onClick={(event) => {
                          event.stopPropagation();
                          openAiStyler(item);
                        }}
                      >
                        <WandSparkles
                          size={15}
                        />
                        Style with AI
                      </button>
                    </div>

                    <div className="clothing-card-info">
                      <div>
                        <p>
                          {item.category}
                        </p>

                        <h3>
                          {item.name}
                        </h3>
                      </div>

                      <span className="clothing-color">
                        {item.color}
                      </span>
                    </div>
                  </article>
                )
              )}
            </section>
          )}
      </main>

      {/* =====================================
          ITEM MODAL
      ===================================== */}

      {selectedItem && (
        <div
          className="closet-modal-backdrop"
          onClick={() =>
            setSelectedItem(null)
          }
        >
          <div
            className="closet-item-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedItem(null)
              }
            >
              <X size={19} />
            </button>

            <div className="modal-image">
              <img
                src={
                  selectedItem.imageUrl
                }
                alt={
                  selectedItem.name
                }
              />
            </div>

            <div className="modal-info">
              <p>
                {selectedItem.category}
              </p>

              <h2>
                {selectedItem.name}
              </h2>

              <div className="modal-meta">
                <span>
                  Color:{" "}
                  <strong>
                    {selectedItem.color}
                  </strong>
                </span>

                <span>
                  Occasion:{" "}
                  <strong>
                    {selectedItem.occasion}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                className="modal-ai-button"
                onClick={() =>
                  openAiStyler(
                    selectedItem
                  )
                }
              >
                <WandSparkles size={17} />
                Style This with AI
              </button>

              <button
                type="button"
                className="modal-delete-button"
                onClick={(event) =>
                  deleteItem(
                    selectedItem,
                    event
                  )
                }
              >
                {deletingId ===
                selectedItem._id ? (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                Remove from Closet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          AI STYLER MODAL
      ===================================== */}

      {aiItem && (
        <div
          className="closet-modal-backdrop"
          onClick={closeAiStyler}
        >
          <div
            className="ai-styler-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Close */}

            <button
              type="button"
              className="modal-close"
              onClick={closeAiStyler}
              disabled={aiLoading}
            >
              <X size={19} />
            </button>

            {/* Header */}

            <div className="ai-styler-header">
              <div className="ai-styler-icon">
                <Sparkles size={20} />
              </div>

              <div>
                <p>
                  CLOSETIQ AI STYLIST
                </p>

                <h2>
                  Style your{" "}
                  {aiItem.name}
                </h2>
              </div>
            </div>

            {/* Selected Item */}

            <div className="selected-ai-item">
              <img
                src={aiItem.imageUrl}
                alt={aiItem.name}
              />

              <div>
                <span>
                  Selected item
                </span>

                <strong>
                  {aiItem.name}
                </strong>

                <small>
                  {aiItem.color} ·{" "}
                  {aiItem.category}
                </small>
              </div>
            </div>

            {/* AI OPTIONS */}

            <div className="ai-options">

              {/* Occasion */}

              <div>
                <label>
                  Occasion
                </label>

                <div className="ai-option-buttons">
                  {occasions.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          occasion === item
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setOccasion(
                            item
                          )
                        }
                        disabled={aiLoading}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Weather */}

              <div>
                <label>
                  Weather
                </label>

                <input
                  value={weather}
                  onChange={(e) =>
                    setWeather(
                      e.target.value
                    )
                  }
                  disabled={aiLoading}
                />
              </div>
            </div>

            {/* =================================
                GENERATE BUTTON
            ================================= */}

            {!aiSuggestion && (
              <button
                type="button"
                className="generate-style-button"
                onClick={
                  generateAiStyle
                }
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />

                    Finding the perfect
                    match...
                  </>
                ) : (
                  <>
                    <WandSparkles
                      size={18}
                    />

                    Style This Outfit
                  </>
                )}
              </button>
            )}

            {/* =================================
                AI ERROR
            ================================= */}

            {aiError && (
              <div className="ai-modal-error">
                {aiError}
              </div>
            )}

            {/* =================================
                AI RESULT
            ================================= */}

            {aiSuggestion && (
              <div className="ai-style-result">

                <div className="result-title">
                  <div>
                    <span>
                      ✦ AI SUGGESTION
                    </span>

                    <h3>
                      {aiSuggestion.title ||
                        "Complete this look"}
                    </h3>
                  </div>

                  <Sparkles size={19} />
                </div>

                {/* Suggestions */}

                <div className="style-suggestions">

                  {aiSuggestion.suggestions?.map(
                    (item) => (
                      <div
                        className="style-suggestion"
                        key={item.id}
                      >
                        <div className="suggestion-check">
                          <Check size={14} />
                        </div>

                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    )
                  )}

                </div>

                {/* Reason */}

                {aiSuggestion.reason && (
                  <div className="ai-style-reason">
                    <span>
                      Why this works
                    </span>

                    <p>
                      {aiSuggestion.reason}
                    </p>
                  </div>
                )}

                {/* Save */}

                <button
                  type="button"
                  className="save-ai-outfit"
                  onClick={
                    saveAiOutfit
                  }
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} />

                      Save This Outfit
                    </>
                  )}
                </button>

                {/* Try Again */}

                <button
                  type="button"
                  className="try-another-style"
                  onClick={() => {
                    setAiSuggestion(null);
                    setAiError("");
                  }}
                  disabled={aiLoading}
                >
                  <Sparkles size={15} />

                  Try another style
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}