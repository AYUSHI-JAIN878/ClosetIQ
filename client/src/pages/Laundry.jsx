import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Circle,
  Loader2,
  Sparkles,
  WashingMachine,
} from "lucide-react";

import api from "../services/api";

export default function Laundry() {
  const [clothing, setClothing] = useState([]);
  const [laundry, setLaundry] =
    useState(() => {
      return JSON.parse(
        localStorage.getItem(
          "closetiq_laundry"
        ) || "{}"
      );
    });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClothing = async () => {
      try {
        const response =
          await api.get("/clothing");

        setClothing(
          response.clothing || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadClothing();
  }, []);

  const toggleLaundry = (id) => {
    setLaundry((previous) => {
      const updated = {
        ...previous,
        [id]: !previous[id],
      };

      localStorage.setItem(
        "closetiq_laundry",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const laundryItems = clothing.filter(
    (item) => laundry[item._id]
  );

  const cleanItems = clothing.filter(
    (item) => !laundry[item._id]
  );

  return (
    <div className="laundry-page">
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

      <main className="laundry-main">
        <section className="laundry-hero">
          <div>
            <p className="laundry-eyebrow">
              CARE & ORGANIZE
            </p>

            <h1>
              Keep your wardrobe
              <br />
              <span>fresh & ready.</span>
            </h1>

            <p>
              Mark pieces that are currently
              in the laundry and keep track of
              what is ready to wear.
            </p>
          </div>

          <div className="laundry-hero-icon">
            <WashingMachine size={42} />
          </div>
        </section>

        {loading ? (
          <div className="page-loader">
            <Loader2
              size={30}
              className="spin"
            />
            <p>
              Loading your wardrobe...
            </p>
          </div>
        ) : (
          <>
            <div className="laundry-stats">
              <div>
                <span>In laundry</span>
                <strong>
                  {laundryItems.length}
                </strong>
              </div>

              <div>
                <span>Ready to wear</span>
                <strong>
                  {cleanItems.length}
                </strong>
              </div>

              <div>
                <span>Total pieces</span>
                <strong>
                  {clothing.length}
                </strong>
              </div>
            </div>

            <section className="laundry-card">
              <div className="laundry-card-heading">
                <div>
                  <span>
                    <WashingMachine
                      size={16}
                    />
                  </span>

                  <div>
                    <h2>
                      Laundry tracker
                    </h2>

                    <p>
                      Tap an item to change its
                      status.
                    </p>
                  </div>
                </div>
              </div>

              {clothing.length === 0 ? (
                <div className="laundry-empty">
                  <WashingMachine
                    size={27}
                  />

                  <h3>
                    Your closet is empty
                  </h3>

                  <p>
                    Add clothing first to
                    start tracking laundry.
                  </p>

                  <Link to="/add-clothing">
                    Add Clothing
                  </Link>
                </div>
              ) : (
                <div className="laundry-list">
                  {clothing.map((item) => {
                    const isLaundry =
                      Boolean(
                        laundry[item._id]
                      );

                    return (
                      <button
                        type="button"
                        className={`laundry-item ${
                          isLaundry
                            ? "in-laundry"
                            : ""
                        }`}
                        key={item._id}
                        onClick={() =>
                          toggleLaundry(
                            item._id
                          )
                        }
                      >
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={item.name}
                        />

                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.category} ·{" "}
                            {item.color}
                          </span>
                        </div>

                        <span className="laundry-status">
                          {isLaundry ? (
                            <>
                              <Check
                                size={15}
                              />
                              In laundry
                            </>
                          ) : (
                            <>
                              <Circle
                                size={15}
                              />
                              Ready
                            </>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}