import Link from "next/link";

export type LinkListItem = {
  href: string;
  label: string;
  note?: string;
};

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

/**
 * A tight, scannable list of internal links. Used instead of card grids so a
 * section reads as a reference index rather than a row of promo tiles.
 *
 * Always sorted alphabetically by label, so a reader can scan or jump to a
 * name without checking whether this particular list happens to be ranked.
 */
export default function LinkList({
  items,
  split = false,
}: {
  items: LinkListItem[];
  split?: boolean;
}) {
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => collator.compare(a.label, b.label));
  return (
    <ul className={`link-list${split ? " link-list--split" : ""}`}>
      {sorted.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>{item.label}</Link>
          {item.note ? <span className="link-note"> &mdash; {item.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}
