# GeorgiaTutoringCenters.com

A directory of tutoring and learning centers across Georgia, built with Next.js 16
(App Router), TypeScript and no runtime CSS framework.

## Requirements

Node 20.9 or newer (`.nvmrc` pins 22). Next 16, React 19.

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

1. Export your Google Maps results from Outscraper as **XLSX**, **CSV** or **JSON**.
2. Drop the file(s) into `data/outscraper/`.
3. Run `npm run import` (this also runs automatically as part of `npm run build`).

Every file in that folder is merged and normalised into `data/listings.json`,
which is the only listing source the site reads. Recognised columns include
`name`, `site`, `category`, `subtypes`, `phone`, `full_address`, `street`,
`city`, `us_state`, `postal_code`, `latitude`, `longitude`, `rating`, `reviews`,
`reviews_link`, `location_link`, `photos_count`, `range`, `business_status`,
`verified`, `about`, `working_hours` and `place_id`. Unknown columns are ignored
and missing ones degrade gracefully.

The importer reads `.xlsx` directly, with no dependencies: an xlsx is a zip of
XML parts, so it walks the zip central directory and reads the worksheet and
shared-string tables itself.

It filters as it goes, and prints what it dropped:

- **Outside Georgia.** A radius search returns neighbouring states; rows whose
  `state_code` is not GA are skipped (170 of 1,096 in the current export).
- **Not education.** Rows whose category and subtypes contain no education
  signal are skipped. A business with an off-topic primary category is kept when
  it also reports itself as a tutoring or learning business.

The importer also:

- builds a URL slug per business (`/partners/<business-name>-<city>`), de-duplicating collisions;
- parses `working_hours` from JSON, dict or `"Monday: 9AM-5PM, ..."` string forms;
- tags each listing with subject areas (math, reading, English, test prep, STEM,
  special needs, early learning, homework help, online) used by the `/find`
  subject pages;
- ranks listings by rating weighted with review volume;
- parses the `about` column, which holds a JSON map of attribute groups rather
  than prose, into a features list ("Online classes", "Wheelchair accessible
  entrance", and so on);
- writes a factual summary per listing when the export carries no `description`,
  built only from fields that are present: category, place, subtypes, features,
  open days and review data;
- captures the photo, street view, logo, booking link and the 1-5 star review
  breakdown.

### Sample data

Until an export is present, the importer falls back to
`data/sample-listings.json` and flags the build as sample data. Every listing
page then shows a "sample data" notice. The placeholder rows are deliberately
fictional (invented names, 555 numbers, example.com sites) so no real business
is ever misrepresented. Regenerate them with `node scripts/make-sample-data.mjs`.

Adding a real export replaces them automatically — no code changes needed. City
and subject pages under `/find`, sitemap entries and internal links are all
generated from the data.

## Pagination and thin pages

The directory is ~900 centers, so listing pages are paginated at 30 per page
(`lib/pagination.ts`): page 1 sits at the base path and later pages at
`/page/<n>`. Without it `/partners` alone was a 4.7 MB document; it is now about
220 KB per page. Each page carries its own canonical URL, continuous numbering
and `ItemList` structured data, and every page is in the sitemap.

City pages, and city+subject pages (below), with only one listing are too thin
to index. They stay crawlable and linked so nothing 404s, but they are marked
`noindex, follow` and left out of the sitemap; they become indexable
automatically once a second center is listed there.

## County and ZIP code pages

`lib/content/counties.ts` holds a hand-maintained city to county lookup and
groups the listings by county. The export ships a `county` column, but it
contains Google's neighbourhood name ("Buckhead", "Midtown Atlanta"), so it is
unusable; the lookup is keyed on `citySlug` instead. **The county assignments
are best-effort and should be checked against an authoritative source before
being treated as an official record** — a few Georgia towns straddle a county
line and are mapped to the county holding the town centre.

That produces two more programmatic page types under `/find`, both ranked
listicles like every other find page:

- `/find/tutoring-centers-in-<county>-county` — "Tutoring & Learning Centers in
  Fulton County Georgia", listing every center in the county and linking to
  each city it covers.
- `/find/tutoring-centers-in-<zip>` — "Tutoring & Learning Centers in 30309",
  with the city and county the ZIP sits in.

Both carry copy generated from their own data (constituent cities, subject mix
with counts, rating and review aggregates), so no two pages share boilerplate.
`/counties` is the hub listing every county page, and is linked from the header.

## City + subject pages

For every city/subject pair with at least one listing, `lib/content/find.ts`
also generates a combined page such as `/find/math-tutors-in-atlanta` ("Math
Tutors in Atlanta, GA"), one level deeper than the plain city and subject
pages. Each one links back to its parent city page and parent subject page,
and to sibling combos in the same city or for the same subject, so the
internal linking runs Home → Find → City or Subject → City + Subject →
individual profile. The tutor-style label and slug per subject (`math-tutoring`
→ "Math Tutors" / `math-tutors-in-<city>`) live in the `SERVICE_TUTOR` map in
that file.

## Site structure

```
/                         Home: hero carousel, six hub blocks, SEO sections, FAQs
/find                     Hub: browse by city and subject
/counties                 Hub: every Georgia county in the directory
/find/[slug]              City, subject, city+subject, county and ZIP pages
                          (e.g. math-tutors-in-atlanta,
                          tutoring-centers-in-fulton-county,
                          tutoring-centers-in-30309)
/find/[slug]/page/[n]     Later pages of a long city, subject or combo list
/partners                 Hub: complete numbered listicle
/partners/page/[n]        Later pages of the directory
/partners/[slug]          Individual business profile (full Outscraper data)
/reviews                  Hub: ratings leaderboard
/reviews/[slug]           Per-business review summary
/costs                    Hub: Georgia pricing overview
/costs/[slug]             Individual cost guides
/blog                     Hub: parent guides
/blog/[slug]              Individual articles
/search                   Hub: site-wide search (also accepts ?q=)
/search/[query]           Query result pages (noindex, follow)
/authors                  Hub: the editorial team
/authors/[slug]           Individual author profiles
/about /contact /disclaimer /privacy /terms /sitemap
/sitemap.xml /robots.txt /ads.txt
```

Internal linking runs Home → Hub → Individual page, and every individual page
links back to its hub, to sibling pages and to the homepage.

## Photography and artwork

Original photographs live in `assets/source-photos/` (Next does not serve that
directory). `npm run photos` writes optimised banner crops and inline widths
into `public/photos/`, which is what pages load. Swap a source file and re-run
the script to change the artwork everywhere it appears.

`assets/source-photos/README.md` records which photo is used where, and why one
supplied image is deliberately unused (it carries another company's branding).
Confirm you hold a licence for each photograph before launch.

Every page opens with the same banner treatment (`components/PageBanner.tsx`):
artwork, a title bar carrying the H1, and an optional panel of key facts.
Business profile pages use that business's own photo from the Outscraper export
as the banner, falling back to the site artwork when the export has none or the
remote image fails.

## Authors

Guides and cost pages carry a byline. Author profiles live in
`lib/content/authors.ts`, avatars are generated by `scripts/make-avatars.mjs`,
and each author gets a page at `/authors/<slug>` plus an entry in the sitemap,
the search index and `Article` structured data.

The supplied profiles describe editorial roles and deliberately claim no
degrees, licences or named institutions. **Replace the names and biographies
with the real people who write for the site before publishing** rather than
presenting invented writers as real ones.

## Brand assets

`npm run brand` regenerates the logo, icons, hero artwork and author avatars.
`node scripts/make-brand.mjs` alone regenerates `public/logo.svg`, `public/logo-mark.svg`,
`app/icon.svg`, `public/favicon.ico`, `app/apple-icon.png`, `public/icon-192.png`,
`public/icon-512.png` and `public/og-image.png` from the SVG source in that script.

## Configuration

| What | Where |
| --- | --- |
| Site name, domain, email, social links, AdSense client | `lib/site.ts` |
| Header and footer links, hub blocks | `lib/site.ts` |
| Security headers and CSP | `next.config.ts` |
| Redirects | `next.config.ts` |
| Blog, cost guide and find-page copy | `lib/content/` |
| Author profiles | `lib/content/authors.ts` |
| City to county lookup | `lib/content/counties.ts` |
| Photo assignments | `lib/photos.ts` |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `CONTACT_WEBHOOK_URL` | Optional. Where `/api/contact` forwards validated submissions (any JSON webhook: email service, form backend, automation). Without it the form tells visitors to email directly instead of silently dropping messages. |

## URLs

Routes are lowercase and case-sensitive under Next 16, so `/Find` returns 404
rather than duplicating `/find`; every internal link and canonical tag uses the
lowercase form. Trailing slashes redirect to the canonical path automatically
(`trailingSlash: false`). There is deliberately **no middleware** — the site is
fully static plus one API route, and an edge function in front of every request
is a runtime failure mode with nothing to gain here.

## Maps

Map views are rendered with plain OpenStreetMap raster tiles and no third-party
JavaScript, which keeps the CSP tight. Heavy production traffic should move to a
tile provider with a suitable plan (or a self-hosted tile server) and update the
tile URL in `components/MapView.tsx` plus the `img-src` entry in `next.config.ts`.

## Security

See [SECURITY.md](./SECURITY.md).
