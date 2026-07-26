"use client";

interface StarsProps {
  rating: number;
  size?: number;
}

export default function Stars({ rating, size = 16 }: StarsProps) {
  const stars = [];
  const roundedRating = Math.round(rating);

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={i <= roundedRating ? "var(--accent-gold)" : "var(--text-muted)"}
        style={{ width: `${size}px`, height: `${size}px`, marginRight: "2px" }}
      >
        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
      </svg>
    );
  }

  return <span style={{ display: "inline-flex", alignItems: "center" }}>{stars}</span>;
}
