export default function Stars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  if (!rating) return <span className="rating-line">No rating yet</span>;
  const full = Math.round(rating);
  return (
    <span className="rating-line">
      <span className="stars" aria-hidden="true">
        {"★".repeat(full)}
        {"☆".repeat(Math.max(0, 5 - full))}
      </span>
      <span>
        {rating.toFixed(1)} out of 5
        {reviewCount ? ` from ${reviewCount.toLocaleString()} reviews` : ""}
      </span>
    </span>
  );
}
