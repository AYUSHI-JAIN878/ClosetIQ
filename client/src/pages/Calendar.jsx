import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
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

const getDateKey = (date) => {
  return date.toISOString().split("T")[0];
};

export default function Calendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState(getDateKey(today));

  const [occasion, setOccasion] =
    useState("College");

  const [weather, setWeather] =
    useState("28°C");

  const [calendarOutfits, setCalendarOutfits] =
    useState({});

  const [suggestion, setSuggestion] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push(day);
  }

  const changeMonth = (direction) => {
    setCurrentDate(
      new Date(
        year,
        month + direction,
        1
      )
    );
  };

  const selectDay = (day) => {
    if (!day) return;

    const date = new Date(
      year,
      month,
      day
    );

    setSelectedDate(
      getDateKey(date)
    );

    setSuggestion(null);
    setError("");
  };

  const isSelected = (day) => {
    if (!day) return false;

    const date = new Date(
      year,
      month,
      day
    );

    return (
      getDateKey(date) === selectedDate
    );
  };

  const isToday = (day) => {
    if (!day) return false;

    const date = new Date(
      year,
      month,
      day
    );

    return (
      getDateKey(date) ===
      getDateKey(today)
    );
  };

  const generateSuggestion = async () => {
    try {
      setLoading(true);
      setSuggestion(null);
      setError("");

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

      const cleaned = response.result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(cleaned);

      setSuggestion(result);
    } catch (error) {
      console.error(
        "Calendar AI error:",
        error
      );

      setError(
        error.message ||
          "Unable to generate an outfit."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveToCalendar = async () => {
    if (!suggestion?.items?.length) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post(
        "/outfits",
        {
          title:
            suggestion.title ||
            `${occasion} Outfit`,
          items: suggestion.items.map(
            (item) => item.id
          ),
          occasion,
          reason:
            suggestion.reason || "",
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to save outfit."
        );
      }

      setCalendarOutfits(
        (previous) => ({
          ...previous,
          [selectedDate]:
            suggestion.title ||
            "AI Outfit",
        })
      );
    } catch (error) {
      console.error(
        "Save calendar outfit error:",
        error
      );

      setError(
        error.message ||
          "Unable to save outfit."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="calendar-page">
      <header className="calendar-topbar">
        <Link
          to="/dashboard"
          className="calendar-brand"
        >
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>

          <span>ClosetIQ</span>
        </Link>

        <Link
          to="/dashboard"
          className="calendar-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </header>

      <main className="calendar-main">
        <section className="calendar-heading">
          <div>
            <p className="calendar-eyebrow">
              OUTFIT CALENDAR
            </p>

            <h1>
              Plan your looks
              <br />
              ahead of time.
            </h1>

            <p>
              Choose a date and let ClosetIQ
              plan an outfit from your wardrobe.
            </p>
          </div>

          <div className="calendar-heading-icon">
            <CalendarDays size={34} />
          </div>
        </section>

        <div className="calendar-layout">
          {/* CALENDAR */}
          <section className="calendar-card">
            <div className="calendar-header">
              <button
                type="button"
                onClick={() =>
                  changeMonth(-1)
                }
              >
                <ChevronLeft size={20} />
              </button>

              <div>
                <h2>{monthName}</h2>
                <span>{year}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  changeMonth(1)
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="weekdays">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <span key={day}>
                  {day}
                </span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map(
                (day, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={!day}
                    className={[
                      "calendar-day",
                      isSelected(day)
                        ? "selected"
                        : "",
                      isToday(day)
                        ? "today"
                        : "",
                      day &&
                      calendarOutfits[
                        getDateKey(
                          new Date(
                            year,
                            month,
                            day
                          )
                        )
                      ]
                        ? "has-outfit"
                        : "",
                    ].join(" ")}
                    onClick={() =>
                      selectDay(day)
                    }
                  >
                    {day && (
                      <>
                        <span>
                          {day}
                        </span>

                        {calendarOutfits[
                          getDateKey(
                            new Date(
                              year,
                              month,
                              day
                            )
                          )
                        ] && (
                          <i></i>
                        )}
                      </>
                    )}
                  </button>
                )
              )}
            </div>

            <div className="calendar-legend">
              <span>
                <i className="legend-selected"></i>
                Selected
              </span>

              <span>
                <i className="legend-outfit"></i>
                Outfit planned
              </span>
            </div>
          </section>

          {/* AI PLANNER */}
          <section className="calendar-planner">
            <div className="planner-header">
              <div className="planner-icon">
                <WandSparkles size={19} />
              </div>

              <div>
                <p>AI OUTFIT PLANNER</p>

                <h2>
                  Plan your selected day
                </h2>
              </div>
            </div>

            <div className="selected-date-box">
              <CalendarDays size={18} />

              <div>
                <span>
                  Selected date
                </span>

                <strong>
                  {new Date(
                    `${selectedDate}T00:00:00`
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>
            </div>

            <div className="planner-field">
              <label>
                What's the occasion?
              </label>

              <div className="planner-occasion">
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
                        setOccasion(item)
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="planner-field">
              <label>
                Expected weather
              </label>

              <input
                value={weather}
                onChange={(e) =>
                  setWeather(
                    e.target.value
                  )
                }
                placeholder="e.g. 28°C"
              />
            </div>

            <button
              type="button"
              className="calendar-ai-button"
              onClick={generateSuggestion}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />
                  Creating your look...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Suggest Outfit
                </>
              )}
            </button>

            {error && (
              <div className="calendar-error">
                {error}
              </div>
            )}
          </section>
        </div>

        {/* AI RESULT */}
        {suggestion && (
          <section className="calendar-result">
            <div className="calendar-result-top">
              <div>
                <p>✦ AI RECOMMENDATION</p>

                <h2>
                  {suggestion.title ||
                    "Your planned look"}
                </h2>
              </div>

              <div className="calendar-result-icon">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="calendar-result-items">
              {suggestion.items?.map(
                (item) => (
                  <div
                    className="calendar-result-item"
                    key={item.id}
                  >
                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.category}
                      </span>
                    </div>

                    <Check size={17} />
                  </div>
                )
              )}
            </div>

            {suggestion.reason && (
              <div className="calendar-reason">
                <span>
                  Why this works
                </span>

                <p>
                  {suggestion.reason}
                </p>
              </div>
            )}

            <button
              type="button"
              className="save-calendar-button"
              onClick={saveToCalendar}
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
                  <CalendarDays size={17} />
                  Save to Calendar
                </>
              )}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}