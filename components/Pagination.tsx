import Link from "next/link";
import { pageHref } from "@/lib/pagination";

/**
 * Numbered pagination. Renders the first and last page plus a window around
 * the current one, so a 30-page list stays a single readable row.
 */
export default function Pagination({
  base,
  page,
  pageCount,
  label,
}: {
  base: string;
  page: number;
  pageCount: number;
  label: string;
}) {
  if (pageCount <= 1) return null;

  const numbers = new Set<number>([1, pageCount, page]);
  for (let offset = 1; offset <= 2; offset++) {
    if (page - offset > 1) numbers.add(page - offset);
    if (page + offset < pageCount) numbers.add(page + offset);
  }
  const shown = [...numbers].sort((a, b) => a - b);

  return (
    <nav className="pagination" aria-label={label}>
      {page > 1 && (
        <Link className="pagination-step" href={pageHref(base, page - 1)} rel="prev">
          &larr; Previous
        </Link>
      )}
      <ul>
        {shown.map((number, index) => {
          const gap = index > 0 && number - shown[index - 1] > 1;
          return (
            <li key={number}>
              {gap && <span className="pagination-gap">…</span>}
              {number === page ? (
                <span className="pagination-current" aria-current="page">
                  {number}
                </span>
              ) : (
                <Link href={pageHref(base, number)}>{number}</Link>
              )}
            </li>
          );
        })}
      </ul>
      {page < pageCount && (
        <Link className="pagination-step" href={pageHref(base, page + 1)} rel="next">
          Next &rarr;
        </Link>
      )}
    </nav>
  );
}
