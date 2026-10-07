import {
  Heart,
  Trash2,
  WandSparkles,
} from "lucide-react";

export default function ClothingCard({
  item,
  onSelect,
  onFavorite,
  onDelete,
  onStyleAI,
  deleting = false,
}) {
  return (
    <article
      className="clothing-card"
      onClick={() => onSelect?.(item)}
    >
      <div className="clothing-image-wrap">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="clothing-image"
        />

        <button
          type="button"
          className={`favorite-button ${
            item.favorite ? "active" : ""
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onFavorite?.(item, event);
          }}
          aria-label="Toggle favorite"
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

        <div className="clothing-card-actions">
          <button
            type="button"
            className="ai-style-overlay"
            onClick={(event) => {
              event.stopPropagation();
              onStyleAI?.(item);
            }}
          >
            <WandSparkles size={15} />
            Style with AI
          </button>

          <button
            type="button"
            className="card-delete-button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(item, event);
            }}
            disabled={deleting}
            aria-label="Delete clothing"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="clothing-card-info">
        <div>
          <p>{item.category}</p>

          <h3>{item.name}</h3>
        </div>

        <span className="clothing-color">
          {item.color}
        </span>
      </div>
    </article>
  );
}