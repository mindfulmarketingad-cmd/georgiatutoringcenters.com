export const PER_PAGE = 30;

export type Paged<T> = {
  items: T[];
  page: number;
  pageCount: number;
  startIndex: number;
  total: number;
};

export function paginate<T>(items: T[], page: number, perPage = PER_PAGE): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: current,
    pageCount,
    startIndex: start + 1,
    total: items.length,
  };
}

/** Page 1 lives at the base path; later pages hang off /page/<n>. */
export function pageHref(base: string, page: number) {
  return page <= 1 ? base : `${base}/page/${page}`;
}

/** Page numbers for 2..pageCount, used by generateStaticParams. */
export function extraPageParams(total: number, perPage = PER_PAGE) {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => ({ n: String(i + 2) }));
}
