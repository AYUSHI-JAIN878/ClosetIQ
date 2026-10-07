import {
  Heart,
  Sparkles,
} from "lucide-react";

export default function OutfitCard({
  outfit,
  onFavorite,
}) {
  const items = outfit.items || [];

  return (
    <article className="outfit-card">
      <div className="outfit-card-header">
        <div>
          <span className="outfit-ai-label">
            <Sparkles size={13} />
            AI LOOK
          </span>

          <h3>
            {outfit.title}
          </h3>
        </div>

        <button
          type="button"
          className={`outfit-favorite ${
            outfit.favorite
              ? "active"
              : ""
          }`}
          onClick={() =>
            onFavorite?.(outfit)
          }
          aria-label="Favorite outfit"
        >
          <Heart
            size={17}
            fill={
              outfit.favorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="outfit-items-preview">
        {items.slice(0, 4).map(
          (item) => (
            <div
              className="outfit-preview-item"
              key={item._id}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                />
              ) : (
                <div className="outfit-no-image">
                  <Sparkles
                    size={18}
                  />
                </div>
              )}
            </div>
          )
        )}
      </div>

      <div className="outfit-card-footer">
        <div>
          <span>
            Occasion
          </span>

          <strong>
            {outfit.occasion ||
              "Casual"}
          </strong>
        </div>

        <div>
          <span>
            Pieces
          </span>

          <strong>
            {items.length}
          </strong>
        </div>
      </div>

      {outfit.reason && (
        <p className="outfit-card-reason">
          {outfit.reason}
        </p>
      )}
    </article>
  );
}