import Link from "next/link";

export type LinkListItem = {
  href: string;
  label: string;
  note?: string;
};

/**
 * A tight, scannable list of internal links. Used instead of card grids so a
 * section reads as a reference index rather than a row of promo tiles.
 */
export default function LinkList({
  items,
  split = false,
}: {
  items: LinkListItem[];
  split?: boolean;
}) {
  if (!items.length) return null;
  return (
    <ul className={`link-list${split ? " link-list--split" : ""}`}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>{item.label}</Link>
          {item.note ? <span className="link-note"> &mdash; {item.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}
