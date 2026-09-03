# GeorgiaTutoringCenters.com

A directory of tutoring and learning centers across Georgia, built with Next.js 15
(App Router), TypeScript and no runtime CSS framework.

## Quick start

```bash
npm install
npm run import   # normalises listing data into data/listings.json
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build    # runs the import, then builds
npm start
```

## Importing Outscraper data

1. Export your Google Maps results from Outscraper as **CSV** or **JSON**.
2. Drop the file(s) into `data/outscraper/`.
3. Run `npm run import` (this also runs automatically as part of `npm run build`).

Every file in that folder is merged and normalised into `data/listings.json`,
which is the only listing source the site reads. Recognised columns include
`name`, `site`, `category`, `subtypes`, `phone`, `full_address`, `street`,
`city`, `us_state`, `postal_code`, `latitude`, `longitude`, `rating`, `reviews`,
`reviews_link`, `location_link`, `photos_count`, `range`, `business_status`,
`verified`, `about`, `working_hours` and `place_id`. Unknown columns are ignored
and missing ones degrade gracefully.

The importer also:

- builds a URL slug per business (`/partners/<business-name>-<city>`), de-duplicating collisions;
- parses `working_hours` from JSON, dict or `"Monday: 9AM-5PM, ..."` string forms;
- tags each listing with subject areas (math, reading, test prep, STEM, special
  needs, early learning, homework help, online) used by the `/find` subject pages;
- ranks listings by rating weighted with review volume.

### Sample data

Until an export is present, the importer falls back to
`data/sample-listings.json` and flags the build as sample data. Every listing
page then shows a "sample data" notice. The placeholder rows are deliberately
fictional (invented names, 555 numbers, example.com sites) so no real business
is ever misrepresented. Regenerate them with `node scripts/make-sample-data.mjs`.

Adding a real export replaces them automatically — no code changes needed. City
and subject pages under `/find`, sitemap entries and internal links are all
generated from the data.

## Site structure

```
/                         Home: hero carousel, six hub blocks, SEO sections, FAQs
/find                     Hub: browse by city and subject
/find/[slug]              City pages (tutoring-centers-in-<city>) and subject pages
/partners                 Hub: complete numbered listicle
/partners/[slug]          Individual business profile (full Outscraper data)
/reviews                  Hub: ratings leaderboard
/reviews/[slug]           Per-business review summary
/costs                    Hub: Georgia pricing overview
/costs/[slug]             Individual cost guides
/blog                     Hub: parent guides
/blog/[slug]              Individual articles
/search                   Hub: site-wide search (also accepts ?q=)
/search/[query]           Query result pages (noindex, follow)
/about /contact /disclaimer /privacy /terms /sitemap
/sitemap.xml /robots.txt /ads.txt
```

Internal linking runs Home → Hub → Individual page, and every individual page
links back to its hub, to sibling pages and to the homepage.

## Brand assets

`node scripts/make-brand.mjs` regenerates `public/logo.svg`, `public/logo-mark.svg`,
`app/icon.svg`, `public/favicon.ico`, `app/apple-icon.png`, `public/icon-192.png`,
`public/icon-512.png` and `public/og-image.png` from the SVG source in that script.

## Configuration

| What | Where |
| --- | --- |
| Site name, domain, email, social links, AdSense client | `lib/site.ts` |
| Header and footer links, hub blocks | `lib/site.ts` |
| Security headers and CSP | `next.config.ts` |
| URL canonicalisation (casing, trailing slash) | `middleware.ts` |
| Blog, cost guide and find-page copy | `lib/content/` |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `CONTACT_WEBHOOK_URL` | Optional. Where `/api/contact` forwards validated submissions (any JSON webhook: email service, form backend, automation). Without it the form tells visitors to email directly instead of silently dropping messages. |

## Maps

Map views are rendered with plain OpenStreetMap raster tiles and no third-party
JavaScript, which keeps the CSP tight. Heavy production traffic should move to a
tile provider with a suitable plan (or a self-hosted tile server) and update the
tile URL in `components/MapView.tsx` plus the `img-src` entry in `next.config.ts`.

## Security

See [SECURITY.md](./SECURITY.md).
