import Link from "next/link";
import { hubs } from "@/lib/site";

const icons: Record<string, React.ReactElement> = {
  compass: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2e6b34" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2e6b34" strokeWidth="2" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2e6b34" strokeWidth="2" aria-hidden="true">
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2e6b34" strokeWidth="2" aria-hidden="true">
      <path d="M3 12.5V4h8.5L21 13.5 13.5 21z" />
      <circle cx="7.5" cy="7.5" r="1.6" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2e6b34" strokeWidth="2" aria-hidden="true">
      <path d="M4 20l1-4L16 5l3 3L8 19z" />
      <path d="M14 7l3 3" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2e6b34" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  ),
};

export default function HubGrid() {
  return (
    <div className="hub-grid">
      {hubs.map((hub) => (
        <Link key={hub.href} href={hub.href} className={`hub-card tone-${hub.tone}`}>
          <span className="hub-icon">{icons[hub.icon]}</span>
          <h3>{hub.label}</h3>
          <p>{hub.blurb}</p>
          <span className="hub-go">Explore {hub.label} &rarr;</span>
        </Link>
      ))}
    </div>
  );
}
