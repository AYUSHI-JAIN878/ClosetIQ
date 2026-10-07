import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

export default function Favorites() {
  const [clothing, setClothing] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const [clothingResponse, outfitResponse] =
        await Promise.all([
          api.get("/clothing"),
          api.get("/outfits"),
        ]);

      setClothing(
        (clothingResponse.clothing || []).filter(
          (item) => item.favorite
        )
      );

      setOutfits(
        (outfitResponse.outfits || []).filter(
          (outfit) => outfit.favorite
        )
      );
    } catch (error) {
      console.error(
        "Favorites error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (item) => {
    try {
      const response = await api.patch(
        `/clothing/${item._id}/favorite`
      );

      if (!response.clothing.favorite) {
        setClothing((previous) =>
          previous.filter(
            (current) =>
              current._id !== item._id
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="favorites-page">
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

      <main className="favorites-main">
        <div className="favorites-heading">
          <div>
            <p>YOUR COLLECTION</p>
            <h1>
              Favorites you{" "}
              <span>love.</span>
            </h1>
            <p className="favorites-description">
              Keep your favorite pieces and
              saved looks close at hand.
            </p>
          </div>

          <div className="favorites-count">
            <Heart size={19} />
            {clothing.length + outfits.length}
          </div>
        </div>

        {loading ? (
          <div className="page-loader">
            <Loader2
              size={30}
              className="spin"
            />
            <p>
              Loading your favorites...
            </p>
          </div>
        ) : (
          <>
            <section className="favorites-section">
              <div className="favorites-section-title">
                <h2>Favorite Clothing</h2>
                <span>
                  {clothing.length} items
                </span>
              </div>

              {clothing.length === 0 ? (
                <div className="favorites-empty">
                  <Heart size={25} />
                  <h3>
                    No favorite clothes yet
                  </h3>
                  <p>
                    Tap the heart on any closet
                    item to save it here.
                  </p>

                  <Link to="/closet">
                    Explore My Closet
                  </Link>
                </div>
              ) : (
                <div className="favorites-clothing-grid">
                  {clothing.map((item) => (
                    <article
                      className="favorite-clothing-card"
                      key={item._id}
                    >
                      <div className="favorite-image">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeFavorite(item)
                          }
                        >
                          <Heart
                            size={17}
                            fill="currentColor"
                          />
                        </button>
                      </div>

                      <div className="favorite-card-info">
                        <span>
                          {item.category}
                        </span>

                        <h3>
                          {item.name}
                        </h3>

                        <small>
                          {item.color}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="favorites-section">
              <div className="favorites-section-title">
                <h2>Favorite AI Looks</h2>
                <span>
                  {outfits.length} looks
                </span>
              </div>

              {outfits.length === 0 ? (
                <div className="favorites-empty">
                  <Sparkles size={25} />
                  <h3>
                    No saved favorite looks
                  </h3>
                  <p>
                    Create an AI outfit and save
                    the ones you love.
                  </p>

                  <Link to="/outfits">
                    Create AI Look
                  </Link>
                </div>
              ) : (
                <div className="favorite-outfits-grid">
                  {outfits.map((outfit) => (
                    <article
                      className="favorite-outfit-card"
                      key={outfit._id}
                    >
                      <div className="favorite-outfit-images">
                        {(outfit.items || [])
                          .slice(0, 4)
                          .map((item) => (
                            <img
                              key={item._id}
                              src={item.imageUrl}
                              alt={item.name}
                            />
                          ))}
                      </div>

                      <div>
                        <span>
                          AI LOOK
                        </span>

                        <h3>
                          {outfit.title}
                        </h3>

                        <p>
                          {outfit.reason ||
                            "Saved from your AI Style Studio."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}